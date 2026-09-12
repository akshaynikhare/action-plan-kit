import { test, expect } from '../fixtures';
import { CONFIG } from '../config';
import { watchConsole } from '../helpers/console';

// @journey — the app loads, has a title, and logs no console errors on first paint.
test('@journey app loads clean', async ({ page }) => {
  const consoleLines = watchConsole(page);
  await page.goto(CONFIG.baseUrl);
  await expect(page).toHaveTitle(/.+/);
  expect(consoleLines, consoleLines.join('\n')).toEqual([]);
});
