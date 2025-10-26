import { BasePage } from '../base/BasePage.js';
import { expect } from '@playwright/test';

/**
 * CheckoutOverview - Handles all checkout overview page interactions
 * Extends BasePage for common functionality
 */
export class CheckoutOverviewPage extends BasePage {
  constructor(page) {
    super(page);

    // ==================== LOCATORS ====================
    // Container
    this.checkoutSummary = this.page.locator('.checkout_summary_container');

    // Cart items
    this.cartItems = this.page.locator('.cart_item');
    this.cartItemNames = this.page.locator('.inventory_item_name');
    this.cartItemDescriptions = this.page.locator('.inventory_item_desc');
    this.cartItemPrices = this.page.locator('.inventory_item_price');
    this.cartItemQuantities = this.page.locator('.cart_quantity');

    // Payment and shipping info
    this.paymentInfoLabel = this.page
      .locator('.summary_info_label')
      .filter({ hasText: 'Payment Information' });
    this.paymentInfoValue = this.page.locator('.summary_value_label').first();
    this.shippingInfoLabel = this.page
      .locator('.summary_info_label')
      .filter({ hasText: 'Shipping Information' });
    this.shippingInfoValue = this.page.locator('.summary_value_label').last();

    // Price information
    this.subtotalLabel = this.page.locator('.summary_subtotal_label');
    this.taxLabel = this.page.locator('.summary_tax_label');
    this.totalLabel = this.page.locator('.summary_total_label');

    // Action buttons
    this.cancelButton = this.page.locator('[data-test="cancel"]');
    this.finishButton = this.page.locator('[data-test="finish"]');

    // Header elements
    this.headerTitle = this.page.locator('.app_logo');
    this.menuButton = this.page.locator('#react-burger-menu-btn');
    this.cartIcon = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to checkout overview page
   */
  async goto() {
    await super.goto('/checkout-step-two.html');
    await this.waitForPageLoad();
  }

  /**
   * Wait for checkout overview page to load completely
   */
  async waitForPageLoad() {
    await this.waitForLoadState();
    try {
      await this.waitForElement(this.checkoutSummary, 15000);
    } catch (error) {
      console.warn('Checkout overview page not loaded properly');
      await this.takeScreenshot('checkout-overview-not-found');

      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);

      throw new Error(`Checkout overview page not loaded properly. URL: ${currentUrl}`);
    }
  }

  // ==================== CHECKOUT INTERACTION METHODS ====================

  /**
   * Get cart item by product name
   * @param {string} productName - Name of the product
   * @returns {Locator} Cart item locator
   */
  getCartItemByName(productName) {
    return this.page.locator('.cart_item').filter({ hasText: productName });
  }

  /**
   * Get product price in checkout overview by product name
   * @param {string} productName - Name of the product
   * @returns {Promise<string>} Product price
   */
  async getProductPrice(productName) {
    const cartItem = this.getCartItemByName(productName);
    const priceElement = cartItem.locator('.inventory_item_price');
    return await priceElement.textContent();
  }

  /**
   * Get product quantity in checkout overview by product name
   * @param {string} productName - Name of the product
   * @returns {Promise<string>} Product quantity
   */
  async getProductQuantity(productName) {
    const cartItem = this.getCartItemByName(productName);
    const quantityElement = cartItem.locator('.cart_quantity');
    return await quantityElement.textContent();
  }

  /**
   * Get all product names in checkout overview
   * @returns {Promise<string[]>} Array of product names
   */
  async getAllProductNames() {
    const names = await this.cartItemNames.all();
    return await Promise.all(names.map(item => item.textContent()));
  }

  /**
   * Get subtotal amount
   * @returns {Promise<string>} Subtotal
   */
  async getSubtotal() {
    return await this.getText(this.subtotalLabel);
  }

  /**
   * Get tax amount
   * @returns {Promise<string>} Tax
   */
  async getTax() {
    return await this.getText(this.taxLabel);
  }

  /**
   * Get total amount
   * @returns {Promise<string>} Total
   */
  async getTotal() {
    return await this.getText(this.totalLabel);
  }

  /**
   * Get payment information value
   * @returns {Promise<string>} Payment info
   */
  async getPaymentInfo() {
    return await this.getText(this.paymentInfoValue);
  }

  /**
   * Get shipping information value
   * @returns {Promise<string>} Shipping info
   */
  async getShippingInfo() {
    return await this.getText(this.shippingInfoValue);
  }

  /**
   * Get number of items in checkout overview
   * @returns {Promise<number>} Number of cart items
   */
  async getCartItemCount() {
    return await this.cartItems.count();
  }

  // ==================== ACTION METHODS ====================

  /**
   * Cancel checkout (return to inventory)
   */
  async cancel() {
    await this.cancelButton.click();
    await this.waitForLoadState();
  }

  /**
   * Finish checkout
   */
  async finish() {
    await this.finishButton.click();
    await this.waitForLoadState();
  }

  // ==================== ASSERTION METHODS ====================

  /**
   * Assert checkout overview page is loaded
   */
  async assertPageLoaded() {
    await expect(this.checkoutSummary).toBeVisible();
    await expect(this.finishButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

  /**
   * Assert cart item is present in overview
   * @param {string} productName - Name of the product
   */
  async assertCartItemPresent(productName) {
    const cartItem = this.getCartItemByName(productName);
    await expect(cartItem).toBeVisible();
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
   * Assert payment and shipping information is displayed
   */
  async assertPaymentShippingInfoDisplayed() {
    await expect(this.paymentInfoLabel).toBeVisible();
    await expect(this.shippingInfoLabel).toBeVisible();
    await expect(this.paymentInfoValue).toBeVisible();
    await expect(this.shippingInfoValue).toBeVisible();
  }

  /**
   * Assert price breakdown is displayed
   */
  async assertPriceBreakdownDisplayed() {
    await expect(this.subtotalLabel).toBeVisible();
    await expect(this.taxLabel).toBeVisible();
    await expect(this.totalLabel).toBeVisible();
  }

  /**
   * Assert product price in overview
   * @param {string} productName - Name of the product
   * @param {string} expectedPrice - Expected price
   */
  async assertProductPrice(productName, expectedPrice) {
    const actualPrice = await this.getProductPrice(productName);
    expect(actualPrice).toBe(expectedPrice);
  }

  /**
   * Assert product quantity in overview
   * @param {string} productName - Name of the product
   * @param {string} expectedQuantity - Expected quantity
   */
  async assertProductQuantity(productName, expectedQuantity) {
    const actualQuantity = await this.getProductQuantity(productName);
    expect(actualQuantity).toBe(expectedQuantity);
  }

  /**
   * Assert total calculation is correct
   */
  async assertTotalCalculationCorrect() {
    const subtotal = await this.getSubtotal();
    const tax = await this.getTax();
    const total = await this.getTotal();

    // Extract numeric values
    const subtotalValue = parseFloat(subtotal.replace(/[^0-9.]/g, ''));
    const taxValue = parseFloat(tax.replace(/[^0-9.]/g, ''));
    const totalValue = parseFloat(total.replace(/[^0-9.]/g, ''));

    expect(totalValue).toBeCloseTo(subtotalValue + taxValue, 2);
  }

  /**
   * Assert all UI elements are visible
   */
  async assertAllElementsVisible() {
    await expect(this.checkoutSummary).toBeVisible();
    await expect(this.finishButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.headerTitle).toBeVisible();
    await expect(this.menuButton).toBeVisible();
  }
}
