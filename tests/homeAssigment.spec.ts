import { test, expect, Page } from "@playwright/test";
import { faker } from "@faker-js/faker";

/**
 * initialize necessary variable that are required for the test
 */
const BASE_URL = "https://www.saucedemo.com/v1";
const USERS = {
  LOCKED_OUT: { username: "locked_out_user", password: "secret_sauce" },
  STANDARD: { username: "standard_user", password: "secret_sauce" },
};
const MESSAGES = {
  INVALID_LOGIN: "Epic sadface: Sorry, this user has been locked out.",
  CHECKOUT_SUCCESS: "THANK YOU FOR YOUR ORDER",
};
const INVENTORY_PAGE_HEADER = "Products";

/**
 * generate fake data
 */
const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const postalCode = faker.location.zipCode();

/**
 * login
 * @param page - The Playwright page object.
 * @param username - the username of the user
 * @param password - the password of the user
 */
async function login(page: Page, username: string, password: string) {
  /**
   * fill username, password and click on login button
   */
  await page.fill("#user-name", username);
  await page.fill("#password", password);
  await page.click("#login-button");

  /**
   * wait for page to stabilize after login
   */
  await page.waitForLoadState("networkidle");
}

/**
 * adds a single item to the card based on its name
 * @param page - The Playwright page object.
 * @param itemName - the name of the item to add to the cart.
 */
async function addItemToCart(page: Page, itemName: string) {
  /**
   * locate the container of the item based on its name
   */
  const itemContainer = await page.locator(".inventory_item", {
    hasText: itemName,
  });

  /**
   * find the "ADD TO CART" button within the item container and click it
   */
  await itemContainer.locator(".btn_primary.btn_inventory").click();
}

/**
 * adds multiple items to the cart.
 * @param page - the Playwright page object.
 * @param itemNames - an array of item names to add to the cart.
 */
async function addMultipleItemsToCart(page: Page, itemNames: string[]) {
  for (const itemName of itemNames) {
    await addItemToCart(page, itemName);
  }
}

test.describe("Swag Labs Test Suite", () => {
  test.beforeEach(async ({ page }) => {
    /**
     * navigate to the login/base url
     */
    await page.goto(`${BASE_URL}/index.html`);
  });

  /**
   * clear local storage after each test to ensure a clean state
   */
  test.afterEach(async ({ page }) => {
    await page.evaluate(() => window.localStorage.clear());
  });

  test("should not login with an invalid user", async ({ page }) => {
    /**
     * fill in the username and password fields with invalid credentials and click on the login button
     */
    await login(page, USERS.LOCKED_OUT.username, USERS.LOCKED_OUT.password);

    /**
     * verify that an error message is displayed
     */
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(MESSAGES.INVALID_LOGIN);

    /**
     * verify that the user is not redirected to the inventory page
     */
    await expect(page).not.toHaveURL(`${BASE_URL}/inventory.html`);
  });

  test("should display an inventory page while login with a valid user", async ({
    page,
  }) => {
    /**
     * fill in the username and password fields with valid credentials
     */
    await page.fill("#user-name", USERS.STANDARD.username);
    await page.fill("#password", USERS.STANDARD.password);

    /**
     * click the login button
     */
    await page.click("#login-button");

    /**
     * verify that the user is successfully logged in and redirected to the inventory page
     */
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);

    /**
     * additional verification: Check for an element that's only present on the inventory page
     */
    await expect(page.locator(".product_label")).toHaveText(
      INVENTORY_PAGE_HEADER
    );
  });

  test("should filter products by Name (Z to A) and Price (Low to High) and list them accordingly", async ({
    page,
  }) => {
    /**
     * login with valid user
     */
    await login(page, USERS.STANDARD.username, USERS.STANDARD.password);

    /**
     * apply filter by Name (Z to A)
     */
    await page.selectOption(".product_sort_container", "za");

    /**
     * verify product names are in descending order as per applied filter
     */
    const productNames = await page.$$eval(".inventory_item_name", (names) =>
      names.map((name) => name.textContent || "")
    );
    expect(productNames).toEqual([...productNames].sort().reverse());

    /**
     * apply filter by price (Low to High)
     */
    await page.selectOption(".product_sort_container", "lohi");

    /**
     * verify product prices are in ascending order
     */
    const productPrices = await page.$$eval(".inventory_item_price", (prices) =>
      prices.map((price) => {
        const priceText = price.textContent || "0";
        return parseFloat(priceText.replace("$", ""));
      })
    );
    expect(productPrices).toEqual([...productPrices].sort((a, b) => a - b));
  });
  test("should add items to the cart and display the count of the added item in the cart icon", async ({
    page,
  }) => {
    /**
     * login with valid user
     */
    await login(page, USERS.STANDARD.username, USERS.STANDARD.password);

    /**
     * add three items to the cart
     */

    await page.click(".btn_primary.btn_inventory");
    await page.click(":nth-match(.btn_primary.btn_inventory, 2)");
    await page.click(":nth-match(.btn_primary.btn_inventory, 3)");

    /**
     * verify cart count equals to 3
     */
    const cartBadge = page.locator(".shopping_cart_badge");
    await expect(cartBadge).toHaveText("3");
  });

  test("should display a successful message when a valid user performs checkout", async ({
    page,
  }) => {
    /**
     * initialize product names
     */
    const products = [
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
      "Sauce Labs Onesie",
    ];
    /**
     * login and add items to cart with name of the item
     */
    await login(page, USERS.STANDARD.username, USERS.STANDARD.password);

    /**
     * add multiple products to the cart
     */
    await addMultipleItemsToCart(page, products);

    /**
     * go to cart and checkout
     */
    await page.click(".shopping_cart_link");
    await page.click("a.btn_action.checkout_button");

    /**
     * fill checkout information
     */

    await page.fill('[data-test="firstName"]', firstName);
    await page.fill('[data-test="lastName"]', lastName);
    await page.fill('[data-test="postalCode"]', postalCode);
    await page.click("input.btn_primary.cart_button");

    /**
     * complete checkout
     */
    await page.click("a.btn_action.cart_button");

    /**
     * verify successful checkout
     */
    const confirmationMessage = page.locator(".complete-header");
    await expect(confirmationMessage).toHaveText(MESSAGES.CHECKOUT_SUCCESS);
  });
});
