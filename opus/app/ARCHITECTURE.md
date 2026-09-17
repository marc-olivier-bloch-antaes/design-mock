# SiL — Architecture de l'app React (POC refonte)

Socle Vite + React 19 + TypeScript strict + Tailwind CSS v4 + React Router 7 pour la refonte mobile-first du site des Services industriels de Lausanne. Seul besoin fonctionnel : naviguer de page en page. Ce document fixe les **conventions** ; le plan de travail page par page est dans [`MIGRATION.md`](./MIGRATION.md). La charte fait foi : [`../design/DESIGN.md`](../design/DESIGN.md).

## 1. Commandes

| Commande                                  | Rôle                                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Serveur de développement (http://localhost:5173)                                                    |
| `npm run build`                           | `tsc -b` puis build de production dans `dist/`                                                      |
| `npm run preview`                         | Sert `dist/` (http://127.0.0.1:4173) — base des tests E2E                                           |
| `npm run lint` · `npm run typecheck`      | ESLint (0 erreur exigée) · TypeScript sans émission                                                 |
| `npm run format` · `npm run format:check` | Prettier (+ tri des classes Tailwind)                                                               |
| `npm run audit-content`                   | Imprime la forme **observée** du crawl et la compare au contrat de types                            |
| `npm run import-content`                  | Réimporte crawl + design dans l'app (voir § 3). Idempotent, incrémental (~3 s ; ~2 min la 1re fois) |
| `npm run test:smoke`                      | Smoke test Playwright (build + preview automatiques ; `SKIP_BUILD=1` pour réutiliser `dist/`)       |
| `npm run test:e2e`                        | Tous les tests Playwright                                                                           |
| `npm run screenshots [-- /route …]`       | Captures 1440/390 + méga-menu + menu mobile dans `screenshots/` (preview lancé au préalable)        |

Node ≥ 20.19. Versions : React Router **7** (la v8 exige Node 22), TypeScript **6.0** (typescript-eslint ne supporte pas encore TS 7), `@playwright/test` épinglé en **1.63.0** (Chromium déjà en cache).

## 2. Arborescence

```
app/
├── index.html                 lang="fr-CH", favicon
├── scripts/                   outillage Node (exécuté par tsx, jamais embarqué)
│   ├── import-content.ts      pipeline crawl/design → src/content, public/images, src/styles…
│   ├── audit-content.ts       audit de forme du crawl
│   ├── screenshots.ts         captures de contrôle visuel
│   └── lib/
│       ├── crawl-contract.ts  contrat du crawl BRUT (types/champs/énumérations attendus)
│       ├── infer-shape.ts     inférence de forme (rapport d'audit)
│       ├── audit.ts           parcours récursif du crawl
│       ├── normalize.ts       normalisations systématiques N1–N15 (§ 3.2)
│       ├── images.ts          optimisation sharp (AVIF + WebP, ≤ 1920 px)
│       └── paths.ts           chemins d'entrée/sortie
├── public/
│   ├── favicon.png
│   └── images/                GÉNÉRÉ — variantes <id>-<largeur>.avif|webp (+ SVG)
├── src/
│   ├── main.tsx               createBrowserRouter + RouterProvider
│   ├── routes.tsx             table des routes générée depuis le contenu
│   ├── content/
│   │   ├── types.ts           ★ modèle typé : Block (union discriminée), Page, Tab, NavNode, ImageAsset…
│   │   ├── index.ts           accès typé : manifest, navigation, images, loadPage(), findNavTrail()
│   │   ├── manifest.json      GÉNÉRÉ — résumé des 20 pages (route, titre, onglets, types de blocs)
│   │   ├── navigation.json    GÉNÉRÉ — menu 3 niveaux normalisé + alias
│   │   ├── images.json        GÉNÉRÉ — manifeste d'images (dimensions, srcset, fit)
│   │   └── pages/<slug>.json  GÉNÉRÉ — une page normalisée (chargée à la demande)
│   ├── config/site.ts         données du chrome absentes du crawl (footer, méga-menu, téléphone…)
│   ├── lib/                   utilitaires sans JSX : links, cn, universe, tabIcons, sections, useMediaQuery
│   ├── components/ui/         primitives transverses du design system (§ 6)
│   ├── layout/                chrome global : RootLayout, UtilityBar, Header, MegaMenu, MobileDrawer,
│   │                          Breadcrumb, PageHero, Footer, SkipLink, PageMeta
│   ├── blocks/                moteur de rendu de blocs (§ 7)
│   │   ├── BlockRenderer.tsx
│   │   ├── registry.ts        type → composant (exhaustif, vérifié par TS)
│   │   ├── types.ts           BlockProps, BlockContext, BlockRegistry
│   │   └── components/Block<Type>.tsx   un fichier par type de bloc
│   ├── templates/             gabarits de page + table page → gabarit (§ 8)
│   │   ├── registry.ts        PAGE_TEMPLATES, chargement paresseux
│   │   ├── HomeTemplate.tsx · SectionTemplate.tsx · TabbedProductTemplate.tsx
│   │   ├── ContentTemplate.tsx · ContactTemplate.tsx
│   │   └── parts/             sous-parties de gabarits : ContentTabs, ContentWithAside, CtaBand…
│   ├── pages/                 éléments de route : ContentPage (+ loader), RubriquePage, OutOfScopePage,
│   │                          NotFoundPage, RouteError, RedirectKeepingQuery
│   ├── assets/brand/          GÉNÉRÉ — logos SiL (positif/négatif/monochrome), écusson Lausanne
│   └── styles/
│       ├── index.css          @import tailwindcss + tokens, base, utilitaires prose-sil / block-flow
│       ├── tokens.css         GÉNÉRÉ — copie de design/tokens.css (ne pas éditer ici)
│       └── fonts/             GÉNÉRÉ — Figtree woff2
└── tests/                     Playwright : helpers.ts, smoke.spec.ts
```

« GÉNÉRÉ » = produit par `npm run import-content`, versionné, **jamais édité à la main**.

## 3. Flux de données

```
../crawl/content/*.json ─┐                        ┌─ src/content/pages/<slug>.json ─┐
../crawl/navigation.json ├─ import-content ───────┼─ manifest.json / navigation.json ├─ routes.tsx ─ loader ─ gabarit ─ BlockRenderer ─ Block<Type>
../crawl/assets/images   │  (audit → normalise →  ├─ images.json + public/images     │                                   └─ ResponsiveImage
../design/tokens, fonts ─┘   optimise → copie)    └─ src/styles, src/assets/brand   ─┘
```

### 3.1 Contrat et audit

`scripts/lib/crawl-contract.ts` décrit la forme **vérifiée** du crawl brut (14 types de blocs : `heading`, `paragraph`, `list`, `image`, `gallery`, `teasers`, `links`, `documents`, `accordion`, `table`, `contact`, `keyfigures`, `cta`, `video`). L'import échoue si un type, un champ ou une valeur d'énumération inconnu apparaît. Faits vérifiés utiles : `links.variant` est absent sur 5 blocs sur 10 (→ `null`), `cta` n'a jamais de `slug`, `documents.title`/`gallery.title`/`image.caption` sont toujours `null` dans le crawl, `lead` est toujours une chaîne.

### 3.2 Normalisations appliquées à l'import (`scripts/lib/normalize.ts`)

| #   | Normalisation                                                                                                                                                                                                                                  | Source        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| N1  | Capitales accentuées (« Electricité » → « Électricité », « A propos » → « À propos »…) sur libellés, titres et nœuds texte HTML                                                                                                                | DESIGN § 11.1 |
| N2  | Titres tout en capitales → casse phrase (« TARIFS 2027 » → « Tarifs 2027 ») ; acronymes courts (« FAQ ») conservés                                                                                                                             | § 3.2         |
| N3  | H1 des pages à onglets : partie avant « - » (`title`), titre brut dans `sourceTitle`                                                                                                                                                           | § 14.2        |
| N4  | Niveaux de titres remappés par liste de blocs : 1er niveau → h2 (h4 dans un accordéon) ; `sourceLevel` conservé                                                                                                                                | § 10          |
| N5  | `alt` qui n'est qu'un crédit (« © … ») → `caption`, `alt = ""`                                                                                                                                                                                 | § 7           |
| N6  | Documents : suffixe « (PDF) » retiré, « 1 er » → « 1er », KB/MB → Ko/Mo                                                                                                                                                                        | § 11.12       |
| N7  | Liens : `slug` (+ `tab`) si page crawlée (URL avec/sans `.html`, `?tab=`, alias `/silcontact`, `/partenaires/reglements`, « lausanne.ch?tab=x » cassé → onglet de la page courante), `route` si entrée du menu non crawlée, `external` partout | § 14.5        |
| N8  | HTML inline : liste blanche `a/strong/em/br/sup/sub`, attributs réduits à `href` + `data-slug/data-tab/data-route`, `<br>` finaux retirés                                                                                                      | README crawl  |
| N9  | Tableaux : en-têtes tous vides → `headers: []`                                                                                                                                                                                                 | § 11.13       |
| N10 | Bloc contact : titre répété retiré des lignes, « Case postale » sur sa ligne, ligne de libellés de liens aplatis (« Ecrivez-nous Tél. … ») retirée                                                                                             | § 11.15       |
| N11 | « : » final des titres retiré                                                                                                                                                                                                                  | § 11.9        |
| N12 | Doublons exacts de teasers retirés (carrousel C-FOR)                                                                                                                                                                                           | —             |
| N13 | `video.provider` déduit du domaine (`datawrapper`, `google-maps`, `youtube`)                                                                                                                                                                   | § 11.17       |
| N14 | Images : chemins → identifiants du manifeste ; `fit: "contain"` pour schémas/visuels à texte ; AVIF+WebP 480/960/1440/1920 sans agrandissement                                                                                                 | § 7           |
| N15 | Exposants d'unités perdus au crawl (« 1 m 3 » → « 1 m³ », « de m 2 » → « de m² », « 100m2 », « par m3 »), libellés et texte HTML                                                                                                               | § 3.2         |
| N16 | Coquilles connues (« Mutlimédia », espace avant « ® ») ; N1 étendu à « A votre écoute », « A Lausanne » ; libellé de tuile tiré d'un titre SVG erroné (« facture » → « Règlements »)                                                           | § 3.2         |
| —   | Fil d'Ariane : 1er élément « Accueil », dernier = titre normalisé                                                                                                                                                                              | § 11.4        |

**Non normalisé** (contextuel, à faire dans les gabarits — voir MIGRATION.md) : formulaire aplati de la page contact, h5 d'intro → Callout, paragraphes-liens « En relation » → aside, préfixes de chiffres clés (« + de »), dates des actualités (« 04.09 – »), « A votre écoute » (le « A » initial ambigu).

Pour corriger une donnée : modifier le normaliseur (règle systématique) ou le gabarit (cas particulier), **jamais** les JSON générés.

## 4. Routage

Routes générées dans `src/routes.tsx` à partir du contenu :

| Type                            | Chemin                                                                                                                                                         | Rendu                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Page crawlée (20)               | `page.path`, ex. `/particuliers/je-choisis-mon-offre/electricite` (URL d'origine sans préfixe `/vie-pratique/energies-et-eau/services-industriels` ni `.html`) | `ContentPage` → gabarit de `PAGE_TEMPLATES`                                   |
| Rubrique racine (5)             | `/particuliers`, `/professionnels`, `/partenaires`, `/a-propos-sil`, `/carrieres`                                                                              | `RubriquePage`                                                                |
| Entrée du menu non crawlée (52) | chemin d'origine, ex. `/particuliers/je-choisis-mon-offre/mobilite`                                                                                            | `OutOfScopePage`                                                              |
| Alias du menu                   | `/partenaires/reglements`                                                                                                                                      | redirection vers `/a-propos-sil/nos-activites/reglements` (query conservée)   |
| Autre                           | `*`                                                                                                                                                            | `NotFoundPage` ; une ancienne URL `….html` est redirigée vers la route propre |

**Décisions**

- **Rubriques racines** : sur lausanne.ch, `particuliers.html` & co. affichent l'accueil à l'identique. Le prototype les remplace par une **vue d'ensemble générée depuis `navigation.json`** (cartes par sous-rubrique, pages non reprises badgées « Hors prototype ») : c'est la cible du lien « Vue d'ensemble » du méga-menu / du menu mobile et des niveaux « Particuliers »… du fil d'Ariane. Dupliquer l'accueil aurait créé du contenu en double sans valeur de démonstration.
- **Pages non crawlées** : la route existe pour que tout le menu reste navigable ; la page (fil d'Ariane reconstruit depuis le menu, H1 = libellé) explique qu'elle est hors périmètre et propose « Voir la page actuelle sur lausanne.ch » + retour au parent. Les pages de l'espace authentifié (Mon Compte, Compte Pro) portent `requiresLogin` et une mention dédiée. « Espace client » (header, drawer) pointe vers `/particuliers/mon-compte`.
- **Liens de contenu** vers une page ni crawlée ni présente dans le menu : lien sortant vers lausanne.ch.
- **Onglets** : `?tab=<id>` est l'état source (`useSearchParams`), mis à jour en `replace` + `preventScrollReset`. Valeur inconnue → premier onglet, sans réécrire l'URL.
- **Chargement** : chaque page a un `loader` qui charge **en parallèle** son JSON (un chunk par page via `import.meta.glob`) et le code de son gabarit (`React.lazy` préchargé) : pas d'écran intermédiaire, `aria-busy` sur `<main>` pendant la navigation.
- **Défilement** : `<ScrollRestoration>` — haut de page à chaque nouvelle page, position restaurée au retour arrière. Ancres : `scroll-padding-top` = header + barre d'onglets.
- **Focus** : après un changement de chemin (pas d'onglet), focus sur le h1 marqué `data-route-focus` (sinon `<main>`), pour l'annonce par les lecteurs d'écran. Tout h1 de gabarit doit porter `tabIndex={-1} data-route-focus` (c'est le cas de `PageHero`).
- **Titre du document** : `<PageMeta title>` (React 19 hisse `<title>`/`<meta>`) → « Titre | Services industriels de Lausanne ».
- **SPA** : `vite preview` renvoie `index.html` pour toute URL ; la 404 est donc applicative (statut HTTP 200).

## 5. Liens (règle unique)

Toujours passer par **`<SmartLink>`** (ou `ButtonLink` / `ArrowLink`, qui l'utilisent) :

```tsx
<SmartLink target={item}>…</SmartLink>          // objet du contenu (LinkTarget : url, slug?, tab?, route?, external)
<SmartLink url={`${SIL}/particuliers/contact-sil.html`}>…</SmartLink>   // URL lausanne.ch saisie à la main (config)
<SmartLink to="/particuliers">…</SmartLink>     // route de l'app
```

Résolution (`src/lib/links.ts`) : `slug` → route de la page (+ `?tab=`) ; `route` → page générée ; sinon `<a href>` sortant, avec « (site externe) » en texte masqué si autre domaine (`externalIcon` ajoute `ArrowUpRight`). Dans le HTML du CMS, `<RichText>` applique la même règle via `data-slug` / `data-tab` / `data-route`. **Jamais** de `<a href="/…">` ni de `useNavigate` pour un lien de contenu.

## 6. Design system et styles

### 6.1 Tokens — jamais de couleur en dur

- `src/styles/tokens.css` est la copie de `design/tokens.css` (mise à jour par `import-content`). Il retire la palette Tailwind par défaut (`--color-*: initial`) : seules les couleurs de la charte existent.
- Utiliser **les rôles sémantiques d'abord** : `bg-surface`, `bg-surface-subtle`, `bg-surface-brand`, `bg-surface-inverse`, `text-ink`, `text-muted`, `text-link`, `bg-action`, `text-on-action`, `border-border-default`, `border-border-strong`, `outline-focus`, `text-danger`/`bg-danger-bg`… ; la palette (`green-700`, `neutral-600`…) seulement quand la charte le précise ; les univers via `src/lib/universe.ts` (`bg-univ-gaz-soft`, `text-univ-gaz-ink`).
- Typo : `text-display`, `text-h1`…`text-h4` (taille + interligne + approche + graisse), `text-lead`, `text-body-lg`, `text-body`, `text-sm`, `text-xs`, `text-figure`. Graisses hors échelle : `font-[650]`, `font-[750]`.
- Espacements : échelle 4 px (`p-4` = 16 px) + tokens fluides `px-gutter`, `gap-grid`, `py-section`, `py-section-sm`, `mb-stack`. Conteneurs : `max-w-page` (via `<Container>`), `max-w-prose`, `max-w-(--sil-measure)` pour 68 caractères.
- Rayons : `rounded-card` (16), `rounded-xl` (24, médias), `rounded-2xl`, `rounded-pill`. Ombres `shadow-sm…xl`. Durées : `duration-(--sil-duration-fast)`, easings `ease-standard`. Z-index : `z-(--sil-z-header)` etc.
- Valeurs `--sil-*` directement accessibles en arbitraire : `h-(--sil-header-h)`, `bg-(--sil-overlay-scrim)`.
- ESLint interdit tout littéral hexadécimal dans `src/` (`no-restricted-syntax`).

### 6.2 Pièges connus

- **`inline-grid` est cassé** : le token `--spacing-grid` fait générer à Tailwind un utilitaire de taille logique `inline-grid { inline-size: … }` qui écrase `display`. Utiliser `inline-flex items-center justify-center` ou `grid`. Même risque avec `block-*`/`inline-*` + `gutter|grid|section|stack|header|touch`.
- **Pas de `tailwind-merge`** : deux utilitaires de la même propriété sur un élément (`hidden` + `inline-flex`, `px-3` + `px-6`) donnent un résultat imprévisible. Écrire des conditions exclusives (`cond ? "a" : "b"`) et, pour masquer un élément qui a déjà un `display`, préférer `max-lg:hidden` à `hidden lg:flex`.
- `<ResponsiveImage>` : pleine largeur par défaut, sauf si `className` contient `size-*` ou `w-*` ; placer l'enveloppe `<picture>` avec `wrapperClassName` (ex. `shrink-0`).
- Aucun parent `overflow: hidden` au-dessus des éléments `sticky` (header, onglets, aside) : gérer les débordements localement (carrousel, tableau).
- `on-dark` sur un conteneur sombre active l'anneau de focus inverse et la variante Tailwind `on-dark:` (ex. `on-dark:text-green-100`).

### 6.3 Primitives (`src/components/ui`, import via `@/components/ui`)

`Button` / `ButtonLink` (variantes `primary` · `secondary` · `ghost` · `inverse` · `outline-inverse`, tailles `sm/md/lg`, `icon`, `trailingIcon`, `block`), `IconButton` (44 px, `label` obligatoire), `ArrowLink`, `SmartLink`, `Container`, `Section` (+ `SectionHead`), `Eyebrow`, `Heading` (niveau sémantique ≠ taille visuelle), `Card` (+ `CardTitle`, `stretchedLinkClass`), `Badge`, `Icon` (Lucide, décorative par défaut), `RichText` (+ `htmlToText`), `ResponsiveImage`, `Logo`, `SocialIcon`, `VisuallyHidden`.

Une nouvelle primitive n'entre dans `ui/` que si elle est **transverse** (≥ 2 composants de blocs ou de layout). Un composant propre à un bloc reste dans `blocks/components/` ; un morceau de gabarit dans `templates/parts/`.

## 7. Moteur de blocs

```tsx
<BlockRenderer
  blocks={tab.blocks}
  pageSlug={page.slug}
  section={page.section}
  region="tab"
  tabId={tab.id}
/>
```

- `blocks/registry.ts` : `blockRegistry = { heading: BlockHeading, … } satisfies BlockRegistry`. Le type mappé `BlockRegistry` exige un composant pour **chaque** membre de l'union `Block` : ajouter un type dans `content/types.ts` sans composant = erreur de compilation.
- Chaque composant reçoit `BlockProps<T>` = `{ block, context }`. `context` fournit `region` (`main` · `tab` · `aside` · `accordion`), `index` et `siblings` (heuristiques de voisinage : titre avant un accordéon, image suivie d'un titre…), `tabId`, `pageSlug`, `section` et `renderBlocks(blocks, region)` pour la récursion (accordéon) sans import circulaire.
- **Les gabarits sélectionnent / regroupent les blocs** (ex. bloc `contact` sorti vers l'aside, paragraphes-liens « En relation » vers « Liens utiles ») ; les composants de blocs restent « bêtes » et réutilisables.
- `BlockRenderer` enveloppe par défaut dans `.block-flow` (rythme vertical) ; `bare` pour laisser la mise en page au parent.
- Composants de référence **finis** à imiter : `BlockHeading`, `BlockParagraph`, `BlockList`, `BlockImage` (+ `BlockCta`).
- Statut en tête de chaque fichier : ✅ fini · 🟡 minimal fonctionnel · 🟠 provisoire, avec la liste `TODO(dev)`. Les composants non finis portent un attribut `data-todo="…"` sur leur racine (`grep -r "data-todo" src` pour l'inventaire) : **le retirer quand le composant est terminé**.

## 8. Gabarits

`templates/registry.ts` contient la table explicite `PAGE_TEMPLATES` (slug → `home` · `section` · `tabbed-product` · `content` · `contact`, DESIGN § 12). Un gabarit est un composant `default export` recevant `{ page: Page }`. Il compose `PageHero` (qui porte le h1 et le fil d'Ariane), `Section`/`Container`, `ContentTabs`, `ContentWithAside`, `CtaBand` et des `BlockRenderer`.

## 9. Conventions de code et de nommage

- Fichiers composants en `PascalCase.tsx`, un composant exporté par fichier ; utilitaires en `camelCase.ts`. Un fichier `.tsx` n'exporte **que** des composants (règle `react-refresh/only-export-components`) : fonctions et constantes partagées dans un `.ts` voisin.
- Composants de blocs : `Block<Type>` ; gabarits : `<Nom>Template` (export par défaut, chargés paresseusement) ; pages de route : `<Nom>Page`.
- Imports absolus `@/…` ; `import type` pour les types (lint). Pas de `any` ; transtypage des JSON uniquement dans `content/index.ts`.
- Textes d'interface en français (fr-CH), typographie française (« », espaces insécables devant `:` quand c'est visible).
- Commentaires d'en-tête de composant : rôle, référence DESIGN.md (§), statut, TODO.
- Pas de dépendance ajoutée sans nécessité (carrousels et onglets en natif, pas de librairie d'UI).

## 10. Responsive

- **Mobile-first** : classes de base = 390 px, puis `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1440 (`xs` 384 réservé). Navigation desktop et méga-menu à partir de `lg` ; drawer en dessous.
- Aucun débordement horizontal de page (vérifié par le smoke test à 390 px) : les zones défilantes (carrousels, onglets, tableaux larges) défilent **localement**.
- Cibles tactiles ≥ 44 px (`min-h-11`, `size-11`) ; liens du méga-menu ≥ 36 px (44 px si `pointer-coarse:`).
- Hauteurs de chrome : header 64/80 px (`--sil-header-h`, `--sil-header-h-lg`), barre d'onglets 56 px ; `sticky` imbriqués : header → onglets (`top: header`) → aside (`top: header + onglets + 32`).
- Texte jamais dans un conteneur à hauteur fixe (zoom 200 %) ; boutons autorisés sur 2 lignes.

## 11. Accessibilité

- `lang="fr-CH"`, lien d'évitement « Aller au contenu » (1er focusable) vers `main#contenu`, `nav[aria-label]` distincts (« Navigation principale », « Fil d'Ariane », « Liens de pied de page »).
- **Un seul h1** par page (porté par `PageHero` ou le hero d'accueil) ; niveaux continus grâce à N4. Taille visuelle ≠ niveau : `Heading level/size`.
- Focus visible partout (`:focus-visible` 3 px `--sil-focus`, inverse sur `on-dark`) ; cartes à lien étiré : anneau sur la carte (`focus-within`).
- Méga-menu : _disclosure_ (`button[aria-expanded][aria-controls]`), pas de `role=menu` ; fermeture Échap (focus rendu au bouton), clic sur le voile, navigation.
- Menu mobile : `<dialog>.showModal()` (piège de focus et inertie natifs), Échap / voile / bouton ferment, focus rendu au bouton « Menu », défilement de la page bloqué.
- Onglets : pattern ARIA Tabs (←/→/Début/Fin, tabindex itinérant, activation automatique), panneaux `role=tabpanel` tous présents dans le DOM (`hidden`).
- Accordéon : `button[aria-expanded][aria-controls]` dans un titre + `role=region`.
- Icônes décoratives `aria-hidden` ; boutons à icône seule avec `aria-label` ; liens externes « (site externe) » masqué ; documents « (PDF, 286 Ko) » masqué.
- Contenus tiers (Datawrapper, Google My Maps, YouTube) chargés **après consentement** ; `iframe[title]` obligatoire.
- `prefers-reduced-motion` : durées à 1 ms (tokens + base CSS), pas de `translate` au survol (`motion-reduce:`).
- Contrastes : ne jamais poser de texte < 24 px en `green-500`, `red-500`, `blue-500`, `amber-500` ni en `-accent` d'univers (DESIGN § 2.6).

## 12. Images

`<ResponsiveImage src={id} alt sizes priority? />` : `<picture>` AVIF + WebP, `srcset` par largeur, `width`/`height` (pas de CLS), `loading="lazy"` sauf `priority` (image LCP → `fetchpriority="high"`). Toujours fournir un `sizes` réaliste. `fit` du manifeste : `contain` (fond neutral-50, padding) pour schémas et visuels à texte. Sources ≤ 310 px (accroches, pictos) : ne pas les afficher au-delà de ~1.25×.

## 13. Tests

- `playwright.config.ts` : build + `vite preview` sur 127.0.0.1:4173, projets **desktop** (1440×900) et **mobile** (390×844, tactile).
- `tests/smoke.spec.ts` (222 tests) : pour les 20 pages, chaque onglet `?tab=`, les 5 rubriques, les 52 pages hors périmètre, l'alias et la 404 → statut HTTP OK, exactement un `main h1` non vide, titre du document, aucune erreur console / exception, aucun débordement horizontal.
- `tests/helpers.ts` : `manifest`, `navigation`, `trackConsoleErrors`, `expectNoHorizontalOverflow` — à réutiliser par le testeur.

## 14. Écarts assumés par rapport aux maquettes

- Menu mobile : lien « Vue d'ensemble » en tête de chaque rubrique dépliée (accès mobile à la page rubrique).
- Recherche : bouton et champ visuels uniquement (hors périmètre), libellé « non disponible dans le prototype ».
- Méga-menu « Partenaires » : pas de carte « À la une » (aucune dans la maquette).
- Les colonnes du footer et les cartes « À la une » du méga-menu sont des données de `src/config/site.ts` (le crawl n'extrait pas le chrome).
