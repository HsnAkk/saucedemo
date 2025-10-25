import { chromium } from '@playwright/test';
import { TestDataLoader } from './utils/testDataLoader.js';


export default async function globalSetup(config) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load environment variables
  const environment = TestDataLoader.getEnvironment('staging');

  // go-to environment page
  await page.goto(environment.baseUrl);

  // Locators
  const usernameInput = page.locator('#user-name');
  const passwordInput = page.locator('#password');
  const loginButton = page.locator('#login-button');

  // Get credentials using TestDataLoader
  const credentials = TestDataLoader.getUserCredentials('standard');

  console.log(credentials);

  // Login as standard_user only
  await usernameInput.fill(credentials.username);
  await passwordInput.fill(credentials.password);
  await loginButton.click();

  // Wait for successful login (navigate to inventory page)
  await page.waitForURL('**/inventory.html');

  // Save auth state for authenticated tests
  await page.context().storageState({ path: 'auth-standard.json' });
  await browser.close();
}