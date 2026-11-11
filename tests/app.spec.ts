import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'Landing Page' },
  { path: '/login', name: 'Login Page' },
  { path: '/register', name: 'Register Page' },
  { path: '/forgot-password', name: 'Forgot Password Page' },
];

for (const { path, name } of routes) {
  test(`${name} (${path}) loads without white screen or unhandled exceptions`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto(`http://localhost:5173${path}`);
    await page.waitForSelector('#root');
    
    const rootHtml = await page.locator('#root').innerHTML();
    console.log(`${name} innerHTML length:`, rootHtml.length);

    expect(pageErrors).toEqual([]);
    expect(rootHtml.length).toBeGreaterThan(100);
  });
}
