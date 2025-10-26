import { BasePage } from '../base/BasePage.js';
import { expect } from '@playwright/test';

/**
 * ProductDetailsPage - Handles all product details page interactions
 * Extends BasePage for common functionality
 */
export class ProductDetailsPage extends BasePage {
  constructor(page) {
    super(page);

    // ==================== LOCATORS ====================
    // Container
    this.productContainer = this.page.locator('.inventory_details_container');

    // Product information
    this.productName = this.page.locator('.inventory_details_name');
    this.productDescription = this.page.locator('.inventory_details_desc');
    this.productPrice = this.page.locator('.inventory_details_price');
    this.productImage = this.page.locator('.inventory_details_img');

    // Action buttons
    this.addToCartButton = this.page.locator('[data-test*="add-to-cart"]');
    this.removeButton = this.page.locator('[data-test*="remove"]');
    this.backButton = this.page.locator('[data-test="back-to-products"]');

    // Cart elements
    this.cartIcon = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');

    // Header elements
    this.menuButton = this.page.locator('#react-burger-menu-btn');
    this.headerTitle = this.page.locator('.app_logo');
  }

  // ==================== NAVIGATION METHODS ====================

  /**
   * Navigate to product details page by product ID
   * @param {number} productId - The ID of the product
   */
  async goto(productId) {
    await super.goto(`/inventory-item.html?id=${productId}`);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to product details by product name from inventory
   * @param {string} productName - Name of the product
   */
  async gotoByName(productName) {
    // Click on product name to navigate to details
    const productItem = this.page.locator(`.inventory_item:has-text("${productName}")`);
    const productLink = productItem.locator('.inventory_item_name');
    await productLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Wait for product details page to load completely
   */
  async waitForPageLoad() {
    await this.waitForLoadState();
    await this.waitForElement(this.productContainer, 15000);
  }

  /**
   * Navigate back to inventory page
   */
  async goBackToInventory() {
    await this.backButton.click();
    await this.waitForLoadState();
  }

  // ==================== PRODUCT INTERACTION METHODS ====================

  /**
   * Add current product to cart
   */
  async addToCart() {
    await this.addToCartButton.click();
  }

  /**
   * Remove current product from cart
   */
  async removeFromCart() {
    await this.removeButton.click();
  }

  /**
   * Navigate to cart page
   */
  async goToCart() {
    await this.cartIcon.click();
    await this.waitForLoadState();
  }

  // ==================== GETTER METHODS ====================

  /**
   * Get product name
   * @returns {Promise<string>} Product name
   */
  async getProductName() {
    return await this.getText(this.productName);
  }

  /**
   * Get product description
   * @returns {Promise<string>} Product description
   */
  async getProductDescription() {
    return await this.getText(this.productDescription);
  }

  /**
   * Get product price
   * @returns {Promise<string>} Product price
   */
  async getProductPrice() {
    return await this.getText(this.productPrice);
  }

  /**
   * Get product image source
   * @returns {Promise<string>} Product image URL
   */
  async getProductImage() {
    return await this.productImage.getAttribute('src');
  }

  /**
   * Get cart item count
   * @returns {Promise<number>} Number of items in cart
   */
  async getCartItemCount() {
    const badgeText = await this.cartBadge.textContent();
    return badgeText ? parseInt(badgeText) : 0;
  }

  /**
   * Check if product is in cart
   * @returns {Promise<boolean>} True if remove button is visible
   */
  async isProductInCart() {
    return await this.isVisible(this.removeButton);
  }

  // ==================== ASSERTION METHODS ====================

  /**
   * Assert product details page is loaded
   */
  async assertPageLoaded() {
    await expect(this.productContainer).toBeVisible();
    await expect(this.productName).toBeVisible();
    await expect(this.productImage).toBeVisible();
  }

  /**
   * Assert product name is displayed
   * @param {string} expectedName - Expected product name
   */
  async assertProductName(expectedName) {
    const actualName = await this.getProductName();
    expect(actualName).toBe(expectedName);
  }

  /**
   * Assert product price is displayed correctly
   * @param {string} expectedPrice - Expected product price
   */
  async assertProductPrice(expectedPrice) {
    const actualPrice = await this.getProductPrice();
    expect(actualPrice).toBe(expectedPrice);
  }

  /**
   * Assert product is added to cart
   */
  async assertProductAddedToCart() {
    await expect(this.removeButton).toBeVisible();
    await expect(this.addToCartButton).not.toBeVisible();
  }

  /**
   * Assert product is removed from cart
   */
  async assertProductRemovedFromCart() {
    await expect(this.removeButton).not.toBeVisible();
    await expect(this.addToCartButton).toBeVisible();
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
      const actualCount = await this.getCartItemCount();
      expect(actualCount).toBe(expectedCount);
    }
  }

  /**
   * Assert product description is not empty
   */
  async assertProductDescriptionExists() {
    const description = await this.getProductDescription();
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(0);
  }

  /**
   * Assert product image is displayed
   */
  async assertProductImageVisible() {
    await expect(this.productImage).toBeVisible();
  }

  /**
   * Assert back button is visible
   */
  async assertBackButtonVisible() {
    await expect(this.backButton).toBeVisible();
  }

  /**
   * Assert all product details are displayed correctly
   */
  async assertAllProductDetailsDisplayed() {
    await this.assertPageLoaded();
    await this.assertProductImageVisible();
    await this.assertProductDescriptionExists();
    await this.assertBackButtonVisible();
  }
}
