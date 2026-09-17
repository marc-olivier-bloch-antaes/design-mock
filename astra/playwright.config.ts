import { defineConfig, devices } from '@playwright/test'

const chromiumExecutable = '/home/mob/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4317',
    browserName: 'chromium',
    launchOptions: { executablePath: chromiumExecutable },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4317',
    url: 'http://127.0.0.1:4317',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
