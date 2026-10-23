/* eslint-disable @typescript-eslint/no-require-imports -- Standalone production-browser acceptance checks. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
const baseURL = process.env.TOOLKIT_BASE_URL || 'http://localhost:3000';
const artifacts = process.env.PROJECT_ARTIFACTS || '/tmp/projects-browser';
const names = ['ATSResumie', 'FrameVault', 'YouTube Extractor', 'Outpost', 'DraftForge', 'NeverComes'];
(async () => {
 fs.mkdirSync(artifacts, { recursive: true });
 const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
 const checks = [], errors = [];
 page.on('pageerror', error => errors.push(error.message));
 let behavior = 'success', previewRequests = 0;
 await page.route(/https:\/\/(www\.atsresumie\.com|nevercomes\.sujanshrestha\.ca)\//, async route => {
  previewRequests++;
  if (behavior === 'slow') return;
  await route.fulfill({ contentType: 'text/html', headers: behavior === 'blocked' ? { 'X-Frame-Options': 'DENY' } : {}, body: '<!doctype html><html lang="en"><title>Preview fixture</title><body><h1>Real iframe boundary fixture</h1><a href="#content">Explore preview</a><div id="content">Site content</div></body></html>' });
 });
 try {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('iframe').count(), 0);
  assert.equal(previewRequests, 0);
  assert.equal(await page.locator('.project-tile').count(), 6);
  for (const name of names) {
   const trigger = page.getByRole('button', { name: `Preview ${name}`, exact: true });
   await trigger.scrollIntoViewIfNeeded();
   const before = await page.evaluate(() => scrollY);
   await trigger.focus(); await page.keyboard.press('Enter');
   const dialog = page.getByRole('dialog', { name, exact: true });
   await dialog.waitFor();
   assert.equal(await page.getByRole('button', { name: 'Close project preview' }).evaluate(e => e === document.activeElement), true);
   assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
   assert.match(await dialog.evaluate(e => getComputedStyle(e, '::backdrop').backdropFilter), /blur/);
   // Finish the child-document navigation before exercising a deterministic tab order.
   if (name === 'ATSResumie' || name === 'NeverComes') await page.frameLocator('iframe').getByRole('heading', { name: 'Real iframe boundary fixture' }).waitFor();
   for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    await page.waitForFunction(() => !!document.activeElement.closest('dialog'), null, { timeout: 1000 });
   }
   if (name === 'ATSResumie' || name === 'NeverComes') {
    await page.frameLocator('iframe').getByRole('heading', { name: 'Real iframe boundary fixture' }).waitFor();
    await dialog.getByRole('button', { name: 'About project', exact: true }).click();
    assert.equal(await dialog.locator('iframe').count(), 0);
   } else assert.equal(await dialog.locator('iframe').count(), 0, 'Blocked sites and repositories never frame');
   assert.ok((await dialog.locator('.overview-copy').innerText()).length > 150);
   assert.ok(await dialog.getByRole('link', { name: /Open website|View on GitHub/ }).count());
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('dialog').count(), 0);
   assert.equal(await trigger.evaluate(e => e === document.activeElement), true);
   assert.equal(await page.evaluate(() => document.body.style.overflow), '');
   assert.ok(Math.abs((await page.evaluate(() => scrollY)) - before) <= 1, 'Scroll position restored');
  }
  checks.push('All six projects open by keyboard, contain focus, retain complete details, close on Escape and restore trigger/scroll; blocked destinations never iframe');
  behavior = 'slow';
  await page.getByRole('button', { name: 'Preview ATSResumie', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('status').filter({ hasText: 'Opening the live page' }).waitFor();
  await dialog.getByRole('status').filter({ hasText: 'Taking longer than expected' }).waitFor({ timeout: 10000 });
  behavior = 'success';
  await dialog.getByRole('button', { name: 'Retry preview', exact: true }).click();
  await page.frameLocator('iframe').getByRole('heading', { name: 'Real iframe boundary fixture' }).waitFor();
  await dialog.getByRole('status').filter({ hasText: 'Preview blank or unavailable' }).waitFor();
  await dialog.getByRole('button', { name: 'Close project preview' }).click();
  behavior = 'blocked';
  await page.getByRole('button', { name: 'Preview ATSResumie', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('status').filter({ hasText: 'Preview blank or unavailable' }).waitFor();
  await dialog.getByRole('button', { name: 'Read project details' }).click();
  await dialog.locator('.overview-copy').waitFor();
  await page.keyboard.press('Escape');
  checks.push('Slow iframe reaches bounded recovery, Retry reloads, and blocked-frame load never claims rendering success; overview/external recovery remains usable');
  for (const width of [320, 375, 768, 1440]) {
   await page.setViewportSize({ width, height: 700 });
   await page.getByRole('button', { name: 'Preview YouTube Extractor', exact: true }).click();
   dialog = page.getByRole('dialog'); await dialog.waitFor();
   assert.equal(await dialog.evaluate(e => e.getAnimations().length), 0, 'Reduced motion removes window entrance');
   const bounds = await dialog.evaluate(e => ({ width: e.scrollWidth, client: e.clientWidth, top: e.getBoundingClientRect().top, bottom: e.getBoundingClientRect().bottom, viewport: innerHeight }));
   assert.ok(bounds.width <= bounds.client, `Dialog fits horizontally at ${width}: ${JSON.stringify(bounds)}`);
   assert.ok(bounds.top >= 0 && bounds.bottom <= bounds.viewport + 1);
   await page.screenshot({ path: path.join(artifacts, `project-modal-${width}.png`) });
   await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  checks.push('Modal and page fit 320/375/768/1440px, including a short viewport; reduced-motion layout stays static');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Preview YouTube Extractor', exact: true }).click();
  dialog = page.getByRole('dialog'); await dialog.waitFor();
  await page.waitForTimeout(350);
  assert.ok(await dialog.evaluate(e => e.getAnimations().every(a => a.playState === 'finished')), 'Window entrance finishes once');
  await page.mouse.click(1, 1);
  assert.equal(await page.locator('dialog').count(), 0, 'Backdrop dismisses');
  await page.route('https://calendar.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Calendar fixture</title><p>Calendar preview</p>' }));
  const schedule = page.getByRole('button', { name: 'Schedule a call', exact: true });
  await schedule.focus(); await page.keyboard.press('Enter');
  await page.getByRole('dialog', { name: 'Schedule a call', exact: true }).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await schedule.evaluate(e => e === document.activeElement), true);
  checks.push('One-shot window entrance, reduced-motion override, backdrop dismissal and shared scheduling focus restoration work');
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const plain = await noJS.newPage(); await plain.goto(baseURL);
  assert.equal(await plain.locator('.project-direct').count(), 6);
  for (const summary of await plain.locator('.content-disclosure > summary, .project-facts > summary').all()) await summary.click();
  const text = await plain.locator('main').innerText();
  for (const fact of ['Tribhuwan University', 'GPA 3.19', 'GPA 3.35', 'Jan 2026', 'NextUnicorn', 'KeepReact', 'Apify', 'five-scene']) assert.ok(text.includes(fact), fact);
  await noJS.close();
  checks.push('Original links and native biography/career/education/project disclosures work without JavaScript');
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(artifacts, 'checks.json'), JSON.stringify({ checks, errors }, null, 2));
  console.log(JSON.stringify({ checks, errors }, null, 2));
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
