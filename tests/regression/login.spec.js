import { test, expect } from '@playwright/test';
import { POManager } from '../../pages/POManager.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * Login Regression Tests
 * Tests all login scenarios including positive, negative, and edge cases
 */
test.describe('Login Regression Tests', () => {
  let po;

  // Increase timeout for login tests
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    po = new POManager(page);
    // Simple navigation without complex error handling
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ==================== POSITIVE LOGIN TESTS ====================

  test.describe('Positive Login Tests', () => {
    test('@login @positive - Should login successfully with standard user', async () => {
      await po.loginPage.loginAsStandardUser();
      await po.loginPage.assertSuccessfulLogin();
    });

    test('@login @positive - Should login successfully with problem user', async () => {
      await po.loginPage.loginWithUserType('problem');
      await po.loginPage.assertSuccessfulLogin();
    });

    test('@login @positive - Should login successfully with performance user', async () => {
      await po.loginPage.loginWithUserType('performance');
      await po.loginPage.assertSuccessfulLogin();
    });

    test('@login @positive - Should login successfully with error user', async () => {
      await po.loginPage.loginWithUserType('error');
      await po.loginPage.assertSuccessfulLogin();
    });

    test('@login @positive - Should login successfully with visual user', async () => {
      await po.loginPage.loginWithUserType('visual');
      await po.loginPage.assertSuccessfulLogin();
    });
  });

  // ==================== NEGATIVE LOGIN TESTS ====================

  test.describe('Negative Login Tests', () => {
    test('@login @negative - Should show error for locked out user', async () => {
      await po.loginPage.loginWithUserType('locked', false);
      await po.loginPage.assertLoginFailed();
      await po.loginPage.assertErrorMessage(TestDataLoader.getErrorMessage('locked'));
    });

    test('@login @negative - Should show error for invalid credentials', async () => {
      await po.loginPage.loginWithUserType('invalid', false);
      await po.loginPage.assertLoginFailed();
      await po.loginPage.assertErrorMessage(TestDataLoader.getErrorMessage('invalid'));
    });

    test('@login @negative - Should show error for empty username', async () => {
      await po.loginPage.fillPassword('secret_sauce');
      await po.loginPage.clickLoginButton();
      await po.loginPage.assertLoginFailed();
      await po.loginPage.assertErrorMessage(TestDataLoader.getErrorMessage('emptyUsername'));
    });

    test('@login @negative - Should show error for empty password', async () => {
      await po.loginPage.fillUsername('standard_user');
      await po.loginPage.clickLoginButton();
      await po.loginPage.assertLoginFailed();
      await po.loginPage.assertErrorMessage(TestDataLoader.getErrorMessage('emptyPassword'));
    });

    test('@login @negative - Should show error for empty fields', async () => {
      await po.loginPage.clickLoginButton();
      await po.loginPage.assertLoginFailed();
      await po.loginPage.assertErrorMessage(TestDataLoader.getErrorMessage('emptyFields'));
    });

    test('@login @negative - Should show error for wrong username', async () => {
      await po.loginPage.login('wrong_user', 'secret_sauce', false);
      await po.loginPage.assertLoginFailed();
      await po.loginPage.assertErrorMessage('Username and password do not match');
    });

    test('@login @negative - Should show error for wrong password', async () => {
      await po.loginPage.login('standard_user', 'wrong_password', false);
      await po.loginPage.assertLoginFailed();
      await po.loginPage.assertErrorMessage('Username and password do not match');
    });
  });

  // ==================== UI VALIDATION TESTS ====================

  test.describe('UI Validation Tests', () => {
    test('@login @ui - Should have all required elements visible', async () => {
      await expect(po.loginPage.usernameInput).toBeVisible();
      await expect(po.loginPage.passwordInput).toBeVisible();
      await expect(po.loginPage.loginButton).toBeVisible();
    });

    test('@login @ui - Should have login button enabled by default', async () => {
      await po.loginPage.assertLoginButtonEnabled();
    });

    test('@login @ui - Should clear fields correctly', async () => {
      await po.loginPage.fillUsername('test_user');
      await po.loginPage.fillPassword('test_password');

      await po.loginPage.clearFields();

      expect(await po.loginPage.isUsernameEmpty()).toBe(true);
      expect(await po.loginPage.isPasswordEmpty()).toBe(true);
    });

    test('@login @ui - Should close error message when clicked', async () => {
      await po.loginPage.loginWithUserType('locked', false);
      await po.loginPage.waitForErrorMessage();

      await po.loginPage.closeErrorMessage();

      expect(await po.loginPage.isErrorVisible()).toBe(false);
    });

    test('@login @ui - Should show correct page title', async () => {
      const title = await po.loginPage.getTitle();
      expect(title).toContain(TestDataLoader.getPageTitle('login'));
    });
  });

  // ==================== FIELD VALIDATION TESTS ====================

  test.describe('Field Validation Tests', () => {
    test('@login @validation - Should accept valid username input', async () => {
      const testUsername = 'standard_user';
      await po.loginPage.fillUsername(testUsername);

      const actualUsername = await po.loginPage.getUsernameValue();
      expect(actualUsername).toBe(testUsername);
    });

    test('@login @validation - Should accept valid password input', async () => {
      const testPassword = 'secret_sauce';
      await po.loginPage.fillPassword(testPassword);

      const actualPassword = await po.loginPage.getPasswordValue();
      expect(actualPassword).toBe(testPassword);
    });

    test('@login @validation - Should handle special characters in username', async () => {
      const specialUsername = 'user@test.com';
      await po.loginPage.fillUsername(specialUsername);

      const actualUsername = await po.loginPage.getUsernameValue();
      expect(actualUsername).toBe(specialUsername);
    });

    test('@login @validation - Should handle long password', async () => {
      const longPassword = 'a'.repeat(100);
      await po.loginPage.fillPassword(longPassword);

      const actualPassword = await po.loginPage.getPasswordValue();
      expect(actualPassword).toBe(longPassword);
    });
  });

  // ==================== EDGE CASE TESTS ====================

  test.describe('Edge Case Tests', () => {
    test('@login @edge - Should handle rapid login attempts', async () => {
      // Try multiple rapid login attempts
      for (let i = 0; i < 3; i++) {
        await po.loginPage.loginWithUserType('locked', false);
        await po.loginPage.waitForErrorMessage();
        await po.loginPage.clearFields();
      }

      // Should still show error for locked user
      await po.loginPage.assertErrorMessage('locked out');
    });

    test('@login @edge - Should handle page refresh during login', async () => {
      await po.loginPage.fillUsername('standard_user');
      await po.loginPage.fillPassword('secret_sauce');

      // Refresh page
      await po.loginPage.refreshPage();

      // Fields should be empty after refresh
      expect(await po.loginPage.areFieldsEmpty()).toBe(true);
    });

    test('@login @edge - Should handle back button after login', async () => {
      await po.loginPage.loginAsStandardUser();

      // Go back to login page using browser back button
      await po.loginPage.goBackToLogin();

      // Should be on login page (URL should contain the base URL without /inventory)
      const currentUrl = po.page.url();
      expect(currentUrl).toContain('saucedemo.com');
      expect(currentUrl).not.toContain('/inventory');
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('Performance Tests', () => {
    test('@login @performance - Should login within acceptable time', async () => {
      const startTime = Date.now();

      await po.loginPage.loginAsStandardUser();

      const endTime = Date.now();
      const loginTime = endTime - startTime;

      // Login should complete within 5 seconds
      expect(loginTime).toBeLessThan(5000);
    });

    test('@login @performance - Should handle slow network gracefully', async () => {
      // Simulate slow network by increasing timeout
      await po.loginPage.login('standard_user', 'secret_sauce', true);
      await po.loginPage.assertSuccessfulLogin();
    });
  });

  // ==================== DATA-DRIVEN TESTS ====================

  test.describe('Data-Driven Tests', () => {
    const userTypes = ['standard', 'problem', 'performance', 'error', 'visual'];

    userTypes.forEach(userType => {
      test(`@login @data-driven - Should login with ${userType} user`, async () => {
        await po.loginPage.loginWithUserType(userType);
        await po.loginPage.assertSuccessfulLogin();
      });
    });

    const invalidCredentials = [
      { username: '', password: 'secret_sauce', expectedError: 'Username is required' },
      { username: 'standard_user', password: '', expectedError: 'Password is required' },
      { username: '', password: '', expectedError: 'Username is required' },
      {
        username: 'invalid_user',
        password: 'wrong_password',
        expectedError: 'Username and password do not match',
      },
    ];

    invalidCredentials.forEach(({ username, password, expectedError }) => {
      test(`@login @data-driven - Should show error for ${username || 'empty'} username and ${password || 'empty'} password`, async () => {
        await po.loginPage.login(username, password, false);
        await po.loginPage.assertLoginFailed();
        await po.loginPage.assertErrorMessage(expectedError);
      });
    });
  });
});
