import 'dotenv/config';

/** Central typed config. No baseURL in playwright.config — URLs live here; the stack must already be running. */
export const CONFIG = {
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
  user: { email: process.env.E2E_EMAIL ?? 'TODO(verify)', password: process.env.E2E_PASSWORD ?? 'TODO(verify)' },
  storageStatePath: '.auth/user.json',
  // Headed by default for humans. Auto-headless when CI or an agent session drives the run —
  // a headed slowMo run inside an agent turn is a hung tool call.
  headed: !['0', 'false', 'no'].includes((process.env.HEADED ?? '').toLowerCase())
    && !process.env.CI && !process.env.CLAUDE_SESSION_ID,
  slowMo: process.env.SLOWMO !== undefined ? Number(process.env.SLOWMO) : 250,
} as const;
