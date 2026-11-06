/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser acceptance uses host tooling. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
const baseURL = process.env.TOOLKIT_BASE_URL || 'http://127.0.0.1:3001';
const artifacts = process.env.POLISH_ARTIFACTS || path.join(process.cwd(), 'work/polish');
const routes = ['/', '/blogs', '/blogs/reverse-proxy-ssrf-cannon', '/blogs/supabase-unlimited-free', '/lab/codex', '/not-a-published-route'];
(async () => {
 fs.mkdirSync(artifacts, {recursive:true});
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 const context = await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
 const page = await context.newPage();
 page.setDefaultTimeout(15000);
 const checks=[], errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try {
  for(const route of routes) {
   const response=await page.goto(baseURL+route,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(), route.includes('not-a-published')?404:200);
   for(const width of [320,375,768,1440]) {
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} fits ${width}px`);
   }
   const light=await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor);
   await page.emulateMedia({colorScheme:'dark'});
   assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),light,`${route} retains authored light appearance`);
   assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).colorScheme),'light');
   await page.emulateMedia({colorScheme:'light'});
  }
  checks.push('Home, writing, both articles, Lab and 404 fit 320/375/768/1440px and retain coherent light appearance under both OS preferences');
  await page.goto(baseURL);
  await page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link',{name:'Projects',exact:true}).click();
  await page.waitForFunction(()=>{const h=document.querySelector('.site-header').getBoundingClientRect();const s=document.querySelector('#projects').getBoundingClientRect();return h.top===0&&s.top>=h.bottom&&s.top<h.bottom+100;});
  checks.push('Sticky header stays at the viewport top and section navigation leaves the heading visible');
  for(const selector of ['.about-disclosure','.career-disclosure','.education-disclosure','.project-facts']) {
   const detail=page.locator(selector).first();
   const summary=detail.locator(':scope > summary');
   await summary.focus(); await page.keyboard.press('Enter');
   assert.equal(await detail.evaluate(e=>e.open),true,selector+' opens with Enter');
   await page.keyboard.press('Space');
   assert.equal(await detail.evaluate(e=>e.open),false,selector+' closes with Space');
   const focus=await summary.evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));
   assert.equal(focus.style,'solid'); assert.equal(focus.width,'2px');
  }
  checks.push('About, experience, education and project disclosures use native Enter/Space behavior and visible keyboard focus');
  const center=page.locator('.workspace-center');
  const colors=await center.evaluate(e=>({color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));
  assert.notEqual(colors.color,colors.bg,'Outpost diagram label is readable');
  const project=page.getByRole('button',{name:'Preview Outpost',exact:true});
  await project.focus();
  assert.equal(await project.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
  assert.equal(await project.locator('.mini-browser').evaluate(e=>getComputedStyle(e).transform),'none','Reduced-motion project focus remains static');
  await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog',{name:'Outpost',exact:true});await dialog.waitFor();
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
  assert.equal(await project.evaluate(e=>e===document.activeElement),true);
  checks.push('Project controls expose focus, reduced motion stays static, the diagram has contrast and modal close restores focus');
  for(const viewport of [{width:320,height:360},{width:568,height:320}]) {
   await page.setViewportSize(viewport);
   await page.getByRole('button',{name:'Preview Outpost',exact:true}).click();
   const shortDialog=page.getByRole('dialog',{name:'Outpost',exact:true});await shortDialog.waitFor();
   assert.ok(await shortDialog.locator('.browser-content').evaluate(e=>e.getBoundingClientRect().height)>180,'Short viewer keeps useful content');
   await shortDialog.evaluate(e=>e.scrollTop=e.scrollHeight);
   const close=await shortDialog.getByRole('button',{name:'Close project preview'}).boundingBox();
   assert.ok(close.y>=0 && close.y+close.height<=viewport.height,'Close stays visible while short viewer scrolls');
   await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:1440,height:900});
  checks.push('Short project viewers scroll complete content while keeping the close control visible');
  const copy=page.getByRole('button',{name:'Copy email',exact:true});
  await copy.scrollIntoViewIfNeeded();const before=await copy.boundingBox();await copy.click();
  await page.getByRole('status').filter({hasText:'Email copied'}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Copied',exact:true}).boundingBox().then(b=>b.width),before.width);
  await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied fixture');};});
  await page.getByRole('button',{name:'Copied',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Copy unavailable. Use the email link above.'}).waitFor();
  assert.equal(await page.getByRole('link',{name:'hi@sujanshrestha.ca',exact:true}).getAttribute('href'),'mailto:hi@sujanshrestha.ca');
  checks.push('Contact copy success preserves button geometry and clipboard denial leaves a persistent actionable email fallback');
  await page.setViewportSize({width:720,height:450});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'200% equivalent reflow fits');
  await page.emulateMedia({forcedColors:'active'});
  await page.keyboard.press('Tab');
  await page.getByRole('button',{name:'Copy email',exact:true}).focus();
  assert.equal(await page.getByRole('button',{name:'Copy email',exact:true}).evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
  await page.emulateMedia({forcedColors:'none'});
  checks.push('Short/zoom-equivalent layout and forced-colors focus remain usable');
  for(const route of routes.slice(0,5)) {
   await page.setViewportSize({width:375,height:844});await page.goto(baseURL+route);
   await page.addScriptTag({path:'/workspace/qa-tools/node_modules/axe-core/axe.min.js'});
   const results=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
   assert.deepEqual(results,[],route+' narrow axe scan');
   await page.screenshot({path:path.join(artifacts,`polish-${route==='/'?'home':route.replaceAll('/','-')}-375.png`),fullPage:true});
  }
  checks.push('Axe WCAG A/AA scans report zero violations on all five narrow public routes');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(artifacts,'portfolio-polish-results.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
 } catch(error) {await page.screenshot({path:path.join(artifacts,'portfolio-polish-failure.png'),fullPage:true}).catch(()=>{});throw error;}
 finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
