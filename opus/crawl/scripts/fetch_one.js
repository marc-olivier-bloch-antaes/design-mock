const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = '/home/mob/sil/opus/crawl';
const UA = 'SIL-POC-Crawler/1.0 (+https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels)';

async function dismissCookies(page) {
  const selectors = ['button:has-text("Accepter")','button:has-text("Tout accepter")','#onetrust-accept-btn-handler'];
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count() > 0 && await loc.isVisible({ timeout: 1000 }).catch(() => false)) {
        await loc.click({ timeout: 2000 }); await page.waitForTimeout(300); return;
      }
    } catch (e) {}
  }
}
async function clickAllTabs(page) {
  const seen = new Set();
  const tabs = await page.locator('.contenu-structure__comp__tab[data-ref]').all();
  for (const t of tabs) {
    let ref; try { ref = await t.getAttribute('data-ref'); } catch (e) { continue; }
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    try { await t.scrollIntoViewIfNeeded({ timeout: 3000 }); await t.click({ timeout: 5000, force: true }); await page.waitForTimeout(900); } catch (e) {}
  }
  try { await page.waitForFunction(() => document.querySelectorAll('.pre-loading-icon').length === 0, { timeout: 5000 }); } catch (e) {}
}

async function main() {
  const slug = process.argv[2];
  const url = process.argv[3];
  const browser = await chromium.launch();
  const context = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await dismissCookies(page);
  await page.waitForTimeout(500);
  await clickAllTabs(page);
  await page.waitForTimeout(400);
  console.log('final url:', page.url());
  fs.writeFileSync(path.join(ROOT, 'raw', slug + '.html'), await page.content());
  await page.screenshot({ path: path.join(ROOT, 'screenshots', slug + '-desktop.png'), fullPage: true });
  await context.close();
  const mctx = await browser.newContext({ userAgent: UA, viewport: { width: 390, height: 844 } });
  const mpage = await mctx.newPage();
  await mpage.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await dismissCookies(mpage);
  await mpage.waitForTimeout(500);
  await clickAllTabs(mpage);
  await mpage.waitForTimeout(400);
  await mpage.screenshot({ path: path.join(ROOT, 'screenshots', slug + '-mobile.png'), fullPage: true });
  await browser.close();
}
main();
