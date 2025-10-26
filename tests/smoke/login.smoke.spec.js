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
    await page.goto('/inventory.html');
    await page.waitForLoadState('networkidle');

    // If we're redirected to login page, it means auth state wasn't loaded properly
    const currentUrl = page.url();
    if (currentUrl.includes('/') && !currentUrl.includes('/inventory')) {
      console.warn('Authentication state not loaded properly, redirecting to login page');
      // Take a screenshot for debugging
      await page.screenshot({ path: 'screenshots/auth-state-error.png' });
      throw new Error('Authentication state not properly loaded. Current URL: ' + currentUrl);
    }
  });

  // ==================== CRITICAL PATH TESTS ====================

  test('@smoke @login @critical - Should access inventory page after authentication', async () => {
    // Verify we're successfully authenticated and on inventory page
    await expect(po.page).toHaveURL(/.*inventory/);

    // Verify page title
    const pageTitle = await po.page.title();
    expect(pageTitle).toBe(TestDataLoader.getPageTitle('inventory'));

    // Verify we can see inventory items (critical functionality)
    const inventoryContainer = po.page.locator('.inventory_container');
    await expect(inventoryContainer).toBeVisible();

    // Verify inventory items are loaded
    const inventoryItems = po.page.locator('.inventory_item');
    await expect(inventoryItems).toHaveCount(6); // SauceDemo has 6 products
  });

  test('@smoke @login @critical - Should maintain authentication across page navigation', async () => {
    // Verify we're authenticated by checking inventory page
    await expect(po.page).toHaveURL(/.*inventory/);

    // Navigate to cart page
    await po.page.goto('/cart.html');
    await po.page.waitForLoadState('networkidle');

    // Verify we're still authenticated (not redirected to login)
    await expect(po.page).toHaveURL(/.*cart/);

    // Go back to inventory
    await po.page.goto('/inventory.html');
    await expect(po.page).toHaveURL(/.*inventory/);
  });

  test('@smoke @login @critical - Should handle page refresh while authenticated', async () => {
    // Verify we're on inventory page
    await expect(po.page).toHaveURL(/.*inventory/);

    // Refresh the page
    await po.page.reload();
    await po.page.waitForLoadState('networkidle');

    // Verify we're still authenticated (not redirected to login)
    await expect(po.page).toHaveURL(/.*inventory/);

    // Verify inventory container is still visible
    const inventoryContainer = po.page.locator('.inventory_container');
    await expect(inventoryContainer).toBeVisible();
  });

  test('@smoke @login @critical - Should have proper user session information', async () => {
    // Verify we're authenticated by checking for user-specific elements
    await expect(po.page).toHaveURL(/.*inventory/);

    // Verify header menu is visible (indicates authenticated state)
    const headerMenu = po.page.locator('.bm-menu');
    // Note: Header menu might be hidden by default, so we check for menu button
    const menuButton = po.page.locator('#react-burger-menu-btn');
    await expect(menuButton).toBeVisible();
  });

  // ==================== PERFORMANCE SMOKE TESTS ====================

  test('@smoke @login @performance - Should load inventory page quickly', async () => {
    const startTime = Date.now();

    // Navigate to inventory page
    await po.page.goto('/inventory.html');
    await po.page.waitForLoadState('networkidle');

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Inventory page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify all elements are visible
    const inventoryContainer = po.page.locator('.inventory_container');
    await expect(inventoryContainer).toBeVisible();
  });

  test('@smoke @login @performance - Should navigate between pages quickly', async () => {
    const startTime = Date.now();

    // Navigate to cart page
    await po.page.goto('/cart.html');
    await po.page.waitForLoadState('networkidle');

    const endTime = Date.now();
    const navigationTime = endTime - startTime;

    // Page navigation should complete within 2 seconds
    expect(navigationTime).toBeLessThan(2000);

    // Verify we're on cart page
    await expect(po.page).toHaveURL(/.*cart/);
  });

  // ==================== NAVIGATION SMOKE TESTS ====================

  test('@smoke @login @navigation - Should navigate between authenticated pages', async () => {
    // Start on inventory page
    await expect(po.page).toHaveURL(/.*inventory/);

    // Navigate to cart page
    await po.page.goto('/cart.html');
    await po.page.waitForLoadState('networkidle');
    await expect(po.page).toHaveURL(/.*cart/);

    // Navigate to checkout info page
    await po.page.goto('/checkout-step-one.html');
    await po.page.waitForLoadState('networkidle');
    await expect(po.page).toHaveURL(/.*checkout-step-one/);

    // Go back to inventory
    await po.page.goto('/inventory.html');
    await expect(po.page).toHaveURL(/.*inventory/);
  });

  // ==================== ACCESSIBILITY SMOKE TESTS ====================

  test('@smoke @login @accessibility - Should have proper page structure and accessibility', async () => {
    // Verify inventory page has proper structure
    await expect(po.page).toHaveURL(/.*inventory/);

    // Verify main content is visible
    const inventoryContainer = po.page.locator('.inventory_container');
    await expect(inventoryContainer).toBeVisible();

    // Verify header elements are accessible
    const menuButton = po.page.locator('#react-burger-menu-btn');
    await expect(menuButton).toBeVisible();

    const cartIcon = po.page.locator('.shopping_cart_link');
    await expect(cartIcon).toBeVisible();
  });

  // ==================== CROSS-BROWSER SMOKE TESTS ====================

  test('@smoke @login @cross-browser - Should work consistently across different viewports', async () => {
    // Test on mobile viewport
    await po.page.setViewportSize({ width: 375, height: 667 });

    // Verify inventory page still works on mobile
    const inventoryContainer = po.page.locator('.inventory_container');
    await expect(inventoryContainer).toBeVisible();

    // Verify mobile navigation works
    const menuButton = po.page.locator('#react-burger-menu-btn');
    await expect(menuButton).toBeVisible();

    // Reset to desktop viewport
    await po.page.setViewportSize({ width: 1280, height: 720 });

    // Verify desktop layout still works
    await expect(inventoryContainer).toBeVisible();
  });
});
