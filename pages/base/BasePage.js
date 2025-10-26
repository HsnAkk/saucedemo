import { expect } from '@playwright/test';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * BasePage - Foundation class for all page objects
 * Contains common methods and utilities used across all pages
 */
export class BasePage {
  constructor(page) {
    this.page = page;
    this.environment = TestDataLoader.getEnvironment('staging');
    this.baseURL = this.environment.baseUrl;
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to a specific page
   * @param {string} path - The path to navigate to
   */
  async goto(path = '') {
    let url;
    if (path.startsWith('http')) {
      url = path;
    } else {
      // Ensure proper URL construction without double slashes
      const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      url = `${baseUrl}${cleanPath}`;
    }
    await this.page.goto(url);
    await this.waitForLoadState();
  }

  /**
   * Wait for page to load completely
   * @param {string} state - Load state to wait for
   */
  async waitForLoadState(state = 'load') {
    await this.page.waitForLoadState(state);
  }

  /**
   * Get current page URL
   * @returns {string} Current URL
   */
  getCurrentURL() {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getTitle() {
    return await this.page.title();
  }

  // ==================== ELEMENT INTERACTION METHODS ====================

  /**
   * Click on an element
   * @param {string|Locator} locator - Element locator (string or Locator object)
   */
  async click(locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.click();
  }

  /**
   * Fill input field with text
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} text - Text to fill
   */
  async fill(locator, text) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.fill(text);
  }

  /**
   * Get text content from element
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @returns {Promise<string>} Element text content
   */
  async getText(locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.textContent();
  }

  /**
   * Check if element is visible
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @returns {Promise<boolean>} True if visible
   */
  async isVisible(locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isVisible();
  }

  /**
   * Check if element is enabled
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @returns {Promise<boolean>} True if enabled
   */
  async isEnabled(locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isEnabled();
  }

  /**
   * Check if checkbox/radio is checked
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @returns {Promise<boolean>} True if checked
   */
  async isChecked(locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isChecked();
  }

  // ==================== WAIT METHODS ====================

  /**
   * Wait for element to be visible
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(locator, timeout = 30000) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElementHidden(locator, timeout = 30000) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for URL to match pattern
   * @param {string} url - URL pattern to wait for
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForURL(url, timeout = 30000) {
    await this.page.waitForURL(url, { timeout });
  }

  // ==================== ASSERTION METHODS ====================

  /**
   * Check if element exists on page
   * @param {string} locator - Element locator
   * @returns {Promise<boolean>} True if element exists
   */
  async elementExists(locator) {
    return (await this.page.locator(locator).count()) > 0;
  }

  /**
   * Assert element is visible
   * @param {string|Locator} locator - Element locator (string or Locator object)
   */
  async assertElementVisible(locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toBeVisible();
  }

  /**
   * Assert element is Hidden
   * @param {string|Locator} locator - Element locator (string or Locator object)
   */
  async assertElementHidden(locator) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).not.toBeVisible();
  }

  /**
   * Assert element contains text
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} text - Expected text
   */
  async assertElementContainsText(locator, text) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toContainText(text);
  }

  /**
   * Assert current URL contains text
   * @param {string} text - Expected text in URL
   */
  async assertURLContains(text) {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get environment-specific setting
   * @param {string} key - Setting key
   * @returns {any} Setting value
   */
  getEnvironmentSetting(key) {
    return this.environment[key];
  }

  /**
   * Get current environment name
   * @returns {string} Environment name
   */
  getCurrentEnvironment() {
    return process.env.TEST_ENV || 'staging';
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Scroll element into view
   * @param {string} locator - Element locator
   */
  async scrollIntoView(locator) {
    await this.page.locator(locator).scrollIntoViewIfNeeded();
  }

  /**
   * Get element count
   * @param {string} locator - Element locator
   * @returns {Promise<number>} Number of elements found
   */
  async getElementCount(locator) {
    return await this.page.locator(locator).count();
  }

  /**
   * Handle errors with screenshot
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   */
  async handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    await this.takeScreenshot(`error-${context}`);
    throw error;
  }

  /**
   * Wait for network to be idle
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForNetworkIdle(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }
}
