import { defineConfig, devices } from '@playwright/test';
import { CONFIG } from './config';

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,   // journeys are dependent; parallelism is opt-in per spec
  workers: 1,
  retries: 0,             // a flake is a finding, not a retry
  timeout: 120_000,
  expect: { timeout: 15_000 },
  globalSetup: './global-setup.ts',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: !CONFIG.headed,
    launchOptions: { slowMo: CONFIG.headed ? CONFIG.slowMo : 0 },
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
