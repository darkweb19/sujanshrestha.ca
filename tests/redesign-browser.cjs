/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser QA uses host tooling. */
// Start a seeded server first. Optional owner tests read LAB_TEST_PASSWORD, never print it.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
const baseURL = process.env.TOOLKIT_BASE_URL || 'http://localhost:3000';
const artifacts = process.env.TOOLKIT_ARTIFACTS || '/tmp/redesign-browser';
const checks = [];
const skipped = [];
const routePaths = ['/', '/blogs', '/blogs/reverse-proxy-ssrf-cannon', '/blogs/supabase-unlimited-free', '/lab/codex'];
const origin = new URL(baseURL).origin;
function noOverflow(page) { return page.evaluate(() => document.documentElement.scrollWidth <= innerWidth); }
function verifyArchive(filename, root, skill) {
  const expected = skill.files.map(file => ({ path: `${root}/${skill.slug}/${file.path}`, content: file.content, encoding: file.encoding }));
  execFileSync('python', ['-c', 'import sys,json,zipfile,base64\nexpected=json.loads(sys.stdin.read())\nwith zipfile.ZipFile(sys.argv[1]) as z:\n assert z.testzip() is None\n assert sorted(z.namelist())==sorted(f["path"] for f in expected)\n for f in expected:\n  data=base64.b64decode(f["content"]) if f["encoding"]=="base64" else f["content"].encode()\n  assert z.read(f["path"])==data\n', filename], { input: JSON.stringify(expected) });
}
(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    // Public pages retain content, unique canonical metadata, usable layout and working links.
    for (const route of routePaths) {
      const response = await page.goto(baseURL + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
      assert.equal(response.status(), 200, route);
      assert.equal(await page.locator('h1').count(), 1, `${route} has one h1`);
      assert.ok((await page.title()).includes('Sujan'), `${route} title identifies author`);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://sujanshrestha.ca${route === '/' ? '' : route}`, `${route} canonical`);
      for (const width of [375, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        assert.ok(await noOverflow(page), `${route} fits ${width}px`);
      }
    }
    checks.push('Five public routes return HTTP 200, one h1, correct canonical, and no overflow at 375/768/1440px');
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => ({ tag: document.activeElement.tagName, href: document.activeElement.getAttribute('href'), text: document.activeElement.textContent }));
    assert.equal(focus.tag, 'A'); assert.match(focus.text, /skip/i); assert.match(focus.href, /^#/);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'MAIN');
    checks.push('Keyboard skip link is first and moves focus to main content');
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
    const plain = await noJS.newPage();
    await plain.goto(baseURL, { waitUntil: 'domcontentloaded' });
    // The owner requested progressive reading; native disclosures also work without JS.
    for (const disclosure of await plain.locator('details > summary').all()) await disclosure.click();
    for (const text of ['Sujan Shrestha', 'Loyalist College', 'Tribhuwan University', 'Deerwalk Institute', 'ATSResumie', 'Outpost', 'DraftForge', 'NeverComes']) {
      assert.ok((await plain.locator('body').innerText()).toLowerCase().includes(text.toLowerCase()), `server content preserves ${text}`);
    }
    await noJS.close();
    checks.push('Professional facts, education and projects are present with JavaScript disabled');

    const publicCatalog = await context.request.get(baseURL + '/api/skills?pageSize=50');
    assert.equal(publicCatalog.status(), 200);
    const catalog = await publicCatalog.json();
    assert.ok(catalog.total > 10, 'Full upstream catalog extends beyond the original ten');
    assert.ok(catalog.skills.length && catalog.skills.length <= 50);
    for (const skill of catalog.skills) assert.ok(!skill.files || skill.files.length === 0, 'Catalog does not send package bodies');
    const denied = await context.request.post(baseURL + '/api/skills/import', {
      headers: { Origin: origin },
      data: { packages: [{ files: [{ path: 'SKILL.md', encoding: 'utf8', content: '---\nname: qa-anonymous-denial\ndescription: An otherwise valid package that anonymous visitors must never save.\n---\nReview the task and report evidence.\n' }] }] },
    });
    const deniedBody = await denied.json();
    const sessionResponse = await context.request.get(baseURL + '/api/lab/session');
    const sessionState = await sessionResponse.json();
    const managementDisabled = denied.status() === 503 && (
      deniedBody.error === 'Owner access requires HTTPS.' ||
      (!sessionState.configured && deniedBody.error === 'Owner access is not configured.')
    );
    assert.ok([401, 403].includes(denied.status()) || managementDisabled, 'Anonymous catalog writes are denied or management is explicitly disabled');
    assert.equal(sessionState.authenticated, false, 'Public test context has no owner session');
    const afterDenied = await context.request.get(baseURL + '/api/skills?pageSize=1');
    assert.equal((await afterDenied.json()).total, catalog.total, 'Denied valid upload does not change SQLite');
    const empty = await context.request.get(baseURL + '/api/skills?q=no-skill-should-match-this-qa-query');
    assert.equal((await empty.json()).total, 0);
    checks.push('Database catalog is paginated, metadata-only, contains more than ten skills, searches correctly, and refuses anonymous writes');

    await page.goto(baseURL + '/lab/codex', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.includes('Owner sign in') && !button.disabled));
    const checkbox = page.getByRole('checkbox', { name: /^Select / }).first();
    await checkbox.waitFor();
    const selectedName = (await checkbox.getAttribute('aria-label')).replace(/^Select /, '');
    await checkbox.check();
    const selectedMetadata = catalog.skills.find(skill => skill.name === selectedName);
    assert.ok(selectedMetadata, `Selected ${selectedName} exists in API metadata`);
    const packageResponse = await context.request.get(baseURL + '/api/skills/' + encodeURIComponent(selectedMetadata.id));
    assert.equal(packageResponse.status(), 200);
    const selectedPackage = await packageResponse.json();
    for (const [id, name, root] of [['codex','OpenAI Codex','.agents/skills'], ['claude-code','Claude Code','.claude/skills'], ['cursor','Cursor','.cursor/skills'], ['github-copilot','GitHub Copilot','.github/skills']]) {
      await page.getByLabel('Target AI Harness', { exact: true }).selectOption(id);
      const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: new RegExp(`Download 1 Skills? for ${name}`, 'i') }).click()]);
      const filename = path.join(artifacts, download.suggestedFilename());
      await download.saveAs(filename);
      verifyArchive(filename, root, selectedPackage);
    }
    checks.push('All four harness ZIPs contain exact selected-only paths and original text/binary supporting bytes');
    await page.getByRole('button', { name: `Preview ${selectedName}`, exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    const source = selectedPackage.files.find(file => file.path === 'SKILL.md');
    assert.equal(await page.getByLabel('SKILL.md complete source', { exact: true }).textContent(), source.content);
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    checks.push('Preview displays complete source and Escape closes the dialog');

    await page.getByLabel('Search skills', { exact: true }).fill('no-skill-should-match-this-qa-query');
    await page.getByRole('heading', { name: 'No skills match your filters', exact: true }).waitFor();
    assert.match(page.url(), /q=no-skill-should-match/);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'No skills match your filters', exact: true }).waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.includes('Owner sign in') && !button.disabled));
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    await page.getByRole('checkbox', { name: /^Select / }).first().waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.includes('Owner sign in') && !button.disabled));
    await page.getByRole('checkbox', { name: /^Select / }).first().check();
    await page.getByLabel('What would you like to build or improve?', { exact: true }).fill('Review authentication and add regression tests.');
    await page.getByRole('button', { name: 'Generate prompt', exact: true }).click();
    assert.match(await page.getByLabel('Editable prompt', { exact: true }).inputValue(), /Installation is required first/);
    await page.getByRole('checkbox', { name: /I confirm the selected skills/ }).check();
    await page.getByRole('button', { name: 'Generate prompt', exact: true }).click();
    assert.match(await page.getByLabel('Editable prompt', { exact: true }).inputValue(), /I have confirmed these skill files are installed/);
    await page.getByLabel('Target AI Harness', { exact: true }).selectOption('cursor');
    assert.equal(await page.getByRole('checkbox', { name: /I confirm the selected skills/ }).isChecked(), false);
    checks.push('Search/no-results URL state survives reload, clearing restores results, prompts distinguish installation state and harness changes reset confirmation');
    await page.setViewportSize({ width: 375, height: 844 });
    await page.getByRole('button', { name: 'Toggle menu', exact: true }).click();
    await page.getByRole('navigation', { name: 'Mobile', exact: true }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('navigation', { name: 'Mobile', exact: true }).waitFor({ state: 'detached' });
    assert.equal(await page.getByRole('button', { name: 'Toggle menu', exact: true }).evaluate(node => node === document.activeElement), true);
    await page.setViewportSize({ width: 1440, height: 1000 });
    checks.push('Mobile navigation opens by button and Escape closes it with focus restored');

    if (process.env.LAB_TEST_PASSWORD) {
      await page.getByRole('button', { name: 'Upload skills', exact: true }).click();
      await page.getByLabel('Owner password', { exact: true }).fill(process.env.LAB_TEST_PASSWORD);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      const uploadDialog = page.getByRole('dialog', { name: 'Upload skills', exact: true });
      await uploadDialog.waitFor();
      assert.ok(await uploadDialog.getByLabel('SKILL.md or ZIP archives', { exact: true }).isVisible());
      await uploadDialog.getByRole('button', { name: 'Close dialog', exact: true }).click();
      checks.push('Visible upload entry leads through owner sign-in directly to the actual file field');
      const session = await (await context.request.get(baseURL + '/api/lab/session')).json();
      assert.equal(session.authenticated, true); assert.ok(session.csrfToken);

      const zipSlug = `qa-zip-${Date.now()}`;
      const zipPath = path.join(artifacts, 'owner-complete.zip');
      execFileSync('python', ['-c', 'import sys,zipfile\nwith zipfile.ZipFile(sys.argv[1],"w") as z:\n z.writestr(sys.argv[2]+"/SKILL.md","---\\nname: "+sys.argv[2]+"\\ndescription: Complete ZIP acceptance fixture.\\n---\\n# ZIP fixture\\n")\n z.writestr(sys.argv[2]+"/assets/sample.bin",bytes([0,1,2,255]))\n z.writestr(sys.argv[2]+"/scripts/example.js","window.__importExecuted=true;")\n', zipPath, zipSlug]);
      await page.getByRole('button', { name: 'Upload skills', exact: true }).click();
      await page.getByLabel('SKILL.md or ZIP archives', { exact: true }).setInputFiles(zipPath);
      const zipResponse = page.waitForResponse(response => response.url().endsWith('/api/skills/import') && response.request().method() === 'POST');
      await page.getByRole('button', { name: 'Upload files', exact: true }).click();
      const zipImported = await zipResponse;
      assert.equal(zipImported.status(), 201);
      const zipSkill = (await zipImported.json()).skills[0];
      try {
        const zipPackage = await (await context.request.get(baseURL + '/api/skills/' + encodeURIComponent(zipSkill.id))).json();
        assert.equal(zipPackage.files.length, 3);
        const binary = zipPackage.files.find(file => file.path === 'assets/sample.bin');
        assert.equal(Buffer.from(binary.content, 'base64').toString('hex'), '000102ff');
        assert.equal(await page.evaluate(() => window.__importExecuted), undefined);
        checks.push('Owner ZIP upload preserves complete Markdown, script and binary supporting files without execution');
      } finally {
        const removed = await context.request.delete(baseURL + '/api/skills/' + encodeURIComponent(zipSkill.id), { headers: { Origin: origin, 'X-CSRF-Token': session.csrfToken }, data: { revision: zipSkill.revision } });
        assert.equal(removed.status(), 200);
      }
      const slug = `qa-persist-${Date.now()}`;
      const markdown = `---\nname: ${slug}\ndescription: Browser acceptance persistence fixture.\n---\n# Browser QA\n\nDo not execute imported scripts.\n`;
      const upload = { multipart: { files: { name: 'SKILL.md', mimeType: 'text/markdown', buffer: Buffer.from(markdown) } } };
      const noCSRF = await context.request.post(baseURL + '/api/skills/import', { ...upload, headers: { Origin: origin } });
      assert.equal(noCSRF.status(), 403);
      await page.getByRole('button', { name: 'Upload skills', exact: true }).click();
      await page.getByLabel('SKILL.md or ZIP archives', { exact: true }).setInputFiles({ name: 'SKILL.md', mimeType: 'text/markdown', buffer: Buffer.from(markdown) });
      const importedResponse = page.waitForResponse(response => response.url().endsWith('/api/skills/import') && response.request().method() === 'POST');
      await page.getByRole('button', { name: 'Upload files', exact: true }).click();
      const imported = await importedResponse;
      assert.equal(imported.status(), 201);
      const saved = (await imported.json()).skills[0];
      assert.ok(saved.id);
      try {
        await page.getByLabel('Search skills', { exact: true }).fill(slug);
        await page.getByRole('button', { name: `Preview ${slug}`, exact: true }).click();
        await page.getByRole('button', { name: 'Edit skill', exact: true }).click();
        const updatedMarkdown = markdown + '\nBROWSER_EDIT_PERSISTED\n';
        await page.getByLabel('Edit SKILL.md', { exact: true }).fill(updatedMarkdown);
        await page.getByRole('button', { name: 'Save changes', exact: true }).click();
        await page.getByLabel('SKILL.md complete source', { exact: true }).filter({ hasText: 'BROWSER_EDIT_PERSISTED' }).waitFor();
        await page.keyboard.press('Escape');
        const second = await browser.newContext();
        const secondPage = await second.newPage();
        await secondPage.goto(baseURL + '/lab/codex?q=' + slug, { waitUntil: 'domcontentloaded' });
        await secondPage.getByRole('checkbox', { name: `Select ${slug}`, exact: true }).waitFor();
        await secondPage.reload({ waitUntil: 'domcontentloaded' });
        await secondPage.getByRole('checkbox', { name: `Select ${slug}`, exact: true }).waitFor();
        const fetched = await second.request.get(baseURL + '/api/skills/' + encodeURIComponent(saved.id));
        assert.equal(fetched.status(), 200);
        assert.equal((await fetched.json()).files.find(file => file.path === 'SKILL.md').content, updatedMarkdown);
        await second.close();
        const malicious = await context.request.post(baseURL + '/api/skills/import', { headers: { Origin: origin, 'X-CSRF-Token': session.csrfToken }, data: { githubUrl: 'http://127.0.0.1/private' } });
        assert.equal(malicious.status(), 400);
        checks.push('Owner sign-in, CSRF enforcement, Markdown upload/edit UI, cross-browser reload persistence and SSRF URL rejection');
        await page.getByRole('button', { name: `Preview ${slug}`, exact: true }).click();
        await page.getByRole('button', { name: 'Remove skill', exact: true }).click();
        await page.getByRole('dialog', { name: 'Remove imported skill?' }).waitFor();
        await page.getByRole('button', { name: 'Keep skill', exact: true }).click();
        assert.equal((await context.request.get(baseURL + '/api/skills/' + encodeURIComponent(saved.id))).status(), 200);
        await page.getByRole('button', { name: `Preview ${slug}`, exact: true }).click();
        await page.getByRole('button', { name: 'Remove skill', exact: true }).click();
        await page.getByRole('dialog', { name: 'Remove imported skill?' }).getByRole('button', { name: 'Remove skill', exact: true }).click();
        await page.getByRole('heading', { name: 'No skills match your filters', exact: true }).waitFor();
        assert.equal((await context.request.get(baseURL + '/api/skills/' + encodeURIComponent(saved.id))).status(), 404);
        checks.push('Owner removal confirmation supports cancel and deletes only after explicit confirmation');
      } finally {
        const remaining = await context.request.get(baseURL + '/api/skills/' + encodeURIComponent(saved.id));
        if (remaining.status() === 200) {
          const latest = await remaining.json();
          const removed = await context.request.delete(baseURL + '/api/skills/' + encodeURIComponent(saved.id), { headers: { Origin: origin, 'X-CSRF-Token': session.csrfToken }, data: { revision: latest.revision } });
          assert.ok([200, 204].includes(removed.status()), `Clean up owner fixture: ${removed.status()}`);
        }
      }
    } else skipped.push('Authenticated upload and cross-browser persistence: set LAB_TEST_PASSWORD matching a nonproduction seeded server; public authorization tests still executed.');
    assert.deepEqual(errors, [], 'No uncaught browser errors');
    fs.writeFileSync(path.join(artifacts, 'redesign-results.json'), JSON.stringify({ checks, skipped, errors }, null, 2));
    console.log(JSON.stringify({ checks, skipped, errors }, null, 2));
  } catch (error) {
    await page.screenshot({ path: path.join(artifacts, 'failure.png'), fullPage: true }).catch(() => {});
    fs.writeFileSync(path.join(artifacts, 'redesign-results.json'), JSON.stringify({ checks, skipped, errors, failure: String(error) }, null, 2));
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
