/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser runner loads optional host Playwright. */
/* Browser acceptance: run against `pnpm dev` with
 * PLAYWRIGHT_MODULE=/path/to/playwright node tests/toolkit-browser.cjs.
 * Browser/tooling are supplied by the verification host, not production dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
const baseURL = process.env.TOOLKIT_BASE_URL || 'http://localhost:3000';
const artifacts = process.env.TOOLKIT_ARTIFACTS || '/workspace/qa-artifacts';
const fixtures = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-browser-'));
fs.mkdirSync(artifacts, { recursive: true });
const localMarkdown = '---\nname: browser-local\ndescription: A complete browser acceptance fixture.\n---\n# Browser fixture\n\nRead the task and report evidence.\n\n<script>window.__importExecuted=true</script>\n\nBROWSER_COMPLETE_SOURCE_END\n';
fs.writeFileSync(path.join(fixtures, 'SKILL.md'), localMarkdown);
fs.writeFileSync(path.join(fixtures, 'bad.md'), '---\nname: bad\n---\nMissing description.');
execFileSync('python', ['-c', `import zipfile,sys\np=sys.argv[1]\nwith zipfile.ZipFile(p+'/unsafe.zip','w') as z:\n z.writestr('../outside.txt','unsafe')\n z.writestr('SKILL.md','---\\nname: bad-archive\\ndescription: Unsafe archive\\n---\\nInstructions')\nwith zipfile.ZipFile(p+'/complete.zip','w') as z:\n z.writestr('browser-package/SKILL.md','---\\nname: browser-package\\ndescription: Complete package with support files.\\n---\\n# Safe package\\nRead [reference](references/example.md).')\n z.writestr('browser-package/references/example.md','REFERENCE_BYTES')\n z.writestr('browser-package/assets/sample.bin',bytes([0,1,2,255]))\n z.writestr('browser-package/scripts/example.js','window.__importExecuted=true;')`, fixtures]);
function verifyZip(file, expected) {
  const actual = JSON.parse(execFileSync('python', ['-c', 'import json,sys,zipfile\nwith zipfile.ZipFile(sys.argv[1]) as z:\n assert z.testzip() is None\n print(json.dumps(sorted(z.namelist())))', file], { encoding:'utf8' }));
  assert.deepEqual(actual, [...expected].sort());
}
async function openImport(page, fixture) {
  await page.getByRole('button', { name: 'Import skill', exact: true }).click();
  await page.getByLabel('SKILL.md or ZIP archives', { exact: true }).setInputFiles(path.join(fixtures, fixture));
  await page.getByRole('button', { name: 'Import files', exact: true }).click();
}
(async () => {
  // Honor the host's proxy and trust its configured local CA roots in an ephemeral
  // NSS database. TLS verification remains enabled. No credential values are logged.
  const browserData=path.join(fixtures,'chromium-data');
  const caDirectory=process.env.TOOLKIT_CHROMIUM_CA_DIR;
  if(caDirectory) {
    if(fs.existsSync(path.join(os.homedir(),'.pki/nssdb'))) throw new Error('Legacy Chromium NSS database exists; refuse to change it. Use an existing verified browser trust configuration.');
    const database=path.join(browserData,'pki/nssdb'); fs.mkdirSync(database,{recursive:true});
    execFileSync('certutil',['-N','--empty-password','-d','sql:'+database]);
    for(const certificate of fs.readdirSync(caDirectory).filter(name=>name.endsWith('.crt')))
      execFileSync('certutil',['-A','-d','sql:'+database,'-n',certificate,'-t','C,,','-i',path.join(caDirectory,certificate)]);
  }
  const inheritedProxy=process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  const proxyURL=inheritedProxy ? new URL(inheritedProxy) : null;
  // Playwright otherwise appends <-loopback> after explicit bypass rules.
  if(proxyURL) process.env.PLAYWRIGHT_DISABLE_FORCED_CHROMIUM_PROXIED_LOOPBACK='1';
  const proxy=proxyURL ? {server:proxyURL.origin,bypass:'localhost,127.0.0.1,[::1]',...(proxyURL.username ? {username:decodeURIComponent(proxyURL.username),password:decodeURIComponent(proxyURL.password)} : {})} : undefined;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'], proxy, ...(caDirectory ? {env:{...process.env,XDG_DATA_HOME:browserData}} : {}) });
  const failures = [];
  const checks = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => failures.push(error.message));
  try {
    await page.goto(baseURL+'/lab/codex', { waitUntil:'domcontentloaded', timeout:60000 });
    await page.getByRole('heading', { name:/skills toolkit/i }).first().waitFor();
    // Remaining selectors deliberately target visible labels and actual downloads.
    await runAcceptance(page, context, checks);
    assert.deepEqual(failures, [], 'No uncaught browser exceptions');
    fs.writeFileSync(path.join(artifacts, 'browser-results.json'), JSON.stringify({ checks, failures }, null, 2));
    console.log(JSON.stringify({ checks, failures }, null, 2));
  } catch(error) {
    await page.screenshot({ path:path.join(artifacts,'failure.png'), fullPage:true, timeout:10000 }).catch(()=>{});
    const visibleAlerts=await page.getByRole('alert').allTextContents().catch(()=>[]);
    if(visibleAlerts.length) console.error('Visible error feedback:',JSON.stringify(visibleAlerts));
    console.error(error);
    process.exitCode=1;
  } finally { await browser.close(); fs.rmSync(fixtures,{recursive:true,force:true}); }
})();

async function runAcceptance(page, context, checks) {
  const names = ['Frontend Design','CTO Advisor','Code Review','Security Audit','Testing'];
  assert.equal(await page.locator('article input[type=checkbox]').count(),10);
  for (const name of names) await page.getByRole('checkbox',{name:'Select '+name,exact:true}).check();
  const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/skills-toolkit/sources.json'),'utf8'));
  const chosen=config.skills.filter(skill=>names.includes(skill.name));
  const harnesses=[['codex','OpenAI Codex','.agents/skills'],['claude-code','Claude Code','.claude/skills'],['cursor','Cursor','.cursor/skills'],['github-copilot','GitHub Copilot','.github/skills']];
  for (const [id,name,root] of harnesses) {
    await page.getByLabel('Target AI Harness',{exact:true}).selectOption(id);
    await page.getByLabel('ZIP file tree for '+name,{exact:true}).getByText(root.split('/')[0]+'/',{exact:true}).waitFor();
    const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:`Download 5 Skills for ${name}`,exact:true}).click()]);
    assert.equal(download.suggestedFilename(),`${id}-skills.zip`);
    const destination=path.join(artifacts,download.suggestedFilename()); await download.saveAs(destination);
    const expected=chosen.flatMap(skill=>JSON.parse(fs.readFileSync(path.join(__dirname,'../public/skills-toolkit',skill.slug+'.json'),'utf8')).files.map(file=>`${root}/${skill.slug}/${file.path}`));
    verifyZip(destination,expected);
    // Python's independent ZIP reader also verifies every original supporting byte.
    execFileSync('python',['-c',`import zipfile,json,base64,sys,pathlib\nwith zipfile.ZipFile(sys.argv[1]) as z:\n for slug in json.loads(sys.argv[4]):\n  p=json.loads((pathlib.Path(sys.argv[2])/(slug+'.json')).read_text())\n  for f in p['files']:\n   expected=base64.b64decode(f['content']) if f['encoding']=='base64' else f['content'].encode()\n   assert z.read(sys.argv[3]+'/'+slug+'/'+f['path'])==expected`,destination,path.join(__dirname,'../public/skills-toolkit'),root,JSON.stringify(chosen.map(skill=>skill.slug))]);
  }
  checks.push('Five selected source packages export exact paths and original supporting bytes for all four harnesses');
  await page.getByLabel('Target AI Harness',{exact:true}).selectOption('codex');
  await page.getByRole('button',{name:'Preview Frontend Design',exact:true}).click();
  const original=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/skills-toolkit/senior-frontend.json'),'utf8')).files.find(file=>file.path==='SKILL.md').content;
  assert.equal(await page.getByLabel('SKILL.md complete source',{exact:true}).textContent(),original);
  await page.getByRole('button',{name:'Expand file',exact:true}).click();
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  checks.push('Preview exposes complete original Markdown instructions');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:path.join(artifacts,'toolkit-desktop-selected.png'),fullPage:true,animations:'disabled'});
  await page.screenshot({path:path.join(artifacts,'toolkit-desktop-viewport.png'),animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:path.join(artifacts,'toolkit-mobile-viewport.png'),animations:'disabled'});
  await page.evaluate(()=>{const archive=document.getElementById('archive-heading').closest('aside');window.scrollTo({top:archive.getBoundingClientRect().top+window.scrollY-90,behavior:'instant'});});
  await page.screenshot({path:path.join(artifacts,'toolkit-mobile-archive.png'),animations:'disabled'});
  const keyboardHarness=page.getByLabel('Target AI Harness',{exact:true});
  await keyboardHarness.focus(); await keyboardHarness.press('Home'); await keyboardHarness.press('ArrowDown');
  assert.equal(await keyboardHarness.inputValue(),'claude-code');
  await keyboardHarness.press('Home'); assert.equal(await keyboardHarness.inputValue(),'codex');
  checks.push('Native harness selector works by keyboard at mobile width');
  await page.setViewportSize({width:1440,height:1000});
  await page.getByLabel('Search skills',{exact:true}).fill('no-result-xyz');
  await page.getByRole('heading',{name:'No skills match your filters',exact:true}).waitFor();
  await page.getByRole('button',{name:'Reset filters',exact:true}).click();
  assert.equal(await page.locator('article input[type=checkbox]').count(),10);
  await page.getByLabel('Filter by category',{exact:true}).selectOption('Quality');
  assert.equal(await page.locator('article input[type=checkbox]').count(),1);
  await page.getByLabel('Filter by category',{exact:true}).selectOption('all');
  checks.push('Search empty state, reset, and category filter');
  await page.getByLabel('What would you like to build or improve?',{exact:true}).fill('Review this API and add regression tests.');
  await page.getByRole('button',{name:'Generate prompt',exact:true}).click();
  let prompt=await page.getByLabel('Editable prompt',{exact:true}).inputValue();
  assert.match(prompt,/Installation is required first/); assert.match(prompt,/\.agents\/skills\/senior-frontend\/SKILL\.md/);
  await page.getByRole('checkbox',{name:/I confirm the selected skills/}).check();
  await page.getByRole('button',{name:'Generate prompt',exact:true}).click();
  prompt=await page.getByLabel('Editable prompt',{exact:true}).inputValue();
  assert.match(prompt,/I have confirmed these skill files are installed/);
  const link=page.getByRole('link',{name:/Open Codex Web/}); assert.equal(await link.getAttribute('href'),'https://chatgpt.com/codex');
  await page.getByLabel('Target AI Harness',{exact:true}).selectOption('claude-code');
  assert.equal(await link.count(),0);
  assert.equal(await page.getByRole('checkbox',{name:/I confirm the selected skills/}).isChecked(),false);
  await page.getByLabel('Target AI Harness',{exact:true}).selectOption('codex');
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}}));
  await page.getByRole('button',{name:'Copy prompt',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'Clipboard access is unavailable'}).waitFor();
  checks.push('Prompts distinguish installation assertion, reset confirmation on harness change, and recover from clipboard failure');
  const importedRecordCount=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('personal-skills-toolkit',1);request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result;const transaction=db.transaction('imported-skills');const count=transaction.objectStore('imported-skills').count();count.onsuccess=()=>{db.close();resolve(count.result)};count.onerror=()=>reject(count.error)}}));
  const beforeRejectedBatch=await page.locator('article input[type=checkbox]').count();
  const beforeRejectedStorage=await importedRecordCount();
  const rejectedBatches=[
    [Array.from({length:21},(_,index)=>({name:`skill-${index}.md`,mimeType:'text/markdown',buffer:Buffer.from(localMarkdown)})),'Choose no more than 20 files per import batch.'],
    [[{name:'large-one.md',mimeType:'text/markdown',buffer:Buffer.alloc(6*1024*1024)},{name:'large-two.md',mimeType:'text/markdown',buffer:Buffer.alloc(6*1024*1024)}],'The selected files exceed the 10 MB total upload limit. Import a smaller batch.'],
  ];
  for(const [uploads,errorMessage] of rejectedBatches) {
    await page.getByRole('button',{name:'Import skill',exact:true}).click();
    await page.getByLabel('SKILL.md or ZIP archives',{exact:true}).setInputFiles(uploads);
    await page.getByRole('button',{name:'Import files',exact:true}).click();
    await page.getByRole('dialog').getByRole('alert').filter({hasText:errorMessage}).waitFor();
    await page.getByRole('button',{name:'Close dialog',exact:true}).click();
    assert.equal(await page.locator('article input[type=checkbox]').count(),beforeRejectedBatch);
    assert.equal(await importedRecordCount(),beforeRejectedStorage);
  }
  checks.push('Oversized and excessive-count upload batches reject before parsing and leave library unchanged');
  for (const [fixture,error] of [['bad.md',/description/i],['unsafe.zip',/unsafe|traversal/i]]) {
    await openImport(page,fixture); await page.getByRole('dialog').getByRole('alert').filter({hasText:error}).waitFor();
    await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  }
  await openImport(page,'SKILL.md');
  await page.getByRole('checkbox',{name:'Select browser-local',exact:true}).waitFor();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('checkbox',{name:'Select browser-local',exact:true}).waitFor();
  await page.getByRole('button',{name:'Preview browser-local',exact:true}).click();
  assert.match(await page.getByLabel('SKILL.md complete source',{exact:true}).textContent(),/BROWSER_COMPLETE_SOURCE_END/);
  assert.equal(await page.evaluate(()=>window.__importExecuted),undefined);
  await page.getByRole('button',{name:'Edit skill',exact:true}).click();
  await page.getByLabel('Edit SKILL.md',{exact:true}).fill(localMarkdown+'\nSAVED_AFTER_EDIT');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await page.getByText('Changes saved in this browser.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Preview browser-local',exact:true}).click();
  assert.match(await page.getByLabel('SKILL.md complete source',{exact:true}).textContent(),/SAVED_AFTER_EDIT/);
  const staleTab=await context.newPage();
  await staleTab.goto(baseURL+'/lab/codex',{waitUntil:'domcontentloaded'});
  await staleTab.getByRole('button',{name:'Preview browser-local',exact:true}).click();
  await staleTab.getByRole('button',{name:'Edit skill',exact:true}).click();
  await staleTab.getByLabel('Edit SKILL.md',{exact:true}).fill(localMarkdown+'\nSTALE_EDIT');
  await page.getByRole('button',{name:'Edit skill',exact:true}).click();
  await page.getByLabel('Edit SKILL.md',{exact:true}).fill(localMarkdown+'\nCURRENT_EDIT');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await page.getByText('Changes saved in this browser.',{exact:true}).waitFor();
  await staleTab.getByRole('button',{name:'Save changes',exact:true}).click();
  await staleTab.getByRole('alert').filter({hasText:'This skill changed in another tab'}).waitFor();
  await staleTab.close();
  checks.push('Stale edit in a second tab is rejected without overwriting the newer record');
  await page.getByRole('button',{name:'Remove skill',exact:true}).click();
  await page.getByRole('dialog',{name:'Remove imported skill?',exact:true}).getByRole('button',{name:'Remove skill',exact:true}).click();
  await page.getByText('browser-local removed from this browser.',{exact:true}).waitFor();
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.getByRole('checkbox',{name:'Select browser-local',exact:true}).count(),0);
  checks.push('Invalid YAML and traversal ZIP rejected; local import, complete escaped preview, edit, remove persist across reload');
  await openImport(page,'complete.zip');
  await page.getByRole('checkbox',{name:'Select browser-package',exact:true}).check();
  await page.getByRole('button',{name:'Preview browser-package',exact:true}).click();
  await page.getByLabel('Package file',{exact:true}).selectOption('assets/sample.bin');
  await page.getByText('Binary supporting file',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  const [localDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download 1 Skill for OpenAI Codex',exact:true}).click()]);
  const localZip=path.join(artifacts,'local-support-files.zip'); await localDownload.saveAs(localZip);
  verifyZip(localZip,['.agents/skills/browser-package/SKILL.md','.agents/skills/browser-package/references/example.md','.agents/skills/browser-package/assets/sample.bin','.agents/skills/browser-package/scripts/example.js']);
  execFileSync('python',['-c',"import zipfile,sys\nwith zipfile.ZipFile(sys.argv[1]) as z: assert z.read('.agents/skills/browser-package/assets/sample.bin')==bytes([0,1,2,255])",localZip]);
  assert.equal(await page.evaluate(()=>window.__importExecuted),undefined);
  await context.setOffline(true);
  const [offlineDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download 1 Skill for OpenAI Codex',exact:true}).click()]);
  await offlineDownload.saveAs(path.join(artifacts,'offline-local.zip'));
  await context.setOffline(false);
  checks.push('Complete imported ZIP retains binary/reference/script files; scripts do not execute; local export works offline');
  await page.setViewportSize({width:390,height:844});
  const longName='a'.repeat(64),longCategory='c'.repeat(200);
  const longMarkdown=`---\nname: ${longName}\ndescription: A valid imported skill with long display labels.\ncategory: ${longCategory}\n---\n# Instructions\nInspect the task and report evidence.`;
  await page.getByRole('button',{name:'Import skill',exact:true}).click();
  await page.getByLabel('SKILL.md or ZIP archives',{exact:true}).setInputFiles({name:'SKILL.md',mimeType:'text/markdown',buffer:Buffer.from(longMarkdown)});
  await page.getByRole('button',{name:'Import files',exact:true}).click();
  const longCard=page.locator('article').filter({has:page.getByRole('checkbox',{name:'Select '+longName,exact:true})});
  await longCard.waitFor();await longCard.scrollIntoViewIfNeeded();
  const longBounds=await longCard.evaluate(card=>{const tag=card.querySelector('[class*=tag]');return{viewport:innerWidth,pageScroll:document.documentElement.scrollWidth,cardClient:card.clientWidth,cardScroll:card.scrollWidth,tagRight:tag.getBoundingClientRect().right,headingClient:card.querySelector('h3').clientWidth,headingScroll:card.querySelector('h3').scrollWidth}});
  assert.ok(longBounds.pageScroll<=longBounds.viewport,JSON.stringify(longBounds));
  assert.ok(longBounds.cardScroll<=longBounds.cardClient,JSON.stringify(longBounds));
  assert.ok(longBounds.tagRight<=longBounds.viewport,JSON.stringify(longBounds));
  assert.ok(longBounds.headingScroll<=longBounds.headingClient,JSON.stringify(longBounds));
  await page.screenshot({path:path.join(artifacts,'long-import-name-card.png'),animations:'disabled'});
  await page.getByRole('button',{name:'Preview '+longName,exact:true}).click();
  const longDialog=page.getByRole('dialog',{name:longName,exact:true});
  const dialogBounds=await longDialog.evaluate(dialog=>{const close=dialog.querySelector('button[aria-label="Close dialog"]');return{client:dialog.clientWidth,scroll:dialog.scrollWidth,right:dialog.getBoundingClientRect().right,closeRight:close.getBoundingClientRect().right}});
  assert.ok(dialogBounds.scroll<=dialogBounds.client,JSON.stringify(dialogBounds));
  assert.ok(dialogBounds.closeRight<=dialogBounds.right,JSON.stringify(dialogBounds));
  assert.equal(await page.getByLabel('SKILL.md complete source',{exact:true}).textContent(),longMarkdown);
  await page.screenshot({path:path.join(artifacts,'long-import-name-dialog.png'),animations:'disabled'});
  await page.getByRole('button',{name:'Remove skill',exact:true}).click();
  await page.getByRole('dialog',{name:'Remove imported skill?',exact:true}).getByRole('button',{name:'Remove skill',exact:true}).click();
  await page.getByText(longName+' removed from this browser.',{exact:true}).waitFor();
  await page.setViewportSize({width:1440,height:1000});
  checks.push('Accepted unbroken64-character skill names and200-character categories stay inside390px cards and dialogs without clipping controls');
  await page.route('https://api.github.com/**',route=>route.abort('failed'));
  await page.getByRole('button',{name:'Import skill',exact:true}).click();
  await page.getByLabel('Public GitHub URL',{exact:true}).fill('https://github.com/darkweb19/skills');
  await page.getByRole('button',{name:'Import from GitHub',exact:true}).click();
  await page.getByRole('dialog').getByRole('alert').filter({hasText:/Could not reach public GitHub/}).waitFor();
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.unroute('https://api.github.com/**');
  checks.push('GitHub network failure offers actionable ZIP fallback');
  if(process.env.TOOLKIT_LIVE_GITHUB==='1') {
    await page.getByRole('button',{name:'Import skill',exact:true}).click();
    await page.getByLabel('Public GitHub URL',{exact:true}).fill('https://github.com/darkweb19/skills/tree/main/self-eval');
    await page.getByRole('button',{name:'Import from GitHub',exact:true}).click();
    await page.getByRole('checkbox',{name:'Select self-eval',exact:true}).waitFor({timeout:60000});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.getByRole('checkbox',{name:'Select self-eval',exact:true}).waitFor();
    const clear=page.getByRole('button',{name:'Clear selection',exact:true}); if(await clear.isEnabled()) await clear.click();
    await page.getByRole('checkbox',{name:'Select self-eval',exact:true}).check();
    const source=await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('personal-skills-toolkit',1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;const q=db.transaction('imported-skills').objectStore('imported-skills').get('github:self-eval');q.onsuccess=()=>{db.close();resolve(q.result)};q.onerror=()=>reject(q.error)}}));
    const pinned=/^https:\/\/github\.com\/darkweb19\/skills\/tree\/([a-f0-9]{40})\/self-eval$/.exec(source.source.url);
    assert.ok(pinned,'Live GitHub import is pinned to an immutable commit');
    const [githubDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download 1 Skill for OpenAI Codex',exact:true}).click()]);
    const githubZip=path.join(artifacts,'live-github-self-eval.zip');await githubDownload.saveAs(githubZip);
    verifyZip(githubZip,source.files.map(file=>'.agents/skills/self-eval/'+file.path));
    const trustedMarkdown=execFileSync('curl',['--fail','--silent','--show-error','--max-time','30',`https://raw.githubusercontent.com/darkweb19/skills/${pinned[1]}/self-eval/SKILL.md`]);
    const independent=path.join(fixtures,'live-self-eval.md');fs.writeFileSync(independent,trustedMarkdown);
    execFileSync('python',['-c',"import zipfile,sys,pathlib\nwith zipfile.ZipFile(sys.argv[1]) as z: assert z.read('.agents/skills/self-eval/SKILL.md')==pathlib.Path(sys.argv[2]).read_bytes()",githubZip,independent]);
    checks.push('Real public GitHub folder imports via verified TLS, persists reload, pins commit, and exports original source bytes');
  }
  await page.screenshot({path:path.join(artifacts,'toolkit-desktop.png'),fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto(baseURL+'/lab/codex',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:/Skills Toolkit/}).waitFor();
  await page.getByRole('button',{name:'Toggle menu',exact:true}).click();
  await page.locator('#mobile-menu').getByRole('link',{name:'Lab',exact:true}).waitFor();
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#mobile-menu').count(),0);
  assert.equal(await page.getByRole('button',{name:'Toggle menu',exact:true}).getAttribute('aria-expanded'),'false');
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(width.scroll<=width.viewport,JSON.stringify(width));
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(()=>{const node=document.activeElement;return node&&getComputedStyle(node).outlineStyle!=='none';}));
  await page.screenshot({path:path.join(artifacts,'toolkit-mobile.png'),fullPage:true,animations:'disabled'});
  await page.goto(baseURL+'/blogs',{waitUntil:'domcontentloaded'});
  assert.match(await page.title(),/Blog/);
  await page.screenshot({path:path.join(artifacts,'blogs-mobile.png'),fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:path.join(artifacts,'blogs-desktop.png'),fullPage:true,animations:'disabled'});
  checks.push('390px layout has no horizontal overflow; mobile menu closes/removes links with Escape; keyboard focus visible; sibling blog renders');
  await page.goto(baseURL+'/lab/codex',{waitUntil:'domcontentloaded'});
  await page.getByRole('checkbox',{name:'Select browser-package',exact:true}).waitFor();
  await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('personal-skills-toolkit',1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;const t=db.transaction('imported-skills','readwrite');t.objectStore('imported-skills').put({id:'local:malformed',source:{kind:'local',label:'invalid'}});t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>reject(t.error)}}));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('alert').filter({hasText:/Saved skill|invalid|Browser storage/}).waitFor();
  checks.push('Malformed persisted storage produces visible recoverable error instead of discarding records');
}
