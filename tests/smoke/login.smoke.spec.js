import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Login Smoke Tests
 * Critical path tests that verify essential login functionality works
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Login Smoke Tests', () => {
  let po;

  // Timeout is configured in playwright.config.js (30 seconds for smoke-tests)

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);
    // Navigate to inventory page (we're already authenticated)
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
  });

  // ==================== CRITICAL PATH TESTS ====================

  test('@smoke @login @critical - Should access inventory page after authentication', async () => {
    // Verify we're successfully authenticated and on inventory page
    await expect(po.page).toHaveURL(/.*inventory/);

    // Verify page title
    const pageTitle = await po.page.title();
    expect(pageTitle).toBe(TestDataLoader.getPageTitle('inventory'));

    // Verify inventory page is properly loaded
    await po.inventoryPage.assertInventoryPageLoaded();

    // Verify inventory items are loaded
    await po.inventoryPage.assertAllProductsDisplayed(6);
  });

  test('@smoke @login @critical - Should display all required UI elements', async () => {
    // Verify header elements
    await expect(po.inventoryPage.headerTitle).toBeVisible();
    await expect(po.inventoryPage.menuButton).toBeVisible();
    await expect(po.inventoryPage.cartIcon).toBeVisible();

    // Verify sorting dropdown is visible
    await expect(po.inventoryPage.sortDropdown).toBeVisible();

    // Verify inventory container is visible
    await expect(po.inventoryPage.inventoryContainer).toBeVisible();
  });

  test('@smoke @login @critical - Should maintain authentication across page navigation', async () => {
    // Verify we're authenticated by checking inventory page
    await expect(po.page).toHaveURL(/.*inventory/);

    // Navigate to cart page
    await po.cartPage.goto();
    await po.cartPage.waitForPageLoad();

    // Verify we're still authenticated (not redirected to login)
    await expect(po.page).toHaveURL(/.*cart/);
    await po.cartPage.assertCartPageLoaded();

    // Go back to inventory
    await po.inventoryPage.goto();
    await expect(po.page).toHaveURL(/.*inventory/);
    await po.inventoryPage.assertInventoryPageLoaded();
  });

  test('@smoke @login @critical - Should handle page refresh while authenticated', async () => {
    // Verify we're on inventory page
    await expect(po.page).toHaveURL(/.*inventory/);

    // Refresh the page
    await po.page.reload();
    await po.inventoryPage.waitForPageLoad();

    // Verify we're still authenticated (not redirected to login)
    await expect(po.page).toHaveURL(/.*inventory/);

    // Verify inventory page is still visible
    await po.inventoryPage.assertInventoryPageLoaded();
  });

  test('@smoke @login @critical - Should have proper user session information', async () => {
    // Verify we're authenticated by checking for user-specific elements
    await expect(po.page).toHaveURL(/.*inventory/);

    // Verify header menu button is visible (indicates authenticated state)
    await expect(po.inventoryPage.menuButton).toBeVisible();

    // Verify cart icon is visible
    await expect(po.inventoryPage.cartIcon).toBeVisible();
  });

  // ==================== PERFORMANCE SMOKE TESTS ====================

  test('@smoke @login @performance - Should load inventory page quickly', async () => {
    const startTime = Date.now();

    // Navigate to inventory page
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Inventory page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify all elements are visible
    await po.inventoryPage.assertInventoryPageLoaded();
  });

  test('@smoke @login @performance - Should navigate between pages quickly', async () => {
    const startTime = Date.now();

    // Navigate to cart page
    await po.cartPage.goto();
    await po.cartPage.waitForPageLoad();

    const endTime = Date.now();
    const navigationTime = endTime - startTime;

    // Page navigation should complete within 2 seconds
    expect(navigationTime).toBeLessThan(2000);

    // Verify we're on cart page
    await expect(po.page).toHaveURL(/.*cart/);
    await po.cartPage.assertCartPageLoaded();
  });

  // ==================== NAVIGATION SMOKE TESTS ====================

  test('@smoke @login @navigation - Should navigate between authenticated pages', async () => {
    // Start on inventory page
    await expect(po.page).toHaveURL(/.*inventory/);

    // Navigate to cart page
    await po.cartPage.goto();
    await expect(po.page).toHaveURL(/.*cart/);

    // Navigate to checkout info page
    await po.checkoutInfoPage.goto();
    await expect(po.page).toHaveURL(/.*checkout-step-one/);

    // Go back to inventory
    await po.inventoryPage.goto();
    await expect(po.page).toHaveURL(/.*inventory/);
    await po.inventoryPage.assertInventoryPageLoaded();
  });

  // ==================== ACCESSIBILITY SMOKE TESTS ====================

  test('@smoke @login @accessibility - Should have proper page structure and accessibility', async () => {
    // Verify inventory page has proper structure
    await expect(po.page).toHaveURL(/.*inventory/);

    // Verify main content is visible
    await expect(po.inventoryPage.inventoryContainer).toBeVisible();

    // Verify header elements are accessible
    await expect(po.inventoryPage.menuButton).toBeVisible();
    await expect(po.inventoryPage.cartIcon).toBeVisible();
    await expect(po.inventoryPage.headerTitle).toBeVisible();
  });

  // ==================== CROSS-BROWSER SMOKE TESTS ====================

  test('@smoke @login @cross-browser - Should work consistently across different viewports', async () => {
    // Test on mobile viewport
    await po.page.setViewportSize({ width: 375, height: 667 });

    // Verify inventory page still works on mobile
    await expect(po.inventoryPage.inventoryContainer).toBeVisible();

    // Verify mobile navigation works
    await expect(po.inventoryPage.menuButton).toBeVisible();

    // Reset to desktop viewport
    await po.page.setViewportSize({ width: 1280, height: 720 });

    // Verify desktop layout still works
    await expect(po.inventoryPage.inventoryContainer).toBeVisible();
    await po.inventoryPage.assertInventoryPageLoaded();
  });

  // ==================== ADDITIONAL SMOKE TESTS ====================

  test('@smoke @login @cart - Should have empty cart after authentication', async () => {
    // Verify cart badge is not visible (empty cart)
    await expect(po.inventoryPage.cartBadge).not.toBeVisible();
  });

  test('@smoke @login @menu - Should open and close header menu', async () => {
    // Open menu
    await po.inventoryPage.openMenu();
    await expect(po.inventoryPage.menuItems).toBeVisible();

    // Close menu
    await po.inventoryPage.closeMenu();
    await expect(po.inventoryPage.menuItems).not.toBeVisible();
  });

  test('@smoke @login @logout - Should logout successfully', async () => {
    // Logout from application
    await po.inventoryPage.logout();

    // Verify we're redirected to login page
    await expect(po.page).toHaveURL(/.*\/$/);

    // Verify login page elements are visible
    await expect(po.loginPage.usernameInput).toBeVisible();
    await expect(po.loginPage.passwordInput).toBeVisible();
    await expect(po.loginPage.loginButton).toBeVisible();
  });
});
