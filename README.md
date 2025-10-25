# SauceDemo Playwright Test Automation

A comprehensive Playwright test automation framework for SauceDemo e-commerce application, built with modern testing practices and Page Object Model (POM) design pattern.

## 🚀 Features

- **Comprehensive Test Coverage**: Login regression tests with 35+ test scenarios
- **Page Object Model**: Well-structured, maintainable test architecture
- **Dynamic Configuration**: Environment-based configuration with centralized test data
- **Multiple Test Projects**: Separate projects for login tests, authenticated tests, and smoke tests
- **Code Quality Tools**: Prettier, ESLint, Husky for consistent code quality
- **Robust Error Handling**: Comprehensive debugging with screenshots and logging
- **Data-Driven Testing**: Centralized test data management with JSON files

## 📁 Project Structure

```
├── config/                 # Configuration files
├── docs/                  # Documentation
├── fixtures/              # Test data and fixtures
│   ├── api/              # API test data
│   ├── builders/         # Test data builders
│   └── data/             # JSON test data files
├── pages/                 # Page Object Model classes
│   ├── auth/             # Authentication pages
│   ├── base/             # Base page class
│   ├── checkout/          # Checkout flow pages
│   ├── common/            # Common components
│   ├── headerMenu/        # Header menu components
│   └── shop/              # Shopping pages
├── tests/                 # Test suites
│   ├── regression/        # Comprehensive regression tests
│   └── smoke/             # Critical path smoke tests
├── utils/                 # Utility classes
├── reports/               # Test reports
├── screenshots/           # Test screenshots
└── playwright.config.js   # Playwright configuration
```

## 🛠️ Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd saucedemo-playwright-tests
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
STANDARD_USERNAME=standard_user
STANDARD_PASSWORD=secret_sauce
PROBLEM_USERNAME=problem_user
PROBLEM_PASSWORD=secret_sauce
LOCKED_USERNAME=locked_out_user
LOCKED_PASSWORD=secret_sauce
INVALID_USERNAME=invalid_user
INVALID_PASSWORD=invalid_password
EMPTY_USERNAME=
EMPTY_PASSWORD=
TEST_ENV=staging
```

5. Set up Git hooks:

```bash
npm run prepare
```

## 🧪 Running Tests

### All Tests

```bash
npm test
```

### Specific Test Suites

```bash
# Login regression tests
npm run test:login

# Smoke tests
npm run test:smoke

# Authenticated tests
npm run test:regression
```

### Test Categories

```bash
# Run tests by tags
npx playwright test --grep @login
npx playwright test --grep @positive
npx playwright test --grep @negative
npx playwright test --grep @smoke
```

### Debug Mode

```bash
npm run test:debug
```

### Generate Reports

```bash
npm run test:report
```

## 📊 Test Coverage

### Login Regression Tests (35+ scenarios)

- **Positive Tests**: Standard user login, different user types
- **Negative Tests**: Invalid credentials, locked users, empty fields
- **UI Tests**: Field validation, button states, error messages
- **Edge Cases**: Page refresh, back button navigation, performance
- **Data-Driven Tests**: Multiple user types with centralized data

### Test Categories

- `@login` - Login functionality tests
- `@positive` - Positive test scenarios
- `@negative` - Negative test scenarios
- `@ui` - UI element tests
- `@edge` - Edge case tests
- `@performance` - Performance tests
- `@smoke` - Critical path tests

## 🔧 Configuration

### Playwright Configuration

The project uses three separate test projects:

1. **login-tests**: Fresh context for login functionality testing
2. **authenticated-tests**: Pre-authenticated state for shopping tests
3. **smoke-tests**: Critical path tests with authentication

### Test Data Management

- **Environments**: `fixtures/data/environments.json`
- **Users**: `fixtures/data/users.json`
- **Test Data**: `fixtures/data/testData.json`
- **API Endpoints**: `fixtures/data/apiEndpoints.json`

## 🏗️ Architecture

### Page Object Model

- **BasePage**: Common functionality for all pages
- **LoginPage**: Comprehensive login page interactions
- **POManager**: Central manager for all page objects

### Key Features

- **Dynamic BaseURL**: Environment-based URL configuration
- **Flexible Locators**: Support for both string selectors and Playwright Locator objects
- **Robust Error Handling**: Comprehensive debugging with screenshots
- **Centralized Validation**: Error messages and page titles in test data

## 🎯 Best Practices

### Code Quality

- **Prettier**: Automatic code formatting
- **ESLint**: Code linting with Playwright-specific rules
- **Husky**: Pre-commit hooks for quality assurance
- **lint-staged**: Run linters on staged files only

### Test Organization

- **Descriptive Test Names**: Clear, readable test descriptions
- **Proper Tagging**: Categorize tests for selective execution
- **Data Centralization**: All test data in JSON files
- **Error Handling**: Comprehensive debugging and reporting

## 📈 Reports

Test reports are generated in multiple formats:

- **HTML Report**: Interactive test results
- **JSON Report**: Machine-readable results
- **JUnit Report**: CI/CD integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything works
5. Commit your changes
6. Push to your fork
7. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - Modern web testing framework
- [SauceDemo](https://www.saucedemo.com/) - Test application
- [Page Object Model](https://playwright.dev/docs/pom) - Design pattern for maintainable tests
