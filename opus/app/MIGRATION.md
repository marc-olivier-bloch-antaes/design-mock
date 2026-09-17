# Plan de migration page par page

Destinataire : le développeur qui finalise les pages. À lire après [`ARCHITECTURE.md`](./ARCHITECTURE.md) (conventions) et avec [`../design/DESIGN.md`](../design/DESIGN.md) ouvert (spécifications, § cités ci-dessous). Maquettes de référence : `../design/mockups/accueil.html` et `produit-onglets.html` (servir `cd /home/mob/sil/opus && python3 -m http.server 8765`, puis `http://127.0.0.1:8765/design/mockups/…` ; états `?tab=…`, `?menu=particuliers`, `?drawer=particuliers`) et leurs captures dans `../design/mockups/screenshots/`.

## 0. Ce qui est déjà en place (ne pas refaire)

- **Chrome global conforme aux maquettes** : barre utilitaire, header collant, méga-menu, menu mobile, fil d'Ariane, footer, lien d'évitement, gestion du focus et du défilement.
- **Routage complet** : 20 pages, onglets `?tab=`, 5 vues d'ensemble de rubriques, 52 pages « hors périmètre », alias, 404.
- **Onglets** (`templates/parts/ContentTabs.tsx`) : ARIA, clavier, URL, barre collante, pilules mobiles.
- **Hero de page intérieure** (`layout/PageHero.tsx`) : variantes simple et produit, tag d'univers, CTA.
- **Contenu normalisé** (N1–N15, voir ARCHITECTURE § 3.2) : ne pas refaire ces corrections dans les composants.

### État des composants de blocs

| Bloc         | Composant         | État                                 | Reste à faire (TODO(dev) dans le fichier)         | DESIGN    |
| ------------ | ----------------- | ------------------------------------ | ------------------------------------------------- | --------- |
| `heading`    | `BlockHeading`    | ✅ fini (référence)                  | — (ancres `id` des h2 posées, cibles du sommaire) | § 3, § 10 |
| `paragraph`  | `BlockParagraph`  | ✅ fini (référence)                  | —                                                 | § 11.16   |
| `list`       | `BlockList`       | ✅ fini (référence, variante Prose)  | composant `Steps` séparé                          | § 11.21   |
| `image`      | `BlockImage`      | ✅ fini (référence, variante Figure) | composition `MediaRow` dans les gabarits          | § 11.19   |
| `cta`        | `BlockCta`        | ✅ fini                              | —                                                 | § 11.16   |
| `accordion`  | `BlockAccordion`  | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.9    |
| `documents`  | `BlockDocuments`  | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.12   |
| `teasers`    | `BlockTeasers`    | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.10   |
| `links`      | `BlockLinks`      | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.11   |
| `contact`    | `BlockContact`    | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.15   |
| `keyfigures` | `BlockKeyFigures` | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.14   |
| `video`      | `BlockVideo`      | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.17   |
| `gallery`    | `BlockGallery`    | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.19   |
| `table`      | `BlockTable`      | ✅ fini                              | — (voir fiches 1 à 20)                            | § 11.13   |

Composants ajoutés en cours de migration : `FeatureGrid` (fiche 5), `ConseilCard` (fiches 5, 8), `ContactBand` (fiche 9), `LinkTiles` (fiche 10) ; `TeaserCard` : props `showUniverse` et `eyebrow`.

Composants de composition **créés** (rendus par les gabarits à partir de plusieurs blocs) : `Callout`, `Steps`, `MediaRow`, `ProductCard`, `FaqGroup` + `AnchorNav`, `UsefulLinks`, `PriceTable` / `ScrollTable` / `DefinitionList`, `NewsList`, `Carousel`. Non créé : `Quote` (§ 11.18, facultatif — aucune citation dans le crawl, à ne pas inventer).

Gabarits : `HomeTemplate` ✅, `SectionTemplate` ✅, `TabbedProductTemplate` ✅, `ContentTemplate` ✅, `ContactTemplate` ✅.

## 1. Ordre de migration

L'ordre maximise la réutilisation : les deux pages avec maquette d'abord (elles produisent 80 % des composants), puis les variantes de la même famille, puis les gabarits plus simples.

| #   | Page                                      | Route                                                                        | Gabarit        | Pourquoi à ce rang                                                                                     |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | `particuliers-electricite`                | `/particuliers/je-choisis-mon-offre/electricite`                             | tabbed-product | Maquette dédiée ; crée Callout, Steps, ProductCard, PriceTable, FaqGroup, UsefulLinks, MediaRow, Embed |
| 2   | `accueil`                                 | `/`                                                                          | home           | Maquette dédiée ; crée Carousel, PromptCard, UniverseGrid, NewsList, KeyFigures, CtaBand               |
| 3   | `professionnels-electricite`              | `/professionnels/les-offres/electricite`                                     | tabbed-product | Même structure que #1                                                                                  |
| 4   | `particuliers-gaz-naturel`                | `/particuliers/je-choisis-mon-offre/gaz-naturel`                             | tabbed-product | Ajoute ScrollTable, légende de schéma                                                                  |
| 5   | `particuliers-chaleur`                    | `/particuliers/je-choisis-mon-offre/chaleur`                                 | tabbed-product | MediaRow + schémas `contain`, LinkList sans variante                                                   |
| 6   | `particuliers-solaire-photovoltaique`     | `/particuliers/je-produis-mon-energie/solaire-photovoltaique`                | tabbed-product | FAQ en titres + paragraphes, documents                                                                 |
| 7   | `professionnels-solaire-photovoltaique`   | `/professionnels/produire-de-l-energie/solaire-photovoltaique`               | tabbed-product | Quasi identique à #6                                                                                   |
| 8   | `partenaires-raccordements`               | `/partenaires/raccordements`                                                 | tabbed-product | La plus volumineuse (7 onglets, 313 blocs) : tout est déjà prêt                                        |
| 9   | `particuliers-je-choisis-mon-offre`       | `/particuliers/je-choisis-mon-offre`                                         | section        | Grille de teasers                                                                                      |
| 10  | `a-propos-nos-activites`                  | `/a-propos-sil/nos-activites`                                                | section        | Galerie, tuiles de liens, accroches                                                                    |
| 11  | `a-propos-notre-portrait`                 | `/a-propos-sil/notre-portrait`                                               | content        | Galerie + tuiles + chiffres clés (variante claire)                                                     |
| 12  | `a-propos-notre-engagement`               | `/a-propos-sil/notre-engagement`                                             | content        | Sous-ensemble de #11                                                                                   |
| 13  | `a-propos-c-for`                          | `/a-propos-sil/c-for`                                                        | content        | Carrousel, chiffres clés, logo C-FOR                                                                   |
| 14  | `a-propos-reglements`                     | `/a-propos-sil/nos-activites/reglements`                                     | content        | Accordéon de documents                                                                                 |
| 15  | `particuliers-economies-energie`          | `/particuliers/j-optimise-ma-consommation/economies-d-energie-particuliers`  | content        | Sommaire + images de section                                                                           |
| 16  | `particuliers-renovation-bien-immobilier` | `/particuliers/j-optimise-ma-consommation/renovation-de-mon-bien-immobilier` | content        | Idem #15                                                                                               |
| 17  | `carrieres-nos-metiers`                   | `/carrieres/nos-metiers`                                                     | content        | Idem + citation éditoriale facultative                                                                 |
| 18  | `particuliers-multimedia`                 | `/particuliers/je-choisis-mon-offre/multimedia`                              | content        | Offres image + titre + CTA                                                                             |
| 19  | `professionnels-telegestion`              | `/professionnels/optimiser-sa-consommation/telegestion`                      | content        | Très courte                                                                                            |
| 20  | `particuliers-contact`                    | `/particuliers/contact-sil`                                                  | contact        | Gabarit spécifique, à faire en dernier                                                                 |

Après les 20 pages : relire les pages générées (`RubriquePage`, `OutOfScopePage`, `NotFoundPage`) avec les composants finis. ✅ Fait : `OutOfScopePage` et `NotFoundPage` conformes ; `RubriquePage` — une entrée de menu sans
sous-pages (« Contact ») affichait une carte vide → lien flèche « Accéder à la page » (+ badge « Hors
prototype »). Dernier `TODO(dev)` levé dans `ContentTabs` : fondu gauche/droite de la barre défilante < md
(seulement du côté qui masque des onglets, `scroll-px-gutter` pour l'accroche) et défilement jusqu'à la
barre quand un lien interne ouvre un autre onglet de la page (pas lors d'un clic dans la barre) — vérifiés
dans Chromium. Plus aucun `TODO(dev)`, `data-todo` ni statut 🟠/🟡 dans `src/`.

## 2. Fiches page

Notation des types : `type[variante]×occurrences` (onglets et accordéons compris). « h5→h3 » = niveau CMS → niveau normalisé.

### 1. `particuliers-electricite` — Électricité (particuliers) ✅

Fait : hero produit, onglets, `ProduitsTab` (cartes nativa/nativaplus réordonnées, badges, embed),
`enhanceBlocks` (Callout brand/info, Steps, FaqGroup + compteur, accordéons compacts archives/glossaire,
MediaRow Sécurité, image 16:9 Raccordement), `UsefulLinks` + `AnchorNav` en aside, `PriceTable` (tableau
des frais avec sous-lignes), `BlockDocuments`/`BlockAccordion`/`BlockVideo` finis. Écart : aside « Bases
légales » (OIBT/ESTI) fusionnée dans `UsefulLinks` plutôt qu'un bloc séparé (même composant, groupe
distinct) — visuellement équivalent. Vérifié : typecheck/lint/build OK, smoke test (12/12) OK, captures
desktop/mobile des 5 onglets sans débordement horizontal (bug d'overflow CSS `aspect-ratio` + `min-height`
sur `BlockVideo` et grille de cartes produit sur mobile corrigés).

- **Route** `/particuliers/je-choisis-mon-offre/electricite` · **gabarit** `tabbed-product` · **maquette** `produit-onglets.html` (5 captures).
- **Onglets** : `produits` (9 blocs) · `tarifs` (29) · `raccordement` (5) · `securite` (16) · `faq` (21).
- **Blocs** : paragraph×100, heading×34, list×16, accordion×10, documents×9, cta×4, video×2 (Datawrapper), image×2, table×1, contact×1.
- **À finaliser** : `ProductCard`, `Callout`, `Steps`, `BlockDocuments`, `BlockAccordion` (compact + FaqGroup), `PriceTable`, `MediaRow`, `UsefulLinks`, `BlockVideo`, `BlockContact` (aside).
- **Points d'attention** :
  - Produits : le crawl liste **nativaplus puis nativa** ; la maquette présente nativa (badge « Produit par défaut ») puis nativaplus (`--featured`, « Sur simple demande »). Carte = `heading` + `paragraph` + `video` + (`paragraph` note « * En 2025… ») + `cta` (§ 11.10, § 12.3).
  - Tarifs : 1er bloc `heading` h5→h3 = phrase de marque → `Callout brand` (§ 13) ; « Tarifs 2027 » + badge « Nouveau » ; liste « Le prix de l'électricité se compose… » (items « Libellé : texte ») → `Steps` 2 colonnes ; « Validité » → `Callout info` ; « TARIFS 2026 », « Reprise de l'énergie 2026 » et l'accordéon d'archives → section « Tarifs précédents » (accordéon **compact**) ; accordéon FAQ (h5 « FAQ ») : 1er item ouvert + lien vers `?tab=faq`.
  - Aside « Liens utiles » : couples `heading` « En relation » / « Conditions des prestations » / « Démarches en ligne » + paragraphes ne contenant qu'un lien (+ `<br>` description) → `UsefulLinks`, **à retirer du contenu principal**.
  - Sécurité : `image` puis `heading` → `MediaRow` ; « Marche à suivre » → `Steps` 1 colonne ; `table` 3 colonnes avec en-têtes (« Frais / Description / Tarifs en CHF hors TVA ») → `PriceTable` (cartes < md, prix alignés, `tabular-nums`) ; paragraphes-liens OIBT / ESTI → aside « Bases légales ».
  - FAQ : accordéon « Glossaire » (compact) puis 7 groupes `heading` h5→h3 + `accordion` → `FaqGroup` avec compteur ; aside « Thèmes » (`AnchorNav`, ancres) + « En relation ».
  - Raccordement : `image` 16:9 en tête, `cta` vers `/partenaires/raccordements?tab=electricite` (déjà routé).
  - Raccourci du hero : libellé « Tarifs 2027 » (année lue dans le 1er titre de l'onglet tarifs).

### 2. `accueil` — Accueil ✅

Fait : `Carousel` (flèches désactivées aux extrémités, barre de progression), `UniverseGrid` (tuile
verticale ≥ lg avec flèche glissante), `NewsList` (tuiles date, 5 items + « Toutes les actualités »),
`KeyFigures` (variante `brand`, 2 colonnes dans la colonne 5/12), filigrane du logo sur `CtaBand`, écart
hero → « Je choisis mon offre » réduit (`spacing="sm"`). Écart assumé : chiffres clés dupliqués dans
`config/site.ts` (`KEY_FIGURES`) plutôt que chargés depuis `a-propos-notre-portrait` — évite un chargement
asynchrone supplémentaire dans un gabarit synchrone, conforme à l'option proposée par ARCHITECTURE.md.
Lien « Toutes les actualités » : URL de l'index actualités lausanne.ch (aucune page de liste dans le
prototype). Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop/mobile
sans débordement horizontal.

### 2. `accueil` — Accueil

- **Route** `/` · **gabarit** `home` · **maquette** `accueil.html` (+ méga-menu, menu mobile).
- **Blocs** : teasers[carousel]×1 (7 items), links[icon-nav]×1 (6 univers), teasers[accroche]×1 (4), links[news]×1 (6), contact×1.
- **À finaliser** : hero (carte flottante qui déborde de 40 px, image 2xl), `Carousel` + `TeaserCard`, `PromptCard` 2×2, tuiles d'univers verticales ≥ lg, `NewsList` (tuile date « 04 / SEPT. » depuis « 04.09 – » ; afficher 5 items + « Toutes les actualités → »), panneau `KeyFigures` 5/12, filigrane du `CtaBand`.
- **Points d'attention** : le H1 n'est pas dans les données (phrase fixe, point final rouge) ; le lead est affiché sans sa première phrase (déjà fait) ; la carte « À la une » = premier teaser interne du carrousel ; les chiffres clés viennent de `a-propos-notre-portrait` (charger la page ou dupliquer les 4 valeurs dans `src/config`) ; le bloc `contact` n'est pas rendu (il alimente le footer) ; « Mobilité » n'a pas de page (route hors périmètre) ; pas d'autoplay du carrousel ; réduire l'écart hero → « Je choisis mon offre » pour coller à la maquette.

### 3. `professionnels-electricite` — Électricité (professionnels) ✅

Entièrement réutilisé depuis #1 (même gabarit, `ProduitsTab` gère aussi les sections de texte courant
« Grands consommateurs / En bref / Cadre juridique / Des tarifs optimisés » après les 2 cartes). Aside
« Bases légales » à 3 liens (Plateforme Elektroform/SiL en plus). Vérifié : typecheck/lint/build OK, smoke
test ciblé (12/12) OK, captures desktop sans débordement.

### 3. `professionnels-electricite` — Électricité (professionnels)

- **Route** `/professionnels/les-offres/electricite` · **gabarit** `tabbed-product`.
- **Onglets** : `produits` (22) · `tarifs` (31) · `raccordement` (5) · `securite` (17) · `faq` (21).
- **Blocs** : paragraph×117, heading×37, list×21, accordion×10, documents×9, cta×4, video×2, image×2, contact×1.
- **À finaliser** : rien de nouveau après #1.
- **Points d'attention** : onglet Produits précédé d'un paragraphe d'intro et suivi de sections « Grands consommateurs », « En bref », « Cadre juridique », « Des tarifs optimisés » (texte courant après les 2 cartes produit) ; pas de tableau dans Sécurité ; tag du hero « Professionnels ».

### 4. `particuliers-gaz-naturel` — Gaz naturel ✅

Fait (session précédente) : légende numérotée du schéma biogaz (3 tableaux 2 colonnes fusionnés → une
seule liste ordonnée, règle générique dans `enhanceTabBlocks`) ; `ScrollTable` de l'onglet Tarifs (10
colonnes) avec en-têtes reconstruits à la main (`src/lib/tableOverrides.ts`, clé
`particuliers-gaz-naturel:tarifs`) et réalignement des lignes de continuation (`padTableRow`).

Fait (cette session) :

- **N1** : ajout de « A télécharger » → « À télécharger » dans `scripts/lib/normalize.ts`
  (`ACCENTED_WORDS`) + `npm run import-content` — corrige les 2 occurrences (heading de l'onglet FAQ et
  groupe « Liens utiles » de l'onglet Tarifs).
- **Bug générique corrigé dans `src/lib/extractLinks.ts`** (`extractSingleLink`) : la fonction acceptait
  un paragraphe dont l'ancre n'était pas en tête (ex. onglet Sécurité : « Contactez-nous au 021 315 83 25
  ou par **e-mail** pour plus d'information. ») et le transformait à tort en entrée d'aside « Bases
  légales » avec un texte tronqué/mal formé. Ajout d'une garde `/^\s*<a[\s>]/i` : le lien doit être le
  tout début du paragraphe (pattern déjà respecté par tous les usages légitimes : OIBT/ESTI, « En
  relation »…). Vérifié : aucune régression sur `particuliers-electricite` / `professionnels-electricite`
  (aside Bases légales et Liens utiles identiques après le correctif) ; balayage de tout `src/content/pages/*.json`
  pour lister les paragraphes-liens avec texte introductif — aucun autre cas n'était extrait à tort.
- **Bug générique corrigé dans `src/templates/parts/enhanceTabBlocks.tsx`** (règle 1, Callout brand) :
  la règle « 1er bloc = heading niveau source 5 → Callout brand » capturait à tort le 1er groupe FAQ de
  l'onglet FAQ (« Actualité internationale et conséquences sur l'approvisionnement en gaz », suivi
  immédiatement d'un accordéon de 8 questions), l'affichant comme bandeau au lieu d'un `FaqGroup` avec
  compteur et entrée dans l'aside « Thèmes ». Ajout d'une exclusion quand le heading est immédiatement
  suivi d'un accordéon (délègue à la règle FaqGroup). Vérifié sans régression sur l'onglet Tarifs de
  `particuliers-electricite` (seule autre page utilisant cette règle, heading suivi d'un paragraphe, pas
  d'un accordéon).

- **Passe de revue complémentaire** :
  - règle 9 de `enhanceBlocks` étendue à **titre → image → paragraphes** (onglet Sécurité : `MediaRow` au
    lieu d'une photo 158×222 px étirée ; les grilles de pictos titre + (image + paragraphe)×n, ex. Chaleur,
    sont exclues) ;
  - règle 10 **liste → cta → liste** → `Steps` 1 colonne (onglet Gaz-solaire : grille d'illustrations SVG
    aplatie au crawl, qui semblait prolonger la liste « Les avantages ») ;
  - `UsefulLinks` : une seule icône (↗ pour un lien externe) au lieu de → et ↗ empilés (toutes les pages) ;
  - nouvelle normalisation **N15** : « 1 m 3 » → « 1 m³ », « de m 2 » → « de m² » (corrige aussi la fiche 6).

Vérifié : typecheck/lint/build OK. Captures desktop **et** mobile des 6 onglets (`solutions`,
`gaz-solaire`, `tarifs`, `raccordement`, `securite`, `faq`) passées en revue : hiérarchie, ScrollTable
avec indice « Faire défiler → », FaqGroup + aside Thèmes, MediaRow (calculateur, schéma biogaz), aside
Liens utiles/Bases légales — aucun débordement horizontal, aucun contenu perdu.

**Écarts assumés** : `ScrollTable` ne gère pas le `colspan` (ligne « Conditions sur demande aux SiL »
réalignée par `padTableRow`, cf. session précédente) ; onglet Raccordement composé différemment de la
fiche #1 (heading + paragraphe + cta + image, au lieu d'image 16:9 en tête) car c'est l'ordre réel des
blocs du CMS pour cette page — pas de règle générique à appliquer ici sans casser d'autres pages ; photo « Contrôle du gaz » (source
158 px) floue en pleine largeur sur mobile — limite de l'actif d'origine.

### 4. `particuliers-gaz-naturel` — Gaz naturel

- **Route** `/particuliers/je-choisis-mon-offre/gaz-naturel` · **gabarit** `tabbed-product`.
- **Onglets** : `solutions` (13) · `gaz-solaire` (9) · `tarifs` (18) · `raccordement` (5) · `securite` (12) · `faq` (14).
- **Blocs** : paragraph×86, heading×22, accordion×8, table×4, image×4, list×3, cta×2, documents×1, video×1, contact×1.
- **À finaliser** : `ScrollTable`, légende de schéma.
- **Points d'attention** :
  - Tarifs : `table` **10 colonnes sans en-têtes** (les 3 premières lignes sont des en-têtes fusionnés aplatis : « Tarif processus et chauffage / Conditions / Abonnement / Consommation / Puissance », puis unités « CHF/mois, Ct/kWh… », puis « Hors TVA / TTC ») → `ScrollTable` avec `thead` **reconstruit à la main** (§ 11.13, § 14.6), 1re colonne collante, indice « Faire défiler → ».
  - Solutions : 3 `table` 2 colonnes (« 1 | Fermentation humide »…) = légende numérotée du schéma biogaz → une seule liste ordonnée sous l'image `contain`, **pas de tableau**.
  - FAQ : 7 groupes h4→h2 + accordéons ; « A télécharger » → « À télécharger » (non corrigé à l'import).

### 5. `particuliers-chaleur` — Chaleur ✅

Fait : nouvelles règles génériques dans `enhanceBlocks` (réutilisées par les fiches 6, 7 et 18) —
**11** ≥ 2 offres « image + titre + paragraphe(s) + cta » → grille de `TeaserCard` ; **12** titre + ≥ 3
couples « picto ≤ 160 px + paragraphe » → `FeatureGrid` (nouveau, `templates/parts/FeatureGrid.tsx`, pictos
sans padding via la nouvelle prop `padded` de `ResponsiveImage`) ; **13** h5 + `cta` seul → `ConseilCard`
(nouveau) ; **14** « Questions fréquentes » + groupes titre/blocs → accordéon (1er ouvert si ≤ 5) + lien
« Plus de FAQ » en `ArrowLink` ; **15** paragraphe « schéma » + image → figure `contain` (schéma PAC plus
rogné). `extractUsefulLinks` accepte « heading + `links` sans variante » (aside Liens utiles des onglets
Solutions et Pompe à chaleur) et `UsefulLinks` masque un sous-titre identique au titre de l'aside. N7 :
liens CMS cassés « lausanne.ch?tab=x » → onglet de la page courante (corrige aussi « Calculateur » de la
fiche 6). `npm run screenshots` : défilement plus lent + retour en haut instantané (images paresseuses
toutes chargées, plus d'artefact de header collant dans les captures pleine page).

Écarts assumés : onglet Simulateur = visuel + texte (pas de simulateur) ; titre de groupe FAQ « PàC »
conservé tel quel.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile des 4
onglets passées en revue, sans débordement horizontal.

### 5. `particuliers-chaleur` — Chaleur

- **Route** `/particuliers/je-choisis-mon-offre/chaleur` · **gabarit** `tabbed-product`.
- **Onglets** : `solutions` (32) · `simulateur-thermique` (5) · `pompe-a-chaleur` (28) · `faq` (4).
- **Blocs** : paragraph×36, heading×20, image×12, cta×3, list×2, links×2 (sans variante), accordion×1, contact×1.
- **Points d'attention** : onglet Pompe à chaleur : suite `image` (schémas `PAC_dessin`, fit `contain`) + paragraphe → `MediaRow` ou grille « Les avantages » ; « Vous souhaitez un conseil? » (h5→h3) + `cta` → encart ; « Liens utiles » (`heading` + `links` sans variante) → aside `UsefulLinks` ; FAQ en `heading` h5 + paragraphes dans Solutions → accordéon ou liste Q/R ; onglet FAQ : un seul accordéon précédé du titre « PàC » ; onglet Simulateur : visuel + liste, pas de simulateur fonctionnel.

### 6. `particuliers-solaire-photovoltaique` — Solaire photovoltaïque (particuliers) ✅

Fait : entièrement couvert par les règles 11 (cartes d'offre), 14 (FAQ en accordéon) et N15 (« m² »),
lien « Calculateur » réparé par N7 (fiche 5). Ajout : `MediaRow` empile les visuels larges non
recadrables (`contain`, ratio ≥ 1.8, bannière de l'onglet Calculateur) au lieu de les réduire en vignette.
Écart assumé : onglet Calculateur = visuel + texte (pas de calculateur). Vérifié : typecheck/lint/build OK,
smoke test complet (222/222) OK, captures desktop + mobile des 3 onglets passées en revue.

### 6. `particuliers-solaire-photovoltaique` — Solaire photovoltaïque (particuliers)

- **Route** `/particuliers/je-produis-mon-energie/solaire-photovoltaique` · **gabarit** `tabbed-product`.
- **Onglets** : `solutions` (23) · `calculateur` (6) · `conditions` (4).
- **Blocs** : paragraph×13, heading×11, image×4, cta×2, documents×2, list×1, contact×1.
- **Points d'attention** : parent dans le fil d'Ariane = « Je produis mon énergie » (hors périmètre, route existante) ; « Questions fréquentes » = titres h5→h3 + paragraphes → accordéon construit dans le gabarit ; titre « Combien de m 2 de panneaux… » : l'exposant a été perdu au crawl (« m² » à corriger dans le gabarit ou le normaliseur) ; Calculateur = visuel `contain` + texte (pas de calculateur) ; Conditions = 2 groupes `heading` + `documents`.

### 7. `professionnels-solaire-photovoltaique` — Solaire photovoltaïque (professionnels) ✅

Fait : 3 cartes d'offre (dont Contracting solaire), FAQ en accordéon. Ajouts : règle 16 (paragraphe
entièrement en gras « Quelles solutions à Lausanne pour les professionnels? » → vrai titre h2, et la règle
9 `MediaRow` s'arrête sur ces pseudo-titres au lieu d'absorber toute l'intro) ; N15 étendu (« 100m2 » →
« 100m² », « par m3 » → « par m³ », aussi dans le texte HTML) ; **N10 étendu** : la ligne « Ecrivez-nous
Tél. +41 21 315 82 82 » (libellés des liens aplatis) est retirée des blocs contact — corrige aussi les
fiches 3, 8 et 13. Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop +
mobile des 2 onglets passées en revue.

### 7. `professionnels-solaire-photovoltaique` — Solaire photovoltaïque (professionnels)

- **Route** `/professionnels/produire-de-l-energie/solaire-photovoltaique` · **gabarit** `tabbed-product`.
- **Onglets** : `solutions` (25) · `conditions` (6).
- **Blocs** : paragraph×11, heading×10, image×4, cta×3, documents×3, contact×1.
- **Points d'attention** : identique à #6 + offre « Contracting solaire » ; 3 groupes de documents.

### 8. `partenaires-raccordements` — Raccordements ✅

Fait : les 23 tableaux s'affichaient déjà en listes de prix dans les accordéons. Corrections génériques :
**règle 17** — titre + accordéon dont les items ne sont pas des questions (« Raccordement en basse tension
(BT) ») → titre + accordéon simple, sans « N questions » ni entrée dans l'aside « Thèmes » (les vraies FAQ
IPE restent des `FaqGroup`) ; `liftHeadingLevels` : les onglets qui commençaient en h3 remontent en h2
(hiérarchie h1 → h2 → h3 continue) ; « Obtenez rapidement vos plans de réseaux… » → `ConseilCard` (prop
`html` ajoutée) ; **panneaux d'accordéon** rendus dans `enhanceBlocks` désormais en `block-flow`
(paragraphes, listes et tableaux n'étaient plus espacés — corrige aussi les fiches 1, 4, 5) ;
`BlockContact` n'affiche les horaires « Lundi-vendredi : 8h-17h » que pour le numéro principal (le
contact Service Patrimoine affichait deux horaires contradictoires ; aussi fiches 3, 7, 13, 15, 16, 19) ;
N7 : « lausanne.ch#faq » → onglet courant (`?tab=ipe`).

Écarts assumés : lien « Consultez notre FAQ » vers l'onglet IPE sans ancre (la FAQ est en bas de l'onglet) ;
cartes Google My Maps derrière consentement (non chargées sur les captures).

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile des 7 onglets
passées en revue ; non-régression contrôlée sur `particuliers-electricite?tab=tarifs` et l'aside de
`professionnels-electricite`.

### 8. `partenaires-raccordements` — Raccordements

- **Route** `/partenaires/raccordements` · **gabarit** `tabbed-product`.
- **Onglets (7)** : `electricite` (21) · `gaz` (9) · `chaleur` (12) · `ipe` (52) · `fibre-optique` (12) · `eau` (16) · `assainissement` (11).
- **Blocs** : paragraph×163, heading×67, list×24, table×23 (tous dans des accordéons), accordion×14, image×9, video×7 (Google My Maps), documents×5, links×1, contact×1.
- **Points d'attention** : H1 « Raccordements » (titre CMS « Raccordements - Electricité ») ; le tag d'univers est absent (pas d'univers unique) ; la barre de 7 onglets doit rester utilisable en pilules défilantes < md ; chaque onglet commence par « Notre réseau » + carte Google My Maps (consentement, 4:3 mobile / 16:9 desktop) ; les 23 tableaux (1 à 3 colonnes, sans en-têtes) sont des grilles de tarifs forfaitaires **dans des accordéons** → `DefinitionList` / petite `PriceTable` ; « Obtenez rapidement vos plans de réseaux » → encart CTA ; contact : `mailto:` raccordements + `tel:` dédié (021 315 87 87) à afficher en ligne téléphone.

### 9. `particuliers-je-choisis-mon-offre` — Je choisis mon offre ✅

Fait : `SectionTemplate` finalisé (✅) — chaque bloc dans sa section, titres h2 ajoutés (« Nos offres »
masqué pour la grille, « Nos domaines d'activité » et « À découvrir » visibles), contact en bandeau
`ContactBand` (nouveau, variante `band` de `BlockContact`). `TeaserCard` : prop `showUniverse` (pastille
d'univers en surimpression, activée sur la grille rubrique ; Mobilité → pastille mobilité, lien vers la
page hors périmètre). Vérifié : typecheck/lint/build OK, smoke test (222/222) OK, captures desktop + mobile.

### 9. `particuliers-je-choisis-mon-offre` — Je choisis mon offre

- **Route** `/particuliers/je-choisis-mon-offre` · **gabarit** `section`.
- **Blocs** : teasers[grid]×1 (5 cartes), contact×1.
- **Points d'attention** : cartes teaser 4:3 avec texte contenant `<strong>` (autorisé) ; pastille d'univers sur chaque carte (§ 2.4, `universeFromLabel`) ; le 5e teaser « Mobilité » n'a pas de slug → lien vers la page hors périmètre ; lead avec `<br>` ; bloc contact en variante `band` (ou `CtaBand`).

### 10. `a-propos-nos-activites` — Nos activités ✅

Fait : `LinkTiles` (nouveau, `BlockLinks`) pour les `icon-nav` hors univers — tuiles bordées libellé +
flèche, 1 → 2 → 3 colonnes, icônes SVG du CMS non reprises (réutilisé par les fiches 11 et 12) ; **N16** :
« facture » → « Règlements » (titre SVG erroné), coquille « Mutlimédia » → « Multimédia » ; accroches en
`PromptCard` sous « À découvrir ». Vérifié : typecheck/lint/build OK, smoke test (222/222) OK, captures
desktop + mobile.

### 10. `a-propos-nos-activites` — Nos activités

- **Route** `/a-propos-sil/nos-activites` · **gabarit** `section`.
- **Blocs** : gallery×1, links[icon-nav]×1, teasers[accroche]×1, contact×1.
- **Points d'attention** : galerie → bandeau 21:9 avec crédits en pastille ; `icon-nav` hors univers (Électricité, Chauffage à distance, Éclairage public, Multimédia — hors périmètre — et un 5e lien vers Règlements **dont le libellé crawlé est « facture »** : titre SVG erroné du site actuel, à renommer « Règlements ») → tuiles de liens sans icônes d'univers erronées (§ 6) ; seul « Règlements » est une page de l'app ; accroches → `PromptCard`.

### 11. `a-propos-notre-portrait` — Notre portrait ✅

Pas de corps : galerie, « Pour aller plus loin », chiffres clés clairs (« plus de 125 ans »), contact en
bandeau. N1 : « A votre écoute » → « À votre écoute ».

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 11. `a-propos-notre-portrait` — Notre portrait

- **Route** `/a-propos-sil/notre-portrait` · **gabarit** `content`.
- **Blocs** : gallery×1, links[icon-nav]×1 (Valeurs, Histoire, Organigramme, Publications — toutes hors périmètre), keyfigures×1, contact×1.
- **Points d'attention** : pas de corps de texte : la mise en page 2 colonnes n'a pas de sens → galerie, tuiles « Pour aller plus loin », `KeyFigures` **variante claire** pleine largeur 4 colonnes, contact `band` ; valeurs « + de 125 ans » → préfixe « plus de » + unité « ans » à 45 % ; « A votre écoute » dans le lead → « À ».

### 12. `a-propos-notre-engagement` — Notre engagement ✅

Galerie, « Pour aller plus loin », contact en bandeau.

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 12. `a-propos-notre-engagement` — Notre engagement

- **Route** `/a-propos-sil/notre-engagement` · **gabarit** `content`.
- **Blocs** : gallery×1, links[icon-nav]×1 (4 liens hors périmètre), contact×1.
- **Points d'attention** : même composition que #11 sans chiffres clés.

### 13. `a-propos-c-for` — C-FOR ✅

Carrousel réduit à 1 teaser → carte d'accroche ; sections image + titre + paragraphe en `MediaRow` ;
chiffres clés « + 200 » → « +200 » (`parseKeyFigure`) ; logo C-FOR dans la carte contact (`BlockContact` lit
`block.logo`).

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 13. `a-propos-c-for` — C-FOR

- **Route** `/a-propos-sil/c-for` · **gabarit** `content`.
- **Blocs** : teasers[carousel]×1 (doublon déjà retiré → 1 item), image×3, heading×3, paragraph×3, keyfigures×1, contact×1.
- **Points d'attention** : le carrousel ne contient plus qu'un teaser (page lausanne.ch hors section SiL → lien sortant) → afficher une carte simple, pas de flèches ; chaque section = `image` + `heading` + `paragraph` → `MediaRow` ; `contact.logo` = `logo-c-for` (logo C-FOR, pas le logo SiL) et lien `mailto:sil.cfor@…` ; image `guide_fond_metro` en `contain`.

### 14. `a-propos-reglements` — Règlements ✅

Accordéon unique déplié en sections h2 (`unfoldSingleAccordion`, titres internes h4 → h3) avec sommaire
des 5 domaines ; `extractUsefulLinks` ne sort plus en aside un bloc `links` que sous « Liens utiles » /
« En relation » (la liste « Fourniture d'énergie électrique… » reste dans sa section).

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 14. `a-propos-reglements` — Règlements

- **Route** `/a-propos-sil/nos-activites/reglements` (alias `/partenaires/reglements`) · **gabarit** `content`.
- **Blocs** : accordion×1 (5 items : Électricité, Gaz naturel-biogaz, Chauffage à distance, Prestations de services énergétiques, Multimédia – accès réseau), documents×8, heading×7, paragraph×4, links×2 (sans variante), contact×1.
- **Points d'attention** : contenu entièrement dans un accordéon → sur cette page, accordéon **ouvert par défaut** ou sections dépliées avec sommaire ; documents groupés par titres h5→h4 ; `links` sans variante → `LinkList` avec description ; contact titré « Coordonnées ».

### 15. `particuliers-economies-energie` — Économies d'énergie - Particuliers ✅

Règle 18 : illustration + titre + listes → en-tête de section à vignette 80 px (plus de pictos géants) ;
Kit équiwatt en `MediaRow`.

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 15. `particuliers-economies-energie` — Économies d'énergie - Particuliers

- **Route** `/particuliers/j-optimise-ma-consommation/economies-d-energie-particuliers` · **gabarit** `content`.
- **Blocs** : list×7, heading×5, image×4, paragraph×4, contact×1.
- **Points d'attention** : chaque section = `image` + `heading` (Chauffage, Électricité, Eau chaude, Kit équiwatt, Écogestes) + listes → média d'ouverture de section ; listes ordonnées de gestes → `Steps` possible ; sommaire dans l'aside ; titre long conservé tel quel (pas d'onglets, pas de coupe au « - »).

### 16. `particuliers-renovation-bien-immobilier` — Rénovation de mon bien immobilier ✅

Photo d'ouverture 21:9 ; N16 : « CECB ® , » → « CECB®, » ; visuel CECB en `contain` (`CONTAIN_RE`),
empilé et plafonné à 24rem (`MediaRow`).

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 16. `particuliers-renovation-bien-immobilier` — Rénovation de mon bien immobilier

- **Route** `/particuliers/j-optimise-ma-consommation/renovation-de-mon-bien-immobilier` · **gabarit** `content`.
- **Blocs** : paragraph×14, list×4, heading×3, image×2, contact×1.
- **Points d'attention** : titres « CECB ® » avec espace parasite avant « ® » (à nettoyer dans le gabarit ou le normaliseur) ; longues sections de texte → `prose` 45rem + sommaire.

### 17. `carrieres-nos-metiers` — Nos métiers ✅

Bannière d'ouverture 21:9 ; section diversité en `MediaRow`. Écart assumé : pas de `Quote` automatique sur
« Rejoindre les SiL… » (DESIGN § 11.18 : ne pas l'inventer).

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 17. `carrieres-nos-metiers` — Nos métiers

- **Route** `/carrieres/nos-metiers` · **gabarit** `content`.
- **Blocs** : paragraph×10, list×3, image×2, heading×2, contact×1.
- **Points d'attention** : image `Caf--Carri-re-Internet` en ouverture (aussi utilisée dans le méga-menu) ; `Quote` éditoriale **facultative** sur la dernière phrase en gras « Rejoindre les SiL, c'est bien plus qu'un métier » (§ 11.18, ne pas l'automatiser) ; parent du fil d'Ariane = rubrique « Carrières ».

### 18. `particuliers-multimedia` — Multimédia ✅

Bannière d'ouverture ; 3 offres en cartes (`TeaserCard` avec surtitre « Offres Combo / Télévision /
Téléphone mobile », ancres du sommaire portées par les cartes) ; `MediaRow` absorbe désormais un `cta` final.

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 18. `particuliers-multimedia` — Multimédia

- **Route** `/particuliers/je-choisis-mon-offre/multimedia` · **gabarit** `content` (page sans onglets).
- **Blocs** : heading×6, image×4, paragraph×4, cta×3, contact×1.
- **Points d'attention** : 3 offres (Offres Combo, Télévision, Téléphone mobile) = `heading` h4→h2 + `image` + `heading` h5→h3 + `paragraph` + `cta` « En savoir plus » (lien externe) → cartes d'offre en grille plutôt qu'une colonne de texte ; envisager le hero produit avec tag d'univers Multimédia (pas de `heroImage` : utiliser la 1re image).

### 19. `professionnels-telegestion` — Télégestion ✅

Page courte : colonne de lecture sans aside, contact en bandeau.

`ContentTemplate` finalisé (✅, commun aux fiches 11 à 19) : ouverture = galerie ou image ≥ 900 px en 21:9
(3:2 mobile) ; corps passé par `enhanceBlocks` (mêmes règles que les pages produit) ; aside collant = sommaire
« Sur cette page » (≥ 3 h2, masqué < lg, ancres `id` posées par `BlockHeading` et les règles d'enrichissement)

- Liens utiles + contact, si le corps est assez long — sinon contact en bandeau `ContactBand` ;
  `links[icon-nav]` → « Pour aller plus loin » (`LinkTiles`) et `keyfigures` → panneau clair 4 colonnes en
  pleine largeur.

Vérifié : typecheck/lint/build OK, smoke test complet (222/222) OK, captures desktop + mobile passées en revue.

### 19. `professionnels-telegestion` — Télégestion

- **Route** `/professionnels/optimiser-sa-consommation/telegestion` · **gabarit** `content`.
- **Blocs** : paragraph×3, list×1, contact×1.
- **Points d'attention** : page très courte : pas de sommaire ; contact `band` en fin de page plutôt qu'un aside quasi vide.

### 20. `particuliers-contact` — Contacter les Services industriels de Lausanne ✅

Fait : `ContactTemplate` finalisé (✅) selon DESIGN § 12.5 — 3 cartes de contact rapide (bouton `tel:` 56 px +
horaires en `dl` ; urgences en `Callout urgent` « 7j/7, 24h/24 — Au menu vocal, tapez 4 » ; guichets
`MapPin`/`Clock`), note d'enregistrement en 14 px muted ; FAQ sur fond neutral-50 (1re question ouverte) +
`ArrowLink` « Consulter toutes nos questions (FAQ) » ; « Nous écrire » : 12 tuiles de sujets **non
cliquables** (2 col. mobile icône au-dessus, 4 col. desktop) + bouton secondaire « Accéder au formulaire sur
lausanne.ch » (le formulaire aplati reste filtré) ; carte Professionnels (téléphone, courriel, horaires) ;
contact en bandeau. Aucun `<table>` rendu. Toutes les données viennent du JSON sauf la liste des sujets.

Vérifié : typecheck/lint/build OK, smoke test complet OK, captures desktop + mobile (débordement des
libellés longs des tuiles corrigé par empilement + césure).

### 20. `particuliers-contact` — Contacter les Services industriels de Lausanne

- **Route** `/particuliers/contact-sil` · **gabarit** `contact`.
- **Blocs** : paragraph×15, heading×7, table×3, accordion×1, contact×1.
- **Points d'attention** (§ 12.5, § 14.9) :
  - **Blocs 13 à 19 = formulaire aplati** (« actual page:Page 1 », texte concaténé, « [VALI] [PROD] ») : déjà filtrés par `withoutFlattenedForm` ; ne jamais les afficher. Les sujets de la grille « Nous écrire » (Adresse et déménagement, Compteur / Compteur intelligent, Consommation et factures, Dépannage et coupure, Subvention 80, Tarifs et prestations, Mon compte / Compte pro, Conseils énergétiques, Formation, Raccordement au réseau, Contrôle, Pénurie) sont à saisir en dur (tuiles non fonctionnelles, 2 col. mobile / 4 col. desktop).
  - Les 3 `table` 2 colonnes **sans en-têtes** (lieux/horaires, téléphone/horaires, professionnels) → `dl` / cartes, **jamais `<table>`** (§ 11.13).
  - Cartes de contact rapide : téléphone (bouton `tel:` 56 px + horaires), urgences (`Callout urgent` « 7j/7, 24h/24 — au menu vocal, tapez 4 »), guichets (`MapPin` / `Clock`) ; note astérisque d'enregistrement en 14 px muted.
  - FAQ (2 questions) sur fond neutral-50 + lien flèche « Consulter toutes nos questions (FAQ) » (page hors crawl → lien sortant).
  - Professionnels : carte avec téléphone 021 315 82 82 et courriel institutionnel du JSON.
  - Le lead contient « Vous avez une question?<br> » : garder la mise en forme sur deux lignes.

## 3. Définition de fini (par page)

Cocher tout avant de passer à la page suivante.

**Conformité visuelle**

- [ ] Desktop 1440 px conforme à la maquette / à DESIGN.md (gabarit § 12, composants § 11) : hiérarchie, espacements (`py-section`, `mb-stack`), rayons, couleurs de rôle.
- [ ] Mobile 390 px conforme : ordre des éléments, boutons pleine largeur < sm, aside après le contenu, tableaux lisibles, onglets en pilules.
- [ ] Vérifié aussi à 768 px et 1024 px (changements de breakpoints du § 4).
- [ ] Captures `npm run screenshots -- <route>` comparées côte à côte avec `design/mockups/screenshots/` (ou la capture du site actuel dans `crawl/screenshots/` pour vérifier qu'aucun contenu n'a disparu).
- [ ] Aucun contenu parasite (formulaire aplati, doublons) ni contenu perdu par rapport au JSON.

**Code**

- [ ] Composants `TODO(dev)` utilisés par la page terminés ; attribut `data-todo` retiré ; statut d'en-tête passé à ✅.
- [ ] Aucune couleur en dur, uniquement des tokens ; pas de conflit d'utilitaires (§ 6.2 d'ARCHITECTURE).
- [ ] Liens via `SmartLink` / `ButtonLink` / `ArrowLink` / `RichText` uniquement ; les liens internes naviguent sans rechargement.
- [ ] Données du JSON jamais éditées à la main ; toute correction systématique ajoutée au normaliseur puis `npm run import-content`.

**Accessibilité**

- [ ] Un seul h1 (`data-route-focus`), niveaux de titres continus (vérifier l'arbre des titres).
- [ ] Navigation clavier complète : ordre logique, focus visible, onglets (←/→), accordéons (Entrée/Espace), carrousels (boutons), aucun piège.
- [ ] Images : `alt` pertinent ou vide si décoratif, crédits en légende ; iframes avec `title` et consentement.
- [ ] Liens externes et documents annoncés (« site externe », « PDF, 286 Ko ») ; cibles ≥ 44 px sur mobile.
- [ ] Zoom 200 % sans perte ; `prefers-reduced-motion` respecté ; contrastes conformes au § 2.6.

**Qualité**

- [ ] `npm run lint` : 0 erreur, 0 avertissement.
- [ ] `npm run typecheck` : 0 erreur.
- [ ] `npm run build` : OK.
- [ ] `npm run test:smoke` : vert sur desktop **et** mobile (aucune erreur console, aucun débordement horizontal).
- [ ] Ligne de la page mise à jour dans le tableau « État des composants » ci-dessus.
