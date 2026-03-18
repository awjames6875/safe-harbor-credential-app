import { test, expect } from "@playwright/test";

test.describe("Admin login", () => {
  test("invalid credentials show error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("bad@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Invalid login credentials")).toBeVisible();
  });

  test("forgot password link shows reset form", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Forgot password?").click();
    await expect(page.getByText("Reset Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send Reset Email" })
    ).toBeVisible();
  });

  test("back to sign in from reset form", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Forgot password?").click();
    await page.getByText("Back to sign in").click();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
});

test.describe("Clinician login", () => {
  test("invalid credentials show error", async ({ page }) => {
    await page.goto("/clinician/login");
    await page.getByLabel("Email").fill("bad@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Invalid login credentials")).toBeVisible();
  });

  test("forgot password link shows reset form", async ({ page }) => {
    await page.goto("/clinician/login");
    await page.getByText("Forgot password?").click();
    await expect(page.getByText("Reset Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send Reset Email" })
    ).toBeVisible();
  });
});
