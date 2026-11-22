import { test, expect } from "@playwright/test";

const CANONICAL_ROUTES = [
  { path: "/", title: "SSN ACM-W Student Chapter", testId: "journey-page" },
  { path: "/home", title: "SSN ACM-W Student Chapter", heading: "The Living World of SSN ACM-W" },
  { path: "/about", title: "SSN ACM-W Student Chapter", heading: "About ACM-W" },
  { path: "/events", title: "SSN ACM-W Student Chapter", heading: "Events & Flagships" },
  { path: "/projects", title: "SSN ACM-W Student Chapter", heading: "Projects & Tech" },
  { path: "/outreach", title: "SSN ACM-W Student Chapter", heading: "Outreach & CSpathshala" },
  { path: "/team", title: "SSN ACM-W Student Chapter", heading: "Team & Leadership" },
  { path: "/join-us", title: "SSN ACM-W Student Chapter", heading: "Join Us · The Future" },
];

test.describe("Canonical Eight-Route Topology & Accessibility Smoke Suite", () => {
  for (const route of CANONICAL_ROUTES) {
    test(`route ${route.path} responds successfully with accessible skip link and valid heading`, async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);

      // Verify skip to main content accessibility link
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeAttached();

      // Verify page title
      await expect(page).toHaveTitle(/SSN ACM-W/);

      // Verify main content container
      const main = page.locator("#main-content");
      await expect(main).toBeAttached();

      if (route.heading) {
        await expect(page.locator("h1")).toContainText(route.heading);
      }
    });
  }
});

test.describe("The Thread We Carry & Terminal Fork Journey", () => {
  test("native scroll journey advances forward and reverses cleanly", async ({ page }) => {
    await page.goto("/");
    const journeyPage = page.locator('[data-testid="journey-page"]');
    await expect(journeyPage).toBeVisible();

    // Verify initial state
    await expect(journeyPage).toHaveAttribute("data-history-progress", /^0(\.0+)?$/);

    // Verify presence of spark bead and living atmosphere
    const spark = page.locator('[data-testid="travelling-golden-bead"]');
    await expect(spark).toBeAttached();
    await expect(page.locator('[data-testid="timeline-living-atmosphere"]')).toBeAttached();
    await page.waitForTimeout(600);

    // Scroll down to mid-timeline
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: "instant" }));
    await page.waitForTimeout(600);

    // Progress should have updated
    const midProgress = await journeyPage.getAttribute("data-history-progress");
    expect(Number(midProgress)).toBeGreaterThan(0);

    // Scroll down to Terminal Fork
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(500);

    const forkProgress = await journeyPage.getAttribute("data-fork-progress");
    expect(Number(forkProgress)).toBeGreaterThan(0);

    // Scroll backwards to verify reverse uncurling and stability
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(500);

    const resetProgress = await journeyPage.getAttribute("data-history-progress");
    expect(Number(resetProgress)).toBeLessThan(0.1);
  });

  test("terminal fork enables selecting a facet strand and navigating", async ({ page }) => {
    await page.goto("/");
    const journeyPage = page.locator('[data-testid="journey-page"]');
    await expect(journeyPage).toBeVisible();
    await page.waitForTimeout(600);

    // Scroll to bottom and ensure fork progress is fully active
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(800);

    const aboutBranch = page.locator('[data-testid="fork-branch-about"]').or(
      page.locator('[data-testid="mobile-fork-branch-about"]')
    );
    await expect(aboutBranch.first()).toBeAttached();
    await aboutBranch.first().click({ force: true });

    // Verifies navigation to /about
    await expect(page).toHaveURL(/\/about$/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "About ACM-W" })).toBeVisible();
  });
});

test.describe("Living Mosaic Homepage & Interactive Exploration", () => {
  test("renders 6 organic regions and allows navigation to facet pages", async ({ page }) => {
    await page.goto("/home");
    await expect(page.locator("h1")).toContainText("The Living World of SSN ACM-W");

    // Verify SVG Mosaic container
    const mosaicSvg = page.locator('[data-testid="mosaic-svg"]');
    await expect(mosaicSvg).toBeVisible();

    // Verify regions
    const regions = ["about", "events", "projects", "outreach", "team", "join-us"];
    for (const r of regions) {
      await expect(page.locator(`[data-testid="mosaic-region-${r}"]`)).toBeAttached();
    }

    // Return to timeline link works
    const timelineLink = page.getByRole("button", { name: /Back to Timeline Story/i });
    await expect(timelineLink).toBeVisible();
    await timelineLink.click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
  });
});

test.describe("Responsive Viewport & Reduced Motion Adaptability", () => {
  test("renders gracefully on mobile viewport (375x667)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const journeyPage = page.locator('[data-testid="journey-page"]');
    await expect(journeyPage).toBeVisible();

    // Navigate to /about
    await page.goto("/about");
    await expect(page.locator("h1")).toContainText("About ACM-W");

    // Horizontal overflow check
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("respects prefers-reduced-motion media query without crashing", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const journeyPage = page.locator('[data-testid="journey-page"]');
    await expect(journeyPage).toBeVisible();

    await page.goto("/home");
    await expect(page.locator("h1")).toContainText("The Living World of SSN ACM-W");
  });
});

test.describe("Governance, Safety & Quarantine Invariants", () => {
  test("strictly excludes PION-07, Anita Borg, and gated student officer names across public DOM", async ({
    page,
  }) => {
    for (const route of ["/", "/home", "/about", "/team", "/events"]) {
      await page.goto(route);
      const content = await page.content();

      // Zero Anita Borg
      expect(content).not.toContain("Anita Borg");

      // Zero PION-07 draft milestone card
      expect(content).not.toContain('data-testid="milestone-PION-07"');
      expect(content).not.toContain("The Legacy Horizon");

      // Zero gated student officer names
      expect(content).not.toContain("Ankitha Reddy");
      expect(content).not.toContain("Akshayalakshmi S");
      expect(content).not.toContain("Oviasree Sampath");
      expect(content).not.toContain("SSN ACM-W Team.pdf");
    }
  });
});
