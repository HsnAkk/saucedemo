import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Cart Regression Tests
 * Comprehensive tests for cart page functionality
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Cart Regression Tests', () => {
  let po;

  // Timeout is configured in playwright.config.js (45 seconds for authenticated-tests)

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);
    // Navigate to cart page (we're already authenticated)
    await po.cartPage.goto();
    await po.cartPage.waitForPageLoad();
  });

  // ==================== POSITIVE CART TESTS ====================

  test.describe('Positive Cart Tests', () => {
    test('@cart @positive - Should display empty cart correctly', async () => {
      // Clear cart first
      await po.cartPage.goto();
      const isNotEmpty = (await po.page.locator('.cart_item').count()) > 0;
      if (isNotEmpty) {
        await po.cartPage.removeAllProducts();
      }

      // Verify cart is empty
      await po.cartPage.assertCartIsEmpty();

      // Verify page title
      const pageTitle = await po.page.title();
      expect(pageTitle).toBe(TestDataLoader.getPageTitle('cart'));

      // Verify cart container is visible
      await po.cartPage.assertCartPageLoaded();
    });

    test('@cart @positive - Should display products in cart', async () => {
      // Add products to cart from inventory
      await po.inventoryPage.goto();
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
      ]);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify products are displayed
      await po.cartPage.assertCartItemCount(2);
      await po.cartPage.assertProductInCart('Sauce Labs Backpack');
      await po.cartPage.assertProductInCart('Sauce Labs Bike Light');
    });

    test('@cart @positive - Should display product information correctly', async () => {
      // Add product to cart from inventory
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify product information
      await po.cartPage.assertProductInCart('Sauce Labs Backpack');
      await po.cartPage.assertProductPrice('Sauce Labs Backpack', '$29.99');
      await po.cartPage.assertProductQuantity('Sauce Labs Backpack', '1');

      // Verify product has description
      const description = await po.cartPage.getProductDescription('Sauce Labs Backpack');
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(0);
    });

    test('@cart @positive - Should remove product from cart', async () => {
      // Add products to cart from inventory
      await po.inventoryPage.goto();
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
      ]);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify products are in cart
      await po.cartPage.assertCartItemCount(2);

      // Remove product from cart
      await po.cartPage.removeProductFromCart('Sauce Labs Backpack');

      // Verify product is removed
      await po.cartPage.assertProductNotInCart('Sauce Labs Backpack');
      await po.cartPage.assertProductInCart('Sauce Labs Bike Light');
      await po.cartPage.assertCartItemCount(1);
    });

    test('@cart @positive - Should remove all products from cart', async () => {
      // Add products to cart from inventory
      await po.inventoryPage.goto();
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
      ]);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify products are in cart
      await po.cartPage.assertCartItemCount(3);

      // Remove all products
      await po.cartPage.removeAllProducts();

      // Verify cart is empty
      await po.cartPage.assertCartIsEmpty();
    });

    test('@cart @positive - Should continue shopping button works', async () => {
      // Verify continue shopping button is visible
      await po.cartPage.assertContinueShoppingButtonVisible();

      // Click continue shopping
      await po.cartPage.continueShopping();

      // Verify we're back on inventory page
      await po.inventoryPage.assertInventoryPageLoaded();
      await expect(po.page).toHaveURL(/.*inventory/);
    });

    test('@cart @positive - Should checkout button works', async () => {
      // Add product to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify checkout button is visible
      await po.cartPage.assertCheckoutButtonVisible();

      // Click checkout
      await po.cartPage.goToCheckout();

      // Verify we're on checkout page
      await expect(po.page).toHaveURL(/.*checkout-step-one/);
    });
  });

  // ==================== CART FUNCTIONALITY TESTS ====================

  test.describe('Cart Functionality Tests', () => {
    test('@cart @functionality - Should add multiple products from inventory', async () => {
      const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

      // Add multiple products to cart from inventory
      await po.inventoryPage.goto();
      await po.inventoryPage.addMultipleProductsToCart(products);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify all products are in cart
      await po.cartPage.assertCartItemCount(3);

      for (const productName of products) {
        await po.cartPage.assertProductInCart(productName);
      }
    });

    test('@cart @functionality - Should maintain cart state during navigation', async () => {
      // Add product to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify product is in cart
      await po.cartPage.assertProductInCart('Sauce Labs Backpack');

      // Go back to inventory
      await po.cartPage.continueShopping();

      // Go back to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify cart state is maintained
      await po.cartPage.assertProductInCart('Sauce Labs Backpack');
    });

    test('@cart @functionality - Should remove products one by one', async () => {
      const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

      // Add multiple products to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addMultipleProductsToCart(products);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify all products are in cart
      await po.cartPage.assertCartItemCount(3);

      // Remove products one by one
      for (const productName of products) {
        await po.cartPage.removeProductFromCart(productName);
        await po.cartPage.assertProductNotInCart(productName);
      }

      // Verify cart is empty
      await po.cartPage.assertCartIsEmpty();
    });

    test('@cart @functionality - Should display correct product prices', async () => {
      // Add products to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.addProductToCart('Sauce Labs Bike Light');

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify product prices
      await po.cartPage.assertProductPrice('Sauce Labs Backpack', '$29.99');
      await po.cartPage.assertProductPrice('Sauce Labs Bike Light', '$9.99');
    });
  });

  // ==================== UI ELEMENT TESTS ====================

  test.describe('UI Element Tests', () => {
    test('@cart @ui - Should have all required UI elements', async () => {
      // Add product to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify all UI elements are visible
      await po.cartPage.assertAllCartElementsVisible();

      // Verify header elements
      await expect(po.cartPage.headerTitle).toBeVisible();
      await expect(po.cartPage.menuButton).toBeVisible();
      await expect(po.cartPage.cartIcon).toBeVisible();
    });

    test('@cart @ui - Should display cart badge correctly', async () => {
      // Add products to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
      ]);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify cart badge shows correct count
      await expect(po.cartPage.cartBadge).toBeVisible();
      await expect(po.cartPage.cartBadge).toHaveText('2');
    });

    test('@cart @ui - Should have proper button states', async () => {
      // Add product to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify buttons are visible and enabled
      await expect(po.cartPage.continueShoppingButton).toBeVisible();
      await expect(po.cartPage.continueShoppingButton).toBeEnabled();

      await expect(po.cartPage.checkoutButton).toBeVisible();
      await expect(po.cartPage.checkoutButton).toBeEnabled();
    });
  });

  // ==================== NAVIGATION TESTS ====================

  test.describe('Navigation Tests', () => {
    test('@cart @navigation - Should navigate between inventory and cart', async () => {
      // Add product to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.assertCartPageLoaded();

      // Continue shopping
      await po.cartPage.continueShopping();
      await po.inventoryPage.assertInventoryPageLoaded();

      // Navigate back to cart
      await po.cartPage.goto();
      await po.cartPage.assertCartPageLoaded();
    });

    test('@cart @navigation - Should navigate to checkout', async () => {
      // Add product to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Navigate to checkout
      await po.cartPage.goToCheckout();

      // Verify we're on checkout page
      await expect(po.page).toHaveURL(/.*checkout-step-one/);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
    test('@cart @performance - Should load cart page quickly', async () => {
      const startTime = Date.now();

      // Navigate to cart page
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Cart page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify page is loaded correctly
      await po.cartPage.assertCartPageLoaded();
    });

    test('@cart @performance - Should remove products quickly', async () => {
      // Add products to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
      ]);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      const startTime = Date.now();

      // Remove all products
      await po.cartPage.removeAllProducts();

      const endTime = Date.now();
      const removeTime = endTime - startTime;

      // Removing products should complete within 2 seconds
      expect(removeTime).toBeLessThan(2000);

      // Verify cart is empty
      await po.cartPage.assertCartIsEmpty();
    });
  });

  // ==================== EDGE CASE TESTS ====================

  test.describe('Edge Case Tests', () => {
    test('@cart @edge - Should handle rapid remove/add operations', async () => {
      const productName = 'Sauce Labs Backpack';

      // Add product to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart(productName);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Rapid operations
      for (let i = 0; i < 3; i++) {
        await po.cartPage.removeProductFromCart(productName);
        await po.inventoryPage.goto();
        await po.inventoryPage.addProductToCart(productName);
        await po.cartPage.goto();
        await po.cartPage.waitForPageLoad();
      }

      // Verify final state
      await po.cartPage.assertProductInCart(productName);
      await po.cartPage.assertCartItemCount(1);
    });

    test('@cart @edge - Should handle cart with single product', async () => {
      const productName = 'Sauce Labs Backpack';

      // Add product to cart
      await po.inventoryPage.goto();
      await po.inventoryPage.addProductToCart(productName);

      // Navigate to cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Verify single product in cart
      await po.cartPage.assertCartItemCount(1);
      await po.cartPage.assertProductInCart(productName);
    });
  });
});
