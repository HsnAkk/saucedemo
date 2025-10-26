import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Checkout Info Regression Tests
 * Comprehensive tests for checkout information page functionality
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Checkout Info Regression Tests', () => {
  let po;

  // Timeout is configured in playwright.config.js (45 seconds for authenticated-tests)

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);

    // Add products to cart and navigate to checkout
    await po.inventoryPage.goto();
    await po.inventoryPage.waitForPageLoad();
    await po.inventoryPage.addProductToCart('Sauce Labs Backpack');

    // Navigate to cart and proceed to checkout
    await po.cartPage.goto();
    await po.cartPage.waitForPageLoad();
    await po.cartPage.goToCheckout();
    await po.checkoutInfoPage.waitForPageLoad();
  });

  // ==================== POSITIVE CHECKOUT INFO TESTS ====================

  test.describe('Positive Checkout Info Tests', () => {
    test('@checkout @positive - Should display checkout info page correctly', async () => {
      // Verify checkout info page is loaded
      await po.checkoutInfoPage.assertPageLoaded();

      // Verify page title
      const pageTitle = await po.page.title();
      expect(pageTitle).toBe(TestDataLoader.getPageTitle('checkout'));

      // Verify URL contains checkout-step-one
      await expect(po.page).toHaveURL(/.*checkout-step-one/);
    });

    test('@checkout @positive - Should fill all form fields correctly', async () => {
      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;

      // Fill checkout form
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );

      // Verify form fields are filled
      await po.checkoutInfoPage.assertFormFieldsFilled(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
    });

    test('@checkout @positive - Should continue to checkout overview with valid data', async () => {
      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;

      // Fill checkout form
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );

      // Continue to checkout overview
      await po.checkoutInfoPage.continueToOverview();

      // Verify we're on checkout overview page
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });

    test('@checkout @positive - Should cancel and return to cart', async () => {
      // Cancel checkout
      await po.checkoutInfoPage.cancel();

      // Verify we're back on cart page
      await expect(po.page).toHaveURL(/.*cart/);
      await po.cartPage.assertCartPageLoaded();
    });

    test('@checkout @positive - Should accept special characters in form fields', async () => {
      const testData = TestDataLoader.loadTestData().testData.checkout.specialCharacters;

      // Fill checkout form with special characters
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );

      // Verify form fields accept special characters
      await po.checkoutInfoPage.assertFormFieldsFilled(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );

      // Continue to checkout overview
      await po.checkoutInfoPage.continueToOverview();
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });
  });

  // ==================== VALIDATION TESTS ====================

  test.describe('Validation Tests', () => {
    test('@checkout @validation - Should show error when first name is missing', async () => {
      // Fill only last name and postal code
      await po.checkoutInfoPage.fillLastName('Doe');
      await po.checkoutInfoPage.fillPostalCode('12345');

      // Try to continue
      await po.checkoutInfoPage.continueButton.click();

      // Verify error message
      await po.checkoutInfoPage.assertErrorMessage('First Name is required');
    });

    test('@checkout @validation - Should show error when last name is missing', async () => {
      // Fill only first name and postal code
      await po.checkoutInfoPage.fillFirstName('John');
      await po.checkoutInfoPage.fillPostalCode('12345');

      // Try to continue
      await po.checkoutInfoPage.continueButton.click();

      // Verify error message
      await po.checkoutInfoPage.assertErrorMessage('Last Name is required');
    });

    test('@checkout @validation - Should show error when postal code is missing', async () => {
      // Fill only first name and last name
      await po.checkoutInfoPage.fillFirstName('John');
      await po.checkoutInfoPage.fillLastName('Doe');

      // Try to continue
      await po.checkoutInfoPage.continueButton.click();

      // Verify error message
      await po.checkoutInfoPage.assertErrorMessage('Postal Code is required');
    });

    test('@checkout @validation - Should show error when all fields are empty', async () => {
      // Try to continue without filling any fields
      await po.checkoutInfoPage.continueButton.click();

      // Verify error message (should show first required field)
      await po.checkoutInfoPage.assertErrorMessage('First Name is required');
    });

    test('@checkout @validation - Should not navigate with empty form', async () => {
      // Try to continue without filling any fields
      await po.checkoutInfoPage.continueButton.click();

      // Verify we're still on checkout info page
      await expect(po.page).toHaveURL(/.*checkout-step-one/);
    });
  });

  // ==================== FORM INTERACTION TESTS ====================

  test.describe('Form Interaction Tests', () => {
    test('@checkout @form - Should fill form fields individually', async () => {
      // Fill fields one by one
      await po.checkoutInfoPage.fillFirstName('John');
      expect(await po.checkoutInfoPage.getFirstNameValue()).toBe('John');

      await po.checkoutInfoPage.fillLastName('Doe');
      expect(await po.checkoutInfoPage.getLastNameValue()).toBe('Doe');

      await po.checkoutInfoPage.fillPostalCode('12345');
      expect(await po.checkoutInfoPage.getPostalCodeValue()).toBe('12345');
    });

    test('@checkout @form - Should clear form fields', async () => {
      // Fill all fields
      await po.checkoutInfoPage.fillCheckoutForm('John', 'Doe', '12345');

      // Verify fields are filled
      await po.checkoutInfoPage.assertFormFieldsFilled('John', 'Doe', '12345');

      // Clear all fields
      await po.checkoutInfoPage.clearAllFields();

      // Verify fields are empty
      await po.checkoutInfoPage.assertFormFieldsEmpty();
    });

    test('@checkout @form - Should update form fields multiple times', async () => {
      // Fill form first time
      await po.checkoutInfoPage.fillCheckoutForm('John', 'Doe', '12345');

      // Clear and fill again
      await po.checkoutInfoPage.clearAllFields();
      await po.checkoutInfoPage.fillCheckoutForm('Jane', 'Smith', '54321');

      // Verify fields are updated
      await po.checkoutInfoPage.assertFormFieldsFilled('Jane', 'Smith', '54321');
    });

    test('@checkout @form - Should handle long text in form fields', async () => {
      const longFirstName = 'A'.repeat(100);
      const longLastName = 'B'.repeat(100);
      const longPostalCode = 'C'.repeat(20);

      // Fill with long text
      await po.checkoutInfoPage.fillCheckoutForm(longFirstName, longLastName, longPostalCode);

      // Verify long text is accepted
      await po.checkoutInfoPage.assertFormFieldsFilled(longFirstName, longLastName, longPostalCode);
    });
  });

  // ==================== UI ELEMENT TESTS ====================

  test.describe('UI Element Tests', () => {
    test('@checkout @ui - Should have all required UI elements', async () => {
      // Verify all elements are visible
      await po.checkoutInfoPage.assertAllElementsVisible();

      // Verify buttons are enabled
      await expect(po.checkoutInfoPage.continueButton).toBeEnabled();
      await expect(po.checkoutInfoPage.cancelButton).toBeEnabled();
    });

    test('@checkout @ui - Should display header elements correctly', async () => {
      // Verify header elements
      await expect(po.checkoutInfoPage.headerTitle).toBeVisible();
      await expect(po.checkoutInfoPage.menuButton).toBeVisible();
      await expect(po.checkoutInfoPage.cartIcon).toBeVisible();

      // Verify cart badge shows correct count
      await expect(po.checkoutInfoPage.cartBadge).toBeVisible();
      await expect(po.checkoutInfoPage.cartBadge).toHaveText('1');
    });

    test('@checkout @ui - Should enable continue button after filling form', async () => {
      // Fill all fields
      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );

      // Verify continue button is enabled
      await expect(po.checkoutInfoPage.continueButton).toBeEnabled();
    });
  });

  // ==================== NAVIGATION TESTS ====================

  test.describe('Navigation Tests', () => {
    test('@checkout @navigation - Should navigate from cart to checkout info', async () => {
      // Start from cart
      await po.cartPage.goto();
      await po.cartPage.waitForPageLoad();

      // Navigate to checkout
      await po.cartPage.goToCheckout();
      await expect(po.page).toHaveURL(/.*checkout-step-one/);

      // Verify page is loaded
      await po.checkoutInfoPage.assertPageLoaded();
    });

    test('@checkout @navigation - Should navigate back to cart from checkout', async () => {
      // Cancel checkout
      await po.checkoutInfoPage.cancel();

      // Verify we're back on cart
      await expect(po.page).toHaveURL(/.*cart/);
      await po.cartPage.assertCartPageLoaded();
    });

    test('@checkout @navigation - Should navigate to overview after filling form', async () => {
      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;

      // Fill and submit form
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      // Verify we're on overview
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
    test('@checkout @performance - Should load checkout info page quickly', async () => {
      const startTime = Date.now();

      // Navigate to checkout info page
      await po.checkoutInfoPage.goto();
      await po.checkoutInfoPage.waitForPageLoad();

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Checkout page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify page is loaded correctly
      await po.checkoutInfoPage.assertPageLoaded();
    });

    test('@checkout @performance - Should submit form quickly', async () => {
      const testData = TestDataLoader.loadTestData().testData.checkout.validCheckout;

      const startTime = Date.now();

      // Fill and submit form
      await po.checkoutInfoPage.fillCheckoutForm(
        testData.firstName,
        testData.lastName,
        testData.postalCode
      );
      await po.checkoutInfoPage.continueToOverview();

      const endTime = Date.now();
      const submitTime = endTime - startTime;

      // Form submission should complete within 2 seconds
      expect(submitTime).toBeLessThan(2000);
    });
  });

  // ==================== EDGE CASE TESTS ====================

  test.describe('Edge Case Tests', () => {
    test('@checkout @edge - Should handle form with spaces', async () => {
      // Fill with spaces
      await po.checkoutInfoPage.fillCheckoutForm('John ', ' Doe ', ' 12345 ');

      // Continue to overview
      await po.checkoutInfoPage.continueToOverview();

      // Should successfully navigate
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });

    test('@checkout @edge - Should handle form with numeric postal code', async () => {
      await po.checkoutInfoPage.fillCheckoutForm('John', 'Doe', '12345');

      await po.checkoutInfoPage.continueToOverview();
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });

    test('@checkout @edge - Should handle form with alphanumeric postal code', async () => {
      await po.checkoutInfoPage.fillCheckoutForm('John', 'Doe', 'A1B2C3');

      await po.checkoutInfoPage.continueToOverview();
      await expect(po.page).toHaveURL(/.*checkout-step-two/);
    });
  });
});
