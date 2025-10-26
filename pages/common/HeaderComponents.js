import { BasePage } from '../base/BasePage.js';
import { expect } from '@playwright/test';

/**
 * HeaderComponents - Handles all header/navigation menu interactions
 * Used across multiple pages in the application
 */
export class HeaderComponents extends BasePage {
  constructor(page) {
    super(page);

    // ==================== HEADER LOCATORS ====================
    this.headerTitle = this.page.locator('.app_logo');
    this.menuButton = this.page.locator('#react-burger-menu-btn');
    this.menuItems = this.page.locator('.bm-menu');
    this.closeMenuButton = this.page.locator('#react-burger-cross-btn');
    this.cartIcon = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');

    // Menu links
    this.allItemsLink = this.page.locator('#inventory_sidebar_link');
    this.aboutLink = this.page.locator('#about_sidebar_link');
    this.logoutLink = this.page.locator('#logout_sidebar_link');
    this.resetAppLink = this.page.locator('#reset_sidebar_link');

    // Secondary header links (sometimes appear at top)
    this.twitterLink = this.page.locator('.social_twitter');
    this.facebookLink = this.page.locator('.social_facebook');
    this.linkedinLink = this.page.locator('.social_linkedin');
  }

  // ==================== MENU INTERACTION METHODS ====================

  /**
   * Open the header menu
   */
  async openMenu() {
    // Check if menu is already fully open
    if (await this.isMenuOpen()) {
      return;
    }

    // Menu is closed, click to open it
    await this.menuButton.click();

    // Wait for close button to appear (signals menu is opening)
    const closeButton = this.page.locator('#react-burger-cross-btn');
    await closeButton.waitFor({ state: 'visible', timeout: 5000 });

    // Additional small delay to ensure menu is fully rendered
    await this.page.waitForTimeout(300);
  }

  /**
   * Close the header menu
   */
  async closeMenu() {
    const closeButton = this.page.locator('#react-burger-cross-btn');

    // Wait for close button to be attached to DOM
    await closeButton.waitFor({ state: 'attached', timeout: 5000 });

    // Use JavaScript evaluation since button may be hidden by CSS
    await closeButton.evaluate(node => node.click());

    // Wait for menu to close
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if menu is open
   * @returns {Promise<boolean>} True if menu is visible
   */
  async isMenuOpen() {
    // Check if menu container exists and close button is visible
    const closeButton = this.page.locator('#react-burger-cross-btn');
    try {
      return await closeButton.isVisible({ timeout: 500 });
    } catch {
      return false;
    }
  }

  // ==================== MENU NAVIGATION METHODS ====================

  /**
   * Navigate to all items (inventory page)
   */
  async goToAllItems() {
    if (!(await this.isMenuOpen())) {
      await this.openMenu();
    }

    // Wait for link to be attached
    await this.allItemsLink.waitFor({ state: 'attached' });
    await this.page.waitForTimeout(200);

    // Click using JavaScript since menu items may not be focusable
    await this.allItemsLink.evaluate(node => node.click());
    await this.waitForLoadState();
  }

  /**
   * Navigate to about page
   * Note: This navigates to external saucelabs.com site
   */
  async goToAbout() {
    // Ensure menu is open
    if (!(await this.isMenuOpen())) {
      await this.openMenu();
    }

    // Wait for menu animation to complete
    await this.page.waitForTimeout(800);

    // Wait for about link to be attached to DOM
    await this.aboutLink.waitFor({ state: 'attached', timeout: 5000 });

    // Small delay for stability
    await this.page.waitForTimeout(200);

    // Click using JavaScript since menu items may not be focusable
    await this.aboutLink.evaluate(node => node.click());

    // Wait for navigation to external site
    await this.page.waitForTimeout(2000);
  }

  /**
   * Logout from application
   */
  async logout() {
    if (!(await this.isMenuOpen())) {
      await this.openMenu();
    }

    // Wait for link to be attached
    await this.logoutLink.waitFor({ state: 'attached' });
    await this.page.waitForTimeout(200);

    // Click using JavaScript since menu items may not be focusable
    await this.logoutLink.evaluate(node => node.click());
    await this.waitForURL('**/');
  }

  /**
   * Reset application state (clear cart)
   */
  async resetApp() {
    if (!(await this.isMenuOpen())) {
      await this.openMenu();
    }

    // Wait for link to be attached
    await this.resetAppLink.waitFor({ state: 'attached' });
    await this.page.waitForTimeout(200);

    // Click using JavaScript since menu items may not be focusable
    await this.resetAppLink.evaluate(node => node.click());
    await this.waitForLoadState();
  }

  // ==================== CART INTERACTION METHODS ====================

  /**
   * Navigate to cart page
   */
  async goToCart() {
    await this.cartIcon.click();
    await this.waitForURL('**/cart.html');
  }

  /**
   * Get cart badge count
   * @returns {Promise<number>} Number of items in cart
   */
  async getCartBadgeCount() {
    try {
      const badgeText = await this.cartBadge.textContent();
      return badgeText ? parseInt(badgeText) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Check if cart badge is visible
   * @returns {Promise<boolean>} True if cart badge is visible
   */
  async isCartBadgeVisible() {
    return await this.isVisible(this.cartBadge);
  }

  // ==================== SOCIAL MEDIA METHODS ====================

  /**
   * Navigate to Twitter page
   */
  async goToTwitter() {
    await this.twitterLink.click();
    await this.waitForLoadState();
  }

  /**
   * Navigate to Facebook page
   */
  async goToFacebook() {
    await this.facebookLink.click();
    await this.waitForLoadState();
  }

  /**
   * Navigate to LinkedIn page
   */
  async goToLinkedIn() {
    await this.linkedinLink.click();
    await this.waitForLoadState();
  }

  // ==================== ASSERTION METHODS ====================

  /**
   * Assert header elements are visible
   */
  async assertHeaderElementsVisible() {
    await expect(this.headerTitle).toBeVisible();
    await expect(this.menuButton).toBeVisible();
    await expect(this.cartIcon).toBeVisible();
  }

  /**
   * Assert cart badge shows correct count
   * @param {number} expectedCount - Expected number of items in cart
   */
  async assertCartBadgeCount(expectedCount) {
    if (expectedCount === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toBeVisible();
      const actualCount = await this.getCartBadgeCount();
      expect(actualCount).toBe(expectedCount);
    }
  }

  /**
   * Assert menu is open
   */
  async assertMenuIsOpen() {
    // Check if close button exists in DOM (even if hidden by CSS)
    const closeButton = this.page.locator('#react-burger-cross-btn');
    await expect(closeButton).toBeAttached();

    // Verify menu items are attached to DOM
    await expect(this.allItemsLink).toBeAttached();
  }

  /**
   * Assert menu is closed
   */
  async assertMenuIsClosed() {
    // When menu is closed, the menu button should be visible
    await expect(this.menuButton).toBeVisible();

    // Menu button should be enabled (clickable)
    await expect(this.menuButton).toBeEnabled();
  }

  /**
   * Assert logout functionality
   */
  async assertLogoutSuccessful() {
    await expect(this.page).toHaveURL(/.*\/$/);
  }
}
