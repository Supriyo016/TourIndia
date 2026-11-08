import { defineConfig, devices } from "@playwright/test";

const port = 3100;
// Set PW_BASE_URL to run the same tests against a deployed site.
const deployedUrl = process.env.PW_BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: deployedUrl ?? `http://localhost:${port}`,
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
