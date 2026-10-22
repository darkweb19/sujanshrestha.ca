/* eslint-disable @typescript-eslint/no-require-imports -- Optional host-supplied QA tools. */
// Run against an already started server. No application files or remote state change.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
const baseURL = process.env.PORTFOLIO_BASE_URL || 'http://localhost:3000';
const artifacts = process.env.PORTFOLIO_ARTIFACTS || '/tmp/portfolio-measurements';
const axePath = process.env.AXE_MODULE || '/workspace/qa-tools/node_modules/axe-core/axe.min.js';
const routes = (process.env.PORTFOLIO_ROUTES || '/,/blogs,/blogs/reverse-proxy-ssrf-cannon,/blogs/supabase-unlimited-free,/lab/codex').split(',');

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const report = { timestamp: new Date().toISOString(), baseURL, mode: process.env.PORTFOLIO_MODE || 'unspecified', browser: browser.version(), note: 'Single synthetic runs; LCP/CLS and event durations are lab observations, not field p75 Core Web Vitals or a WCAG compliance certification.', measurements: [] };
  try {
    for (const width of [375, 768, 1440]) {
      for (const route of routes) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(() => {
          window.__portfolioMetrics = { lcp: null, cls: 0, interactions: [] };
          new PerformanceObserver(list => { for (const item of list.getEntries()) window.__portfolioMetrics.lcp = item.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver(list => { for (const item of list.getEntries()) if (!item.hadRecentInput) window.__portfolioMetrics.cls += item.value; }).observe({ type: 'layout-shift', buffered: true });
          new PerformanceObserver(list => { for (const item of list.getEntries()) if (item.interactionId) window.__portfolioMetrics.interactions.push(item.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
        });
        const started = performance.now();
        const response = await page.goto(baseURL + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.locator('h1').first().waitFor({ timeout: 60000 });
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode().catch(() => {})));
        });
        // Let paint observers deliver after resources have settled without waiting on dev HMR/network-idle.
        await page.waitForTimeout(700);
        const slug = route === '/' ? 'home' : route.replaceAll('/', '-').slice(1);
        await page.screenshot({ path: path.join(artifacts, `${slug}-${width}.png`), fullPage: true });
        if (width === 375) {
          const menu = page.getByRole('button', { name: 'Toggle menu', exact: true });
          if (await menu.count()) { await menu.click(); await page.keyboard.press('Escape'); await page.waitForTimeout(100); }
        }
        const details = await page.evaluate(() => ({
          title: document.title,
          h1: [...document.querySelectorAll('h1')].map(node => node.textContent),
          canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href') || null,
          description: document.querySelector('meta[name=description]')?.getAttribute('content') || null,
          robots: document.querySelector('meta[name=robots]')?.getAttribute('content') || null,
          overflow: document.documentElement.scrollWidth > innerWidth,
          metrics: window.__portfolioMetrics,
          navigation: performance.getEntriesByType('navigation').map(item => ({ ttfb: item.responseStart, domContentLoaded: item.domContentLoadedEventEnd, transferSize: item.transferSize })),
          js: performance.getEntriesByType('resource').filter(item => item.initiatorType === 'script').reduce((sum, item) => sum + item.transferSize, 0),
          structuredData: [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => { try { return JSON.parse(node.textContent); } catch { return { invalid: true }; } }),
        }));
        let accessibility = { unavailable: 'Set AXE_MODULE to a verified local axe.min.js to run automated accessibility checks.' };
        if (fs.existsSync(axePath)) {
          await page.addScriptTag({ path: axePath });
          accessibility = await page.evaluate(async () => {
            const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
            return { passes: result.passes.length, incomplete: result.incomplete.length, violations: result.violations.map(({ id, impact, description, nodes }) => ({ id, impact, description, nodes: nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) };
          });
        }
        report.measurements.push({ route, width, status: response.status(), elapsedMs: Math.round(performance.now() - started), ...details, errors, accessibility });
        fs.writeFileSync(path.join(artifacts, 'measurements.json'), JSON.stringify(report, null, 2));
        console.log(`${route} @ ${width}: HTTP ${response.status()}, overflow=${details.overflow}, axe=${accessibility.violations?.length ?? 'unavailable'}`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
  if (process.env.LIGHTHOUSE_CLI) {
    execFileSync(process.execPath, [process.env.LIGHTHOUSE_CLI, baseURL, '--quiet', '--chrome-flags=--headless --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo', '--output=json', `--output-path=${path.join(artifacts, 'lighthouse-mobile.json')}`], { stdio: 'inherit', env: { ...process.env, CHROME_PATH: process.env.CHROMIUM_PATH || '/usr/bin/chromium' } });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
