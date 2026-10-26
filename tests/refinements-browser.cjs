/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser acceptance checks. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
const baseURL = process.env.TOOLKIT_BASE_URL || 'http://localhost:3000';
const artifacts = process.env.REFINEMENT_ARTIFACTS || '/tmp/refinements-browser';
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
 const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
 const page = await context.newPage();
 const checks = [], errors = [];
 page.on('pageerror', error => errors.push(error.message));
 fs.mkdirSync(artifacts, { recursive: true });
 try {
  await page.goto(baseURL + '/lab/codex');
  assert.equal(await page.locator('article').count(), 0, 'Root shows category folders');
  const folders = page.getByRole('button', { name: /^Open .* folder$/ });
  assert.ok(await folders.count() >= 7);
  await page.getByRole('button', { name: 'Open Design folder', exact: true }).click();
  const select = page.getByRole('checkbox', { name: /^Select / }).first();
  await select.waitFor();
  const name = (await select.getAttribute('aria-label')).replace(/^Select /, '');
  await select.check();
  const card = page.locator('article').first();
  const surface = await card.locator('p').first().boundingBox();
  await page.mouse.click(surface.x + surface.width / 2, surface.y + surface.height / 2);
  const copied = await page.getByLabel('Raw Markdown link', { exact: true }).inputValue();
  assert.match(copied, /^https:\/\/sujanshrestha\.ca\/lab\/skills\/[a-z0-9-]+\/skills\.md$/);
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), copied);
  assert.equal(await select.isChecked(), true, 'Copy does not change ZIP selection');
  const raw = await context.request.get(baseURL + new URL(copied).pathname);
  assert.equal(raw.status(), 200);
  assert.match(raw.headers()['content-type'], /^text\/markdown/);
  const metadata = (await (await context.request.get(baseURL + '/api/skills?q=' + encodeURIComponent(name))).json()).skills.find(skill => skill.name === name);
  const detail = await (await context.request.get(baseURL + '/api/skills/' + encodeURIComponent(metadata.id))).json();
  assert.equal(await raw.text(), detail.files.find(file => file.path === 'SKILL.md').content);
  checks.push('Card surface copies the canonical raw Markdown URL; HTTP response matches original source exactly and ZIP selection stays independent');

  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Permission denied fixture'); }; });
  await page.getByRole('button', { name: `Copy Markdown link for ${name}`, exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Clipboard access is unavailable' }).waitFor();
  assert.equal(await page.getByLabel('Raw Markdown link', { exact: true }).evaluate(node => node === document.activeElement && node.selectionEnd === node.value.length), true);
  checks.push('Clipboard denial exposes and focuses a selectable raw source URL');

  await page.getByRole('button', { name: `Preview ${name}`, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  assert.match(await dialog.evaluate(node => getComputedStyle(node, '::backdrop').backdropFilter), /blur/);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await dialog.getByRole('heading', { name, exact: true }).click();
  assert.equal(await dialog.isVisible(), true, 'Inside click keeps dialog open');
  await page.mouse.click(4, 4);
  await dialog.waitFor({ state: 'detached' });
  assert.equal(await page.getByRole('button', { name: `Preview ${name}`, exact: true }).evaluate(node => node === document.activeElement), true);
  assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.getByRole('button', { name: `Preview ${name}`, exact: true }).click();
  await dialog.waitFor();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  checks.push('Lab preview blurs background, locks scroll, retains inside clicks, dismisses on outside click/Escape, and restores trigger focus');

  await Promise.all([page.waitForResponse(response => response.url().includes('/api/skills?') && response.url().includes('category=Engineering')), page.getByLabel('Filter by category', { exact: true }).selectOption('Engineering')]);
  assert.match(await page.getByRole('status').filter({ hasText: '1 selected' }).innerText(), /1 selected/);
  await page.getByRole('button', { name: 'All folders', exact: true }).click();
  await page.getByRole('button', { name: 'Open Design folder', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Open Design folder', exact: true }).click();
  await page.getByRole('checkbox', { name: `Select ${name}`, exact: true }).waitFor();
  assert.equal(await page.getByRole('checkbox', { name: `Select ${name}`, exact: true }).isChecked(), true);
  checks.push('Category folders query the full server catalog and retain ZIP selections across folder navigation');
  for (const width of [375, 768, 1440]) {
   await page.setViewportSize({ width, height: 900 });
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
   await page.getByRole('button', { name: `Preview ${name}`, exact: true }).click();
   await dialog.waitFor();
   assert.equal(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth), true);
   await page.screenshot({ path: path.join(artifacts, `lab-modal-${width}.png`) });
   await page.mouse.click(4, 4);
   await dialog.waitFor({ state: 'detached' });
  }
  await page.getByRole('button', { name: 'All folders', exact: true }).click();
  await page.getByRole('button', { name: 'Open Design folder', exact: true }).waitFor();
  await page.screenshot({ path: path.join(artifacts, 'lab-folders.png'), fullPage: true });
  await page.getByLabel('Search skills', { exact: true }).fill('no-skill-should-match-refinements');
  await page.getByRole('heading', { name: 'No skills match your filters', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await folders.first().waitFor();
  checks.push('Folders, skill cards, preview and empty-state reset remain usable at phone/tablet/desktop widths');

  for (const route of ['/', '/blogs', '/lab/codex', '/blogs/reverse-proxy-ssrf-cannon']) {
   await page.goto(baseURL + route);
   assert.notEqual(await page.locator('h1').evaluate(node => getComputedStyle(node).textShadow), 'none', route + ' title has soft blur halo');
  }
  await page.goto(baseURL);
  const hero = page.locator('.hero-gradient-blur');
  assert.match(await hero.evaluate(node => getComputedStyle(node).backdropFilter), /blur\(16px\)/);
  await page.screenshot({ path: path.join(artifacts, 'hero-desktop.png') });
  await page.emulateMedia({ forcedColors: 'active' });
  assert.equal(await page.locator('h1').evaluate(node => getComputedStyle(node).textShadow), 'none');
  checks.push('Hero has progressive gradient blur; page titles keep readable foregrounds and remove halos in forced colors');
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ checks, errors }, null, 2));
  console.log(JSON.stringify({ checks, errors }, null, 2));
 } catch (error) {
  await page.screenshot({ path: path.join(artifacts, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
