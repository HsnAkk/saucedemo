import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Cart & Checkout Smoke Tests
 * Critical path tests for shopping cart and checkout functionality
 * These tests run with pre-authenticated state from global-setup.js
 */
test.describe('Cart & Checkout Smoke Tests', () => {
  let po;

  // Set timeout for smoke tests
  test.setTimeout(30000);

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);
    // Navigate to inventory page (we're already authenticated)
    await page.goto('/inventory.html');
    await page.waitForLoadState('networkidle');
  });

  // ==================== CART SMOKE TESTS ====================

  test('@smoke @cart @critical - Should add product to cart successfully', async () => {
    // Add first product to cart
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    // Verify button changes to "Remove"
    await expect(addToCartButton).toHaveText('Remove');

    // Verify cart badge shows 1 item
    const cartBadge = po.page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
  });

  test('@smoke @cart @critical - Should navigate to cart page', async () => {
    // Add a product to cart first
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    // Navigate to cart page
    const cartIcon = po.page.locator('.shopping_cart_link');
    await cartIcon.click();

    // Verify we're on cart page
    await expect(po.page).toHaveURL(/.*cart/);

    // Verify cart page title
    const pageTitle = await po.page.title();
    expect(pageTitle).toBe(TestDataLoader.getPageTitle('cart'));

    // Verify cart items are visible
    const cartItems = po.page.locator('.cart_item');
    await expect(cartItems).toHaveCount(1);
  });

  test('@smoke @cart @critical - Should remove product from cart', async () => {
    // Add a product to cart
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    // Navigate to cart page
    const cartIcon = po.page.locator('.shopping_cart_link');
    await cartIcon.click();

    // Remove product from cart
    const removeButton = po.page.locator('[data-test="remove-sauce-labs-backpack"]');
    await removeButton.click();

    // Verify cart is empty
    const cartItems = po.page.locator('.cart_item');
    await expect(cartItems).toHaveCount(0);

    // Verify cart badge is not visible
    const cartBadge = po.page.locator('.shopping_cart_badge');
    await expect(cartBadge).not.toBeVisible();
  });

  // ==================== CHECKOUT SMOKE TESTS ====================

  test('@smoke @checkout @critical - Should navigate to checkout information page', async () => {
    // Add a product to cart
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    // Navigate to cart page
    const cartIcon = po.page.locator('.shopping_cart_link');
    await cartIcon.click();

    // Click checkout button
    const checkoutButton = po.page.locator('[data-test="checkout"]');
    await checkoutButton.click();

    // Verify we're on checkout info page
    await expect(po.page).toHaveURL(/.*checkout-step-one/);

    // Verify checkout form is visible
    const firstNameField = po.page.locator('[data-test="firstName"]');
    const lastNameField = po.page.locator('[data-test="lastName"]');
    const postalCodeField = po.page.locator('[data-test="postalCode"]');

    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
    await expect(postalCodeField).toBeVisible();
  });

  test('@smoke @checkout @critical - Should complete checkout process', async () => {
    // Add a product to cart
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    // Navigate to cart page
    const cartIcon = po.page.locator('.shopping_cart_link');
    await cartIcon.click();

    // Start checkout
    const checkoutButton = po.page.locator('[data-test="checkout"]');
    await checkoutButton.click();

    // Fill checkout information
    await po.page.locator('[data-test="firstName"]').fill('John');
    await po.page.locator('[data-test="lastName"]').fill('Doe');
    await po.page.locator('[data-test="postalCode"]').fill('12345');

    // Continue to overview
    const continueButton = po.page.locator('[data-test="continue"]');
    await continueButton.click();

    // Verify we're on checkout overview page
    await expect(po.page).toHaveURL(/.*checkout-step-two/);

    // Verify order summary is visible
    const orderSummary = po.page.locator('.summary_info');
    await expect(orderSummary).toBeVisible();

    // Complete the order
    const finishButton = po.page.locator('[data-test="finish"]');
    await finishButton.click();

    // Verify we're on checkout complete page
    await expect(po.page).toHaveURL(/.*checkout-complete/);

    // Verify success message
    const successMessage = po.page.locator('.complete-header');
    await expect(successMessage).toHaveText('Thank you for your order!');
  });

  // ==================== PERFORMANCE SMOKE TESTS ====================

  test('@smoke @cart @performance - Should add to cart within acceptable time', async () => {
    const startTime = Date.now();

    // Add product to cart
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    const endTime = Date.now();
    const addToCartTime = endTime - startTime;

    // Add to cart should complete within 2 seconds
    expect(addToCartTime).toBeLessThan(2000);

    // Verify cart badge is updated
    const cartBadge = po.page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
  });

  test('@smoke @checkout @performance - Should complete checkout within acceptable time', async () => {
    // Add product to cart
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    const startTime = Date.now();

    // Navigate to cart and checkout
    const cartIcon = po.page.locator('.shopping_cart_link');
    await cartIcon.click();

    const checkoutButton = po.page.locator('[data-test="checkout"]');
    await checkoutButton.click();

    // Fill and complete checkout
    await po.page.locator('[data-test="firstName"]').fill('John');
    await po.page.locator('[data-test="lastName"]').fill('Doe');
    await po.page.locator('[data-test="postalCode"]').fill('12345');

    const continueButton = po.page.locator('[data-test="continue"]');
    await continueButton.click();

    const finishButton = po.page.locator('[data-test="finish"]');
    await finishButton.click();

    const endTime = Date.now();
    const checkoutTime = endTime - startTime;

    // Complete checkout should finish within 10 seconds
    expect(checkoutTime).toBeLessThan(10000);

    // Verify we're on complete page
    await expect(po.page).toHaveURL(/.*checkout-complete/);
  });

  // ==================== ERROR HANDLING SMOKE TESTS ====================

  test('@smoke @checkout @error - Should handle empty checkout fields', async () => {
    // Add product to cart
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    // Navigate to checkout
    const cartIcon = po.page.locator('.shopping_cart_link');
    await cartIcon.click();

    const checkoutButton = po.page.locator('[data-test="checkout"]');
    await checkoutButton.click();

    // Try to continue without filling fields
    const continueButton = po.page.locator('[data-test="continue"]');
    await continueButton.click();

    // Verify error message
    const errorMessage = po.page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('First Name is required');

    // Verify we're still on checkout info page
    await expect(po.page).toHaveURL(/.*checkout-step-one/);
  });

  // ==================== NAVIGATION SMOKE TESTS ====================

  test('@smoke @cart @navigation - Should maintain cart state across page navigation', async () => {
    // Add multiple products to cart
    await po.page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').first().click();
    await po.page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').first().click();

    // Verify cart badge shows 2 items
    const cartBadge = po.page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('2');

    // Navigate to cart page
    const cartIcon = po.page.locator('.shopping_cart_link');
    await cartIcon.click();

    // Verify both items are in cart
    const cartItems = po.page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);

    // Go back to inventory
    await po.page.goto('/inventory.html');

    // Verify cart badge still shows 2 items
    await expect(cartBadge).toHaveText('2');
  });

  test('@smoke @checkout @navigation - Should handle back navigation during checkout', async () => {
    // Add product to cart
    const addToCartButton = po.page
      .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      .first();
    await addToCartButton.click();

    // Navigate to checkout
    const cartIcon = po.page.locator('.shopping_cart_link');
    await cartIcon.click();

    const checkoutButton = po.page.locator('[data-test="checkout"]');
    await checkoutButton.click();

    // Fill checkout info
    await po.page.locator('[data-test="firstName"]').fill('John');
    await po.page.locator('[data-test="lastName"]').fill('Doe');
    await po.page.locator('[data-test="postalCode"]').fill('12345');

    const continueButton = po.page.locator('[data-test="continue"]');
    await continueButton.click();

    // Go back to checkout info
    const cancelButton = po.page.locator('[data-test="cancel"]');
    await cancelButton.click();

    // Verify we're back on checkout info page
    await expect(po.page).toHaveURL(/.*checkout-step-one/);

    // Verify form fields still have values
    const firstNameField = po.page.locator('[data-test="firstName"]');
    await expect(firstNameField).toHaveValue('John');
  });
});

