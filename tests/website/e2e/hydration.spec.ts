import { expect, test, type Page } from "@playwright/test";

const HYDRATION_PATTERN =
  /hydrat|did not match|server-rendered|server rendered|tree hydrated|mismatch/i;

function attachIssueCollector(page: Page) {
  const errors: string[] = [];
  const hydrationWarnings: string[] = [];

  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      errors.push(`console.error: ${text}`);
    }
    if (HYDRATION_PATTERN.test(text)) {
      hydrationWarnings.push(`console.${msg.type()}: ${text}`);
    }
  });

  return { errors, hydrationWarnings };
}

test.describe("Hydration & Console Cleanliness", () => {
  test("hydrates / cleanly across desktop, tablet, and mobile viewports", async ({
    page,
  }) => {
    const { errors, hydrationWarnings } = attachIssueCollector(page);
    const viewports = [
      { width: 1440, height: 900 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "networkidle" });
      await expect(page.locator('[data-testid="journey-page"]')).toBeVisible();
      await page.waitForTimeout(250);
    }

    expect(hydrationWarnings).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("hydrates / and /home cleanly with prefers-reduced-motion: reduce", async ({
    page,
  }) => {
    const { errors, hydrationWarnings } = attachIssueCollector(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="journey-page"]')).toBeVisible();
    await page.waitForTimeout(200);

    await page.goto("/home", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForTimeout(200);

    expect(hydrationWarnings).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("hydrates all facet routes cleanly without console errors", async ({
    page,
  }) => {
    const { errors, hydrationWarnings } = attachIssueCollector(page);
    await page.setViewportSize({ width: 375, height: 667 });

    for (const route of [
      "/about",
      "/events",
      "/projects",
      "/outreach",
      "/team",
      "/join-us",
    ]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator("h1").first()).toBeVisible();
    }

    expect(hydrationWarnings).toEqual([]);
    expect(errors).toEqual([]);
  });
});
