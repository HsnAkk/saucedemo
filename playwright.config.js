// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  globalSetup: './global-setup.js',
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Global timeout settings */
  timeout: 30000, // 30 seconds for individual tests
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'login-tests',
      testMatch: 'tests/regression/login.spec.js', // Only regression login tests
      timeout: 60000, // 60 seconds for login tests (more complex scenarios)
      use: {
        ...devices['Desktop Chrome'],
        // No storageState - fresh context
      },
    },
    {
      name: 'authenticated-tests',
      testMatch: [
        'tests/regression/inventory.spec.js',
        'tests/regression/productDetails.spec.js',
        'tests/regression/cart.spec.js',
        'tests/regression/checkout*.spec.js',
        'tests/regression/headerMenu.spec.js',
      ],
      timeout: 45000, // 45 seconds for authenticated tests (moderate complexity)
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth-standard.json',
      },
    },
    {
      name: 'smoke-tests',
      testMatch: 'tests/smoke/*.smoke.spec.js',
      timeout: 30000, // 30 seconds for smoke tests (fast critical path)
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth-standard.json',
      },
    },
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
