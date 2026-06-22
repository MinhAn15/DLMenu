import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
  globalSetup: require.resolve('./tests/setup/seed.ts'),
  globalTeardown: require.resolve('./tests/setup/teardown.ts'),
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'vi-VN',
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
