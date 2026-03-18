import { test, expect } from "@playwright/test";

test.describe("Page loads", () => {
  test("landing page loads with heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Insurance credentialing,")
    ).toBeVisible();
  });

  test("admin login page loads with sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("clinician login page loads with sign-in form", async ({ page }) => {
    await page.goto("/clinician/login");
    await expect(page.getByText("Clinician Portal")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("create-password page loads", async ({ page }) => {
    await page.goto("/create-password");
    await expect(page.getByText("Create Your Password")).toBeVisible();
  });
});
