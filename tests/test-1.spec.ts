import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://erpperu2-crt-4.smartclic.pe/auth/login');
});