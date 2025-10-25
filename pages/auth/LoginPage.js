import { BasePage } from '../base/BasePage.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * LoginPage - Handles all login page interactions
 * Extends BasePage for common functionality
 */
export class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // ==================== LOCATORS ====================
    this.usernameInput = this.page.locator('#user-name');
    this.passwordInput = this.page.locator('#password');
    this.loginButton = this.page.locator('#login-button');
    this.errorContainer = this.page.locator('[data-test="error"]');
    this.errorButton = this.page.locator('[data-test="error"] .error-button');
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to login page
   */
  async goto() {
    await super.goto('/');
    await this.waitForLoadState();

    // Wait for login button with better error handling
    try {
      await this.loginButton.waitFor({ state: 'visible', timeout: 15000 });
    } catch (error) {
      console.warn('Login button not visible, taking screenshot for debugging');
      await this.takeScreenshot('login-button-not-visible');

      // Try to get page content for debugging
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      console.log(`Current URL: ${currentUrl}`);
      console.log(`Page Title: ${pageTitle}`);

      throw new Error(`Login button not visible on page. URL: ${currentUrl}, Title: ${pageTitle}`);
    }
  }

  // ==================== LOGIN ACTIONS ====================

  /**
   * Login with username and password
   * @param {string} username - Username to login with
   * @param {string} password - Password to login with
   * @param {boolean} waitForRedirect - Wait for successful login redirect
   */
  async login(username, password, waitForRedirect = true) {
    try {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();

      if (waitForRedirect) {
        await this.waitForURL('**/inventory.html');
      }
    } catch (error) {
      await this.handleError(error, 'login');
      throw error;
    }
  }

  /**
   * Login using user type from TestDataLoader
   * @param {string} userType - User type (standard, problem, locked, etc.)
   * @param {boolean} waitForRedirect - Wait for successful login redirect
   */
  async loginWithUserType(userType, waitForRedirect = true) {
    const credentials = TestDataLoader.getUserCredentials(userType);
    await this.login(credentials.username, credentials.password, waitForRedirect);
  }

  /**
   * Login as standard user
   * @param {boolean} waitForRedirect - Wait for successful login redirect
   */
  async loginAsStandardUser(waitForRedirect = true) {
    await this.loginWithUserType('standard', waitForRedirect);
  }

  /**
   * Clear all input fields
   */
  async clearFields() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Fill username field only
   * @param {string} username - Username to fill
   */
  async fillUsername(username) {
    await this.usernameInput.fill(username);
  }

  /**
   * Fill password field only
   * @param {string} password - Password to fill
   */
  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click login button
   */
  async clickLoginButton() {
    await this.loginButton.click();
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Get error message text
   * @returns {Promise<string>} Error message text
   */
  async getErrorText() {
    await this.waitForElement(this.errorContainer);
    return await this.errorContainer.textContent();
  }

  /**
   * Check if error message is visible
   * @returns {Promise<boolean>} True if error is visible
   */
  async isErrorVisible() {
    return await this.errorContainer.isVisible();
  }

  /**
   * Close error message
   */
  async closeErrorMessage() {
    if (await this.isErrorVisible()) {
      await this.errorButton.click();
    }
  }

  /**
   * Wait for error message to appear
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForErrorMessage(timeout = 5000) {
    await this.waitForElement(this.errorContainer, timeout);
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Check if login button is enabled
   * @returns {Promise<boolean>} True if button is enabled
   */
  async isLoginButtonEnabled() {
    return await this.loginButton.isEnabled();
  }

  /**
   * Check if username field is empty
   * @returns {Promise<boolean>} True if username field is empty
   */
  async isUsernameEmpty() {
    const value = await this.usernameInput.inputValue();
    return value === '';
  }

  /**
   * Check if password field is empty
   * @returns {Promise<boolean>} True if password field is empty
   */
  async isPasswordEmpty() {
    const value = await this.passwordInput.inputValue();
    return value === '';
  }

  /**
   * Check if both fields are empty
   * @returns {Promise<boolean>} True if both fields are empty
   */
  async areFieldsEmpty() {
    return (await this.isUsernameEmpty()) && (await this.isPasswordEmpty());
  }

  // ==================== ASSERTION METHODS ====================

  /**
   * Assert error message contains specific text
   * @param {string} expectedText - Expected error text
   */
  async assertErrorMessage(expectedText) {
    const errorText = await this.getErrorText();
    if (!errorText.includes(expectedText)) {
      throw new Error(
        `Expected error message to contain "${expectedText}", but got "${errorText}"`
      );
    }
  }

  /**
   * Assert successful login (redirected to inventory)
   */
  async assertSuccessfulLogin() {
    await this.waitForURL('**/inventory.html');
    await this.assertURLContains('inventory');
  }

  /**
   * Assert login failed (still on login page with error)
   */
  async assertLoginFailed() {
    await this.waitForErrorMessage();
    await this.assertURLContains('');
  }

  /**
   * Assert login button is enabled
   */
  async assertLoginButtonEnabled() {
    const isEnabled = await this.isLoginButtonEnabled();
    if (!isEnabled) {
      throw new Error('Login button should be enabled');
    }
  }

  /**
   * Assert login button is disabled
   */
  async assertLoginButtonDisabled() {
    const isEnabled = await this.isLoginButtonEnabled();
    if (isEnabled) {
      throw new Error('Login button should be disabled');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get current username value
   * @returns {Promise<string>} Current username value
   */
  async getUsernameValue() {
    return await this.usernameInput.inputValue();
  }

  /**
   * Get current password value
   * @returns {Promise<string>} Current password value
   */
  async getPasswordValue() {
    return await this.passwordInput.inputValue();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.waitForLoadState();
    // Wait for login button with reasonable timeout
    await this.waitForElement(this.loginButton, 15000);
  }

  /**
   * Refresh the current page
   */
  async refreshPage() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back to login page using browser back button
   */
  async goBackToLogin() {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');

    // Verify we're on login page
    const currentUrl = this.page.url();
    if (currentUrl.includes('/inventory')) {
      throw new Error(`Expected to be on login page, but current URL is: ${currentUrl}`);
    }

    // Wait for login button to be visible to ensure page is fully loaded
    try {
      await this.loginButton.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      console.warn('Login button not visible after going back, taking screenshot');
      await this.takeScreenshot('back-button-login-issue');
      throw error;
    }
  }
}
