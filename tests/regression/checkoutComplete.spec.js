import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Checkout Complete Regression Tests
 * Comprehensive tests for checkout complete page functionality
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Checkout Complete Regression Tests', () => {
  let po;

  // Timeout is configured in playwright.config.js (45 seconds for authenticated-tests)

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);

    // Complete the full checkout flow to reach the complete page
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
    await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

    // Navigate to cart
    await po.cartPage.goto();
    await po.cartPage.waitForPageLoad();
    await po.cartPage.goToCheckout();

    // Fill checkout form
    const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
    await po.checkoutInfoPage.fillCheckoutForm(
      testData.firstName,
      testData.lastName,
      testData.postalCode
    );
    await po.checkoutInfoPage.continueToOverview();

    // Complete checkout
    await po.checkoutOverviewPage.finish();
    await po.checkoutCompletePage.waitForPageLoad();
  });

  // ==================== POSITIVE CHECKOUT COMPLETE TESTS ====================

  test.describe('Positive Checkout Complete Tests', () => {
    test('@checkout @complete @positive - Should display checkout complete page correctly', async () => {
      // Verify checkout complete page is loaded
      await po.checkoutCompletePage.assertPageLoaded();

      // Verify page title
      const pageTitle = await po.page.title();
      expect(pageTitle).toBe(TestDataLoader.getPageTitle('checkout'));

      // Verify URL contains checkout-complete
      await expect(po.page).toHaveURL(/.*checkout-complete/);
    });

    test('@checkout @complete @positive - Should display success message', async () => {
      // Verify success message
      const successMessage = await po.checkoutCompletePage.getCompleteHeader();
      expect(successMessage).toContain('Thank you for your order!');
    });

    test('@checkout @complete @positive - Should display complete text', async () => {
      // Verify complete text is displayed
      await po.checkoutCompletePage.assertCompleteTextDisplayed();
    });

    test('@checkout @complete @positive - Should display pony express image', async () => {
      // Verify pony express image is visible
      await po.checkoutCompletePage.assertPonyExpressImageVisible();
    });

    test('@checkout @complete @positive - Should display all completion elements', async () => {
      // Verify all completion elements are visible
      await po.checkoutCompletePage.assertAllCompletionElementsDisplayed();
    });

    test('@checkout @complete @positive - Should navigate back to inventory', async () => {
      // Go back to products
      await po.checkoutCompletePage.backToProducts();

      // Verify we're on inventory page
      await expect(po.page).toHaveURL(/.*inventory/);
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@checkout @complete @positive - Should show cart is empty after completion', async () => {
      // Verify cart is empty
      await po.checkoutCompletePage.assertCartIsEmpty();
    });
  });

  // ==================== UI ELEMENT TESTS ====================

  test.describe('UI Element Tests', () => {
    test('@checkout @complete @ui - Should have all required UI elements', async () => {
      // Verify all UI elements are visible
      await po.checkoutCompletePage.assertAllElementsVisible();
    });

    test('@checkout @complete @ui - Should have back button visible and enabled', async () => {
      // Verify back button is visible and enabled
      await po.checkoutCompletePage.assertBackButtonVisible();
    });

    test('@checkout @complete @ui - Should display header elements correctly', async () => {
      // Verify header elements
      await expect(po.checkoutCompletePage.headerTitle).toBeVisible();
      await expect(po.checkoutCompletePage.menuButton).toBeVisible();
      await expect(po.checkoutCompletePage.cartIcon).toBeVisible();
    });
  });

  // ==================== NAVIGATION TESTS ====================

  test.describe('Navigation Tests', () => {
    test('@checkout @complete @navigation - Should navigate back to inventory from complete page', async () => {
      // Verify we're on complete page
      await expect(po.page).toHaveURL(/.*checkout-complete/);

      // Go back to products
      await po.checkoutCompletePage.backToProducts();

      // Verify we're on inventory
      await expect(po.page).toHaveURL(/.*inventory/);
      await po.inventoryPage.assertInventoryPageLoaded();
    });

    test('@checkout @complete @navigation - Should maintain empty cart after completion', async () => {
      // Verify cart is empty on complete page
      await po.checkoutCompletePage.assertCartIsEmpty();

      // Navigate back to inventory
      await po.checkoutCompletePage.backToProducts();

      // Verify cart is still empty on inventory
      await expect(po.checkoutCompletePage.cartBadge).not.toBeVisible();
    });

    test('@checkout @complete @navigation - Should complete full checkout flow', async () => {
      // Verify we're on complete page (after full flow)
      await expect(po.page).toHaveURL(/.*checkout-complete/);
      await po.checkoutCompletePage.assertPageLoaded();

      // Verify success message
      const successMessage = await po.checkoutCompletePage.getCompleteHeader();
      expect(successMessage).toContain('Thank you for your order!');
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
    test('@checkout @complete @performance - Should load checkout complete page quickly', async () => {
      const startTime = Date.now();

      // Navigate to checkout complete page
      await po.checkoutCompletePage.goto();
      await po.checkoutCompletePage.waitForPageLoad();

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Checkout complete page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify page is loaded correctly
      await po.checkoutCompletePage.assertPageLoaded();
    });

    test('@checkout @complete @performance - Should navigate back to products quickly', async () => {
      const startTime = Date.now();

      // Navigate back to inventory
      await po.checkoutCompletePage.backToProducts();

      const endTime = Date.now();
      const navigationTime = endTime - startTime;

      // Navigation should be quick
      expect(navigationTime).toBeLessThan(2000);

      // Verify we're on inventory
      await po.inventoryPage.assertInventoryPageLoaded();
    });
  });
});
