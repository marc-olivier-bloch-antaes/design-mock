import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page } from "@playwright/test";
import type { Navigation, NavNode, PageSummary } from "../src/content/types";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/content");

export const manifest = JSON.parse(
  fs.readFileSync(path.join(contentDir, "manifest.json"), "utf8"),
) as PageSummary[];
export const navigation = JSON.parse(
  fs.readFileSync(path.join(contentDir, "navigation.json"), "utf8"),
) as Navigation;

export function flattenNav(nodes: NavNode[] = navigation.mainMenu): NavNode[] {
  return nodes.flatMap((n) => [n, ...flattenNav(n.children)]);
}

/**
 * Collecte les erreurs console et les exceptions non interceptées d'une page.
 * À appeler AVANT `page.goto`.
 */
export function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Aucun défilement horizontal de la page (tolérance 1 px pour les arrondis). */
export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `débordement horizontal : ${scrollWidth}px > ${clientWidth}px`,
  ).toBeLessThanOrEqual(clientWidth + 1);
}
