import { BasePage } from '../base/BasePage.js';
import { expect } from '@playwright/test';

/**
 * CheckoutInfo - Handles all checkout information page interactions
 * Extends BasePage for common functionality
 */
export class CheckoutInfoPage extends BasePage {
  constructor(page) {
    super(page);

    // ==================== LOCATORS ====================
    // Container
    this.checkoutContainer = this.page.locator('.checkout_info_container');

    // Form fields
    this.firstNameInput = this.page.locator('[data-test="firstName"]');
    this.lastNameInput = this.page.locator('[data-test="lastName"]');
    this.postalCodeInput = this.page.locator('[data-test="postalCode"]');

    // Action buttons
    this.cancelButton = this.page.locator('[data-test="cancel"]');
    this.continueButton = this.page.locator('[data-test="continue"]');

    // Header elements
    this.headerTitle = this.page.locator('.app_logo');
    this.menuButton = this.page.locator('#react-burger-menu-btn');
    this.cartIcon = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');

    // Error message
    this.errorMessage = this.page.locator('[data-test="error"]');
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to checkout info page
   */
  async goto() {
    await super.goto('/checkout-step-one.html');
    await this.waitForPageLoad();
  }

  /**
   * Wait for checkout info page to load completely
   */
  async waitForPageLoad() {
    await this.waitForLoadState();
    try {
      await this.waitForElement(this.firstNameInput, 15000);
    } catch (error) {
      console.warn('Checkout info page not loaded properly');
      await this.takeScreenshot('checkout-info-not-found');

      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);

      throw new Error(`Checkout info page not loaded properly. URL: ${currentUrl}`);
    }
  }

  // ==================== FORM INTERACTION METHODS ====================

  /**
   * Fill checkout form
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @param {string} postalCode - Postal code
   */
  async fillCheckoutForm(firstName, lastName, postalCode) {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillPostalCode(postalCode);
  }

  /**
   * Fill first name field
   * @param {string} firstName - First name
   */
  async fillFirstName(firstName) {
    await this.fill(this.firstNameInput, firstName);
  }

  /**
   * Fill last name field
   * @param {string} lastName - Last name
   */
  async fillLastName(lastName) {
    await this.fill(this.lastNameInput, lastName);
  }

  /**
   * Fill postal code field
   * @param {string} postalCode - Postal code
   */
  async fillPostalCode(postalCode) {
    await this.fill(this.postalCodeInput, postalCode);
  }

  /**
   * Clear all form fields
   */
  async clearAllFields() {
    await this.firstNameInput.fill('');
    await this.lastNameInput.fill('');
    await this.postalCodeInput.fill('');
  }

  /**
   * Continue to checkout overview
   */
  async continueToOverview() {
    await this.continueButton.click();
    await this.waitForLoadState();
  }

  /**
   * Cancel checkout (return to cart)
   */
  async cancel() {
    await this.cancelButton.click();
    await this.waitForLoadState();
  }

  // ==================== GETTER METHODS ====================

  /**
   * Get first name value
   * @returns {Promise<string>} First name value
   */
  async getFirstNameValue() {
    return await this.firstNameInput.inputValue();
  }

  /**
   * Get last name value
   * @returns {Promise<string>} Last name value
   */
  async getLastNameValue() {
    return await this.lastNameInput.inputValue();
  }

  /**
   * Get postal code value
   * @returns {Promise<string>} Postal code value
   */
  async getPostalCodeValue() {
    return await this.postalCodeInput.inputValue();
  }

  /**
   * Get error message text
   * @returns {Promise<string>} Error message
   */
  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if error message is visible
   * @returns {Promise<boolean>} True if error is visible
   */
  async hasErrorMessage() {
    return await this.isVisible(this.errorMessage);
  }

  // ==================== ASSERTION METHODS ====================

  /**
   * Assert checkout info page is loaded
   */
  async assertPageLoaded() {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.postalCodeInput).toBeVisible();
    await expect(this.continueButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

  /**
   * Assert error message is displayed
   * @param {string} expectedMessage - Expected error message
   */
  async assertErrorMessage(expectedMessage) {
    await expect(this.errorMessage).toBeVisible();
    const actualMessage = await this.getErrorMessage();
    expect(actualMessage).toContain(expectedMessage);
  }

  /**
   * Assert form fields are empty
   */
  async assertFormFieldsEmpty() {
    const firstName = await this.getFirstNameValue();
    const lastName = await this.getLastNameValue();
    const postalCode = await this.getPostalCodeValue();

    expect(firstName).toBe('');
    expect(lastName).toBe('');
    expect(postalCode).toBe('');
  }

  /**
   * Assert form fields are filled with specific values
   * @param {string} expectedFirstName - Expected first name
   * @param {string} expectedLastName - Expected last name
   * @param {string} expectedPostalCode - Expected postal code
   */
  async assertFormFieldsFilled(expectedFirstName, expectedLastName, expectedPostalCode) {
    const firstName = await this.getFirstNameValue();
    const lastName = await this.getLastNameValue();
    const postalCode = await this.getPostalCodeValue();

    expect(firstName).toBe(expectedFirstName);
    expect(lastName).toBe(expectedLastName);
    expect(postalCode).toBe(expectedPostalCode);
  }

  /**
   * Assert continue button is visible and enabled
   */
  async assertContinueButtonVisible() {
    await expect(this.continueButton).toBeVisible();
    await expect(this.continueButton).toBeEnabled();
  }

  /**
   * Assert cancel button is visible and enabled
   */
  async assertCancelButtonVisible() {
    await expect(this.cancelButton).toBeVisible();
    await expect(this.cancelButton).toBeEnabled();
  }

  /**
   * Assert all UI elements are visible
   */
  async assertAllElementsVisible() {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.postalCodeInput).toBeVisible();
    await expect(this.continueButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.headerTitle).toBeVisible();
  }
}
