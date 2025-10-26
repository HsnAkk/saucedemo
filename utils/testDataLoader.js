import fs from 'fs';
import path from 'path';

export class TestDataLoader {
  static loadUser() {
    const filePath = path.join(process.cwd(), 'fixtures/data', 'users.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  static getUserCredentials(userType = 'standard') {
    const users = this.loadUser();
    const user = users.users[userType];

    if (!user) {
      throw new Error(`User type '${userType}' not found`);
    }

    // Get password from environment variables
    const username = process.env[user.username];
    const password = process.env[user.password];

    return {
      username,
      password,
    };
  }

  static loadTestData() {
    const filePath = path.join(process.cwd(), 'fixtures/data', 'testData.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  static loadTestConfig() {
    const filePath = path.join(process.cwd(), 'fixtures/data', 'testConfig.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  static loadProducts() {
    const filePath = path.join(process.cwd(), 'fixtures/data', 'products.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  static loadApiEndpoints() {
    const filePath = path.join(process.cwd(), 'fixtures/data', 'apiEndpoints.json');
    const file = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return file.apiEndpoints;
  }

  static getApiEndpoints() {
    return this.loadApiEndpoints();
  }

  static loadEnvironments() {
    const filePath = path.join(process.cwd(), 'fixtures/data', 'environments.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  static getEnvironment(envName = 'staging') {
    const environments = this.loadEnvironments();
    return environments.environments[envName];
  }

  // ==================== VALIDATION DATA METHODS ====================

  /**
   * Get error message for specific scenario
   * @param {string} scenario - Error scenario (locked, invalid, emptyUsername, etc.)
   * @returns {string} Error message text
   */
  static getErrorMessage(scenario) {
    const testData = this.loadTestData();
    return testData.testData.validation.loginErrorMessages[scenario];
  }

  /**
   * Get page title for specific page
   * @param {string} pageName - Page name (login, inventory, cart, etc.)
   * @returns {string} Page title
   */
  static getPageTitle(pageName) {
    const testData = this.loadTestData();
    return testData.testData.validation.pageTitles[pageName];
  }

  /**
   * Get success message for specific action
   * @param {string} action - Action name (loginSuccess, addToCart, etc.)
   * @returns {string} Success message text
   */
  static getSuccessMessage(action) {
    const testData = this.loadTestData();
    return testData.testData.validation.successMessages[action];
  }

  /**
   * Get all login error messages
   * @returns {Object} All login error messages
   */
  static getAllLoginErrorMessages() {
    const testData = this.loadTestData();
    return testData.testData.validation.loginErrorMessages;
  }
}
