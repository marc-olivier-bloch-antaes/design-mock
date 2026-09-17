/* Captures des maquettes (Playwright/Chromium du dossier crawl).
   Prérequis : servir /home/mob/sil/opus en HTTP (les polices woff2 sont bloquées en file://) :
     cd /home/mob/sil/opus && python3 -m http.server 8765 --bind 127.0.0.1
   Usage : NODE_PATH=../crawl/node_modules node scripts/screenshots.js            (jeu complet)
           NODE_PATH=... node scripts/screenshots.js '[{"file":"accueil.html","w":390,"out":"x.png"}]'
   Affiche aussi le débordement horizontal détecté (scrollWidth vs clientWidth). */
const { chromium } = require('playwright');
const path = require('path');
const OUT = require('path').resolve(__dirname, '../mockups/screenshots');
const DEFAULT = [
  { file: 'accueil.html', w: 1440, out: 'accueil-desktop.png' },
  { file: 'accueil.html', w: 390, out: 'accueil-mobile.png' },
  { file: 'accueil.html', q: '?menu=particuliers', w: 1440, h: 900, out: 'accueil-megamenu-desktop.png', viewportOnly: true },
  { file: 'accueil.html', q: '?drawer=particuliers', w: 390, h: 844, out: 'accueil-menu-mobile.png', viewportOnly: true },
  { file: 'produit-onglets.html', q: '?tab=tarifs', w: 1440, out: 'produit-onglets-desktop.png' },
  { file: 'produit-onglets.html', q: '?tab=tarifs', w: 390, out: 'produit-onglets-mobile.png' },
  { file: 'produit-onglets.html', w: 1440, out: 'produit-onglets-produits-desktop.png' },
  { file: 'produit-onglets.html', w: 390, out: 'produit-onglets-produits-mobile.png' },
  { file: 'produit-onglets.html', q: '?tab=securite', w: 1440, out: 'produit-onglets-securite-desktop.png' },
  { file: 'produit-onglets.html', q: '?tab=securite', w: 390, out: 'produit-onglets-securite-mobile.png' },
  { file: 'produit-onglets.html', q: '?tab=faq', w: 1440, out: 'produit-onglets-faq-desktop.png' },
  { file: 'produit-onglets.html', q: '?tab=faq', w: 390, out: 'produit-onglets-faq-mobile.png' },
];
const jobs = process.argv[2] ? JSON.parse(process.argv[2]) : DEFAULT;
(async () => {
  const b = await chromium.launch();
  for (const j of jobs) {
    const w = j.w; const ctx = await b.newContext({ viewport: { width: w, height: j.h || (w < 600 ? 844 : 900) }, deviceScaleFactor: j.dpr || 1, hasTouch: w < 600, isMobile: w < 600 });
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/design/mockups/' + j.file + (j.q || ''), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      wide: Array.from(document.querySelectorAll('body *')).filter(e => { const r = e.getBoundingClientRect(); return r.right > document.documentElement.clientWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.carousel__track,.tablist,.table-scroll,[hidden],.keyfigures__deco,.cta-band__deco'); }).slice(0, 5).map(e => e.className + ' ' + Math.round(e.getBoundingClientRect().right)) }));
    await p.screenshot({ path: path.join(OUT, j.out), fullPage: !j.viewportOnly });
    console.log(j.out, JSON.stringify(ov), errs.join(' | '));
    await ctx.close();
  }
  await b.close();
})();
