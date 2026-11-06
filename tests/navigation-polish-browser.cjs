/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser acceptance check. */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
const baseURL = process.env.TOOLKIT_BASE_URL || 'http://127.0.0.1:3001';

(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
 const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));

 try {
  await page.goto(`${baseURL}/#about`, { waitUntil: 'domcontentloaded' });
  const primary = page.getByRole('navigation', { name: 'Primary', exact: true });
  await primary.waitFor();
  await page.waitForFunction(() => document.querySelector('nav[aria-label="Primary"] a[href="/#about"]')?.getAttribute('aria-current') === 'location');
  assert.equal(await primary.getByRole('link', { name: 'About', exact: true }).getAttribute('aria-current'), 'location');
  await primary.getByRole('link', { name: 'Projects', exact: true }).click();
  await page.waitForFunction(() => location.hash === '#projects' && document.querySelector('nav[aria-label="Primary"] a[href="/#projects"]')?.getAttribute('aria-current') === 'location');
  assert.equal(await primary.getByRole('link', { name: 'About', exact: true }).getAttribute('aria-current'), null);

  await page.goto(`${baseURL}/blogs`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('nav[aria-label="Primary"] a[href="/blogs"]')?.getAttribute('aria-current') === 'page');
  assert.equal(await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Blog', exact: true }).getAttribute('aria-current'), 'page');

  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  const toggle = page.getByRole('button', { name: 'Toggle menu', exact: true });
  const mobile = page.locator('nav[aria-label="Mobile"]');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await mobile.isVisible(), false, 'Closed links are not visible or tabbable');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(await mobile.getByRole('link').count(), 8);
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await toggle.evaluate(node => node === document.activeElement), true, 'Escape returns focus to the toggle');
  await page.keyboard.press('Tab');
  assert.equal(await mobile.evaluate(node => node.contains(document.activeElement)), false, 'Closed links are skipped in keyboard order');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await toggle.evaluate(node => node === document.activeElement), true, 'Keyboard focus returns predictably to the toggle');

  await toggle.click();
  await page.mouse.click(320, 650);
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'An outside pointer closes the menu');

  await toggle.click();
  await mobile.getByRole('link', { name: 'Blog', exact: true }).click();
  await page.waitForURL('**/blogs');
  assert.equal(await page.getByRole('button', { name: 'Toggle menu', exact: true }).getAttribute('aria-expanded'), 'false', 'Following a route closes the menu');

  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.setViewportSize({ width: 375, height: 240 });
  const shortToggle = page.getByRole('button', { name: 'Toggle menu', exact: true });
  const shortMenu = page.getByRole('navigation', { name: 'Mobile', exact: true });
  await shortToggle.click();
  const bounds = await shortMenu.boundingBox();
  assert.ok(bounds, 'The mobile menu has a visible box on a short viewport');
  assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 240, `Menu stays within the viewport: ${JSON.stringify(bounds)}`);
  assert.ok(await shortMenu.evaluate(node => node.scrollHeight > node.clientHeight), 'The short menu scrolls internally to keep every link reachable');
  await shortMenu.getByRole('link', { name: 'Contact', exact: true }).focus();
  assert.equal(await shortMenu.getByRole('link', { name: 'Contact', exact: true }).evaluate(node => node === document.activeElement), true);

  await page.setViewportSize({ width: 375, height: 700 });
  await shortMenu.getByRole('link', { name: 'Lab', exact: true }).focus();
  await page.setViewportSize({ width: 1024, height: 700 });
  await page.waitForFunction(() => document.querySelector('button[aria-label="Toggle menu"]')?.getAttribute('aria-expanded') === 'false');
  const lab = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Lab', exact: true });
  await page.waitForFunction(() => document.activeElement?.getAttribute('data-nav-link') === 'Lab');
  assert.equal(await lab.evaluate(node => node === document.activeElement), true, 'Desktop resize closes the menu and moves focus to the matching desktop link');
  assert.deepEqual(errors, []);

  console.log('PASS: homepage hash and route states; mobile close, escape, outside pointer and route; short viewport scrolling; desktop resize focus.');
 } finally {
  await browser.close();
 }
})().catch(error => { console.error(error); process.exitCode = 1; });
