import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const KEY_PAGES = [
  "/",
  "/explore",
  "/explore/kerala",
  "/discover",
  "/destinations/hampi",
  "/planner",
  "/compare",
  "/quiz",
  "/bookings",
  "/services",
  "/gallery",
  "/stories",
  "/stories/planning-a-first-trip-to-india",
  "/culture",
  "/culture/festivals",
  "/culture/festivals/diwali",
  "/culture/food",
  "/culture/heritage",
  "/culture/arts",
  "/about",
  "/contact",
  "/saved",
  "/privacy",
  "/credits",
];

const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

async function sitemapPaths(page: Page): Promise<string[]> {
  const xml = await (await page.request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]!).pathname);
}

/** Console problems that aren't caused by the site itself. */
const isExternalNoise = (text: string) => /tile\.openstreetmap|ERR_(NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|CONNECTION)|api\/weather/.test(text);

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !isExternalNoise(`${message.text()} ${message.location().url}`)) errors.push(message.text());
  });
  return errors;
}

test.describe("routes and links", () => {
  test("every page in the sitemap responds and internal links resolve", async ({ page }) => {
    test.setTimeout(420_000);
    const paths = await sitemapPaths(page);
    expect(paths.length).toBeGreaterThan(180);

    const seen = new Set(paths);
    const broken: string[] = [];
    const queue = new Set<string>();

    for (const path of paths) {
      const response = await page.request.get(path);
      if (response.status() !== 200) broken.push(`${path} -> ${response.status()}`);
      const html = await response.text();
      for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
        const target = match[1]!;
        if (!target.startsWith("/_next") && !seen.has(target) && !/\.(css|js|svg|ico|png|webp|xml|json)$/.test(target)) queue.add(target);
      }
    }
    for (const path of queue) {
      const response = await page.request.get(path);
      if (response.status() !== 200) broken.push(`link ${path} -> ${response.status()}`);
    }
    expect(broken).toEqual([]);
  });

  test("unknown pages return 404 with a helpful page", async ({ page }) => {
    const response = await page.goto("/destinations/not-a-real-place");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("wandered off");
  });

  test("addresses from the original site redirect", async ({ page }) => {
    await page.goto("/AboutUs.html");
    await expect(page).toHaveURL(/\/about$/);
  });

  test("primary navigation works", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    for (const [label, url] of [["Discover", /\/discover$/], ["Bookings", /\/bookings$/], ["Services", /\/services$/], ["Gallery", /\/gallery$/], ["About Us", /\/about$/]] as const) {
      await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(url);
    }
  });

  test("the mobile menu closes on any navigation and on resize", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/about");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("banner").getByRole("link", { name: "Tour India home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("the region menu applies on the map page itself", async ({ page }) => {
    await page.goto("/explore");
    await page.goto("/explore?region=south");
    await expect(page.getByRole("button", { name: "South India" })).toHaveAttribute("aria-pressed", "true");
  });

  test("mobile menu opens and navigates", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Gallery" }).click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);
  });
});

test.describe("layout", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width, height: 800 });
      const problems: string[] = [];
      for (const path of KEY_PAGES) {
        await page.goto(path, { waitUntil: "load" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 0) problems.push(`${path}: ${overflow}px`);
      }
      expect(problems).toEqual([]);
    });
  }
});

test.describe("runtime health", () => {
  test("key pages load without console errors", async ({ page }) => {
    test.setTimeout(240_000);
    const errors = trackErrors(page);
    for (const path of KEY_PAGES) await page.goto(path, { waitUntil: "load" });
    expect(errors).toEqual([]);
  });
});

test.describe("accessibility (axe, WCAG 2.1 AA)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`key pages in ${theme} mode`, async ({ page }) => {
      test.setTimeout(300_000);
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      const failures: string[] = [];
      for (const path of KEY_PAGES) {
        await page.goto(path, { waitUntil: "load" });
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        for (const violation of results.violations) {
          failures.push(`${path} [${violation.impact}] ${violation.id}: ${violation.nodes.slice(0, 2).map((node) => node.target.join(" ")).join(" | ")}`);
        }
      }
      expect(failures).toEqual([]);
    });
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the map and guide lists are in the delivered HTML", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.locator("a.map-state")).toHaveCount(36);
    await expect(page.locator("a.map-state path").first()).toBeVisible();
    await page.goto("/discover");
    await expect(page.getByRole("link", { name: "Hampi", exact: true })).toBeVisible();
    await page.goto("/destinations/hampi");
    await expect(page.getByRole("heading", { name: "Main attractions" })).toBeVisible();
  });
});

test.describe("theme and motion", () => {
  test("follows the system, and a manual choice persists", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/about");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: /Theme: system/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe("rgb(251, 248, 242)");
  });

  test("the slideshow advances, and pause stops it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const caption = page.getByRole("region", { name: "Destinations across India" }).locator("a.link-u");
    const first = await caption.textContent();
    await page.getByRole("button", { name: "Next photo" }).click();
    await expect(caption).not.toHaveText(first!);
    await page.getByRole("button", { name: "Pause slideshow" }).click();
    await expect(page.getByRole("button", { name: "Resume slideshow" })).toBeVisible();
    await page.mouse.move(0, 0);
    const held = await caption.textContent();
    await page.waitForTimeout(8000);
    await expect(caption).toHaveText(held!);
  });

  test("reduced motion stops the autoplay and animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Resume slideshow" })).toBeVisible();
    // Anything lasting over a millisecond, or looping, would be visible motion.
    const moving = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return animation.playState === "running" && (timing?.iterations === Infinity || Number(timing?.duration) > 1);
        })
        .map((animation) => (animation as CSSAnimation).animationName ?? (animation as CSSTransition).transitionProperty),
    );
    expect(moving).toEqual([]);
  });
});

test.describe("search and discovery", () => {
  test("hero search suggests and navigates", async ({ page }) => {
    await page.goto("/");
    const box = page.getByRole("combobox", { name: "Search Tour India" });
    await box.fill("hamp");
    await expect(page.getByRole("option", { name: /Hampi/ }).first()).toBeVisible();
    await box.press("Enter");
    await expect(page).toHaveURL(/\/destinations\/hampi$/);
  });

  test("search shows an empty state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Search Tour India" }).fill("zzzzqqq");
    await expect(page.getByText(/Nothing matches/)).toBeVisible();
  });

  test("the / shortcut opens search", async ({ page }) => {
    await page.goto("/about");
    await page.keyboard.press("/");
    await expect(page.getByRole("dialog", { name: "Search" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Search" })).toHaveCount(0);
  });

  test("filters narrow the list and can be cleared", async ({ page }) => {
    await page.goto("/discover");
    const count = page.getByText(/^\d+ guides?/).first();
    const all = await count.textContent();
    await page.getByLabel("Region").selectOption("northeast");
    await expect(count).not.toHaveText(all!);
    await page.getByLabel("Name or state").fill("zzzz");
    await expect(page.getByRole("heading", { name: "No guides match those filters" })).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).first().click();
    await expect(count).toHaveText(all!);
  });

  test("filters read from the URL", async ({ page }) => {
    await page.goto("/discover?month=7");
    await expect(page.getByLabel("Travelling in")).toHaveValue("7");
  });

  test("the map selects a state and links to it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/explore");
    // The region buttons only exist once the interactive map has replaced the static one.
    await expect(page.getByRole("button", { name: "All India" })).toBeVisible();
    const shape = page.locator('a.map-state[data-slug="madhya-pradesh"] path');
    await shape.scrollIntoViewIfNeeded();
    const box = (await shape.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.getByRole("heading", { name: "Madhya Pradesh", level: 2 })).toBeVisible();
    await page.locator('a.map-state[data-slug="kerala"]').focus();
    await expect(page.getByRole("heading", { name: "Kerala", level: 2 })).toBeVisible();
    await page.getByRole("button", { name: "Northeast India" }).click();
    await expect(page.locator("[data-region-filter='northeast']")).toHaveCount(1);
    await page.goto("/explore/kerala");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kerala");
  });

  test("map states are keyboard reachable", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByRole("button", { name: "All India" })).toBeVisible();
    const states = page.locator("a.map-state");
    await expect(states).toHaveCount(36);
    await states.first().focus();
    await expect(states.first()).toBeFocused();
  });

  test("saving a place persists to the wishlist", async ({ page }) => {
    await page.goto("/destinations/hampi");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.goto("/saved");
    await expect(page.getByRole("link", { name: "Hampi" }).first()).toBeVisible();
  });
});

test.describe("trip planner", () => {
  test("rejects an empty form with a clear message", async ({ page }) => {
    await page.goto("/planner");
    await page.getByRole("button", { name: "Build my itinerary" }).click();
    await expect(page.getByText("Add at least one destination.")).toBeVisible();
  });

  test("rejects an invalid number of days", async ({ page }) => {
    await page.goto("/planner?d=jaipur");
    await page.getByLabel("Number of days").fill("99");
    await page.getByRole("button", { name: "Build my itinerary" }).click();
    await expect(page.getByText("Enter between 1 and 45 days.")).toBeVisible();
  });

  test("builds, edits, shares and saves an itinerary", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/planner?d=jaipur,agra&days=5");
    await page.getByLabel("Start date (optional)").fill("2027-01-10");
    await page.getByRole("button", { name: "Build my itinerary" }).click();

    await expect(page.getByRole("heading", { name: "Your 5-day itinerary" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Day 1:/ })).toBeVisible();
    await expect(page.getByText("Estimate", { exact: true }).first()).toBeVisible();

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Add to calendar" }).click();
    expect((await download).suggestedFilename()).toBe("tour-india-trip.ics");

    const firstSelect = page.getByLabel(/Move .* to another day/).first();
    await firstSelect.selectOption({ label: "Day 2" });

    await page.getByRole("button", { name: "Copy share link" }).click();
    const link = await page.evaluate(() => navigator.clipboard.readText());
    expect(link).toContain("/planner#trip=");
    await page.goto("/about");
    await page.goto(link);
    await expect(page.getByRole("heading", { name: "Your 5-day itinerary" })).toBeVisible();

    await page.getByRole("button", { name: "Save trip" }).click();
    await page.goto("/saved");
    await expect(page.getByRole("link", { name: /Jaipur|Agra/ }).first()).toBeVisible();
  });

  test("handles a corrupted share link", async ({ page }) => {
    await page.goto("/planner#trip=garbage!!");
    await expect(page.getByText("That shared trip link could not be read.")).toBeVisible();
  });

  test("survives corrupted saved data", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/about");
    await page.evaluate(() => {
      localStorage.setItem("ti-favourites", "{}");
      localStorage.setItem("ti-trips", "[null]");
      localStorage.setItem("ti-passport", "null");
      localStorage.setItem("ti-recent", "not json");
      localStorage.setItem("ti-expenses", '{"people":[]}');
    });
    await page.goto("/saved");
    await expect(page.getByRole("heading", { name: "Wishlist" })).toBeVisible();
    await page.goto("/destinations/goa");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Goa");
    expect(errors).toEqual([]);
  });

  test("a saved trip reopens without sending it to the server", async ({ page }) => {
    await page.goto("/planner?d=goa&days=3");
    await page.getByRole("button", { name: "Build my itinerary" }).click();
    await page.getByRole("button", { name: "Save trip" }).click();
    await page.goto("/saved");
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.getByRole("link", { name: "Goa", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Your 3-day itinerary" })).toBeVisible();
    expect(requests.some((url) => url.includes("trip="))).toBe(false);
  });

  test("offers the print path for PDF export", async ({ page }) => {
    await page.goto("/planner?d=goa");
    await page.getByRole("button", { name: "Build my itinerary" }).click();
    await expect(page.getByRole("button", { name: "Print or save as PDF" })).toBeVisible();
  });
});

test.describe("other tools", () => {
  test("gallery lightbox opens, moves and closes", async ({ page }) => {
    await page.goto("/gallery");
    await page.getByRole("button", { name: /View larger/ }).first().click();
    const dialog = page.getByRole("dialog", { name: "Photograph viewer" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("gallery videos load and are credited", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.locator("video")).toHaveCount(5);
    const src = await page.locator("video source").first().getAttribute("src");
    expect((await page.request.get(src!)).status()).toBe(200);
    await page.goto("/credits");
    await expect(page.getByRole("heading", { name: "Videos" })).toBeVisible();
  });

  test("festival cards show official dates where confirmed", async ({ page }) => {
    await page.goto("/culture/festivals/diwali");
    await expect(page.getByText("Sourced")).toBeVisible();
  });

  test("the quiz reaches results", async ({ page }) => {
    await page.goto("/quiz");
    for (let i = 0; i < 5; i += 1) await page.getByRole("main").locator("ul button").first().click();
    await expect(page.getByRole("heading", { name: "You might like" })).toBeVisible();
  });

  test("compare shows chosen destinations", async ({ page }) => {
    await page.goto("/compare?a=goa&b=leh");
    await expect(page.getByRole("columnheader", { name: "Goa" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Leh" })).toBeVisible();
  });

  test("the passport awards a badge", async ({ page }) => {
    await page.goto("/saved");
    await page.getByLabel("Kerala").check();
    await expect(page.getByText(/1 of 36 stamped/)).toBeVisible();
    await expect(page.getByText("First stamp (earned)")).toHaveCount(1);
  });
});

test.describe("forms", () => {
  test("shows validation errors in the browser", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Name must be at least 2 characters.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });

  test("reports honestly when submissions are unavailable", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Your name").fill("Test Person");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByLabel("Subject").fill("Testing");
    await page.getByLabel("Message").fill("This is a test of the failure path.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /isn't available/ })).toBeVisible();
    await expect(page.getByText("Message received")).toHaveCount(0);
  });
});

test.describe("trust and identity", () => {
  test("about page shows the owner and dated history, with no former team", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "Supriyo Sarkar" })).toBeVisible();
    await expect(page.getByText("Founder & Website Owner").first()).toBeVisible();
    await expect(page.getByText("27 May 2022")).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/Shiwam|Mehul|Ashis|Shabnam|Bedadyuti|3\.5\+? years/);
  });

  test("bookings page disclaims being a travel agent and has no checkout", async ({ page }) => {
    await page.goto("/bookings");
    await expect(page.getByText("Tour India is not a travel agent")).toBeVisible();
    await expect(page.locator("input")).toHaveCount(0);
  });

  test("external links open safely", async ({ page }) => {
    await page.goto("/bookings");
    const links = page.locator('main a[target="_blank"]');
    expect(await links.count()).toBeGreaterThan(3);
    for (const link of await links.all()) expect(await link.getAttribute("rel")).toContain("noopener");
  });

  test("no empty or placeholder links", async ({ page }) => {
    const bad: string[] = [];
    for (const path of KEY_PAGES) {
      await page.goto(path);
      const found = await page.locator('a[href="#"], a[href=""], a:not([href])').count();
      if (found) bad.push(`${path}: ${found}`);
    }
    expect(bad).toEqual([]);
  });

  test("pages have unique titles and SEO basics", async ({ page }) => {
    const titles = new Set<string>();
    for (const path of KEY_PAGES) {
      await page.goto(path);
      const title = await page.title();
      expect(titles.has(title), `${path} repeats "${title}"`).toBe(false);
      titles.add(title);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
    }
    await page.goto("/destinations/hampi");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/destinations\/hampi$/);
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(1);
  });
});

test.describe("security headers", () => {
  test("responses carry the expected headers", async ({ page }) => {
    const headers = (await page.request.get("/")).headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("wrong methods are refused", async ({ page }) => {
    expect((await page.request.get("/api/contact")).status()).toBe(405);
    expect((await page.request.delete("/api/newsletter")).status()).toBe(405);
  });

  test("cross-site posts are refused on the running server", async ({ page }) => {
    const response = await page.request.post("/api/contact", {
      headers: { origin: "https://evil.example", "content-type": "application/json" },
      data: { name: "x" },
    });
    expect(response.status()).toBe(403);
  });

  test("no secrets or server modules reach the browser bundle", async ({ page }) => {
    const urls = new Set<string>();
    page.on("response", (response) => {
      if (response.url().includes("/_next/static/") && response.url().endsWith(".js")) urls.add(response.url());
    });
    await page.goto("/contact", { waitUntil: "networkidle" });
    await page.goto("/planner", { waitUntil: "networkidle" });
    expect(urls.size).toBeGreaterThan(0);
    for (const url of urls) {
      const source = await (await page.request.get(url)).text();
      expect(source, url).not.toMatch(/MONGODB_URI|RATE_LIMIT_SALT|mongodb\+srv/);
    }
  });
});
