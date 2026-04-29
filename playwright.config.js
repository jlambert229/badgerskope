import { defineConfig, devices } from "@playwright/test";

// Allow concurrent worktrees to run tests on different ports without
// stepping on each other. Defaults to 5173 (npm run web).
const PORT = Number(process.env.PLAYWRIGHT_PORT || 5173);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30_000,

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: `npx --yes serve . -l ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    /* ---- iOS Safari (primary target) ---- */
    /* WebKit requires compatible ICU libs — may fail on some Linux distros.
       Set PLAYWRIGHT_WEBKIT=1 to force, or run on macOS/CI for full coverage. */
    ...(process.env.PLAYWRIGHT_WEBKIT !== "0" ? [
      {
        name: "safari-ios",
        use: { ...devices["iPhone 14"] },
      },
      {
        name: "safari-ios-landscape",
        use: { ...devices["iPhone 14 landscape"] },
      },
      {
        name: "ipad",
        use: { ...devices["iPad (gen 7)"] },
      },
      {
        name: "safari-desktop",
        use: { ...devices["Desktop Safari"] },
      },
    ] : []),

    /* ---- Chrome with iPhone emulation (always works) ---- */
    {
      name: "chrome-iphone",
      use: {
        ...devices["iPhone 14"],
        channel: undefined,
        browserName: "chromium",
      },
    },
    {
      name: "chrome-ipad",
      use: {
        ...devices["iPad (gen 7)"],
        channel: undefined,
        browserName: "chromium",
      },
    },

    /* ---- Desktop Chrome ---- */
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
