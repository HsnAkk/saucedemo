import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Cart & Checkout Smoke Tests
 * Critical path tests for shopping cart and checkout functionality
 * These tests run with pre-authenticated state from global-setup.js
 * Organized by user journey: Cart → Product Details → Checkout
 */
test.describe('Cart & Checkout Smoke Tests', () => {
  let po;

  // Set timeout for smoke tests
  test.setTimeout(30000);

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);
    // Navigate to inventory page (we're already authenticated)
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
  });

  // ==================== CART OPERATIONS ====================

  test.describe('Cart Operations', () => {
  test('@smoke @cart @critical - Should add product to cart successfully', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.assertProductAddedToCart('Sauce Labs Backpack');
      await po.inventoryPage.assertCartBadgeCount(1);
    });

    test('@smoke @cart @critical - Should remove product from cart', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.goToCart();
      await po.cartPage.waitForPageLoad();

      await po.cartPage.removeProductFromCart('Sauce Labs Backpack');
      await po.cartPage.assertCartIsEmpty();
      await expect(po.inventoryPage.cartBadge).not.toBeVisible();
    });

    test('@smoke @cart @critical - Should add multiple products to cart', async () => {
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
      ]);
      await po.inventoryPage.assertCartBadgeCount(3);
    });

    test('@smoke @cart @critical - Should display product information in cart', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.goToCart();
      await po.cartPage.waitForPageLoad();

      await po.cartPage.assertProductInCart('Sauce Labs Backpack');
      await po.cartPage.assertProductPrice('Sauce Labs Backpack', '$29.99');
      await po.cartPage.assertProductQuantity('Sauce Labs Backpack', '1');
  });

  test('@smoke @cart @critical - Should navigate to cart page', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.goToCart();

    await expect(po.page).toHaveURL(/.*cart/);
    const pageTitle = await po.page.title();
    expect(pageTitle).toBe(TestDataLoader.getPageTitle('cart'));
      await po.cartPage.assertCartPageLoaded();
      await po.cartPage.assertCartItemCount(1);
    });

    test('@smoke @cart @navigation - Should maintain cart state across page navigation', async () => {
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
      ]);

      await po.inventoryPage.assertCartBadgeCount(2);
      await po.inventoryPage.goToCart();
      await po.cartPage.assertCartItemCount(2);
      await po.cartPage.continueShopping();
      await po.inventoryPage.assertCartBadgeCount(2);
    });
  });

  // ==================== PRODUCT DETAILS ====================

  test.describe('Product Details', () => {
    test('@smoke @product @critical - Should navigate to product details page', async () => {
      const productName = 'Sauce Labs Backpack';
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();

      await expect(po.page).toHaveURL(/.*inventory-item/);
      await po.productDetailsPage.waitForPageLoad();
      await po.productDetailsPage.assertPageLoaded();
    });

    test('@smoke @product @critical - Should display product information correctly', async () => {
      const productName = 'Sauce Labs Backpack';
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      await po.productDetailsPage.assertAllProductDetailsDisplayed();
      await po.productDetailsPage.assertProductName(productName);
      await po.productDetailsPage.assertProductPrice('$29.99');
      await po.productDetailsPage.assertProductDescriptionExists();
      await po.productDetailsPage.assertProductImageVisible();
    });

    test('@smoke @product @critical - Should add product to cart from details page', async () => {
      const productName = 'Sauce Labs Backpack';
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      await po.productDetailsPage.addToCart();
      await po.productDetailsPage.assertProductAddedToCart();
      await po.productDetailsPage.assertCartBadgeCount(1);
    });

    test('@smoke @product @critical - Should remove product from cart from details page', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      const productItem = po.inventoryPage.getProductItemByName('Sauce Labs Backpack');
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      await po.productDetailsPage.assertProductAddedToCart();
      await po.productDetailsPage.removeFromCart();
      await po.productDetailsPage.assertProductRemovedFromCart();
      await po.productDetailsPage.assertCartBadgeCount(0);
    });

    test('@smoke @product @navigation - Should navigate back to inventory from details page', async () => {
      const productName = 'Sauce Labs Backpack';
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      await expect(po.page).toHaveURL(/.*inventory-item/);
      await po.productDetailsPage.goBackToInventory();
      await expect(po.page).toHaveURL(/.*inventory/);
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@smoke @product @critical - Should match product details with inventory', async () => {
      const productName = 'Sauce Labs Backpack';

      const inventoryPrice = await po.inventoryPage.getProductPrice(productName);
      const inventoryDescription = await po.inventoryPage.getProductDescription(productName);

      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      const detailsPrice = await po.productDetailsPage.getProductPrice();
      const detailsDescription = await po.productDetailsPage.getProductDescription();

      expect(detailsPrice).toBe(inventoryPrice);
      expect(detailsDescription).toBe(inventoryDescription);
    });

    test('@smoke @product @critical - Should handle adding/removing multiple times from details', async () => {
      const productName = 'Sauce Labs Backpack';
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      await po.productDetailsPage.addToCart();
      await po.productDetailsPage.assertCartBadgeCount(1);
      await po.productDetailsPage.removeFromCart();
      await po.productDetailsPage.assertCartBadgeCount(0);
      await po.productDetailsPage.addToCart();
      await po.productDetailsPage.assertCartBadgeCount(1);
    });
  });

  // ==================== CHECKOUT FLOW ====================

  test.describe('Checkout Flow', () => {
  test('@smoke @checkout @critical - Should navigate to checkout information page', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();
      await po.cartPage.goToCheckout();

    await expect(po.page).toHaveURL(/.*checkout-step-one/);
      await po.checkoutInfoPage.assertPageLoaded();
    });

    test('@smoke @checkout @critical - Should fill checkout form and continue', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );

      await po.checkoutInfoPage.continueToOverview();
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
      await po.checkoutOverviewPage.assertPageLoaded();
  });

  test('@smoke @checkout @critical - Should complete checkout process', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();
      await po.checkoutOverviewPage.assertPageLoaded();

      await po.checkoutOverviewPage.finish();

      await expect(po.page).toHaveURL(/.*checkout-complete/);
      await po.checkoutCompletePage.assertPageLoaded();

      const successMessage = await po.checkoutCompletePage.getCompleteHeader();
      expect(successMessage).toContain('Thank you for your order!');
    });

    test('@smoke @checkout @critical - Should navigate back from complete page', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();
      await po.checkoutOverviewPage.finish();

      await po.checkoutCompletePage.backToProducts();

      await expect(po.page).toHaveURL(/.*inventory/);
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@smoke @checkout @critical - Should complete checkout with multiple products', async () => {
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
      ]);

      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      await po.checkoutOverviewPage.assertCartItemCount(3);
      await po.checkoutOverviewPage.assertCartItemPresent('Sauce Labs Backpack');
      await po.checkoutOverviewPage.assertCartItemPresent('Sauce Labs Bike Light');
      await po.checkoutOverviewPage.assertCartItemPresent('Sauce Labs Bolt T-Shirt');

      await po.checkoutOverviewPage.finish();
      await expect(po.page).toHaveURL(/.*checkout-complete/);
    });

    test('@smoke @checkout @critical - Should verify price calculation on overview page', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.addProductToCart('Sauce Labs Bike Light');

      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      await po.checkoutOverviewPage.assertProductPrice('Sauce Labs Backpack', '$29.99');
      await po.checkoutOverviewPage.assertProductPrice('Sauce Labs Bike Light', '$9.99');
      await po.checkoutOverviewPage.assertPriceBreakdownDisplayed();
      await po.checkoutOverviewPage.assertPaymentShippingInfoDisplayed();
    });

    test('@smoke @checkout @flow - Should maintain product information through checkout', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      await po.checkoutOverviewPage.assertCartItemPresent('Sauce Labs Backpack');
      await po.checkoutOverviewPage.assertProductPrice('Sauce Labs Backpack', '$29.99');
    });

    test('@smoke @checkout @complete - Should empty cart after order completion', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();
      await po.checkoutOverviewPage.finish();

      await po.checkoutCompletePage.assertCartIsEmpty();
      await po.checkoutCompletePage.backToProducts();
      await expect(po.checkoutCompletePage.cartBadge).not.toBeVisible();
    });
  });

  // ==================== CHECKOUT VALIDATION ====================

  test.describe('Checkout Validation', () => {
    test('@smoke @checkout @error - Should handle empty checkout fields', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      await po.checkoutInfoPage.continueButton.click();
      await po.checkoutInfoPage.assertErrorMessage('First Name is required');
      await expect(po.page).toHaveURL(/.*checkout-step-one/);
    });

    test('@smoke @checkout @error - Should handle missing postal code', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      await po.checkoutInfoPage.fillFirstName('John');
      await po.checkoutInfoPage.fillLastName('Doe');
      await po.checkoutInfoPage.continueButton.click();
      await po.checkoutInfoPage.assertErrorMessage('Postal Code is required');
    });

    test('@smoke @checkout @validation - Should show error for invalid form fields', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      await po.checkoutInfoPage.fillFirstName('John');
      await po.checkoutInfoPage.continueButton.click();
      await po.checkoutInfoPage.assertErrorMessage('Last Name is required');
    });

    test('@smoke @checkout @critical - Should handle special characters in checkout form', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.specialCharacters;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );

      await po.checkoutInfoPage.continueToOverview();
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });
  });

  // ==================== NAVIGATION & STATE MANAGEMENT ====================

  test.describe('Navigation & State Management', () => {
    test('@smoke @checkout @navigation - Should handle back navigation during checkout', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      await expect(po.page).toHaveURL(/.*checkout-step-two/);

      await po.checkoutOverviewPage.cancel();

      await expect(po.page).toHaveURL(/.*inventory/);
    });

    test('@smoke @checkout @navigation - Should cancel from checkout overview page', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      await po.checkoutOverviewPage.cancel();

      await expect(po.page).toHaveURL(/.*inventory/);
      await po.inventoryPage.assertInventoryPageLoaded();
      await po.inventoryPage.assertCartBadgeCount(1);
    });

    test('@smoke @checkout @error - Should handle browser back button during checkout', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      // Verify we're on overview page
    await expect(po.page).toHaveURL(/.*checkout-step-two/);

      // Go back using browser back button
      await po.page.goBack();

      // Verify we're back on checkout info page without errors
      await expect(po.page).toHaveURL(/.*checkout-step-one/);
      await po.checkoutInfoPage.assertPageLoaded();

      // Can optionally continue with the checkout again
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });

    test('@smoke @checkout @critical - Should maintain session across checkout steps', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      await po.page.reload();
      await po.checkoutOverviewPage.waitForPageLoad();

      await expect(po.page).toHaveURL(/.*checkout-step-two/);
      await po.checkoutOverviewPage.assertCartItemCount(1);

      await po.checkoutOverviewPage.finish();
    await expect(po.page).toHaveURL(/.*checkout-complete/);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
  test('@smoke @cart @performance - Should add to cart within acceptable time', async () => {
    const startTime = Date.now();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
    const endTime = Date.now();
    const addToCartTime = endTime - startTime;

    expect(addToCartTime).toBeLessThan(2000);
      await po.inventoryPage.assertCartBadgeCount(1);
  });

  test('@smoke @checkout @performance - Should complete checkout within acceptable time', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

    const startTime = Date.now();
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();
      await po.checkoutOverviewPage.finish();
    const endTime = Date.now();

    const checkoutTime = endTime - startTime;
    expect(checkoutTime).toBeLessThan(10000);
    await expect(po.page).toHaveURL(/.*checkout-complete/);
  });

    test('@smoke @checkout @performance - Should process checkout form submission quickly', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.cartPage.goto();
      await po.cartPage.goToCheckout();

      const startTime = Date.now();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      const endTime = Date.now();
      const submissionTime = endTime - startTime;

      expect(submissionTime).toBeLessThan(3000);
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });
  });
});
