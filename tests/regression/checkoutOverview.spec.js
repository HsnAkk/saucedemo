import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Checkout Overview Regression Tests
 * Comprehensive tests for checkout overview page functionality
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Checkout Overview Regression Tests', () => {
  let po;

  // Timeout is configured in playwright.config.js (45 seconds for authenticated-tests)

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);

    // Add products to cart and navigate through checkout
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
    await po.inventoryPage.addMultipleProductsToCart([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
    ]);

    // Navigate to cart
    await po.cartPage.goto();
    await po.cartPage.waitForPageLoad();
    await po.cartPage.goToCheckout();

    // Fill checkout form and navigate to overview
    const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
    await po.checkoutInfoPage.fillCheckoutForm(
      testData.firstName,
      testData.lastName,
      testData.postalCode
    );
    await po.checkoutInfoPage.continueToOverview();
    await po.checkoutOverviewPage.waitForPageLoad();
  });

  // ==================== POSITIVE CHECKOUT OVERVIEW TESTS ====================

  test.describe('Positive Checkout Overview Tests', () => {
    test('@checkout @overview @positive - Should display checkout overview page correctly', async () => {
      // Verify checkout overview page is loaded
      await po.checkoutOverviewPage.assertPageLoaded();

      // Verify page title
      const pageTitle = await po.page.title();
      expect(pageTitle).toBe(TestDataLoader.getPageTitle('checkout'));

      // Verify URL contains checkout-step-two
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });

    test('@checkout @overview @positive - Should display all cart items correctly', async () => {
      // Verify all items are displayed
      await po.checkoutOverviewPage.assertCartItemCount(2);
      await po.checkoutOverviewPage.assertCartItemPresent('Sauce Labs Backpack');
      await po.checkoutOverviewPage.assertCartItemPresent('Sauce Labs Bike Light');
    });

    test('@checkout @overview @positive - Should display correct product information', async () => {
      // Verify product names
      const productNames = await po.checkoutOverviewPage.getAllProductNames();
      expect(productNames).toContain('Sauce Labs Backpack');
      expect(productNames).toContain('Sauce Labs Bike Light');

      // Verify product prices
      await po.checkoutOverviewPage.assertProductPrice('Sauce Labs Backpack', '$29.99');
      await po.checkoutOverviewPage.assertProductPrice('Sauce Labs Bike Light', '$9.99');

      // Verify product quantities
      await po.checkoutOverviewPage.assertProductQuantity('Sauce Labs Backpack', '1');
      await po.checkoutOverviewPage.assertProductQuantity('Sauce Labs Bike Light', '1');
    });

    test('@checkout @overview @positive - Should display payment and shipping information', async () => {
      // Verify payment and shipping info are displayed
      await po.checkoutOverviewPage.assertPaymentShippingInfoDisplayed();

      // Verify info values exist
      const paymentInfo = await po.checkoutOverviewPage.getPaymentInfo();
      const shippingInfo = await po.checkoutOverviewPage.getShippingInfo();

      expect(paymentInfo).toBeTruthy();
      expect(shippingInfo).toBeTruthy();
    });

    test('@checkout @overview @positive - Should display price breakdown', async () => {
      // Verify price breakdown is displayed
      await po.checkoutOverviewPage.assertPriceBreakdownDisplayed();

      // Verify price information exists
      const subtotal = await po.checkoutOverviewPage.getSubtotal();
      const tax = await po.checkoutOverviewPage.getTax();
      const total = await po.checkoutOverviewPage.getTotal();

      expect(subtotal).toBeTruthy();
      expect(tax).toBeTruthy();
      expect(total).toBeTruthy();
    });

    test('@checkout @overview @positive - Should complete checkout successfully', async () => {
      // Verify finish button is visible and enabled
      await expect(po.checkoutOverviewPage.finishButton).toBeVisible();
      await expect(po.checkoutOverviewPage.finishButton).toBeEnabled();

      // Complete checkout
      await po.checkoutOverviewPage.finish();

      // Verify we're on checkout complete page
      await expect(po.page).toHaveURL(/.*checkout-complete/);
    });

    test('@checkout @overview @positive - Should cancel and return to inventory', async () => {
      // Verify cancel button is visible and enabled
      await expect(po.checkoutOverviewPage.cancelButton).toBeVisible();
      await expect(po.checkoutOverviewPage.cancelButton).toBeEnabled();

      // Cancel checkout
      await po.checkoutOverviewPage.cancel();

      // Verify we're back on inventory page
      await expect(po.page).toHaveURL(/.*inventory/);
    });
  });

  // ==================== PRICE CALCULATION TESTS ====================

  test.describe('Price Calculation Tests', () => {
    test('@checkout @overview @calculation - Should calculate total correctly', async () => {
      // Verify total calculation
      await po.checkoutOverviewPage.assertTotalCalculationCorrect();
    });

    test('@checkout @overview @calculation - Should display correct subtotal', async () => {
      const subtotal = await po.checkoutOverviewPage.getSubtotal();

      // Subtotal should be the sum of all item prices
      // $29.99 + $9.99 = $39.98
      expect(subtotal).toContain('$39.98');
    });

    test('@checkout @overview @calculation - Should display tax', async () => {
      const tax = await po.checkoutOverviewPage.getTax();

      // Verify tax is displayed
      expect(tax).toMatch(/\$\d+\.\d{2}/);
    });

    test('@checkout @overview @calculation - Should display correct total', async () => {
      const subtotal = await po.checkoutOverviewPage.getSubtotal();
      const tax = await po.checkoutOverviewPage.getTax();
      const total = await po.checkoutOverviewPage.getTotal();

      // Extract numeric values
      const subtotalValue = parseFloat(subtotal.replace(/[^0-9.]/g, ''));
      const taxValue = parseFloat(tax.replace(/[^0-9.]/g, ''));
      const totalValue = parseFloat(total.replace(/[^0-9.]/g, ''));

      // Verify total = subtotal + tax
      expect(totalValue).toBeCloseTo(subtotalValue + taxValue, 2);
    });
  });

  // ==================== UI ELEMENT TESTS ====================

  test.describe('UI Element Tests', () => {
    test('@checkout @overview @ui - Should have all required UI elements', async () => {
      // Verify all UI elements are visible
      await po.checkoutOverviewPage.assertAllElementsVisible();
    });

    test('@checkout @overview @ui - Should display cart badge correctly', async () => {
      // Verify cart badge shows correct count
      await expect(po.checkoutOverviewPage.cartBadge).toBeVisible();
      await expect(po.checkoutOverviewPage.cartBadge).toHaveText('2');
    });

    test('@checkout @overview @ui - Should have enabled action buttons', async () => {
      // Verify buttons are enabled
      await expect(po.checkoutOverviewPage.finishButton).toBeEnabled();
      await expect(po.checkoutOverviewPage.cancelButton).toBeEnabled();
    });
  });

  // ==================== NAVIGATION TESTS ====================

  test.describe('Navigation Tests', () => {
    test('@checkout @overview @navigation - Should navigate from checkout info to overview', async () => {
      // We're already on the overview page from beforeEach
      // This test just verifies we're in the correct state

      // Verify we're on overview page
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
      await po.checkoutOverviewPage.assertPageLoaded();

      // Verify products are displayed
      await po.checkoutOverviewPage.assertCartItemCount(2);
    });

    test('@checkout @overview @navigation - Should navigate back to inventory when canceling', async () => {
      // Cancel checkout
      await po.checkoutOverviewPage.cancel();

      // Verify we're on inventory page
      await expect(po.page).toHaveURL(/.*inventory/);
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@checkout @overview @navigation - Should navigate to complete page when finishing', async () => {
      // Complete checkout
      await po.checkoutOverviewPage.finish();

      // Verify we're on complete page
      await expect(po.page).toHaveURL(/.*checkout-complete/);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
    test('@checkout @overview @performance - Should load checkout overview page quickly', async () => {
      const startTime = Date.now();

      // Navigate to checkout overview page
      await po.checkoutOverviewPage.goto();
      await po.checkoutOverviewPage.waitForPageLoad();

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Checkout overview page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify page is loaded correctly
      await po.checkoutOverviewPage.assertPageLoaded();
    });

    test('@checkout @overview @performance - Should complete checkout quickly', async () => {
      const startTime = Date.now();

      // Complete checkout
      await po.checkoutOverviewPage.finish();

      const endTime = Date.now();
      const completeTime = endTime - startTime;

      // Completing checkout should be quick
      expect(completeTime).toBeLessThan(2000);
    });
  });

  // ==================== EDGE CASE TESTS ====================

  test.describe('Edge Case Tests', () => {
    test('@checkout @overview @edge - Should handle checkout with multiple products', async () => {
      // Verify multiple products are displayed
      await po.checkoutOverviewPage.assertCartItemCount(2);

      // Verify prices are correct
      await po.checkoutOverviewPage.assertProductPrice('Sauce Labs Backpack', '$29.99');
      await po.checkoutOverviewPage.assertProductPrice('Sauce Labs Bike Light', '$9.99');
    });
  });
});

// Separate test group that needs different setup (1 product instead of 2)
test.describe('Checkout Overview - Single Product Tests', () => {
  let po;

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);

    // Add SINGLE product to cart and navigate through checkout
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
    await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

    // Navigate to cart
    await po.cartPage.goto();
    await po.cartPage.waitForPageLoad();
    await po.cartPage.goToCheckout();

    // Fill checkout form and navigate to overview
    const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
    await po.checkoutInfoPage.fillCheckoutForm(
      testData.firstName,
      testData.lastName,
      testData.postalCode
    );
    await po.checkoutInfoPage.continueToOverview();
    await po.checkoutOverviewPage.waitForPageLoad();
  });

  test('@checkout @overview @edge - Should handle checkout with single product', async () => {
    // Verify single product is displayed
    await po.checkoutOverviewPage.assertCartItemCount(1);
    await po.checkoutOverviewPage.assertCartItemPresent('Sauce Labs Backpack');
  });
});
