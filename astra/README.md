# SiL — prototype de refonte

Proof of concept marketing en français : une interface lumineuse et contemporaine pour les Services industriels de Lausanne, construite avec React, TypeScript et Vite. La direction visuelle conserve le logo officiel et son rouge #E30613.

## Lancer le prototype

Node.js 20.19+ ou une version LTS plus récente est nécessaire.

```bash
npm ci
npm run dev -- --host 0.0.0.0
```

Ouvrir l’URL affichée par Vite (habituellement http://localhost:5173).

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

Le build vérifie TypeScript et génère `dist/`. Pour publier cette application monopage, configurer l’hébergement pour servir `index.html` sur les routes internes.

## Périmètre

Les pages présentent les offres, les démarches et les activités des SiL. Les sources publiques, les logos et les photos ont été collectés depuis [la rubrique officielle SiL](https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels). Les espaces authentifiés, paiements et soumissions de formulaires restent sur les services officiels. Aucune donnée personnelle n’est enregistrée par ce prototype.

Les textes ont été réorganisés pour la démonstration : ce prototype ne remplace pas les informations contractuelles et les tarifs du site officiel. Les archives sont un instantané du 16 septembre 2026. Certains onglets de la source chargent leurs détails séparément : leur limite est documentée dans le rapport de collecte.

## Sources et conception

- `research/sources/` : 18 pages HTML publiques originales.
- `research/content.json` : contenu structuré, URLs originales et provenance des images.
- `research/crawl-report.md` : périmètre et limites de la collecte.
- `research/design.md` : direction UX, identité et principes responsive.
- `research/editorial-review.md` : points factuels contrôlés lors de l’intégration.
- `public/assets/` : logos et photos servis localement, avec crédits dans le manifeste.

Les médias conservent les droits et crédits de leurs auteurs d’origine. Leur présence sert cette démonstration interne ; aucune licence nouvelle n’est créée par le prototype.

## Code et validation

`src/routes.ts` décrit les routes. `src/App.tsx` assemble la navigation et les gabarits ; les autres fichiers de `src/` contiennent les contenus et styles. Les choix techniques sont documentés dans `research/architecture.md`.

```bash
npx playwright install chromium
npm test
```

Playwright vérifie les parcours et le rendu dans Chromium. Voir `research/test-report.md` et `research/screenshots/` pour le résultat et les captures de la validation.
