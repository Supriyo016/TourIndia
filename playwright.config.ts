import { defineConfig, devices } from "@playwright/test";

const port = 3100;
// Set PW_BASE_URL to run the same tests against a deployed site.
const deployedUrl = process.env.PW_BASE_URL;
const baseURL = deployedUrl ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL,
    // Most tests start with a cookie choice already made, so the banner stays out of the way.
    storageState: {
      cookies: [
        {
          name: "ti_consent",
          value: `1.1.${Math.floor(Date.now() / 1000)}`,
          domain: new URL(baseURL).hostname,
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
    ...devices["Desktop Chrome"],
    // Uses the Edge already on Windows; CI can set PW_CHANNEL=chrome or leave it unset.
    channel: process.env.PW_CHANNEL ?? "msedge",
  },
  webServer: deployedUrl
    ? undefined
    : {
        command: `npx next start -p ${port}`,
        url: `http://localhost:${port}`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
