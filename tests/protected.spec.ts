import { test, expect } from '@playwright/test';

test('Protected route /app redirects to /login for unauthenticated users', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto('http://localhost:5173/app');
  await page.waitForURL('**/login');
  await page.waitForSelector('button');
  
  const rootHtml = await page.locator('#root').innerHTML();
  console.log('Redirected to login, innerHTML length:', rootHtml.length);

  expect(pageErrors).toEqual([]);
  expect(rootHtml.length).toBeGreaterThan(100);
});
