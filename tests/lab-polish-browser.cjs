/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser acceptance uses host tooling. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');

const baseURL = process.env.TOOLKIT_BASE_URL || 'http://127.0.0.1:3001';
const artifacts = process.env.LAB_POLISH_ARTIFACTS || path.join(process.cwd(), 'work/polish');
const checks = [];

async function settled(page) {
  await page.waitForFunction(() => {
    const results = document.querySelector('[aria-busy][class*="results"]');
    return results && results.getAttribute('aria-busy') === 'false';
  });
}

async function visibleInViewport(locator, width, height) {
  const bounds = await locator.boundingBox();
  assert.ok(bounds, 'Element has visible bounds');
  assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width + 1 && bounds.y + bounds.height <= height + 1,
    `Element is inside the ${width} × ${height} viewport: ${JSON.stringify(bounds)}`);
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${baseURL}/lab/codex`, { waitUntil: 'domcontentloaded' });
    const browse = page.getByRole('button', { name: 'Browse all skills', exact: true });
    await browse.waitFor();
    await settled(page);
    const download = page.getByRole('button', { name: /^Download .*Skills? for / });
    assert.ok(await download.isDisabled());
    assert.equal(await download.evaluate(node => getComputedStyle(node).cursor), 'not-allowed');

    const defaultBackground = await browse.evaluate(node => getComputedStyle(node).backgroundColor);
    await browse.hover();
    const hoverBackground = await browse.evaluate(node => getComputedStyle(node).backgroundColor);
    assert.notEqual(hoverBackground, defaultBackground, 'Enabled button responds to hover');
    await page.mouse.down();
    const activeBackground = await browse.evaluate(node => getComputedStyle(node).backgroundColor);
    assert.notEqual(activeBackground, hoverBackground, 'Enabled button responds to press');
    await page.mouse.up();
    await settled(page);
    await page.keyboard.press('Tab');
    await browse.focus();
    const focus = await browse.evaluate(node => ({ style: getComputedStyle(node).outlineStyle, width: getComputedStyle(node).outlineWidth }));
    assert.equal(focus.style, 'solid');
    assert.equal(focus.width, '2px');
    assert.equal(await browse.evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const durations = await browse.evaluate(node => getComputedStyle(node).transitionDuration.split(',').map(value => parseFloat(value)));
    assert.ok(durations.every(value => value >= 0.15 && value <= 0.25), 'Control transitions stay brief');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const search = page.getByLabel('Search skills', { exact: true });
    const fieldBorder = await search.evaluate(node => getComputedStyle(node).borderColor);
    await search.hover();
    assert.notEqual(await search.evaluate(node => getComputedStyle(node).borderColor), fieldBorder, 'Field responds to hover');
    await page.keyboard.press('Tab');
    await search.focus();
    assert.equal(await search.evaluate(node => getComputedStyle(node).outlineWidth), '2px');
    checks.push('Button and field states are distinct; transitions are brief and reduced motion removes them');

    const firstCard = page.locator('article[class*="skillCard"]').first();
    await firstCard.waitFor();
    const preview = firstCard.getByRole('button', { name: /^Preview / });
    let releaseDetail;
    const detailGate = new Promise(resolve => { releaseDetail = resolve; });
    const detailMatcher = url => /^\/api\/skills\/[^/]+$/.test(url.pathname);
    await page.route(detailMatcher, async route => { await detailGate; await route.continue(); });
    await preview.click();
    await preview.waitFor({ state: 'visible' });
    await page.waitForFunction(node => node.getAttribute('aria-busy') === 'true', await preview.elementHandle());
    assert.equal(await preview.getAttribute('aria-disabled'), 'true');
    assert.equal(await preview.evaluate(node => getComputedStyle(node).cursor), 'progress');
    releaseDetail();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.ok(await dialog.evaluate(node => node.contains(document.activeElement)));
    const close = dialog.getByRole('button', { name: 'Close dialog', exact: true });
    await close.focus();
    await page.keyboard.press('Shift+Tab');
    assert.ok(await dialog.evaluate(node => node.contains(document.activeElement) && document.activeElement !== node.querySelector('button[aria-label="Close dialog"]')), 'Shift+Tab wraps to the last dialog control');
    await page.keyboard.press('Tab');
    assert.ok(await close.evaluate(node => node === document.activeElement), 'Tab wraps back to the first dialog control');
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      assert.ok(await dialog.evaluate(node => node.contains(document.activeElement)), 'Tab remains inside the modal');
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.ok(await preview.evaluate(node => node === document.activeElement), 'Closing restores focus to the preview control');
    await page.unroute(detailMatcher);
    checks.push('Pending preview exposes a busy state; the modal contains keyboard focus and restores it on close');

    const tag = firstCard.locator('[class*="tag"]').first();
    const originalTag = await tag.textContent();
    await tag.evaluate(node => { node.textContent = 'A-very-long-category-name-without-spaces-'.repeat(4); });
    assert.ok(await tag.evaluate(node => node.scrollWidth <= node.clientWidth + 1), 'Long category text wraps inside the card');
    await tag.evaluate((node, value) => { node.textContent = value; }, originalTag);
    assert.ok(await firstCard.locator('[class*="skillDescription"]').evaluate(node => node.scrollWidth <= node.clientWidth + 1), 'Description text stays within the card');
    const checkbox = firstCard.getByRole('checkbox');
    await checkbox.check();
    await page.getByRole('list', { name: 'Selected skills', exact: true }).waitFor();
    const summary = page.locator('summary').filter({ hasText: 'Archive contents' });
    await summary.click();
    assert.ok(await summary.evaluate(node => node.parentElement.open));
    assert.equal(await summary.evaluate(node => getComputedStyle(node).display), 'list-item');
    assert.notEqual(await summary.evaluate(node => getComputedStyle(node, '::marker').content), 'none');
    checks.push('Long labels and description text stay within their cards, and archive contents uses an operable native disclosure');

    await page.setViewportSize({ width: 1280, height: 480 });
    const archive = page.locator('aside[aria-labelledby="archive-heading"]');
    const archiveGeometry = await archive.evaluate(node => ({ position: getComputedStyle(node).position, top: parseFloat(getComputedStyle(node).top), height: node.getBoundingClientRect().height }));
    assert.equal(archiveGeometry.position, 'sticky');
    assert.ok(archiveGeometry.top >= 88 && archiveGeometry.height <= 480 - archiveGeometry.top + 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    checks.push('Desktop archive stays bounded below the header in a short viewport');

    await page.setViewportSize({ width: 320, height: 568 });
    const dock = page.getByRole('region', { name: 'Selection summary', exact: true });
    await visibleInViewport(dock, 320, 568);
    await dock.getByRole('link', { name: 'Review', exact: true }).click();
    assert.equal(await page.locator('#archive-heading').evaluate(node => node === document.activeElement), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(artifacts, 'lab-polish-mobile.png'), fullPage: true });

    await page.setViewportSize({ width: 320, height: 360 });
    await preview.click();
    await dialog.waitFor();
    await visibleInViewport(dialog, 320, 360);
    await dialog.getByRole('button', { name: 'Close dialog', exact: true }).focus();
    await visibleInViewport(dialog.getByRole('button', { name: 'Close dialog', exact: true }), 320, 360);
    await page.screenshot({ path: path.join(artifacts, 'lab-polish-dialog-short.png') });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.ok(await preview.evaluate(node => node === document.activeElement));
    assert.deepEqual(errors, []);
    checks.push('At 320px the selection dock, review target and short-viewport dialog remain reachable without page overflow');
    console.log(JSON.stringify({ checks, errors }, null, 2));
  } catch (error) {
    await page.screenshot({ path: path.join(artifacts, 'lab-polish-failure.png') }).catch(() => {});
    console.error(JSON.stringify({ checks, errors }, null, 2));
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
