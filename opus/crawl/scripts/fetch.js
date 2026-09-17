// Batch fetch + render SiL pages with Playwright: dismiss cookie banner,
// click through every content tab so its content is AJAX-loaded, then save
// the fully rendered HTML plus desktop/mobile full-page screenshots.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = '/home/mob/sil/opus/crawl';
const BASE = 'https://www.lausanne.ch';
const UA = 'SIL-POC-Crawler/1.0 (+https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels)';
const PAUSE_MS = 1000;

const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/pages.config.json'), 'utf8'));

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function dismissCookies(page) {
  const selectors = [
    'button:has-text("Accepter")',
    'button:has-text("Tout accepter")',
    '#onetrust-accept-btn-handler',
    '.cookie-consent button',
  ];
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count() > 0 && await loc.isVisible({ timeout: 1000 }).catch(() => false)) {
        await loc.click({ timeout: 2000 });
        await page.waitForTimeout(300);
        return;
      }
    } catch (e) { /* ignore */ }
  }
}

async function clickAllTabs(page) {
  const seen = new Set();
  // loop in case new tab sets appear (unlikely) - fixed pass is enough here
  const tabs = await page.locator('.contenu-structure__comp__tab[data-ref]').all();
  for (const t of tabs) {
    let ref;
    try { ref = await t.getAttribute('data-ref'); } catch (e) { continue; }
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    try {
      await t.scrollIntoViewIfNeeded({ timeout: 3000 });
      await t.click({ timeout: 5000, force: true });
      await page.waitForTimeout(900);
    } catch (e) {
      console.log('  ! tab click failed', ref, e.message);
    }
  }
  // wait for any residual pre-loading-icon to resolve
  try {
    await page.waitForFunction(() => document.querySelectorAll('.pre-loading-icon').length === 0, { timeout: 5000 });
  } catch (e) { /* best effort */ }
}

async function main() {
  const browser = await chromium.launch();
  const results = [];
  for (const p of pages) {
    const url = BASE + p.path;
    console.log('=== ', p.slug, url);
    const context = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await dismissCookies(page);
      await page.waitForTimeout(500);
      await clickAllTabs(page);
      await page.waitForTimeout(400);

      const finalUrl = page.url();
      const html = await page.content();
      fs.writeFileSync(path.join(ROOT, 'raw', p.slug + '.html'), html);

      // desktop screenshot (already 1440 viewport)
      await page.screenshot({ path: path.join(ROOT, 'screenshots', p.slug + '-desktop.png'), fullPage: true });

      // mobile screenshot: new context/page at 390 width
      await context.close();
      const mctx = await browser.newContext({ userAgent: UA, viewport: { width: 390, height: 844 } });
      const mpage = await mctx.newPage();
      await mpage.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await dismissCookies(mpage);
      await mpage.waitForTimeout(500);
      await clickAllTabs(mpage);
      await mpage.waitForTimeout(400);
      await mpage.screenshot({ path: path.join(ROOT, 'screenshots', p.slug + '-mobile.png'), fullPage: true });
      await mctx.close();

      results.push({ slug: p.slug, url: finalUrl, ok: true });
      console.log('  ok ->', finalUrl);
    } catch (e) {
      console.log('  ERROR', e.message);
      results.push({ slug: p.slug, url, ok: false, error: e.message });
      try { await context.close(); } catch (e2) {}
    }
    await sleep(PAUSE_MS);
  }
  await browser.close();
  fs.writeFileSync(path.join(ROOT, 'scripts/fetch_results.json'), JSON.stringify(results, null, 2));
  console.log('DONE', results.filter(r => r.ok).length, '/', results.length);
}

main();
