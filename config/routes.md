# SauceDemo API Routes

## Authentication

- `POST /login` - User login
- `POST /logout` - User logout

## Products

- `GET /inventory.html` - Product inventory
- `GET /inventory-item.html` - Product details

## Cart

- `GET /cart.html` - Shopping cart
- `POST /cart/add` - Add item to cart
- `DELETE /cart/remove` - Remove item from cart

## Checkout

- `GET /checkout-step-one.html` - Checkout info
- `GET /checkout-step-two.html` - Checkout overview
- `GET /checkout-complete.html` - Order complete

## Test Data

- All test data stored in `fixtures/data/` directory
- User credentials in `.env` file
- Environment settings in `config/env.json`
