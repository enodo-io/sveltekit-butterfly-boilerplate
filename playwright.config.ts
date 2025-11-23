import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '.env') });

export default defineConfig({
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:4173',
  },
});
