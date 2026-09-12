// Log in once, persist storage state — every spec reuses it (dodges auth rate limits).
// Fill in the real login flow; until then this is a no-op so the smoke spec can run logged-out.
import { CONFIG } from './config';

export default async function globalSetup() {
  if (CONFIG.user.email.startsWith('TODO')) return; // no auth configured yet
  // TODO(verify): launch chromium, log in with CONFIG.user, save storageState to CONFIG.storageStatePath.
}
