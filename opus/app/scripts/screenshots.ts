/**
 * npm run screenshots [-- /route …]
 * Captures pleine page 1440 px et 390 px (+ méga-menu et menu mobile ouverts) du build servi par
 * `vite preview` (http://127.0.0.1:4173, à lancer avant), pour comparaison avec design/mockups/screenshots.
 * Sortie : screenshots/<nom>-<desktop|mobile>.png (dossier ignoré par git).
 */
import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { APP_DIR } from "./lib/paths.ts";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const OUT = path.join(APP_DIR, "screenshots");
const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/particuliers/je-choisis-mon-offre/electricite?tab=tarifs"];

const nameOf = (route: string) =>
  route.replace(/^\/|\?tab=/g, (m) => (m === "/" ? "" : "--")).replace(/\//g, "_") || "accueil";

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  // Force le chargement des images paresseuses avant la capture pleine page.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 300)); // header collant revenu à l'état initial
  });
  await page.waitForLoadState("networkidle");
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const [label, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  for (const route of routes) {
    await page.goto(BASE + route);
    await settle(page);
    await page.screenshot({
      path: path.join(OUT, `${nameOf(route)}-${label}.png`),
      fullPage: true,
    });
  }
  await page.goto(BASE + "/");
  await settle(page);
  if (label === "desktop") {
    await page.getByRole("button", { name: "Particuliers" }).click();
    await page.waitForTimeout(400); // fin de l'animation d'ouverture
    await page.screenshot({ path: path.join(OUT, `megamenu-desktop.png`) });
  } else {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Particuliers" }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `menu-mobile.png`) });
  }
  await page.close();
}
await browser.close();
console.log(`Captures écrites dans ${path.relative(process.cwd(), OUT)}/`);
