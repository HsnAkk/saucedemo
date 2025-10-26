import { BasePage } from '../base/BasePage.js';
import { expect } from '@playwright/test';

/**
 * CheckoutCompletePage - Handles all checkout complete page interactions
 * Extends BasePage for common functionality
 */
export class CheckoutCompletePage extends BasePage {
  constructor(page) {
    super(page);

    // ==================== LOCATORS ====================
    // Container
    this.checkoutCompleteContainer = this.page.locator('.checkout_complete_container');

    // Success message elements
    this.completeHeader = this.page.locator('.complete-header');
    this.completeText = this.page.locator('.complete-text');
    this.ponyExpressImage = this.page.locator('.pony_express');

    // Action button
    this.backHomeButton = this.page.locator('[data-test="back-to-products"]');

    // Header elements
    this.headerTitle = this.page.locator('.app_logo');
    this.menuButton = this.page.locator('#react-burger-menu-btn');
    this.cartIcon = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to checkout complete page
   */
  async goto() {
    await super.goto('/checkout-complete.html');
    await this.waitForPageLoad();
  }

  /**
   * Wait for checkout complete page to load completely
   */
  async waitForPageLoad() {
    await this.waitForLoadState();
    try {
      await this.waitForElement(this.checkoutCompleteContainer, 15000);
    } catch (error) {
      console.warn('Checkout complete page not loaded properly');
      await this.takeScreenshot('checkout-complete-not-found');

      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);

      throw new Error(`Checkout complete page not loaded properly. URL: ${currentUrl}`);
    }
  }

  // ==================== ACTION METHODS ====================

  /**
   * Go back to inventory/home
   */
  async backToProducts() {
    await this.backHomeButton.click();
    await this.waitForLoadState();
  }

  // ==================== GETTER METHODS ====================

  /**
   * Get complete header text
   * @returns {Promise<string>} Header text
   */
  async getCompleteHeader() {
    return await this.getText(this.completeHeader);
  }

  /**
   * Get complete text
   * @returns {Promise<string>} Complete text
   */
  async getCompleteText() {
    return await this.getText(this.completeText);
  }

  /**
   * Check if cart badge is visible
   * @returns {Promise<boolean>} True if visible
   */
  async isCartBadgeVisible() {
    return await this.isVisible(this.cartBadge);
  }

  // ==================== ASSERTION METHODS ====================

  /**
   * Assert checkout complete page is loaded
   */
  async assertPageLoaded() {
    await expect(this.checkoutCompleteContainer).toBeVisible();
    await expect(this.completeHeader).toBeVisible();
    await expect(this.backHomeButton).toBeVisible();
  }

  /**
   * Assert success message is displayed
   * @param {string} expectedMessage - Expected success message
   */
  async assertSuccessMessage(expectedMessage) {
    const actualMessage = await this.getCompleteHeader();
    expect(actualMessage).toContain(expectedMessage);
  }

  /**
   * Assert complete text is displayed
   */
  async assertCompleteTextDisplayed() {
    await expect(this.completeText).toBeVisible();
    const text = await this.getCompleteText();
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  }

  /**
   * Assert pony express image is displayed
   */
  async assertPonyExpressImageVisible() {
    await expect(this.ponyExpressImage).toBeVisible();
  }

  /**
   * Assert back button is visible and enabled
   */
  async assertBackButtonVisible() {
    await expect(this.backHomeButton).toBeVisible();
    await expect(this.backHomeButton).toBeEnabled();
  }

  /**
   * Assert cart is empty (no cart badge)
   */
  async assertCartIsEmpty() {
    // After checkout is complete, cart should be empty
    const isVisible = await this.isCartBadgeVisible();
    expect(isVisible).toBe(false);
  }

  /**
   * Assert all completion elements are displayed
   */
  async assertAllCompletionElementsDisplayed() {
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeText).toBeVisible();
    await expect(this.ponyExpressImage).toBeVisible();
    await expect(this.backHomeButton).toBeVisible();
  }

  /**
   * Assert all UI elements are visible
   */
  async assertAllElementsVisible() {
    await expect(this.checkoutCompleteContainer).toBeVisible();
    await expect(this.headerTitle).toBeVisible();
    await expect(this.menuButton).toBeVisible();
    await expect(this.cartIcon).toBeVisible();
  }
}
