import { defineConfig, devices } from '@playwright/test'

// FeederFlex E2E smoke suite (Section 11.4). Runs against a locally-started backend (port 8000,
// started separately -- not managed by this config) and this config's own dev-server instance.
// No external network dependency.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'e2e-results.json' }]],
  use: {
    // Port 5173 (Vite default) is occupied by an unrelated dev server on this shared machine;
    // the app now runs on an explicit, distinct port (see vite.config.ts) to avoid colliding with it.
    baseURL: 'http://localhost:5199',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5199',
    reuseExistingServer: true,
    timeout: 30000,
  },
})
