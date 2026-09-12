import { test as base } from '@playwright/test';
export const test = base; // extend with authed fixtures once global-setup does a real login
export { expect } from '@playwright/test';
