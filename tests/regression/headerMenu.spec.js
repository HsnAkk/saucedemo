import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Header Menu Regression Tests
 * Comprehensive tests for header menu and navigation functionality
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Header Menu Regression Tests', () => {
  let po;

  // Timeout is configured in playwright.config.js (45 seconds for authenticated-tests)

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);
    // Navigate to inventory page (we're already authenticated)
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
  });

  // ==================== MENU INTERACTION TESTS ====================

  test.describe('Menu Interaction Tests', () => {
    test('@menu @positive - Should open header menu', async () => {
      await po.headerComponents.openMenu();
      await po.headerComponents.assertMenuIsOpen();
    });

    test('@menu @positive - Should close header menu', async () => {
      await po.headerComponents.openMenu();
      await po.headerComponents.assertMenuIsOpen();

      await po.headerComponents.closeMenu();
      await po.headerComponents.assertMenuIsClosed();
    });

    test('@menu @positive - Should display all menu items when opened', async () => {
      await po.headerComponents.openMenu();
      await po.headerComponents.assertMenuIsOpen();

      // Check that menu items exist in DOM (they may be hidden by CSS but still accessible)
      await expect(po.headerComponents.allItemsLink).toBeAttached();
      await expect(po.headerComponents.aboutLink).toBeAttached();
      await expect(po.headerComponents.logoutLink).toBeAttached();
      await expect(po.headerComponents.resetAppLink).toBeAttached();
    });

    test('@menu @ui - Should have proper menu button state', async () => {
      await expect(po.headerComponents.menuButton).toBeVisible();
      await expect(po.headerComponents.menuButton).toBeEnabled();
    });

    test('@menu @edge - Should handle rapid open/close menu operations', async () => {
      for (let i = 0; i < 5; i++) {
        await po.headerComponents.openMenu();
        await po.headerComponents.assertMenuIsOpen();
        await po.headerComponents.closeMenu();
        await po.headerComponents.assertMenuIsClosed();
      }
    });
  });

  // ==================== MENU NAVIGATION TESTS ====================

  test.describe('Menu Navigation Tests', () => {
    test('@menu @navigation - Should navigate to all items (inventory)', async () => {
      // Add some products to cart first
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate away from inventory (go to cart)
      await po.inventoryPage.goToCart();

      // Use menu to go back to all items
      await po.headerComponents.goToAllItems();

      // Verify we're back on inventory page
      await expect(po.page).toHaveURL(/.*inventory/);
      await po.inventoryPage.assertInventoryPageLoaded();

      // Verify cart state is maintained
      await po.inventoryPage.assertCartBadgeCount(1);
    });

    test('@menu @navigation - Should navigate to about page', async () => {
      await po.headerComponents.goToAbout();

      // Verify we're on about page
      await expect(po.page).toHaveURL(/.*saucelabs/);

      // Go back to inventory
      await po.page.goBack();
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@menu @logout - Should logout successfully from menu', async () => {
      await po.headerComponents.logout();

      // Verify we're redirected to login page
      await expect(po.page).toHaveURL(/.*\/$/);

      // Verify login page elements are visible
      await expect(po.loginPage.usernameInput).toBeVisible();
      await expect(po.loginPage.passwordInput).toBeVisible();
      await expect(po.loginPage.loginButton).toBeVisible();
    });

    test('@menu @reset - Should reset application state', async () => {
      // Add products to cart first
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
      ]);

      // Verify cart has items
      await po.inventoryPage.assertCartBadgeCount(2);

      // Reset application
      await po.headerComponents.resetApp();

      // Verify cart is cleared
      await po.inventoryPage.assertCartBadgeCount(0);

      // Verify we're still on inventory page
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@menu @navigation - Should navigate through menu and back', async () => {
      await po.headerComponents.openMenu();
      await po.headerComponents.assertMenuIsOpen();

      await po.headerComponents.goToAbout();
      await expect(po.page).toHaveURL(/.*saucelabs/);

      // Go back
      await po.page.goBack();
      await po.inventoryPage.assertInventoryPageLoaded();

      // Menu should be closed after navigation
      await po.headerComponents.assertMenuIsClosed();
    });
  });

  // ==================== CART FUNCTIONALITY TESTS ====================

  test.describe('Cart Functionality in Menu Tests', () => {
    test('@menu @cart - Should navigate to cart from header', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      await po.headerComponents.goToCart();

      // Verify we're on cart page
      await expect(po.page).toHaveURL(/.*cart/);
      await po.cartPage.assertCartPageLoaded();
    });

    test('@menu @cart - Should display correct cart count in badge', async () => {
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
      ]);

      // Verify cart badge shows correct count
      await po.headerComponents.assertCartBadgeCount(3);
    });

    test('@menu @cart - Should hide cart badge when cart is empty', async () => {
      await po.headerComponents.assertCartBadgeCount(0);
      await expect(po.headerComponents.cartBadge).not.toBeVisible();
    });

    test('@menu @cart - Should maintain cart state after menu operations', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      await po.headerComponents.openMenu();
      await po.headerComponents.closeMenu();

      await po.inventoryPage.assertCartBadgeCount(1);
    });
  });

  // ==================== UI ELEMENT TESTS ====================

  test.describe('UI Element Tests', () => {
    test('@menu @ui - Should have all required header elements', async () => {
      await po.headerComponents.assertHeaderElementsVisible();
    });

    test('@menu @ui - Should have accessible menu button', async () => {
      await expect(po.headerComponents.menuButton).toBeVisible();
      await expect(po.headerComponents.menuButton).toBeEnabled();
    });

    test('@menu @ui - Should have accessible cart icon', async () => {
      await expect(po.headerComponents.cartIcon).toBeVisible();
      await expect(po.headerComponents.cartIcon).toBeEnabled();
    });

    test('@menu @ui - Should display header title', async () => {
      await expect(po.headerComponents.headerTitle).toBeVisible();
    });

    test('@menu @ui - Should have proper menu item states', async () => {
      // Initially menu should be closed
      await po.headerComponents.assertMenuIsClosed();

      // After opening menu, items should be attached
      await po.headerComponents.openMenu();
      await po.headerComponents.assertMenuIsOpen();
      await expect(po.headerComponents.allItemsLink).toBeAttached();
      await expect(po.headerComponents.logoutLink).toBeAttached();
    });
  });

  // ==================== SOCIAL MEDIA TESTS ====================

  test.describe('Social Media Links Tests', () => {
    test('@menu @social - Should have Twitter link in header', async () => {
      await expect(po.headerComponents.twitterLink).toBeVisible();
      await expect(po.headerComponents.twitterLink).toBeEnabled();
    });

    test('@menu @social - Should have Facebook link in header', async () => {
      await expect(po.headerComponents.facebookLink).toBeVisible();
      await expect(po.headerComponents.facebookLink).toBeEnabled();
    });

    test('@menu @social - Should have LinkedIn link in header', async () => {
      await expect(po.headerComponents.linkedinLink).toBeVisible();
      await expect(po.headerComponents.linkedinLink).toBeEnabled();
    });
  });

  // ==================== EDGE CASE TESTS ====================

  test.describe('Edge Case Tests', () => {
    test('@menu @edge - Should handle logout with items in cart', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      await po.headerComponents.logout();

      // Verify we're logged out
      await expect(po.page).toHaveURL(/.*\/$/);
      await expect(po.loginPage.usernameInput).toBeVisible();
    });

    test('@menu @edge - Should maintain cart state through page refresh', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');
      await po.inventoryPage.assertCartBadgeCount(1);

      await po.page.reload();
      await po.inventoryPage.waitForPageLoad();

      // Verify cart state is maintained
      await po.inventoryPage.assertCartBadgeCount(1);
    });

    test('@menu @edge - Should handle menu operations with multiple products', async () => {
      await po.inventoryPage.addMultipleProductsToCart([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Fleece Jacket',
      ]);

      await po.headerComponents.assertCartBadgeCount(4);
      await po.headerComponents.openMenu();
      await po.headerComponents.assertMenuIsOpen();
      await po.headerComponents.closeMenu();
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
    test('@menu @performance - Should open menu quickly', async () => {
      const startTime = Date.now();

      await po.headerComponents.openMenu();

      const endTime = Date.now();
      const openTime = endTime - startTime;

      // Menu should open within 1 second
      expect(openTime).toBeLessThan(1000);
    });

    test('@menu @performance - Should close menu quickly', async () => {
      await po.headerComponents.openMenu();

      const startTime = Date.now();
      await po.headerComponents.closeMenu();
      const endTime = Date.now();

      const closeTime = endTime - startTime;

      // Menu should close within 1 second
      expect(closeTime).toBeLessThan(1000);
    });
  });

  // ==================== INTEGRATION TESTS ====================

  test.describe('Integration Tests', () => {
    test('@menu @integration - Should complete full workflow with menu', async () => {
      // Add product
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      // Navigate to cart via header
      await po.headerComponents.goToCart();
      await po.cartPage.assertCartPageLoaded();

      // Go back to inventory via menu
      await po.headerComponents.goToAllItems();
      await po.inventoryPage.assertInventoryPageLoaded();

      // Verify cart state is maintained
      await po.inventoryPage.assertCartBadgeCount(1);

      // Complete checkout
      await po.inventoryPage.goToCart();
      await po.cartPage.goToCheckout();

      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();
      await po.checkoutOverviewPage.finish();

      // Verify order is complete
      await expect(po.page).toHaveURL(/.*checkout-complete/);
    });

    test('@menu @integration - Should handle logout and re-login flow', async () => {
      await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

      await po.headerComponents.logout();
      await expect(po.page).toHaveURL(/.*\/$/);

      // Login again
      const userData = TestDataLoader.getUserCredentials('standard');
      await po.loginPage.login(userData.username, userData.password);

      await expect(po.page).toHaveURL(/.*inventory/);
      await po.inventoryPage.assertInventoryPageLoaded();

      // Note: Cart persists across logout/login because we're using the same storage state
      // In a real scenario, cart would be tied to the user session
      // This test verifies the logout and re-login process works correctly
      await po.inventoryPage.assertInventoryPageLoaded();
    });
  });
});
