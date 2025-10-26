import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Product Details Regression Tests
 * Comprehensive tests for product details page functionality
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Product Details Regression Tests', () => {
  let po;

  // Timeout is configured in playwright.config.js (45 seconds for authenticated-tests)

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);
    // Navigate to inventory page first (we're already authenticated)
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
  });

  // ==================== POSITIVE PRODUCT DETAILS TESTS ====================

  test.describe('Positive Product Details Tests', () => {
    test('@productDetails @positive - Should navigate to product details page', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Verify URL contains inventory-item
      await expect(po.page).toHaveURL(/.*inventory-item/);

      // Verify product details page is loaded
      await po.productDetailsPage.assertPageLoaded();

      // Verify product name matches
      await po.productDetailsPage.assertProductName(productName);
    });

    test('@productDetails @positive - Should display product information correctly', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Verify all product details are displayed
      await po.productDetailsPage.assertAllProductDetailsDisplayed();

      // Verify specific product information
      const name = await po.productDetailsPage.getProductName();
      const price = await po.productDetailsPage.getProductPrice();
      const description = await po.productDetailsPage.getProductDescription();

      // Verify name is correct
      expect(name).toBe(productName);

      // Verify price format
      expect(price).toMatch(/\$\d+\.\d{2}/);

      // Verify description exists
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(0);
    });

    test('@productDetails @positive - Should add product to cart from details page', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Add product to cart
      await po.productDetailsPage.addToCart();

      // Verify product is added to cart
      await po.productDetailsPage.assertProductAddedToCart();

      // Verify cart badge shows 1 item
      await po.productDetailsPage.assertCartBadgeCount(1);
    });

    test('@productDetails @positive - Should remove product from cart from details page', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Add product to cart first
      await po.productDetailsPage.addToCart();
      await po.productDetailsPage.assertCartBadgeCount(1);

      // Remove product from cart
      await po.productDetailsPage.removeFromCart();

      // Verify product is removed from cart
      await po.productDetailsPage.assertProductRemovedFromCart();

      // Verify cart badge is hidden
      await po.productDetailsPage.assertCartBadgeCount(0);
    });

    test('@productDetails @positive - Should navigate back to inventory page', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Click back button
      await po.productDetailsPage.goBackToInventory();

      // Verify we're back on inventory page
      await po.inventoryPage.assertInventoryPageLoaded();
      await expect(po.page).toHaveURL(/.*inventory/);
    });
  });

  // ==================== CART FUNCTIONALITY TESTS ====================

  test.describe('Cart Functionality Tests', () => {
    test('@productDetails @cart - Should add and remove same product multiple times', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Add product
      await po.productDetailsPage.addToCart();
      await po.productDetailsPage.assertCartBadgeCount(1);

      // Remove product
      await po.productDetailsPage.removeFromCart();
      await po.productDetailsPage.assertCartBadgeCount(0);

      // Add product again
      await po.productDetailsPage.addToCart();
      await po.productDetailsPage.assertCartBadgeCount(1);

      // Remove product again
      await po.productDetailsPage.removeFromCart();
      await po.productDetailsPage.assertCartBadgeCount(0);
    });

    test('@productDetails @cart - Should maintain cart state when returning from details', async () => {
      const productName = 'Sauce Labs Backpack';

      // Add product to cart from inventory
      await po.inventoryPage.addProductToCart(productName);
      await po.inventoryPage.assertCartBadgeCount(1);

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Verify product is in cart (remove button should be visible)
      await po.productDetailsPage.assertProductAddedToCart();

      // Go back to inventory
      await po.productDetailsPage.goBackToInventory();

      // Verify cart state is maintained
      await po.inventoryPage.assertCartBadgeCount(1);
      await po.inventoryPage.assertProductAddedToCart(productName);
    });

    test('@productDetails @cart - Should navigate to cart from details page', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Add product to cart
      await po.productDetailsPage.addToCart();

      // Navigate to cart
      await po.productDetailsPage.goToCart();

      // Verify we're on cart page
      await expect(po.page).toHaveURL(/.*cart/);

      // Verify cart page title
      const pageTitle = await po.page.title();
      expect(pageTitle).toBe(TestDataLoader.getPageTitle('cart'));
    });

    test('@productDetails @cart - Should add multiple products via details page', async () => {
      const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

      for (const productName of products) {
        // Go back to inventory if not on it
        const currentUrl = po.page.url();
        if (!currentUrl.includes('/inventory')) {
          await po.inventoryPage.goto();
          await po.inventoryPage.waitForPageLoad();
        }

        // Navigate to product details
        const productItem = po.inventoryPage.getProductItemByName(productName);
        const productNameLink = productItem.locator('.inventory_item_name');
        await productNameLink.click();
        await po.productDetailsPage.waitForPageLoad();

        // Add product to cart
        await po.productDetailsPage.addToCart();

        // Go back to inventory
        await po.productDetailsPage.goBackToInventory();
        await po.inventoryPage.waitForPageLoad();
      }

      // Verify all products are in cart
      await po.inventoryPage.assertCartBadgeCount(3);

      // Verify each product shows remove button
      for (const productName of products) {
        await po.inventoryPage.assertProductAddedToCart(productName);
      }
    });
  });

  // ==================== UI ELEMENT TESTS ====================

  test.describe('UI Element Tests', () => {
    test('@productDetails @ui - Should have all required UI elements', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Verify all required elements are visible
      await po.productDetailsPage.assertProductImageVisible();
      await po.productDetailsPage.assertBackButtonVisible();

      // Verify header elements
      await expect(po.productDetailsPage.headerTitle).toBeVisible();
      await expect(po.productDetailsPage.menuButton).toBeVisible();
      await expect(po.productDetailsPage.cartIcon).toBeVisible();
    });

    test('@productDetails @ui - Should have proper button states', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Initially, add to cart button should be visible
      await expect(po.productDetailsPage.addToCartButton).toBeVisible();
      await expect(po.productDetailsPage.removeButton).not.toBeVisible();

      // Add product to cart
      await po.productDetailsPage.addToCart();

      // Remove button should be visible, add button should not
      await expect(po.productDetailsPage.addToCartButton).not.toBeVisible();
      await expect(po.productDetailsPage.removeButton).toBeVisible();
    });

    test('@productDetails @ui - Should display cart badge correctly', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      {
        const productItem = po.inventoryPage.getProductItemByName(productName);
        const productNameLink = productItem.locator('.inventory_item_name');
        await productNameLink.click();
      }
      await po.productDetailsPage.waitForPageLoad();

      // Initially, cart badge should not be visible
      await expect(po.productDetailsPage.cartBadge).not.toBeVisible();

      // Add product to cart
      await po.productDetailsPage.addToCart();

      // Cart badge should be visible with count 1
      await expect(po.productDetailsPage.cartBadge).toBeVisible();
      await expect(po.productDetailsPage.cartBadge).toHaveText('1');

      // Add another product from inventory
      await po.productDetailsPage.goBackToInventory();
      await po.inventoryPage.addProductToCart('Sauce Labs Bike Light');

      // Navigate back to details
      {
        const productItem = po.inventoryPage.getProductItemByName(productName);
        const productNameLink = productItem.locator('.inventory_item_name');
        await productNameLink.click();
      }
      await po.productDetailsPage.waitForPageLoad();

      // Cart badge should show count 2
      await expect(po.productDetailsPage.cartBadge).toHaveText('2');
    });
  });

  // ==================== NAVIGATION TESTS ====================

  test.describe('Navigation Tests', () => {
    test('@productDetails @navigation - Should navigate to and from product details', async () => {
      const productName = 'Sauce Labs Backpack';

      // Start on inventory
      await po.inventoryPage.assertInventoryPageLoaded();

      // Navigate to details
      {
        const productItem = po.inventoryPage.getProductItemByName(productName);
        const productNameLink = productItem.locator('.inventory_item_name');
        await productNameLink.click();
      }
      await po.productDetailsPage.waitForPageLoad();
      await expect(po.page).toHaveURL(/.*inventory-item/);

      // Go back to inventory
      await po.productDetailsPage.goBackToInventory();
      await po.inventoryPage.assertInventoryPageLoaded();
      await expect(po.page).toHaveURL(/.*inventory/);
    });

    test('@productDetails @navigation - Should navigate between different products', async () => {
      const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

      for (const productName of products) {
        // Navigate to inventory
        await po.inventoryPage.goto();
        await po.inventoryPage.waitForPageLoad();

        // Navigate to product details
        const productItem = po.inventoryPage.getProductItemByName(productName);
        const productNameLink = productItem.locator('.inventory_item_name');
        await productNameLink.click();
        await po.productDetailsPage.waitForPageLoad();

        // Verify correct product is displayed
        await po.productDetailsPage.assertProductName(productName);
      }
    });

    test('@productDetails @navigation - Should navigate to cart and back', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Add product to cart
      await po.productDetailsPage.addToCart();

      // Navigate to cart
      await po.productDetailsPage.goToCart();
      await expect(po.page).toHaveURL(/.*cart/);

      // Go back to product details
      await po.page.goBack();
      await po.productDetailsPage.waitForPageLoad();

      // Verify we're on product details page
      await expect(po.page).toHaveURL(/.*inventory-item/);

      // Verify cart state is maintained
      await po.productDetailsPage.assertCartBadgeCount(1);
    });
  });

  // ==================== PRODUCT INFORMATION TESTS ====================

  test.describe('Product Information Tests', () => {
    test('@productDetails @info - Should display correct product price', async () => {
      const productName = 'Sauce Labs Backpack';
      const expectedPrice = '$29.99';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Verify product price
      await po.productDetailsPage.assertProductPrice(expectedPrice);
    });

    test('@productDetails @info - Should display product description', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Verify product description exists and is not empty
      await po.productDetailsPage.assertProductDescriptionExists();
    });

    test('@productDetails @info - Should display product image', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Verify product image is visible
      await po.productDetailsPage.assertProductImageVisible();
    });

    test('@productDetails @info - Should match product details with inventory list', async () => {
      const productName = 'Sauce Labs Backpack';

      // Get product info from inventory page
      const inventoryPrice = await po.inventoryPage.getProductPrice(productName);
      const inventoryDescription = await po.inventoryPage.getProductDescription(productName);

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Get product info from details page
      const detailsPrice = await po.productDetailsPage.getProductPrice();
      const detailsDescription = await po.productDetailsPage.getProductDescription();

      // Verify prices match
      expect(detailsPrice).toBe(inventoryPrice);

      // Verify descriptions match
      expect(detailsDescription).toBe(inventoryDescription);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
    test('@productDetails @performance - Should load product details page quickly', async () => {
      const productName = 'Sauce Labs Backpack';

      const startTime = Date.now();

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Product details page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify page is loaded correctly
      await po.productDetailsPage.assertPageLoaded();
    });

    test('@productDetails @performance - Should add product to cart quickly', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      const startTime = Date.now();

      // Add product to cart
      await po.productDetailsPage.addToCart();

      const endTime = Date.now();
      const addToCartTime = endTime - startTime;

      // Adding product should complete within 1 second
      expect(addToCartTime).toBeLessThan(1000);

      // Verify product was added
      await po.productDetailsPage.assertCartBadgeCount(1);
    });
  });

  // ==================== EDGE CASE TESTS ====================

  test.describe('Edge Case Tests', () => {
    test('@productDetails @edge - Should handle rapid add/remove operations', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Rapid add/remove operations
      for (let i = 0; i < 5; i++) {
        await po.productDetailsPage.addToCart();
        await po.productDetailsPage.removeFromCart();
      }

      // Verify final state
      await po.productDetailsPage.assertCartBadgeCount(0);
      await po.productDetailsPage.assertProductRemovedFromCart();
    });

    test('@productDetails @edge - Should maintain state during page navigation', async () => {
      const productName = 'Sauce Labs Backpack';

      // Navigate to product details by clicking product name link
      const productItem = po.inventoryPage.getProductItemByName(productName);
      const productNameLink = productItem.locator('.inventory_item_name');
      await productNameLink.click();
      await po.productDetailsPage.waitForPageLoad();

      // Add product to cart
      await po.productDetailsPage.addToCart();
      await po.productDetailsPage.assertCartBadgeCount(1);

      // Navigate to inventory and back
      await po.productDetailsPage.goBackToInventory();
      {
        const productItem = po.inventoryPage.getProductItemByName(productName);
        const productNameLink = productItem.locator('.inventory_item_name');
        await productNameLink.click();
      }
      await po.productDetailsPage.waitForPageLoad();

      // Verify cart state is maintained
      await po.productDetailsPage.assertCartBadgeCount(1);
      await po.productDetailsPage.assertProductAddedToCart();
    });
  });
});
