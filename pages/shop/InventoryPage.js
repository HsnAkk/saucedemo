import { BasePage } from '../base/BasePage.js';
import { TestDataLoader } from '../../utils/testDataLoader.js';

/**
 * InventoryPage - Handles all inventory page interactions
 * Extends BasePage for common functionality
 */
export class InventoryPage extends BasePage {
  constructor(page) {
    super(page);

    // ==================== LOCATORS ====================
    this.inventoryContainer = this.page.locator('.inventory_container');
    this.inventoryItems = this.page.locator('.inventory_item');
    this.inventoryItemNames = this.page.locator('.inventory_item_name');
    this.inventoryItemDescriptions = this.page.locator('.inventory_item_desc');
    this.inventoryItemPrices = this.page.locator('.inventory_item_price');
    this.addToCartButtons = this.page.locator('[data-test*="add-to-cart"]');
    this.removeButtons = this.page.locator('[data-test*="remove"]');

    // Sorting dropdown
    this.sortDropdown = this.page.locator('[data-test="product-sort-container"]');

    // Cart elements
    this.cartIcon = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');

    // Header elements
    this.headerTitle = this.page.locator('.app_logo');
    this.menuButton = this.page.locator('#react-burger-menu-btn');
    this.menuItems = this.page.locator('.bm-menu');
    this.logoutLink = this.page.locator('#logout_sidebar_link');
    this.resetAppLink = this.page.locator('#reset_sidebar_link');
    this.aboutLink = this.page.locator('#about_sidebar_link');
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to inventory page
   */
  async goto() {
    await super.goto('/inventory.html');

    // Check if we're redirected to login page (authentication issue)
    const currentUrl = this.page.url();
    if (currentUrl.includes('/') && !currentUrl.includes('/inventory')) {
      console.warn('Authentication failed - redirected to login page');
      await this.takeScreenshot('inventory-auth-failed');
      throw new Error(`Authentication failed. Expected inventory page, but got: ${currentUrl}`);
    }

    await this.waitForPageLoad();
  }

  /**
   * Wait for inventory page to load completely
   */
  async waitForPageLoad() {
    await this.waitForLoadState();

    try {
      await this.waitForElement(this.inventoryContainer, 15000);
    } catch (error) {
      console.warn('Inventory container not found, taking screenshot for debugging');
      await this.takeScreenshot('inventory-container-not-found');

      // Check current URL for debugging
      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);

      throw new Error(`Inventory page not loaded properly. URL: ${currentUrl}`);
    }
  }

  // ==================== PRODUCT INTERACTION METHODS ====================

  /**
   * Add product to cart by product name
   * @param {string} productName - Name of the product to add
   */
  async addProductToCart(productName) {
    const productItem = this.getProductItemByName(productName);
    const addToCartButton = productItem.locator('[data-test*="add-to-cart"]');
    await addToCartButton.click();
  }

  /**
   * Remove product from cart by product name
   * @param {string} productName - Name of the product to remove
   */
  async removeProductFromCart(productName) {
    const productItem = this.getProductItemByName(productName);
    const removeButton = productItem.locator('[data-test*="remove"]');
    await removeButton.click();
  }

  /**
   * Add multiple products to cart
   * @param {string[]} productNames - Array of product names to add
   */
  async addMultipleProductsToCart(productNames) {
    for (const productName of productNames) {
      await this.addProductToCart(productName);
    }
  }

  /**
   * Get product item element by product name
   * @param {string} productName - Name of the product
   * @returns {Locator} Product item locator
   */
  getProductItemByName(productName) {
    return this.page.locator('.inventory_item').filter({ hasText: productName });
  }

  /**
   * Get product price by product name
   * @param {string} productName - Name of the product
   * @returns {Promise<string>} Product price
   */
  async getProductPrice(productName) {
    const productItem = this.getProductItemByName(productName);
    const priceElement = productItem.locator('.inventory_item_price');
    return await priceElement.textContent();
  }

  /**
   * Get product description by product name
   * @param {string} productName - Name of the product
   * @returns {Promise<string>} Product description
   */
  async getProductDescription(productName) {
    const productItem = this.getProductItemByName(productName);
    const descriptionElement = productItem.locator('.inventory_item_desc');
    return await descriptionElement.textContent();
  }

  // ==================== SORTING METHODS ====================

  /**
   * Sort products by option
   * @param {string} sortOption - Sorting option (name-asc, name-desc, price-asc, price-desc)
   */
  async sortProducts(sortOption) {
    await this.sortDropdown.selectOption(sortOption);
    await this.waitForLoadState();
  }

  /**
   * Get current sort option
   * @returns {Promise<string>} Current sort option value
   */
  async getCurrentSortOption() {
    return await this.sortDropdown.inputValue();
  }

  /**
   * Get all product names in current order
   * @returns {Promise<string[]>} Array of product names
   */
  async getAllProductNames() {
    const names = await this.inventoryItemNames.allTextContents();
    return names;
  }

  /**
   * Get all product prices in current order
   * @returns {Promise<string[]>} Array of product prices
   */
  async getAllProductPrices() {
    const prices = await this.inventoryItemPrices.allTextContents();
    return prices;
  }

  // ==================== CART METHODS ====================

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
  async getCartItemCount() {
    const badge = this.cartBadge;
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return parseInt(text);
    }
    return 0;
  }

  /**
   * Check if cart badge is visible
   * @returns {Promise<boolean>} True if cart badge is visible
   */
  async isCartBadgeVisible() {
    return await this.cartBadge.isVisible();
  }

  // ==================== HEADER MENU METHODS ====================

  /**
   * Open header menu
   */
  async openMenu() {
    await this.menuButton.click();
    await this.waitForElement(this.menuItems, 5000);
  }

  /**
   * Close header menu
   */
  async closeMenu() {
    const closeButton = this.page.locator('#react-burger-cross-btn');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
    await this.waitForURL('**/');
  }

  /**
   * Reset application state
   */
  async resetApp() {
    await this.openMenu();
    await this.resetAppLink.click();
    await this.waitForLoadState();
  }

  /**
   * Navigate to about page
   */
  async goToAbout() {
    await this.openMenu();
    await this.aboutLink.click();
    await this.waitForLoadState();
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Verify inventory page is loaded
   */
  async assertInventoryPageLoaded() {
    await this.assertURLContains('inventory');
    await this.assertElementVisible(this.inventoryContainer);
  }

  /**
   * Verify product is added to cart
   * @param {string} productName - Name of the product
   */
  async assertProductAddedToCart(productName) {
    const productItem = this.getProductItemByName(productName);
    const removeButton = productItem.locator('[data-test*="remove"]');
    await this.assertElementVisible(removeButton);
  }

  /**
   * Verify product is removed from cart
   * @param {string} productName - Name of the product
   */
  async assertProductRemovedFromCart(productName) {
    const productItem = this.getProductItemByName(productName);
    const addToCartButton = productItem.locator('[data-test*="add-to-cart"]');
    await this.assertElementVisible(addToCartButton);
  }

  /**
   * Verify cart badge shows correct count
   * @param {number} expectedCount - Expected number of items in cart
   */
  async assertCartBadgeCount(expectedCount) {
    if (expectedCount === 0) {
      await this.assertElementHidden(this.cartBadge);
    } else {
      await this.assertElementVisible(this.cartBadge);
      const actualCount = await this.getCartItemCount();
      if (actualCount !== expectedCount) {
        throw new Error(`Expected cart count ${expectedCount}, but got ${actualCount}`);
      }
    }
  }

  /**
   * Verify products are sorted correctly
   * @param {string} sortType - Type of sorting (name, price)
   * @param {string} order - Order (asc, desc)
   */
  async assertProductsSorted(sortType, order) {
    const items =
      sortType === 'name' ? await this.getAllProductNames() : await this.getAllProductPrices();

    for (let i = 0; i < items.length - 1; i++) {
      const current = items[i];
      const next = items[i + 1];

      if (sortType === 'name') {
        const comparison = order === 'asc' ? current <= next : current >= next;
        if (!comparison) {
          throw new Error(
            `Products not sorted correctly by name ${order}. Found: ${current} and ${next}`
          );
        }
      } else if (sortType === 'price') {
        const currentPrice = parseFloat(current.replace('$', ''));
        const nextPrice = parseFloat(next.replace('$', ''));
        const comparison = order === 'asc' ? currentPrice <= nextPrice : currentPrice >= nextPrice;
        if (!comparison) {
          throw new Error(
            `Products not sorted correctly by price ${order}. Found: ${current} and ${next}`
          );
        }
      }
    }
  }

  /**
   * Verify all products are displayed
   * @param {number} expectedCount - Expected number of products
   */
  async assertAllProductsDisplayed(expectedCount = 6) {
    await this.assertElementVisible(this.inventoryContainer);
    const productCount = await this.inventoryItems.count();
    if (productCount !== expectedCount) {
      throw new Error(`Expected ${expectedCount} products, but found ${productCount}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get total number of products
   * @returns {Promise<number>} Total number of products
   */
  async getTotalProductCount() {
    return await this.inventoryItems.count();
  }

  /**
   * Check if product exists by name
   * @param {string} productName - Name of the product
   * @returns {Promise<boolean>} True if product exists
   */
  async isProductExists(productName) {
    const productItem = this.getProductItemByName(productName);
    return await productItem.isVisible();
  }

  /**
   * Get all available products
   * @returns {Promise<string[]>} Array of all product names
   */
  async getAllAvailableProducts() {
    return await this.getAllProductNames();
  }

  /**
   * Take screenshot of inventory page
   * @param {string} name - Screenshot name
   */
  async takeInventoryScreenshot(name = 'inventory-page') {
    await this.takeScreenshot(name);
  }
}
