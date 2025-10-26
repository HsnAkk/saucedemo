import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Inventory Regression Tests
 * Comprehensive tests for inventory page functionality
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Inventory Regression Tests', () => {
  let po;

  // Timeout is configured in playwright.config.js (45 seconds for authenticated-tests)

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);
    // Navigate to inventory page (we're already authenticated)
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
  });

  // ==================== POSITIVE INVENTORY TESTS ====================

  test.describe('Positive Inventory Tests', () => {
    test('@inventory @positive - Should display all products correctly', async () => {
      // Verify inventory page is loaded
      await po.inventoryPage.assertInventoryPageLoaded();

      // Verify all products are displayed
      await po.inventoryPage.assertAllProductsDisplayed(6);

      // Verify page title
      const pageTitle = await po.page.title();
      expect(pageTitle).toBe(TestDataLoader.getPageTitle('inventory'));

      // Verify inventory container is visible
      await expect(po.inventoryPage.inventoryContainer).toBeVisible();
    });

    test('@inventory @positive - Should add single product to cart', async () => {
      const productName = 'Sauce Labs Backpack';

      // Add product to cart
      await po.inventoryPage.addProductToCart(productName);

      // Verify product is added to cart
      await po.inventoryPage.assertProductAddedToCart(productName);

      // Verify cart badge shows 1 item
      await po.inventoryPage.assertCartBadgeCount(1);
    });

    test('@inventory @positive - Should add multiple products to cart', async () => {
      const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

      // Add multiple products to cart
      await po.inventoryPage.addMultipleProductsToCart(products);

      // Verify all products are added to cart
      for (const product of products) {
        await po.inventoryPage.assertProductAddedToCart(product);
      }

      // Verify cart badge shows correct count
      await po.inventoryPage.assertCartBadgeCount(3);
    });

    test('@inventory @positive - Should remove product from cart', async () => {
      const productName = 'Sauce Labs Backpack';

      // Add product to cart first
      await po.inventoryPage.addProductToCart(productName);
      await po.inventoryPage.assertCartBadgeCount(1);

      // Remove product from cart
      await po.inventoryPage.removeProductFromCart(productName);

      // Verify product is removed from cart
      await po.inventoryPage.assertProductRemovedFromCart(productName);

      // Verify cart badge is hidden
      await po.inventoryPage.assertCartBadgeCount(0);
    });

    test('@inventory @positive - Should navigate to cart page', async () => {
      // Add a product to cart first
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart page
      await po.inventoryPage.goToCart();

      // Verify we're on cart page
      await expect(po.page).toHaveURL(/.*cart/);

      // Verify cart page title
      const pageTitle = await po.page.title();
      expect(pageTitle).toBe(TestDataLoader.getPageTitle('cart'));
    });
  });

  // ==================== SORTING TESTS ====================

  test.describe('Product Sorting Tests', () => {
    test('@inventory @sorting - Should sort products by name A to Z', async () => {
      // Sort by name A to Z
      await po.inventoryPage.sortProducts('az');

      // Verify products are sorted correctly
      await po.inventoryPage.assertProductsSorted('name', 'asc');

      // Verify sort dropdown shows correct option
      const currentSort = await po.inventoryPage.getCurrentSortOption();
      expect(currentSort).toBe('az');
    });

    test('@inventory @sorting - Should sort products by name Z to A', async () => {
      // Sort by name Z to A
      await po.inventoryPage.sortProducts('za');

      // Verify products are sorted correctly
      await po.inventoryPage.assertProductsSorted('name', 'desc');

      // Verify sort dropdown shows correct option
      const currentSort = await po.inventoryPage.getCurrentSortOption();
      expect(currentSort).toBe('za');
    });

    test('@inventory @sorting - Should sort products by price low to high', async () => {
      // Sort by price low to high
      await po.inventoryPage.sortProducts('lohi');

      // Verify products are sorted correctly
      await po.inventoryPage.assertProductsSorted('price', 'asc');

      // Verify sort dropdown shows correct option
      const currentSort = await po.inventoryPage.getCurrentSortOption();
      expect(currentSort).toBe('lohi');
    });

    test('@inventory @sorting - Should sort products by price high to low', async () => {
      // Sort by price high to low
      await po.inventoryPage.sortProducts('hilo');

      // Verify products are sorted correctly
      await po.inventoryPage.assertProductsSorted('price', 'desc');

      // Verify sort dropdown shows correct option
      const currentSort = await po.inventoryPage.getCurrentSortOption();
      expect(currentSort).toBe('hilo');
    });

    test('@inventory @sorting - Should maintain cart state after sorting', async () => {
      // Add products to cart
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.addProductToCart('Sauce Labs Bike Light');

      // Verify cart count
      await po.inventoryPage.assertCartBadgeCount(2);

      // Sort products
      await po.inventoryPage.sortProducts('za');

      // Verify cart count is maintained
      await po.inventoryPage.assertCartBadgeCount(2);

      // Verify products are still added to cart
      await po.inventoryPage.assertProductAddedToCart('Sauce Labs Backpack');
      await po.inventoryPage.assertProductAddedToCart('Sauce Labs Bike Light');
    });
  });

  // ==================== HEADER MENU TESTS ====================

  test.describe('Header Menu Tests', () => {
    test('@inventory @menu - Should open and close header menu', async () => {
      // Open menu
      await po.inventoryPage.openMenu();
      await expect(po.inventoryPage.menuItems).toBeVisible();

      // Close menu
      await po.inventoryPage.closeMenu();
      await expect(po.inventoryPage.menuItems).not.toBeVisible();
    });

    test('@inventory @menu - Should logout successfully', async () => {
      // Logout from application
      await po.inventoryPage.logout();

      // Verify we're redirected to login page
      await expect(po.page).toHaveURL(/.*\/$/);

      // Verify login page elements are visible
      await expect(po.loginPage.usernameInput).toBeVisible();
      await expect(po.loginPage.passwordInput).toBeVisible();
      await expect(po.loginPage.loginButton).toBeVisible();
    });

    test('@inventory @menu - Should reset application state', async () => {
      // Add products to cart first
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.assertCartBadgeCount(1);

      // Reset application
      await po.inventoryPage.resetApp();

      // Verify cart is cleared
      await po.inventoryPage.assertCartBadgeCount(0);

      // Verify we're still on inventory page
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@inventory @menu - Should navigate to about page', async () => {
      // Navigate to about page
      await po.inventoryPage.goToAbout();

      // Verify we're on about page
      await expect(po.page).toHaveURL(/.*\/$/);

      // Go back to inventory
      await po.page.goBack();
      await po.inventoryPage.assertInventoryPageLoaded();
    });
  });

  // ==================== PRODUCT INFORMATION TESTS ====================

  test.describe('Product Information Tests', () => {
    test('@inventory @product - Should display correct product names', async () => {
      const expectedProducts = [
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Fleece Jacket',
        'Sauce Labs Onesie',
        'Test.allTheThings() T-Shirt (Red)',
      ];

      const actualProducts = await po.inventoryPage.getAllAvailableProducts();

      // Verify all expected products are present
      for (const expectedProduct of expectedProducts) {
        expect(actualProducts).toContain(expectedProduct);
      }

      // Verify we have the correct number of products
      expect(actualProducts).toHaveLength(6);
    });

    test('@inventory @product - Should display product prices', async () => {
      const productName = 'Sauce Labs Backpack';

      // Get product price
      const price = await po.inventoryPage.getProductPrice(productName);

      // Verify price is displayed and formatted correctly
      expect(price).toMatch(/\$\d+\.\d{2}/);
      expect(price).toBe('$29.99');
    });

    test('@inventory @product - Should display product descriptions', async () => {
      const productName = 'Sauce Labs Backpack';

      // Get product description
      const description = await po.inventoryPage.getProductDescription(productName);

      // Verify description is displayed
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(0);
    });

    test('@inventory @product - Should verify product exists', async () => {
      // Test existing product
      const exists = await po.inventoryPage.isProductExists('Sauce Labs Backpack');
      expect(exists).toBe(true);

      // Test non-existing product
      const notExists = await po.inventoryPage.isProductExists('Non-existent Product');
      expect(notExists).toBe(false);
    });
  });

  // ==================== CART FUNCTIONALITY TESTS ====================

  test.describe('Cart Functionality Tests', () => {
    test('@inventory @cart - Should add and remove same product multiple times', async () => {
      const productName = 'Sauce Labs Backpack';

      // Add product
      await po.inventoryPage.addProductToCart(productName);
      await po.inventoryPage.assertCartBadgeCount(1);

      // Remove product
      await po.inventoryPage.removeProductFromCart(productName);
      await po.inventoryPage.assertCartBadgeCount(0);

      // Add product again
      await po.inventoryPage.addProductToCart(productName);
      await po.inventoryPage.assertCartBadgeCount(1);

      // Remove product again
      await po.inventoryPage.removeProductFromCart(productName);
      await po.inventoryPage.assertCartBadgeCount(0);
    });

    test('@inventory @cart - Should handle adding all products to cart', async () => {
      const allProducts = await po.inventoryPage.getAllAvailableProducts();

      // Add all products to cart
      await po.inventoryPage.addMultipleProductsToCart(allProducts);

      // Verify cart badge shows correct count
      await po.inventoryPage.assertCartBadgeCount(6);

      // Verify all products show remove button
      for (const product of allProducts) {
        await po.inventoryPage.assertProductAddedToCart(product);
      }
    });

    test('@inventory @cart - Should maintain cart state across page refresh', async () => {
      // Add products to cart
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.addProductToCart('Sauce Labs Bike Light');
      await po.inventoryPage.assertCartBadgeCount(2);

      // Refresh page
      await po.page.reload();
      await po.inventoryPage.waitForPageLoad();

      // Verify cart state is maintained
      await po.inventoryPage.assertCartBadgeCount(2);
      await po.inventoryPage.assertProductAddedToCart('Sauce Labs Backpack');
      await po.inventoryPage.assertProductAddedToCart('Sauce Labs Bike Light');
    });

    test('@inventory @cart - Should navigate to cart and back to inventory', async () => {
      // Add product to cart
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart
      await po.inventoryPage.goToCart();
      await expect(po.page).toHaveURL(/.*cart/);

      // Go back to inventory
      await po.page.goBack();
      await po.inventoryPage.assertInventoryPageLoaded();

      // Verify cart state is maintained
      await po.inventoryPage.assertCartBadgeCount(1);
    });
  });

  // ==================== UI ELEMENT TESTS ====================

  test.describe('UI Element Tests', () => {
    test('@inventory @ui - Should have all required UI elements', async () => {
      // Verify header elements
      await expect(po.inventoryPage.headerTitle).toBeVisible();
      await expect(po.inventoryPage.menuButton).toBeVisible();
      await expect(po.inventoryPage.cartIcon).toBeVisible();

      // Verify sorting dropdown
      await expect(po.inventoryPage.sortDropdown).toBeVisible();

      // Verify inventory container
      await expect(po.inventoryPage.inventoryContainer).toBeVisible();

      // Verify product elements
      await expect(po.inventoryPage.inventoryItems).toHaveCount(6);
    });

    test('@inventory @ui - Should have proper button states', async () => {
      const productName = 'Sauce Labs Backpack';

      // Initially, add to cart button should be visible
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const addToCartButton = productItem.locator('[data-test*="add-to-cart"]');
      await expect(addToCartButton).toBeVisible();

      // Add product to cart
      await po.inventoryPage.addProductToCart(productName);

      // Remove button should be visible
      const removeButton = productItem.locator('[data-test*="remove"]');
      await expect(removeButton).toBeVisible();
    });

    test('@inventory @ui - Should display cart badge correctly', async () => {
      // Initially, cart badge should not be visible
      await expect(po.inventoryPage.cartBadge).not.toBeVisible();

      // Add product to cart
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Cart badge should be visible with count 1
      await expect(po.inventoryPage.cartBadge).toBeVisible();
      await expect(po.inventoryPage.cartBadge).toHaveText('1');

      // Add another product
      await po.inventoryPage.addProductToCart('Sauce Labs Bike Light');

      // Cart badge should show count 2
      await expect(po.inventoryPage.cartBadge).toHaveText('2');
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
    test('@inventory @performance - Should load inventory page quickly', async () => {
      const startTime = Date.now();

      // Navigate to inventory page
      await po.inventoryPage.goto();
      await po.inventoryPage.waitForPageLoad();

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Inventory page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify page is loaded correctly
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@inventory @performance - Should add products to cart quickly', async () => {
      const startTime = Date.now();

      // Add multiple products to cart
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
      ]);

      const endTime = Date.now();
      const addToCartTime = endTime - startTime;

      // Adding products should complete within 2 seconds
      expect(addToCartTime).toBeLessThan(2000);

      // Verify products were added
      await po.inventoryPage.assertCartBadgeCount(3);
    });

    test('@inventory @performance - Should sort products quickly', async () => {
      const startTime = Date.now();

      // Sort products by different options
      await po.inventoryPage.sortProducts('az');
      await po.inventoryPage.sortProducts('za');
      await po.inventoryPage.sortProducts('lohi');
      await po.inventoryPage.sortProducts('hilo');

      const endTime = Date.now();
      const sortTime = endTime - startTime;

      // Sorting should complete within 2 seconds
      expect(sortTime).toBeLessThan(2000);
    });
  });

  // ==================== EDGE CASE TESTS ====================

  test.describe('Edge Case Tests', () => {
    test('@inventory @edge - Should handle rapid add/remove operations', async () => {
      const productName = 'Sauce Labs Backpack';

      // Rapid add/remove operations
      for (let i = 0; i < 5; i++) {
        await po.inventoryPage.addProductToCart(productName);
        await po.inventoryPage.removeProductFromCart(productName);
      }

      // Verify final state
      await po.inventoryPage.assertCartBadgeCount(0);
      await po.inventoryPage.assertProductRemovedFromCart(productName);
    });

    test('@inventory @edge - Should handle sorting with products in cart', async () => {
      // Add products to cart
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
      ]);

      // Sort products multiple times
      await po.inventoryPage.sortProducts('az');
      await po.inventoryPage.sortProducts('za');
      await po.inventoryPage.sortProducts('lohi');
      await po.inventoryPage.sortProducts('hilo');

      // Verify cart state is maintained
      await po.inventoryPage.assertCartBadgeCount(2);
      await po.inventoryPage.assertProductAddedToCart('Sauce Labs Backpack');
      await po.inventoryPage.assertProductAddedToCart('Sauce Labs Bike Light');
    });

    test('@inventory @edge - Should handle page refresh during operations', async () => {
      // Add product to cart
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Refresh page during operation
      await po.page.reload();
      await po.inventoryPage.waitForPageLoad();

      // Verify state is maintained
      await po.inventoryPage.assertCartBadgeCount(1);
      await po.inventoryPage.assertProductAddedToCart('Sauce Labs Backpack');
    });
  });
});
