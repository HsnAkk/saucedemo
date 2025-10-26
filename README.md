# SauceDemo Playwright Testing Framework

Comprehensive Playwright automation framework for SauceDemo e-commerce application.

## 🚀 Features

- **Page Object Model (POM)** architecture
- **237+ test cases** across 8 suites
- **Smoke + Regression** test coverage
- **CI/CD Integration** with GitHub Actions
- **Parallel execution** for faster feedback
- **Comprehensive reporting** with HTML/XML/JSON

## 📊 Project Statistics

- **Total Lines:** ~6,400
- **Page Objects:** 2,700+ lines
- **Test Files:** 3,700+ lines
- **Test Cases:** 237
- **Code Coverage:** Login, Inventory, Cart, Checkout, Products

## 🏗️ Architecture

```
pages/
├── auth/LoginPage.js           # Authentication
├── shop/
│   ├── InventoryPage.js         # Product listing
│   ├── ProductDetailsPage.js   # Product details
│   └── CartPage.js              # Shopping cart
├── checkout/
│   ├── CheckoutInfoPage.js     # Checkout step 1
│   ├── CheckoutOverviewPage.js # Checkout step 2
│   └── CheckoutCompletePage.js # Checkout complete
├── common/HeaderComponents.js   # Header/Menu
└── base/BasePage.js             # Base class

tests/
├── regression/ (8 suites)
│   ├── login.spec.js
│   ├── inventory.spec.js
│   ├── productDetails.spec.js
│   ├── cart.spec.js
│   ├── checkoutInfo.spec.js
│   ├── checkoutOverview.spec.js
│   ├── checkoutComplete.spec.js
│   └── headerMenu.spec.js
└── smoke/ (2 suites)
    ├── login.smoke.spec.js
    └── cart-checkout.smoke.spec.js
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run Tests

```bash
# Run all tests
npm test

# Run smoke tests (fast feedback)
npm run test:smoke

# Run regression tests
npm run test:regression

# Run specific suite
npm run test -- tests/regression/inventory.spec.js

# Run with specific tag
npm run test -- --grep @smoke
```

## 📝 Test Execution

### Local Execution

```bash
# All tests (~10 minutes)
npm test

# Smoke tests only (~2 minutes)
npm run test:smoke

# With UI (headed mode)
npm run test -- --headed

# With specific browser
npm run test -- --project=chromium
```

### CI/CD Pipeline

Automatically runs on:

- Push to `main` or `develop`
- Pull requests
- Scheduled (nightly at 2 AM UTC)

**View CI Results:** [GitHub Actions](.github/workflows/)

## 📊 Test Reports

After execution, view reports:

```bash
# Open HTML report
npm run test:report

# Or manually
npx playwright show-report
```

Reports include:

- HTML report with screenshots
- JSON results
- XML results (for CI tools)
- Video recordings on failure

## 🏷️ Test Tags

Tests are tagged for selective execution:

- `@smoke` - Critical path tests
- `@regression` - Full regression suite
- `@positive` - Positive test cases
- `@negative` - Negative test cases
- `@ui` - UI verification tests
- `@performance` - Performance tests
- `@edge` - Edge case tests

**Examples:**

```bash
# Run only smoke tests
npm run test -- --grep @smoke

# Run only negative tests
npm run test -- --grep @negative

# Run specific module
npm run test -- --grep @cart
```

## 📦 NPM Scripts

| Script                    | Description          |
| ------------------------- | -------------------- |
| `npm test`                | Run all tests        |
| `npm run test:smoke`      | Run smoke tests only |
| `npm run test:regression` | Run regression tests |
| `npm run test:login`      | Run login tests      |
| `npm run test:inventory`  | Run inventory tests  |
| `npm run test:cart`       | Run cart tests       |
| `npm run test:checkout`   | Run checkout tests   |
| `npm run test:report`     | Open HTML report     |
| `npm run test:debug`      | Debug mode           |
| `npm run lint`            | Run ESLint           |
| `npm run lint:fix`        | Fix linting issues   |
| `npm run format`          | Format code          |

## 🔧 Configuration

### Playwright Config

Main configuration: `playwright.config.js`

Key settings:

- **Timeout:** 45 seconds for authenticated tests
- **Retries:** 2 on CI, 0 locally
- **Browsers:** Chromium (add more as needed)
- **Reports:** HTML, JSON, XML

### Test Data

Located in: `fixtures/data/`

- `users.json` - User credentials
- `testData.json` - Test data
- `products.json` - Product information
- `testConfig.json` - Test configuration
- `environments.json` - Environment settings

## 🧪 Test Coverage

### UI Coverage

✅ Login & Authentication  
✅ Product Browsing  
✅ Product Details  
✅ Shopping Cart  
✅ Checkout Flow (3 steps)  
✅ Header Menu  
✅ User Management

### Test Types

✅ **Positive Tests** - Happy path scenarios  
✅ **Negative Tests** - Error handling  
✅ **Edge Cases** - Boundary conditions  
✅ **UI Tests** - Visual verification  
✅ **Performance Tests** - Response times

## 🛠️ Development

### Add New Test

1. Create page object (if needed) in `pages/`
2. Add test in appropriate `tests/` directory
3. Use tags for categorization
4. Update POManager if adding new page

### Add New Page Object

```javascript
import { BasePage } from '../base/BasePage.js';

export class NewPage extends BasePage {
  constructor(page) {
    super(page);
    // Add locators
  }

  // Add methods
}
```

## 📈 CI/CD Integration

### GitHub Actions

Workflows:

- **CI Pipeline** - Runs on every push/PR
- **Release Pipeline** - Creates releases
- **Scheduled Tests** - Nightly runs
- **Deployment Pipeline** - Deploys to environments

See [`.github/workflows/`](.github/workflows/) for details.

## 🐛 Debugging

### Debug Mode

```bash
# Run with debugger
npm run test:debug

# Or
npx playwright test --debug
```

### Screenshots on Failure

Automatically captured in:

- `test-results/` directory
- Included in HTML report

### Video Recordings

Automatically recorded on:

- Test failures
- Available in HTML report

## 📚 Documentation

- [Page Objects Guide](docs/page-objects.md)
- [Test Writing Guide](docs/writing-tests.md)
- [CI/CD Setup](.github/workflows/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Write tests
4. Submit pull request

## 📄 License

MIT License

## 👥 Authors

Your Name

## 🙏 Acknowledgments

- SauceDemo team for the demo application
- Playwright team for the excellent tooling
- Testing community for best practices
