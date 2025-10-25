import { LoginPage } from './auth/LoginPage';
import { InventoryPage } from './shop/InventoryPage';
import { ProductDetailsPage } from './shop/ProductDetailsPage';
import { CartPage } from './shop/CartPage';
import { CheckoutInfo } from './checkout/CheckoutInfo';
import { CheckoutOverview } from './checkout/CheckoutOverview';
import { CheckoutCompilation } from './checkout/CheckoutCompilation';
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
    this._checkoutInfo = new CheckoutInfo(page);
    this._checkoutOverview = new CheckoutOverview(page);
    this._checkoutCompilation = new CheckoutCompilation(page);
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

  get checkoutInfo() {
    return this._checkoutInfo;
  }

  get checkoutOverview() {
    return this._checkoutOverview;
  }

  get checkoutCompilation() {
    return this._checkoutCompilation;
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
