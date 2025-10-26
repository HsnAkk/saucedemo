import { LoginPage } from './auth/LoginPage';
import { InventoryPage } from './shop/InventoryPage';
import { ProductDetailsPage } from './shop/ProductDetailsPage';
import { CartPage } from './shop/CartPage';
import { CheckoutInfoPage } from './checkout/CheckoutInfoPage';
import { CheckoutOverviewPage } from './checkout/CheckoutOverviewPage';
import { CheckoutCompletePage } from './checkout/CheckoutCompletePage';
import { HeaderComponents } from './common/HeaderComponents';
import { CommonElements } from './common/CommonElements';
import { BasePage } from './base/BasePage';

export class POManager {
  constructor(page) {
    this.page = page;
    this._loginPage = new LoginPage(page);
    this._inventoryPage = new InventoryPage(page);
    this._productDetailsPage = new ProductDetailsPage(page);
    this._cartPage = new CartPage(page);
    this._checkoutInfo = new CheckoutInfoPage(page);
    this._checkoutOverview = new CheckoutOverviewPage(page);
    this._checkoutComplete = new CheckoutCompletePage(page);
    this._headerComponents = new HeaderComponents(page);
    this._commonElements = new CommonElements(page);
    this._basePage = new BasePage(page);
  }

  // GETTERS
  get loginPage() {
    return this._loginPage;
  }

  get inventoryPage() {
    return this._inventoryPage;
  }

  get productDetailsPage() {
    return this._productDetailsPage;
  }

  get cartPage() {
    return this._cartPage;
  }

  get checkoutInfoPage() {
    return this._checkoutInfo;
  }

  get checkoutOverviewPage() {
    return this._checkoutOverview;
  }

  get checkoutCompletePage() {
    return this._checkoutComplete;
  }

  get checkoutCompilation() {
    return this._checkoutComplete;
  }

  get headerComponents() {
    return this._headerComponents;
  }

  get commonElements() {
    return this._commonElements;
  }

  get basePage() {
    return this._basePage;
  }
}
