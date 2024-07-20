# SwagLabs Playwright Automation Suite

This project contains automated tests for the SwagLabs demo site using Playwright with TypeScript. This automation suite is designed to test the core functionality of the SwagLabs demo site. It covers critical user journeys including login, product browsing, cart management, and checkout process.

## Test Scenarios

1. Login with an Invalid User
2. Login with a Valid User
3. Filter Products by Name and Price
4. Add Items to the Cart
5. Perform Checkout

## Technologies Used

- Playwright
- TypeScript
- Faker.js for test data generation
- Allure for reporting

## Project Structure

playwright-swag-labs-automation/
├── tests/
│ └── homeassignment.spec.ts
├── package.json
├── playwright.config.ts
└── README.md

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v18 or newer) installed
- Git installed

## Setup

1. Clone the repository:

```bash
git clone https://github.com/imsuraj/playwright-swag-labs-automation.git
```

```bash
cd playwright-swag-labs-automation
```

2. Install dependencies:

```bash
npm install
```

3. Install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

To run all tests:

```bash
npm run test
```

## Viewing Test Reports

### HTML Report

To view the HTML report after running tests:

```bash
npm run report:html
```

### Allure Report

To generate and open the Allure report:

```bash
npm run report:allure
```

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are correctly installed
2. Check that you're using the correct Node.js version
3. Clear the browser cache: `npx playwright clear-browser-cache`
4. If tests are failing, check the SwagLabs demo site status
