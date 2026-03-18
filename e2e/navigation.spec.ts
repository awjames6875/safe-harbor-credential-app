import { test, expect } from "@playwright/test";

test.describe("Navigation & redirects", () => {
  test("unauthenticated /admin redirects to /login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/login");
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated /clinician redirects to /clinician/login", async ({
    page,
  }) => {
    await page.goto("/clinician");
    await page.waitForURL("**/clinician/login");
    expect(page.url()).toContain("/clinician/login");
  });

  test("unauthenticated /clinician/settings redirects to /clinician/login", async ({ page }) => {
    await page.goto("/clinician/settings");
    await page.waitForURL("**/clinician/login");
    expect(page.url()).toContain("/clinician/login");
  });

  test("landing page has admin and clinician login links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /admin dashboard/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /clinician portal/i }).first()
    ).toBeVisible();
  });
});
