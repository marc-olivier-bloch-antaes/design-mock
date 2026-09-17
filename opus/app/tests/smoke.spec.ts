/**
 * Smoke test : chaque route s'affiche sans erreur, sur desktop (1440) et mobile (390).
 * Vérifie : statut HTTP OK, exactement un h1 visible, aucune erreur console, aucun débordement horizontal.
 * Le testeur enrichira (a11y axe, navigation clavier, régression visuelle…).
 */
import { expect, test, type Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  flattenNav,
  manifest,
  navigation,
  trackConsoleErrors,
} from "./helpers";

async function checkRoute(page: Page, url: string) {
  const errors = trackConsoleErrors(page);
  const response = await page.goto(url);
  expect(response?.ok(), `statut HTTP de ${url}`).toBeTruthy();

  const h1 = page.locator("main h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toBeVisible();
  await expect(h1).not.toBeEmpty();
  await expect(page).toHaveTitle(/Services industriels de Lausanne/);

  // Laisser les images paresseuses / polices se charger pour capter d'éventuelles 404.
  await page.waitForLoadState("networkidle");
  await expectNoHorizontalOverflow(page);
  expect(errors, `erreurs console sur ${url}`).toEqual([]);
}

test.describe("pages du manifeste", () => {
  for (const p of manifest) {
    test(`${p.slug} (${p.path})`, async ({ page }) => {
      await checkRoute(page, p.path);
    });
  }
});

test.describe("onglets (?tab=)", () => {
  for (const p of manifest.filter((m) => m.tabs.length > 0)) {
    for (const tab of p.tabs) {
      test(`${p.slug} ?tab=${tab.id}`, async ({ page }) => {
        await checkRoute(page, `${p.path}?tab=${tab.id}`);
        await expect(page.getByRole("tab", { name: tab.label, exact: true })).toHaveAttribute(
          "aria-selected",
          "true",
        );
      });
    }
  }
});

test.describe("routes générées depuis le menu", () => {
  const rubriques = navigation.mainMenu;
  const outOfScope = flattenNav().filter((n) => n.kind === "out-of-scope");

  for (const node of rubriques) {
    test(`rubrique ${node.path}`, async ({ page }) => {
      await checkRoute(page, node.path);
    });
  }

  for (const node of outOfScope) {
    test(`hors périmètre ${node.path}`, async ({ page }) => {
      await checkRoute(page, node.path);
      await expect(
        page.getByRole("link", { name: /Voir la page actuelle sur lausanne\.ch/ }),
      ).toHaveAttribute("href", node.url);
    });
  }

  for (const r of navigation.redirects) {
    test(`alias ${r.from} → ${r.to}`, async ({ page }) => {
      await page.goto(r.from);
      await expect(page).toHaveURL(new RegExp(`${r.to}$`));
    });
  }
});

test("404", async ({ page }) => {
  await checkRoute(page, "/cette-page-n-existe-pas");
  await expect(page.locator("main h1")).toHaveText("Page introuvable");
});
