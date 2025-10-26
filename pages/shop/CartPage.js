import { BasePage } from '../base/BasePage.js';
import { expect } from '@playwright/test';

/**
 * CartPage - Handles all cart page interactions
 * Extends BasePage for common functionality
 */
export class CartPage extends BasePage {
  constructor(page) {
    super(page);

    // ==================== LOCATORS ====================
    // Container
    this.cartContainer = this.page.locator('.cart_contents_container');
    this.cartItems = this.page.locator('.cart_item');
    this.cartItemNames = this.page.locator('.inventory_item_name');
    this.cartItemDescriptions = this.page.locator('.inventory_item_desc');
    this.cartItemPrices = this.page.locator('.inventory_item_price');
    this.cartItemQuantities = this.page.locator('.cart_quantity');

    // Action buttons
    this.removeButtons = this.page.locator('[data-test*="remove"]');
    this.continueShoppingButton = this.page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = this.page.locator('[data-test="checkout"]');

    // Header elements
    this.headerTitle = this.page.locator('.app_logo');
    this.menuButton = this.page.locator('#react-burger-menu-btn');
    this.cartIcon = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to cart page
   */
  async goto() {
    await super.goto('/cart.html');
    await this.waitForPageLoad();
  }

  /**
   * Wait for cart page to load completely
   */
  async waitForPageLoad() {
    await this.waitForLoadState();
    try {
      await this.waitForElement(this.cartContainer, 15000);
    } catch (error) {
      console.warn('Cart container not found, taking screenshot for debugging');
      await this.takeScreenshot('cart-container-not-found');

      // Check current URL for debugging
      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);

      throw new Error(`Cart page not loaded properly. URL: ${currentUrl}`);
    }
  }

  // ==================== CART INTERACTION METHODS ====================

  /**
   * Remove product from cart by product name
   * @param {string} productName - Name of the product to remove
   */
  async removeProductFromCart(productName) {
    const cartItem = this.getCartItemByName(productName);
    const removeButton = cartItem.locator('[data-test*="remove"]');
    await removeButton.click();
  }

  /**
   * Remove all products from cart
   */
  async removeAllProducts() {
    // Click buttons one at a time to avoid stale elements
    let buttonCount = await this.removeButtons.count();
    while (buttonCount > 0) {
      // Get the first button and click it
      const button = this.removeButtons.first();
      await button.click();

      // Wait a bit for the DOM to update
      await this.page.waitForTimeout(100);

      // Get the updated count
      buttonCount = await this.removeButtons.count();
    }
  }

  /**
   * Continue shopping (return to inventory)
   */
  async continueShopping() {
    await this.continueShoppingButton.click();
    await this.waitForLoadState();
  }

  /**
   * Proceed to checkout
   */
  async goToCheckout() {
    await this.checkoutButton.click();
    await this.waitForLoadState();
  }

  // ==================== GETTER METHODS ====================

  /**
   * Get cart item by product name
   * @param {string} productName - Name of the product
   * @returns {Locator} Cart item locator
   */
  getCartItemByName(productName) {
    return this.page.locator('.cart_item').filter({ hasText: productName });
  }

  /**
   * Get all product names in cart
   * @returns {Promise<string[]>} Array of product names
   */
  async getAllProductNames() {
    const names = await this.cartItemNames.all();
    return await Promise.all(names.map(item => item.textContent()));
  }

  /**
   * Get product price in cart by product name
   * @param {string} productName - Name of the product
   * @returns {Promise<string>} Product price
   */
  async getProductPrice(productName) {
    const cartItem = this.getCartItemByName(productName);
    const priceElement = cartItem.locator('.inventory_item_price');
    return await priceElement.textContent();
  }

  /**
   * Get product quantity in cart by product name
   * @param {string} productName - Name of the product
   * @returns {Promise<string>} Product quantity
   */
  async getProductQuantity(productName) {
    const cartItem = this.getCartItemByName(productName);
    const quantityElement = cartItem.locator('.cart_quantity');
    return await quantityElement.textContent();
  }

  /**
   * Get product description in cart by product name
   * @param {string} productName - Name of the product
   * @returns {Promise<string>} Product description
   */
  async getProductDescription(productName) {
    const cartItem = this.getCartItemByName(productName);
    const descriptionElement = cartItem.locator('.inventory_item_desc');
    return await descriptionElement.textContent();
  }

  /**
   * Get number of items in cart
   * @returns {Promise<number>} Number of cart items
   */
  async getCartItemCount() {
    return await this.cartItems.count();
  }

  /**
   * Get total number of cart items from cart items
   * @returns {Promise<number>} Total count of items in cart
   */
  async getTotalCartItemCount() {
    const items = await this.cartItems.all();
    let totalCount = 0;
    for (const item of items) {
      const quantity = await item.locator('.cart_quantity').textContent();
      totalCount += quantity ? parseInt(quantity) : 0;
    }
    return totalCount;
  }

  /**
   * Check if cart is empty
   * @returns {Promise<boolean>} True if cart is empty
   */
  async isCartEmpty() {
    const count = await this.getCartItemCount();
    return count === 0;
  }

  /**
   * Check if product exists in cart
   * @param {string} productName - Name of the product
   * @returns {Promise<boolean>} True if product exists in cart
   */
  async isProductInCart(productName) {
    try {
      const cartItem = this.getCartItemByName(productName);
      const count = await cartItem.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  // ==================== ASSERTION METHODS ====================

  /**
   * Assert cart page is loaded
   */
  async assertCartPageLoaded() {
    await expect(this.cartContainer).toBeVisible();
  }

  /**
   * Assert cart has specific number of items
   * @param {number} expectedCount - Expected number of items
   */
  async assertCartItemCount(expectedCount) {
    const actualCount = await this.getCartItemCount();
    expect(actualCount).toBe(expectedCount);
  }

  /**
   * Assert product is in cart
   * @param {string} productName - Name of the product
   */
  async assertProductInCart(productName) {
    const cartItem = this.getCartItemByName(productName);
    await expect(cartItem).toBeVisible();
  }

  /**
   * Assert product is not in cart
   * @param {string} productName - Name of the product
   */
  async assertProductNotInCart(productName) {
    const cartItem = this.getCartItemByName(productName);
    await expect(cartItem).not.toBeVisible();
  }

  /**
   * Assert cart is empty
   */
  async assertCartIsEmpty() {
    const count = await this.getCartItemCount();
    expect(count).toBe(0);
  }

  /**
   * Assert cart has products
   */
  async assertCartHasProducts() {
    const count = await this.getCartItemCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Assert product price in cart
   * @param {string} productName - Name of the product
   * @param {string} expectedPrice - Expected price
   */
  async assertProductPrice(productName, expectedPrice) {
    const actualPrice = await this.getProductPrice(productName);
    expect(actualPrice).toBe(expectedPrice);
  }

  /**
   * Assert product quantity in cart
   * @param {string} productName - Name of the product
   * @param {string} expectedQuantity - Expected quantity
   */
  async assertProductQuantity(productName, expectedQuantity) {
    const actualQuantity = await this.getProductQuantity(productName);
    expect(actualQuantity).toBe(expectedQuantity);
  }

  /**
   * Assert continue shopping button is visible
   */
  async assertContinueShoppingButtonVisible() {
    await expect(this.continueShoppingButton).toBeVisible();
  }

  /**
   * Assert checkout button is visible
   */
  async assertCheckoutButtonVisible() {
    await expect(this.checkoutButton).toBeVisible();
  }

  /**
   * Assert all cart UI elements are visible
   */
  async assertAllCartElementsVisible() {
    await expect(this.cartContainer).toBeVisible();
    await expect(this.continueShoppingButton).toBeVisible();
    await expect(this.checkoutButton).toBeVisible();
  }
}
