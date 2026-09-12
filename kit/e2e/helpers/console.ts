import type { Page } from '@playwright/test';

/** Collect console warnings+errors for the life of a page. Assert empty at journey end. */
export function watchConsole(page: Page) {
  const lines: string[] = [];
  page.on('console', (m) => { if (['warning', 'error'].includes(m.type())) lines.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => lines.push(`[pageerror] ${e.message}`));
  return lines;
}
