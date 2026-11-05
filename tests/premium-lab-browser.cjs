/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser acceptance uses host tooling. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
const baseURL = process.env.TOOLKIT_BASE_URL || 'http://127.0.0.1:3000';
const artifacts = process.env.TOOLKIT_ARTIFACTS || '/tmp/premium-lab-browser';
const checks = [], errors = [];

function verifyArchive(filename, root, skills) {
  const expected = skills.flatMap(skill => skill.files.map(file => ({ ...file, path: `${root}/${skill.slug}/${file.path}` })));
  execFileSync('python', ['-c', 'import sys,json,zipfile,base64\nexpected=json.loads(sys.stdin.read())\nwith zipfile.ZipFile(sys.argv[1]) as z:\n assert z.testzip() is None\n assert sorted(z.namelist())==sorted(f["path"] for f in expected)\n for f in expected:\n  data=base64.b64decode(f["content"]) if f["encoding"]=="base64" else f["content"].encode()\n  assert z.read(f["path"])==data, f["path"]\n', filename], { input: JSON.stringify(expected) });
}
function catalogResponse(page) {
  return page.waitForResponse(response => new URL(response.url()).pathname === '/api/skills' && response.request().method() === 'GET');
}
async function settled(page) {
  await page.waitForFunction(() => {
    const results = document.querySelector('[aria-busy][class*="results"]');
    return results && results.getAttribute('aria-busy') === 'false';
  });
}
async function changeCatalog(page, action) {
  const response = catalogResponse(page);
  await action();
  assert.equal((await response).status(), 200);
  await settled(page);
}
async function downloadArchive(page, name, skills, root) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name, exact: true }).click(),
  ]);
  const filename = path.join(artifacts, download.suggestedFilename());
  await download.saveAs(filename);
  verifyArchive(filename, root, skills);
}
function watchPage(page) {
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true, ignoreHTTPSErrors: process.env.TOOLKIT_HTTPS_TEST === '1' });
  const page = await context.newPage();
  watchPage(page);
  try {
    const packages = [];
    for (const slug of ['senior-frontend', 'ux-researcher-designer']) {
      const response = await context.request.get(`${baseURL}/api/skills?q=${encodeURIComponent(slug)}`);
      assert.equal(response.status(), 200);
      const metadata = (await response.json()).skills.find(skill => skill.slug === slug && skill.managed);
      assert.ok(metadata, `Seeded catalog includes ${slug}`);
      const detail = await context.request.get(`${baseURL}/api/skills/${encodeURIComponent(metadata.id)}`);
      assert.equal(detail.status(), 200);
      packages.push(await detail.json());
    }
    const [first, second] = packages;
    assert.notEqual(first.category, second.category, 'Fixtures cover different categories');
    assert.ok(packages.every(skill => skill.files.length > 1), 'ZIP checks include supporting files');

    await page.goto(`${baseURL}/lab/codex`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Browse all skills', exact: true }).waitFor();
    await changeCatalog(page, () => page.getByRole('button', { name: `Open ${first.category} folder`, exact: true }).click());
    await changeCatalog(page, () => page.getByLabel('Search skills', { exact: true }).fill(first.name));
    await page.getByRole('checkbox', { name: `Select ${first.name}`, exact: true }).check();
    const selectedList = page.getByRole('list', { name: 'Selected skills', exact: true });
    await selectedList.getByRole('button', { name: `Remove ${first.name} from selection`, exact: true }).waitFor();
    await changeCatalog(page, () => page.getByRole('button', { name: 'Clear search', exact: true }).click());
    await changeCatalog(page, () => page.getByLabel('Filter by category', { exact: true }).selectOption(second.category));
    await changeCatalog(page, () => page.getByLabel('Search skills', { exact: true }).fill(second.name));
    await page.getByRole('checkbox', { name: `Select ${second.name}`, exact: true }).check();
    await selectedList.getByRole('button', { name: `Remove ${second.name} from selection`, exact: true }).waitFor();
    assert.equal(await selectedList.locator('li').count(), 2);
    assert.ok(await selectedList.getByText(first.name, { exact: true }).isVisible());
    checks.push('Two skills selected across categories/search remain named in the persistent summary with independent remove controls');

    for (const [id, name, root] of [['codex', 'OpenAI Codex', '.agents/skills'], ['claude-code', 'Claude Code', '.claude/skills'], ['cursor', 'Cursor', '.cursor/skills'], ['github-copilot', 'GitHub Copilot', '.github/skills']]) {
      await page.getByLabel('Target AI Harness', { exact: true }).selectOption(id);
      await downloadArchive(page, `Download 2 Skills for ${name}`, packages, root);
    }
    checks.push('All four harness downloads contain exactly both selected packages, every supporting path, and every original text/binary byte');

    await page.getByRole('button', { name: `Preview ${second.name}`, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: second.name, exact: true });
    const reading = dialog.getByRole('region', { name: 'SKILL.md rendered Markdown', exact: true });
    await reading.waitFor();
    await reading.locator('h1,h2,h3,p,ul,ol').first().waitFor();
    assert.equal(await reading.locator('script,iframe,object,embed').count(), 0);
    await dialog.getByRole('button', { name: 'Source', exact: true }).click();
    assert.equal(await dialog.getByLabel('SKILL.md complete source', { exact: true }).textContent(), second.files.find(file => file.path === 'SKILL.md').content);
    await dialog.getByRole('button', { name: 'Read', exact: true }).click();
    await reading.waitFor();
    await dialog.getByRole('button', { name: 'Remove from selection', exact: true }).click();
    await dialog.getByRole('button', { name: 'Add to selection', exact: true }).click();
    assert.equal(await dialog.getByRole('button', { name: 'Remove from selection', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await selectedList.locator('li').count(), 2);
    checks.push('Detail defaults to semantic Markdown, Source preserves exact Markdown, and preview selection controls update the shared selection');

    await selectedList.getByRole('button', { name: `Remove ${first.name} from selection`, exact: true }).click();
    assert.equal(await selectedList.locator('li').count(), 1);
    assert.equal(await selectedList.getByText(first.name, { exact: true }).count(), 0);
    checks.push('Summary removal changes only the named selected skill');

    await page.setViewportSize({ width: 375, height: 844 });
    const dock = page.getByRole('region', { name: 'Selection summary', exact: true });
    for (const position of ['top', 'bottom']) {
      await page.evaluate(where => window.scrollTo(0, where === 'top' ? 0 : document.documentElement.scrollHeight), position);
      await dock.waitFor();
      const bounds = await dock.boundingBox();
      assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 844, `Selection dock remains within viewport at ${position}`);
      assert.match(await dock.innerText(), /1 selected/);
    }
    await dock.getByRole('link', { name: 'Review', exact: true }).click();
    assert.equal(await page.locator('#archive-heading').evaluate(node => node === document.activeElement), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(artifacts, 'mobile-selection-review.png'), fullPage: true });
    checks.push('Mobile selection dock stays visible at both scroll extremes; Review focuses the archive heading without page overflow');
    await page.setViewportSize({ width: 1440, height: 1000 });

    // Use a fresh navigation history so Back/Forward checks have deliberate boundaries.
    await page.goto(`${baseURL}/lab/codex`, { waitUntil: 'domcontentloaded' });
    await changeCatalog(page, () => page.getByRole('button', { name: 'Browse all skills', exact: true }).click());
    const allURL = page.url();
    await changeCatalog(page, () => page.getByRole('button', { name: 'Next', exact: true }).click());
    const pageTwoURL = page.url();
    assert.equal(new URL(pageTwoURL).searchParams.get('page'), '2');
    await changeCatalog(page, () => page.getByLabel('Filter by category', { exact: true }).selectOption(second.category));
    const categoryURL = page.url();
    await changeCatalog(page, () => page.getByLabel('Search skills', { exact: true }).fill(second.name));
    const searchURL = page.url();
    await changeCatalog(page, () => page.goBack());
    assert.equal(page.url(), categoryURL);
    assert.equal(await page.getByLabel('Search skills', { exact: true }).inputValue(), '');
    assert.equal(await page.getByLabel('Filter by category', { exact: true }).inputValue(), second.category);
    await changeCatalog(page, () => page.goBack());
    assert.equal(page.url(), pageTwoURL);
    assert.equal(await page.getByLabel('Filter by category', { exact: true }).inputValue(), 'all');
    assert.match(await page.getByRole('navigation', { name: 'Skills library pages', exact: true }).innerText(), /Page 2 of/);
    await changeCatalog(page, () => page.goBack());
    assert.equal(page.url(), allURL);
    assert.equal(await page.getByRole('button', { name: 'Browse all skills', exact: true }).getAttribute('aria-pressed'), 'true');
    await changeCatalog(page, () => page.goBack());
    assert.equal(new URL(page.url()).searchParams.get('view'), null);
    await page.getByRole('button', { name: `Open ${first.category} folder`, exact: true }).waitFor();
    for (const expected of [allURL, pageTwoURL, categoryURL, searchURL]) {
      await changeCatalog(page, () => page.goForward());
      assert.equal(page.url(), expected);
    }
    assert.equal(await page.getByLabel('Search skills', { exact: true }).inputValue(), second.name);
    checks.push('Browser Back/Forward restores folder/all-skills view, category, query, and page with matching controls/results');

    let failCatalog = true;
    const catalogMatcher = url => url.pathname === '/api/skills';
    await page.route(catalogMatcher, route => failCatalog
      ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Fixture catalog unavailable. Retry the library.' }) })
      : route.continue());
    await page.getByLabel('Search skills', { exact: true }).fill('premium-catalog-failure');
    await page.getByRole('alert').filter({ hasText: 'Fixture catalog unavailable' }).waitFor();
    failCatalog = false;
    await changeCatalog(page, () => page.getByRole('button', { name: 'Retry library', exact: true }).click());
    await page.getByRole('heading', { name: 'No skills match your filters', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Retry library', exact: true }).count(), 0);
    await page.unroute(catalogMatcher);
    checks.push('Catalog failure is distinct from empty results; Retry library recovers to a successful no-results response');

    const recovery = await context.newPage();
    watchPage(recovery);
    await recovery.goto(`${baseURL}/lab/codex?q=${encodeURIComponent(first.name)}`, { waitUntil: 'domcontentloaded' });
    let failDetail = true;
    const detailPath = `/api/skills/${encodeURIComponent(first.id)}`;
    const detailMatcher = url => url.pathname === detailPath;
    await recovery.route(detailMatcher, route => failDetail
      ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Fixture selected package unavailable.' }) })
      : route.continue());
    await recovery.getByRole('checkbox', { name: `Select ${first.name}`, exact: true }).check();
    await recovery.getByRole('button', { name: 'Retry packages', exact: true }).waitFor();
    assert.ok(await recovery.getByRole('checkbox', { name: `Select ${first.name}`, exact: true }).isChecked());
    assert.ok(await recovery.getByRole('list', { name: 'Selected skills', exact: true }).getByText(first.name, { exact: true }).isVisible());
    assert.ok(await recovery.getByRole('button', { name: 'Download 1 Skill for OpenAI Codex', exact: true }).isDisabled());
    failDetail = false;
    await recovery.getByRole('button', { name: 'Retry packages', exact: true }).click();
    await downloadArchive(recovery, 'Download 1 Skill for OpenAI Codex', [first], '.agents/skills');
    assert.ok(await recovery.getByRole('checkbox', { name: `Select ${first.name}`, exact: true }).isChecked());
    await recovery.screenshot({ path: path.join(artifacts, 'desktop-recovered-selection.png'), fullPage: true });
    checks.push('Detail failure preserves named selection and disables incomplete export; Retry packages recovers an exact verified download');

    const axePath = process.env.AXE_MODULE || '/workspace/qa-tools/node_modules/axe-core';
    await recovery.addScriptTag({ content: require(axePath).source });
    const axe = await recovery.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
    fs.writeFileSync(path.join(artifacts, 'axe.json'), JSON.stringify(axe, null, 2));
    assert.deepEqual(axe.violations.map(({ id, impact, nodes }) => ({ id, impact, count: nodes.length })), []);
    checks.push('Axe WCAG 2/2.1/2.2 A/AA scan finds no violations in the recovered desktop selection workflow');
    await recovery.close();
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'checks.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(JSON.stringify({ checks, errors }, null, 2));
  } catch (error) {
    fs.writeFileSync(path.join(artifacts, 'checks.json'), JSON.stringify({ checks, errors, failure: String(error) }, null, 2));
    await page.screenshot({ path: path.join(artifacts, 'failure.png'), fullPage: true }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
