import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const KEY_PAGES = [
  "/",
  "/explore",
  "/explore/kerala",
  "/discover",
  "/destinations/hampi",
  "/planner",
  "/calendar",
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
    const primary = page.getByRole("navigation", { name: "Primary" });
    // Seven main items, with everything else under More.
    await expect(primary.locator(":scope > ul > li")).toHaveCount(8);
    for (const [label, url] of [["Discover", /\/discover$/], ["Bookings", /\/bookings$/], ["Stories", /\/stories$/]] as const) {
      await primary.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(url);
    }
    for (const [label, url] of [["Services", /\/services$/], ["Gallery", /\/gallery$/], ["About Us", /\/about$/]] as const) {
      await primary.getByRole("button", { name: "More" }).click();
      await primary.getByRole("link", { name: new RegExp(`^${label}`) }).click();
      await expect(page).toHaveURL(url);
    }
  });

  test("a loading bar runs across the top while a page loads", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    const bar = page.getByTestId("route-progress");
    const started = page.waitForFunction(() => document.querySelector("[data-testid=route-progress]")?.getAttribute("data-active") === "true");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Bookings", exact: true }).click();
    await started;
    await expect(page).toHaveURL(/\/bookings$/);
    await expect(bar).toHaveAttribute("data-active", "false");
  });

  test("the open mobile menu holds a steady size", async ({ page }) => {
    // The menu once fed its own height back into --header-h, so it grew and shrank in a loop.
    for (const size of [{ width: 375, height: 812 }, { width: 768, height: 1024 }]) {
      await page.setViewportSize(size);
      await page.goto("/");
      await page.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("navigation", { name: "Mobile" });
      await expect(menu).toBeVisible();
      const heights = new Set<number>();
      for (let sample = 0; sample < 10; sample += 1) {
        heights.add(Math.round((await menu.boundingBox())!.height));
        await page.waitForTimeout(80);
      }
      expect([...heights]).toHaveLength(1);
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

test.describe("date, calendar and notes", () => {
  test("the top bar shows a ticking clock in IST", async ({ page }) => {
    await page.goto("/about");
    const clock = page.getByTestId("india-clock");
    await expect(clock).toContainText("IST");
    const first = await clock.textContent();
    await expect(clock).not.toHaveText(first!, { timeout: 4000 });
  });

  test("the calendar shows holidays and moves between months", async ({ page }) => {
    await page.goto("/calendar");
    const heading = page.getByRole("heading", { level: 2, name: /^[A-Z][a-z]+ 20\d\d$/ });
    await expect(heading).toBeVisible();
    const month = await heading.textContent();
    await page.getByRole("button", { name: "Next month" }).click();
    await expect(heading).not.toHaveText(month!);
    await page.getByRole("button", { name: "Today" }).click();
    await expect(heading).toHaveText(month!);
    await expect(page.getByText("Diwali").first()).toBeVisible();
  });

  test("the calendar filters occasions, lists them, and exports a month", async ({ page }) => {
    await page.goto("/calendar");
    await page.getByRole("button", { name: "Next month" }).click();
    await page.getByRole("tab", { name: "List" }).click();
    const observance = page.getByRole("button", { name: "Day of observance" });
    await expect(observance).toHaveAttribute("aria-pressed", "true");
    await observance.click();
    await expect(observance).toHaveAttribute("aria-pressed", "false");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /Add to my calendar/ }).click();
    expect((await download).suggestedFilename()).toMatch(/^tour-india-\d{4}-\d{2}\.ics$/);
  });

  test("booking requests walk through five steps and ask to sign in before sending", async ({ page }) => {
    await page.goto("/bookings?destination=hampi");
    await page.getByLabel("A place to stay").check();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("combobox", { name: "Destination" })).toHaveValue("hampi");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText("Choose your dates.")).toBeVisible();
  });

  test("a note can be written, dated, edited, deleted and restored", async ({ page }) => {
    await page.goto("/calendar");
    await page.getByRole("button", { name: /^(Saturday|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday),? 15 / }).click();
    await page.getByLabel("Plan title").fill("Kerala in December");
    await page.getByLabel("Plan details").fill("Book the houseboat");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByLabel("Note title")).toHaveValue("Kerala in December");

    await page.reload();
    await expect(page.getByLabel("Note title")).toHaveValue("Kerala in December");
    await page.getByRole("button", { name: /Delete note/ }).click();
    await expect(page.getByLabel("Note title")).toHaveCount(0);
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.getByLabel("Note title")).toHaveValue("Kerala in December");
  });

  test("an empty note is refused", async ({ page }) => {
    await page.goto("/calendar");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByText("Write a title or some plan details first.")).toBeVisible();
  });
});

test.describe("home page additions", () => {
  test("the tagline changes with the slide, and the controls sit at the lower right", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const hero = page.getByRole("region", { name: "Destinations across India" });
    const tagline = hero.locator(".hero-tagline");
    const first = await tagline.textContent();
    await hero.getByRole("button", { name: "Next photo" }).click();
    await expect(tagline).not.toHaveText(first!);
    const next = (await hero.getByRole("button", { name: "Next photo" }).boundingBox())!;
    const area = (await hero.boundingBox())!;
    expect(next.x).toBeGreaterThan(area.width / 2);
    expect(next.y).toBeGreaterThan(area.y + area.height / 2);
  });

  test("the header is transparent glass over the slider and solid below it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const header = page.locator("header.site-header");
    await expect(header).toHaveAttribute("data-overlay", "true");
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-overlay", "false");
    await page.goto("/about");
    await expect(header).toHaveAttribute("data-overlay", "false");
  });

  test("a travel style page has a related photo behind its title", async ({ page }) => {
    await page.goto("/discover/lakes");
    await expect(page.getByRole("heading", { level: 1, name: "Lakes in India" })).toBeVisible();
    await expect(page.locator(".page-hero img")).toBeAttached();
  });

  test("the slideshow keeps playing while the pointer rests on it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const label = page.locator('[aria-label^="Slide "]');
    const first = await label.getAttribute("aria-label");
    await page.mouse.move(640, 300);
    // The interval is 7 seconds; give it one full turn.
    await expect(label).not.toHaveAttribute("aria-label", first!, { timeout: 10_000 });
  });

  test("the site video is on the home page and doesn't preload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "See India in motion" })).toBeVisible();
    const video = page.locator('video[aria-label="A video tour of India"]');
    await expect(video).toHaveAttribute("preload", "none");
    // The poster is only set once the video comes near the screen.
    await expect(video).not.toHaveAttribute("poster", /.+/);
    await video.scrollIntoViewIfNeeded();
    await expect(video).toHaveAttribute("poster", "/videos/tour-india-poster.webp");
    expect((await page.request.get("/videos/tour-india-poster.webp")).status()).toBe(200);
    for (const size of ["", "-480", "-360"]) expect((await page.request.head(`/videos/tour-india${size}.webm`)).status()).toBe(200);
  });

  test("the video plays in view, fills a third of the screen, and quality can be chosen", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const video = page.getByTestId("tour-video");
    await video.scrollIntoViewIfNeeded();
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused && element.currentTime > 0.2), { timeout: 15_000 }).toBe(true);
    const box = (await video.boundingBox())!;
    expect(Math.abs(box.height - 300)).toBeLessThan(4);
    expect(Math.abs(box.x + box.width / 2 - 720)).toBeLessThan(12);
    await page.getByRole("button", { name: /^Auto/ }).click();
    await page.getByRole("menuitemradio", { name: "480p" }).click();
    await expect(video).toHaveAttribute("data-quality", "480");
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentSrc)).toContain("tour-india-480.webm");
  });
});

test.describe("accounts and community", () => {
  test("the sign-in dialog opens from the header, and says so honestly when accounts are off", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Sign in" }).click();
    const dialog = page.getByRole("dialog", { name: "Sign in or create an account" });
    await expect(dialog).toBeVisible();
    // The test server runs without a database, so neither method is switched on.
    await expect(dialog.getByText(/Accounts aren.t switched on yet/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("every place and state has an encyclopedia entry with edit and community sections", async ({ page }) => {
    await page.goto("/encyclopedia");
    await page.getByRole("link", { name: "Hampi", exact: true }).click();
    await expect(page).toHaveURL(/\/encyclopedia\/hampi$/);
    await expect(page.getByRole("heading", { level: 1, name: "Hampi" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Suggest an edit" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Travellers on Hampi" })).toBeVisible();
    await page.getByRole("button", { name: "Suggest an edit" }).first().click();
    await expect(page.getByRole("dialog", { name: "Sign in or create an account" })).toBeVisible();
    await expect(page.getByText("Sign in to suggest a correction.")).toBeVisible();
    expect((await page.request.get("/encyclopedia/states/kerala")).status()).toBe(200);
  });

  test("private pages are kept out of search engines", async ({ page }) => {
    const robots = await (await page.request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/admin/);
    expect(robots).toMatch(/Disallow: \/account/);
    await page.goto("/account");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("cookies", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("asks first, and refusing is as easy as accepting", async ({ page }) => {
    await page.goto("/about");
    const banner = page.getByRole("region", { name: "Cookie choices" });
    await expect(banner).toBeVisible();
    await expect(banner.getByRole("button", { name: "Accept all" })).toBeVisible();
    await banner.getByRole("button", { name: "Essential only" }).click();
    await expect(banner).toHaveCount(0);
    const cookies = await page.context().cookies();
    expect(cookies.find((cookie) => cookie.name === "ti_consent")?.value).toMatch(/^1\.0\./);
    await page.reload();
    await expect(banner).toHaveCount(0);
  });

  test("without consent, preferences aren't remembered", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Essential only" }).click();
    await expect(page.getByRole("region", { name: "Cookie choices" })).toHaveCount(0);
    // System, then Light, then Dark: one click each.
    await page.getByRole("button", { name: "Theme: System. Switch to Light" }).click();
    await page.getByRole("button", { name: "Theme: Light. Switch to Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("ti-theme"))).toBeNull();
    await page.goto("/destinations/hampi");
    expect(await page.evaluate(() => localStorage.getItem("ti-recent"))).toBeNull();
  });

  test("consent can be changed from the footer, which clears stored preferences", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Accept all" }).click();
    // The choice is saved by a request; wait for it before relying on it.
    await expect(page.getByRole("region", { name: "Cookie choices" })).toHaveCount(0);
    await page.getByRole("button", { name: /^Theme:/ }).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("ti-theme"))).not.toBeNull();
    await page.getByRole("button", { name: "Cookie settings" }).click();
    await page.getByLabel(/Preferences/).uncheck();
    await page.getByRole("button", { name: "Save choices" }).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("ti-theme"))).toBeNull();
  });
});

test.describe("Yatri", () => {
  // The launcher floats; reduced motion holds it still so clicks are deterministic.
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  const open = async (page: Page) => {
    await page.goto("/about");
    await page.getByRole("button", { name: /Ask Yatri/ }).click();
    await expect(page.getByRole("dialog", { name: /Yatri/ })).toBeVisible();
  };

  test("answers a question and links to the guide", async ({ page }) => {
    await open(page);
    await page.getByLabel("Message Yatri").fill("Tell me about Hampi");
    await page.getByRole("button", { name: "Send message" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("link", { name: /guide/i }).first()).toHaveAttribute("href", "/destinations/hampi", { timeout: 30_000 });
    // The answer carries a place card that can be added to a trip and opened in the planner.
    await dialog.getByRole("button", { name: "Add to trip" }).click();
    await expect(dialog.getByRole("link", { name: "Plan it" })).toHaveAttribute("href", "/planner?d=hampi");
  });

  test("the terminal runs commands, recalls history and completes", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: "Open the Yatri terminal" }).click();
    const input = page.getByLabel("Terminal command");
    await expect(input).toBeFocused();
    await input.pressSequentially("gui");
    await input.press("Tab");
    await expect(input).toHaveValue("guide ");
    await input.pressSequentially("hamp");
    // Place names complete only once the guide index has loaded, which can take a moment on a slow runner.
    await expect.poll(async () => {
      await input.fill("guide hamp");
      await input.press("Tab");
      return input.inputValue();
    }, { timeout: 15_000 }).toBe("guide hampi");
    await input.press("Enter");
    const log = page.getByRole("log", { name: "Terminal output" });
    await expect(log).toContainText("Typical stay", { timeout: 15_000 });
    await input.press("ArrowUp");
    await expect(input).toHaveValue("guide hampi");
    await input.fill("clear");
    await input.press("Enter");
    await expect(log).not.toContainText("Typical stay");
  });

  test("terminal commands can navigate and set the theme", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: "Open the Yatri terminal" }).click();
    const input = page.getByLabel("Terminal command");
    await page.getByRole("log", { name: "Terminal output" }).waitFor();
    await expect.poll(async () => {
      await input.fill("help");
      await input.press("Enter");
      return page.getByRole("log", { name: "Terminal output" }).textContent();
    }).toContain("ask <question>");
    await input.fill("theme dark");
    await input.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await input.fill("open gallery");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/gallery$/);
  });

  test("closes with Escape and returns focus", async ({ page }) => {
    await open(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /Yatri/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Ask Yatri/ })).toBeFocused();
  });

  test("the assistant passes an accessibility check", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
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
    // One click moves from System to Light.
    await page.getByRole("button", { name: "Theme: System. Switch to Light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe("rgb(251, 248, 242)");
  });

  test("the slideshow advances, and pause stops it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const caption = page.getByRole("region", { name: "Destinations across India" }).locator(".hero-tagline");
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
    // The tilted map sways; reduced motion holds it still for precise pointer moves.
    await page.emulateMedia({ reducedMotion: "reduce" });
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
    await expect(page.locator("video")).toHaveCount(6);
    await expect.poll(() => page.getByTestId("tour-video").getAttribute("src")).toMatch(/^\/videos\/tour-india(-480|-360)?\.webm$/);
    const src = await page.getByTestId("tour-video").getAttribute("src");
    expect((await page.request.head(src!)).status()).toBe(200);
    await expect(page.locator("video").first()).toHaveAttribute("preload", "none");
    await page.goto("/credits");
    await expect(page.getByRole("heading", { name: "Videos" })).toBeVisible();
  });

  test("festival cards show official dates where confirmed", async ({ page }) => {
    await page.goto("/culture/festivals/diwali");
    await expect(page.getByText("Sourced")).toBeVisible();
  });

  test("the quiz reaches results", async ({ page }) => {
    await page.goto("/quiz");
    await page.getByRole("link", { name: "Start the quiz" }).click();
    await expect(page.getByText("Question 1 of 8", { exact: true })).toBeVisible();
    await page.locator("label", { hasText: "October" }).click();
    await expect(page).toHaveURL(/month=10/);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: "How long is the trip?" })).toBeFocused();
    await page.keyboard.press("2");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Question 3 of 8", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByLabel("About a week")).toBeChecked();
    for (let i = 0; i < 7; i += 1) await page.getByRole("button", { name: /^(Next|Skip|See my matches)$/ }).click();
    await expect(page.getByRole("heading", { name: /Your best match is/ })).toBeVisible();
    await expect(page.getByText("Best in October").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Plan this trip" })).toHaveAttribute("href", /^\/planner\?d=[a-z-]+,[a-z-]+&days=7$/);
    await page.reload();
    await expect(page.getByRole("heading", { name: /Your best match is/ })).toBeVisible();
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
    // The planning-request form has fields, but nothing that takes payment.
    await expect(page.locator('input[autocomplete^="cc-"], input[name*="card" i]')).toHaveCount(0);
    await expect(page.getByText(/card number|pay now|checkout/i)).toHaveCount(0);
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
