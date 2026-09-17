# SiL — Charte graphique & look and feel (POC refonte)

> Services industriels de Lausanne · proposition de refonte mobile-first de la section SiL de lausanne.ch.
> Destinataires : architecte React (Vite + React + TypeScript + Tailwind CSS v4) et développeurs.
> Tout ce qui est décrit ici se remplit avec le contenu réel du crawl (`../crawl/content/*.json`, `../crawl/navigation.json`).

**Livrables du dossier `design/`**

| Fichier | Rôle |
|---|---|
| `DESIGN.md` | Ce document : principes, fondations, composants, gabarits, règles d'implémentation |
| `tokens.css` | Design tokens : `:root` (valeurs, préfixe `--sil-*`) + `@theme inline` Tailwind v4 + breakpoints. À importer tel quel |
| `fonts/` | Figtree variable (woff2, latin + latin-ext + italique), licence SIL OFL 1.1, auto-hébergée |
| `assets/logo-sil-positif.svg` · `logo-sil-negatif.svg` · `logo-sil-monochrome.svg` | Logo recadré au plus juste (viewBox 106.73×30), versions fond clair / fond sombre / `currentColor` |
| `mockups/accueil.html` · `mockups/produit-onglets.html` | Maquettes HTML haute fidélité (contenu réel), `mockups.css` = implémentation de référence des composants, `mockups.js` = comportements (onglets, accordéon, méga-menu, drawer, carrousel) |
| `mockups/screenshots/` | Captures 1440 px et 390 px (accueil, méga-menu, menu mobile, 4 onglets de la page produit) |
| `scripts/contrast.py` | Calcul des ratios WCAG de toutes les paires de couleurs utilisées (`--md` pour le tableau ci-dessous) |
| `scripts/build-mockups.py` · `scripts/mockup-src/` · `scripts/screenshots.js` | Génération des maquettes depuis le JSON crawlé, captures Playwright |

**Voir les maquettes** : les polices woff2 sont bloquées par Chromium en `file://` (CORS). Servir la racine du projet :
`cd /home/mob/sil/opus && python3 -m http.server 8765` puis ouvrir `http://127.0.0.1:8765/design/mockups/accueil.html`.
États de démo par URL : `produit-onglets.html?tab=tarifs|produits|raccordement|securite|faq`, `accueil.html?menu=particuliers`, `accueil.html?drawer=particuliers` (à 390 px).

---

## 1. Intention

### 1.1 Positionnement
Les SiL sont un **service public** lausannois (130 ans en 2026) qui vend de l'énergie et des services dans un marché partiellement ouvert : électricité 100 % renouvelable *nativa*, chauffage à distance, gaz, multimédia, mobilité électrique, solaire. Le site doit à la fois **rassurer** (institution, tarifs réglementés, urgences 24/7), **servir** (trouver un tarif, un PDF, une démarche en trois gestes sur mobile) et **donner envie** (transition écologique, offres, subventions).

Le site actuel souffre de : hiérarchie plate (tout en Open Sans gris, titres verts peu contrastés), barre verte `#09a16d` portant du texte blanc à 3.3:1, onglets à pictos gris datés, FAQ de 55 questions en liste continue, tableaux non responsives (mobile = défilement ou écrasement), méga-menu à deux étages bruyant, CTA verts appliqués au cas par cas en style inline.

### 1.2 Principes
1. **Clarté d'abord** — une idée par section, titres forts, texte à 16 px minimum, longueur de ligne ≤ 68 caractères. Le contenu réglementaire (tarifs, OIBT, PDF) doit être *lisible*, pas juste présent.
2. **Proximité lausannoise** — ton chaleureux et concret : photos locales quand elles existent (Halle Sud Beaulieu, Lavey, Chauderon), coordonnées et urgences toujours à un geste, vocabulaire des SiL (« Je choisis mon offre »).
3. **Énergie maîtrisée** — un système sobre (beaucoup de blanc, neutres chauds) où la couleur a un rôle : **vert = agir**, **rouge = signature de marque**, **pastilles d'univers = se repérer**. Jamais de couleur décorative gratuite.
4. **Mobile-first et accessible par défaut** — cibles tactiles ≥ 44 px, contrastes AA calculés, focus visible, composants ARIA standard, `prefers-reduced-motion` respecté.
5. **Un système, pas des pages** — 20 composants couvrent les 12 types de blocs du CMS ; aucune mise en forme ad hoc (fin des styles inline par bouton).

### 1.3 Moodboard (textuel)
- **Lumière du Léman un matin clair** : blancs chauds, gris pierre (`#f6f6f4`), ciel franc.
- **Signalétique suisse contemporaine** : grotesque géométrique, alignements stricts, pictogrammes à trait régulier, pastilles de couleur codifiées (comme les lignes tl / CFF).
- **Le logo SiL comme motif** : ses traits épais à terminaisons arrondies deviennent des *rails* (soulignement d'onglet actif, filet de navigation) et ses lettres, agrandies à 5 % d'opacité, un filigrane de bandeau ; son **point rouge** devient la pastille des surtitres et le point final du titre d'accueil.
- **Références d'esprit** : sites de fournisseurs d'énergie nordiques et suisses récents (clarté, cartes arrondies, données mises en avant), design systems publics (GOV.UK, DSFR) pour la rigueur d'accessibilité.
- **À éviter** : dégradés « tech », néons verts, photos de stock génériques en plein écran avec texte blanc non protégé, icônes remplies multicolores.

---

## 2. Couleurs

### 2.1 Choix et justification
| Rôle | Base historique | Décision |
|---|---|---|
| **Action** (boutons, liens, onglet actif) | Vert CTA `#09a16d` (barre de nav SiL + CTA inline) | Conservé comme **green-500** (identité), mais le texte blanc dessus n'atteint que 3.32:1. L'action utilise **green-700 `#00734d`** (5.90:1 blanc) — même teinte, plus dense, plus « institution ». |
| **Signature de marque** | Rouge Lausanne `#e1313c`, point du logo `#e30613` | Rouge réservé aux **accents** : pastille des surtitres, point du logo, point final du H1 d'accueil, badges PDF, erreurs/urgences. Jamais en aplat de navigation (évite la confusion avec lausanne.ch et l'effet « alerte »). Texte rouge = **red-600 `#c8202c`**. |
| **Texte et structure** | Noir `#000`, gris `#333/#666/#999/#ccc/#eee` | Neutres **chauds** dérivés du noir du logo `#1d1d1b` : plus doux que le noir pur, cohérents avec les photos. `#999` (2.85:1) est abandonné pour le texte. |
| **Focus / info** | Bleu interactif `#0080bf` | Recyclé en **anneau de focus** (blue-600) et couleur d'information / univers Gaz. |
| **Avertissement** | Ambre `#f69e01` | Conservé (amber-500), texte en amber-700. Univers Électricité. |

### 2.2 Palette complète (valeurs dans `tokens.css`)

**Vert SiL (action)** — `--sil-green-*` / `bg-green-*`
| 50 | 100 | 200 | 300 | 400 | **500** | 600 | **700** | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#ecf8f2` | `#d2efe2` | `#a6dfc6` | `#6fcaa5` | `#36b485` | `#09a16d` | `#008a5c` | `#00734d` | `#065c3f` | `#0a4a34` | `#062a1f` |
| fonds doux, hover ghost | | | lien sur fond sombre | | rail, icônes, décor | décor | **boutons, liens** | hover | pressed, bandeau CTA, chiffres clés | |

**Rouge Lausanne (accent)** — `--sil-red-*`
| 50 | 100 | 200 | 300 | 400 | **500** | **600** | 700 | 800 | 900 | 950 | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `#fdeeee` | `#fbd6d8` | `#f6adb1` | `#ee7c83` | `#e8535c` | `#e1313c` | `#c8202c` | `#a51d27` | `#8d1e20` | `#6f1a1d` | `#3f0c0e` | `#e30613` |

**Neutres chauds** — `--sil-neutral-*`
| 0 | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `#ffffff` | `#fbfbfa` | `#f6f6f4` | `#eeeeeb` | `#e0e0dc` | `#c9c9c3` | `#a3a39c` | `#7b7b74` | `#5f5f59` | `#474743` | `#30302d` | `#1d1d1b` | `#111110` |
| page | hover | section alternée | chips, header tableau | bordures | bordures fortes | texte sur sombre | bordure champ | texte secondaire | lead, eyebrow | | **texte** | footer |

**Bleu** `50 #e6f3fa · 100 #c6e3f3 · 300 #7fd3ff (focus inverse) · 500 #0080bf · 600 #006fa6 (focus) · 700 #005a87 (info)`
**Ambre** `50 #fff5e0 · 100 #ffe7b3 · 400 #ffb42e · 500 #f69e01 · 700 #9a5b00`

### 2.3 Rôles sémantiques (à utiliser dans les composants)
| Token CSS (`--sil-…`) | Classe Tailwind | Valeur |
|---|---|---|
| `bg` / `bg-subtle` / `bg-muted` | `bg-surface` / `bg-surface-subtle` / `bg-surface-muted` | blanc / neutral-50 / neutral-100 |
| `bg-inverse` · `bg-brand` · `bg-brand-subtle` | `bg-surface-inverse` · `bg-surface-brand` · `bg-surface-brand-subtle` | neutral-950 · green-900 · green-50 |
| `text` · `text-muted` · `text-inverse` · `text-inverse-muted` | `text-ink` · `text-muted` · `text-inverse` · `text-inverse-muted` | neutral-900 · 600 · blanc · neutral-400 |
| `text-link` / `-hover` | `text-link` / `text-link-hover` | green-700 / green-800 |
| `border` · `border-strong` · `border-input` | `border-border-default` · `border-border-strong` · `border-border-input` | neutral-200 · 300 · 500 |
| `action` · `action-hover` · `action-active` · `action-subtle` · `on-action` | `bg-action` … `text-on-action` | green-700 · 800 · 900 · 50 · blanc |
| `accent` | `bg-accent` / `text-accent` | red-500 (décoratif uniquement) |
| `focus` · `focus-inverse` | `outline-focus` | blue-600 · blue-300 |
| `success` · `warning` · `danger` · `info` (+ `-bg`) | `text-success` / `bg-success-bg` … | green-700 · amber-700 · red-700 · blue-700 sur leurs 50 |

### 2.4 Accents par univers
Utilisés **uniquement** pour la pastille d'icône (fond `-soft` + icône `-ink`), le tag du hero intérieur et un éventuel filet décoratif (`-accent`). Toujours accompagnés d'une icône **et** d'un libellé (jamais la couleur seule, WCAG 1.4.1).

| Univers | Icône Lucide | `-accent` | `-soft` | `-ink` (icône/texte) | Contraste ink/soft |
|---|---|---|---|---|---|
| Électricité | `Zap` | `#f69e01` | `#fff3d6` | `#8a5200` | 5.79:1 |
| Chaleur (CAD, PAC) | `Heater` | `#e5542b` | `#fdebe4` | `#b03a16` | 5.25:1 |
| Gaz | `Flame` | `#0080bf` | `#e3f2fa` | `#00628f` | 5.84:1 |
| Multimédia | `Wifi` | `#7a4fd8` | `#efe9fc` | `#5f37b8` | 6.51:1 |
| Mobilité | `PlugZap` | `#13a3a3` | `#e0f5f4` | `#0b6f70` | 5.26:1 |
| Solaire | `Sun` | `#f5c000` | `#fff7d1` | `#7a6000` | 5.56:1 |

Mapping données : `links[variant=icon-nav]` de l'accueil (libellés `Electricité`, `Chaleur`, `Gaz`, `Multimédia`, `Mobilité`, `Solaire`) et `teasers[variant=grid]` de `particuliers-je-choisis-mon-offre`. Classe utilitaire de maquette : `.u-electricite` etc. (définit `--u`, `--u-soft`, `--u-ink`) ; en React, prop `universe` → data-attribute.

### 2.5 États interactifs
| État | Règle |
|---|---|
| Hover | Bouton primaire green-700 → 800 ; secondaire bordure neutral-300 → 900 ; cartes : ombre `md` + bordure `strong` + zoom image 1.04 ; liens : soulignement 1 → 2 px |
| Active / pressed | green-900 + `translateY(1px)` (supprimé si mouvement réduit) |
| Focus visible | `outline: 3px solid var(--sil-focus); outline-offset: 2px` ; sur fond sombre (`.on-dark`) `--sil-focus-inverse`. Cartes à lien étiré : l'anneau est porté par la carte (`:focus-within`) |
| Sélectionné | Onglet desktop : rail green-500 3 px + icône green-700 ; onglet mobile : pilule neutral-900 texte blanc ; menu ouvert : fond green-50 texte green-800 |
| Désactivé | opacité 0.4 (icônes), ou fond neutral-200 / texte neutral-500 ; `aria-disabled` ; exempté de contraste mais jamais seul porteur d'information |
| Erreur / urgence | red-700 sur red-50 + icône `TriangleAlert` |

### 2.6 Contrastes calculés (WCAG 2.1)
Calculés avec `scripts/contrast.py` (formule de luminance relative WCAG). Seuils : 4.5:1 texte courant, 3:1 texte ≥ 24 px (ou 18.66 px gras) et composants d'interface / anneaux de focus. **45 paires, 0 échec.**

| Premier plan | Fond | Usage | Ratio | Requis | Résultat |
|---|---|---|---:|---:|---|
| `#1d1d1b` | `#ffffff` | Texte principal (neutral-900) sur blanc | 16.88:1 | 4.5:1 | AAA |
| `#1d1d1b` | `#f6f6f4` | Texte principal sur fond alterné (neutral-50) | 15.60:1 | 4.5:1 | AAA |
| `#5f5f59` | `#ffffff` | Texte secondaire (neutral-600) sur blanc | 6.43:1 | 4.5:1 | AA |
| `#5f5f59` | `#f6f6f4` | Texte secondaire sur neutral-50 | 5.94:1 | 4.5:1 | AA |
| `#5f5f59` | `#eeeeeb` | Texte secondaire sur neutral-100 | 5.53:1 | 4.5:1 | AA |
| `#474743` | `#ffffff` | Texte lead (neutral-700) sur blanc | 9.33:1 | 4.5:1 | AAA |
| `#7b7b74` | `#ffffff` | Bordure de champ (neutral-500) sur blanc | 4.26:1 | 3.0:1 | AA grand texte / UI |
| `#ffffff` | `#00734d` | Bouton primaire : blanc sur green-700 | 5.90:1 | 4.5:1 | AA |
| `#ffffff` | `#065c3f` | Bouton primaire hover : blanc sur green-800 | 8.04:1 | 4.5:1 | AAA |
| `#00734d` | `#ffffff` | Lien (green-700) sur blanc | 5.90:1 | 4.5:1 | AA |
| `#00734d` | `#f6f6f4` | Lien sur neutral-50 | 5.45:1 | 4.5:1 | AA |
| `#065c3f` | `#ecf8f2` | Texte green-800 sur green-50 (menu actif) | 7.38:1 | 4.5:1 | AAA |
| `#0a4a34` | `#ecf8f2` | Texte callout green-900 sur green-50 | 9.44:1 | 4.5:1 | AAA |
| `#ffffff` | `#0a4a34` | Blanc sur green-900 (bandeau CTA, chiffres clés) | 10.28:1 | 4.5:1 | AAA |
| `#d2efe2` | `#0a4a34` | green-100 sur green-900 (texte secondaire bandeau) | 8.42:1 | 4.5:1 | AAA |
| `#a6dfc6` | `#0a4a34` | green-200 sur green-900 (préfixes chiffres clés) | 6.85:1 | 4.5:1 | AA |
| `#ffb42e` | `#0a4a34` | Icône alerte amber-400 sur green-900 | 5.79:1 | 3.0:1 | AA |
| `#1d1d1b` | `#ffffff` | Bouton inverse : ink sur blanc | 16.88:1 | 4.5:1 | AAA |
| `#ffffff` | `#111110` | Blanc sur footer (neutral-950) | 18.89:1 | 4.5:1 | AAA |
| `#c9c9c3` | `#111110` | Liens footer (neutral-300) sur neutral-950 | 11.36:1 | 4.5:1 | AAA |
| `#a3a39c` | `#111110` | Texte discret footer (neutral-400) sur neutral-950 | 7.45:1 | 4.5:1 | AAA |
| `#6fcaa5` | `#111110` | Lien accent footer (green-300) sur neutral-950 | 9.60:1 | 4.5:1 | AAA |
| `#e30613` | `#111110` | Point rouge du logo sur neutral-950 (logo négatif) | 3.87:1 | 3.0:1 | AA grand texte / UI |
| `#e30613` | `#ffffff` | Point rouge du logo sur blanc | 4.88:1 | 3.0:1 | AA |
| `#e1313c` | `#ffffff` | Rouge Lausanne red-500 sur blanc (décoratif uniquement) | 4.46:1 | 3.0:1 | AA grand texte / UI |
| `#c8202c` | `#ffffff` | Texte rouge red-600 sur blanc (« À la une ») | 5.68:1 | 4.5:1 | AA |
| `#a51d27` | `#fdeeee` | Badge PDF / erreur : red-700 sur red-50 | 6.65:1 | 4.5:1 | AA |
| `#09a16d` | `#ffffff` | Vert historique green-500 sur blanc (décoratif, rail) | 3.32:1 | 3.0:1 | AA grand texte / UI |
| `#ffffff` | `#09a16d` | Blanc sur green-500 (INTERDIT pour texte < 24 px) | 3.32:1 | 3.0:1 | AA grand texte / UI |
| `#0080bf` | `#ffffff` | Bleu historique blue-500 sur blanc (décoratif) | 4.34:1 | 3.0:1 | AA grand texte / UI |
| `#006fa6` | `#ffffff` | Anneau de focus blue-600 sur blanc | 5.49:1 | 3.0:1 | AA |
| `#006fa6` | `#f6f6f4` | Anneau de focus sur neutral-50 | 5.07:1 | 3.0:1 | AA |
| `#7fd3ff` | `#111110` | Anneau de focus inverse blue-300 sur neutral-950 | 11.39:1 | 3.0:1 | AAA |
| `#7fd3ff` | `#0a4a34` | Anneau de focus inverse sur green-900 | 6.20:1 | 3.0:1 | AA |
| `#005a87` | `#e6f3fa` | Info : blue-700 sur blue-50 | 6.60:1 | 4.5:1 | AA |
| `#9a5b00` | `#fff5e0` | Badge JSON / avertissement : amber-700 sur amber-50 | 5.01:1 | 4.5:1 | AA |
| `#1d1d1b` | `#f69e01` | Ink sur amber-500 | 7.89:1 | 4.5:1 | AAA |
| `#8a5200` | `#fff3d6` | Univers Électricité : ink sur soft | 5.79:1 | 4.5:1 | AA |
| `#b03a16` | `#fdebe4` | Univers Chaleur : ink sur soft | 5.25:1 | 4.5:1 | AA |
| `#00628f` | `#e3f2fa` | Univers Gaz : ink sur soft | 5.84:1 | 4.5:1 | AA |
| `#5f37b8` | `#efe9fc` | Univers Multimédia : ink sur soft | 6.51:1 | 4.5:1 | AA |
| `#0b6f70` | `#e0f5f4` | Univers Mobilité : ink sur soft | 5.26:1 | 4.5:1 | AA |
| `#7a6000` | `#fff7d1` | Univers Solaire : ink sur soft | 5.56:1 | 4.5:1 | AA |
| `#ffffff` | `#707070` | Blanc sur overlay photo 60 % (pire cas : photo blanche) | 4.95:1 | 4.5:1 | AA |
| `#ffffff` | `#1d1d1b` | Onglet mobile actif : blanc sur neutral-900 | 16.88:1 | 4.5:1 | AAA |

**Règles qui en découlent**
- `green-500 #09a16d`, `red-500 #e1313c`, `blue-500 #0080bf`, `amber-500` et tous les `-accent` d'univers : **jamais pour du texte < 24 px** ni pour du texte blanc posé dessus.
- `neutral-400` : uniquement sur fond sombre. Sur fond clair, texte secondaire = `neutral-600` minimum.
- Texte sur photo : toujours sur `--sil-overlay-photo` (≥ 60 % d'opacité sous le texte) ou dans une carte blanche.

---

## 3. Typographie

### 3.1 Famille : **Figtree** (Google Fonts, SIL OFL 1.1, variable 300–900)
- **Pourquoi** : grotesque géométrique aux formes rondes et ouvertes qui prolonge naturellement le logo (lettres à terminaisons arrondies, « i » à point circulaire) tout en restant très lisible en texte courant — ce qu'Open Sans fait bien mais de façon générique et datée. Chiffres nets pour les tarifs, excellent rendu des accents français, fichiers légers (≈ 20 Ko/subset).
- Comparée en rendu réel à Outfit (trop géométrique en texte), Plus Jakarta Sans (large), Manrope (technique), Instrument Sans et Hanken Grotesk : Figtree offre le meilleur compromis chaleur / lisibilité / cohérence avec le logo.
- **Une seule famille** (poids 400 → 800) : performance et cohérence. Auto-hébergée (`design/fonts/`, `font-display: swap`, préchargement du subset latin). Pile de secours : `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial`.
- Graisses : 400 texte · 500–550 liens, lead · 600–650 UI (boutons, nav, labels, onglets) · 700 titres H2–H4 · 750 H1/display · 800 chiffres clés.
- Chiffres : `font-variant-numeric: tabular-nums` pour tarifs, dates, chiffres clés.

### 3.2 Échelle responsive (fluide 390 → 1440 px, `clamp()`)
| Token (`text-…`) | Mobile | Desktop | Interligne | Approche | Graisse | Usage |
|---|---|---|---|---|---|---|
| `display` | 40 px | 64 px | 1.04 | −0.03em | 750 | H1 d'accueil uniquement |
| `h1` | 34 px | 52 px | 1.08 | −0.025em | 750 | H1 des pages intérieures |
| `h2` | 28 px | 40 px | 1.15 | −0.02em | 700 | Titres de section |
| `h3` | 22 px | 28 px | 1.25 | −0.01em | 700 | Sous-sections, groupes FAQ, titres de carte produit |
| `h4` | 19 px | 22 px | 1.3 | −0.005em | 650 | Intertitres dans le contenu |
| `lead` | 18 px | 22 px | 1.5 | 0 | 400 (gras 700 conservé) | Chapeau (`lead` du JSON) |
| `body-lg` | 18 px | 18 px | 1.6 | 0 | 400 | Sous-titres de section, callouts |
| `body` | 16 px | 16 px | 1.6 | 0 | 400 | Texte courant (minimum absolu du texte continu) |
| `sm` | 14 px | 14 px | 1.5 | 0 | 400–650 | Fil d'Ariane, méta documents, légendes |
| `xs` | 13 px | 13 px | 1.4 | +0.01em | 650–700 | Badges, barre utilitaire, mois des dates |
| `figure` | 36 px | 56 px | 1.0 | −0.03em | 800 | Chiffres clés |

Surtitre (« eyebrow ») : `sm` 650, neutral-700, précédé d'une **pastille rouge de 8 px** (le point du logo). Casse normale (pas de capitales espacées).
Titres en capitales dans le CMS (`TARIFS 2027`) : **normaliser en casse phrase à l'affichage** (« Tarifs 2027 »).

---

## 4. Espacements, grille, breakpoints

- **Unité 4 px** (`--spacing: 0.25rem` → `p-4` = 16 px). Rythme courant : 8 · 12 · 16 · 24 · 32 · 48 · 64.
- Tokens fluides : `gutter` 16 → 32 px (marges latérales) · `grid` 16 → 32 px (gouttières) · `section` 56 → 104 px (padding vertical des sections) · `section-sm` 40 → 64 px · `stack` 24 → 40 px (titre de section → contenu).
- **Conteneur** : `max-width: 80rem` (1280 px, gouttières incluses → 1216 px de contenu à 1440 px). Colonne de lecture `prose` 45rem / `68ch`.
- **Grille** : 4 colonnes mobile · 8 tablette (≥ 768) · 12 desktop (≥ 1024). Page de contenu desktop : `1fr + 20rem` (aside collant), gouttière 72 px.

| Breakpoint | min-width | Changements majeurs |
|---|---|---|
| (base) | 0 | 1 colonne, drawer, onglets en pilules défilantes, tableaux en cartes, footer en accordéons |
| `xs` | 384 px | — (réservé grands smartphones) |
| `sm` | 640 px | Boutons de hero côte à côte, icône Espace client + recherche dans le header, badge produit positionné |
| `md` | 768 px | Fil d'Ariane complet, onglets soulignés, tableaux en vrai tableau, univers 3 col., accroches 2 col., footer 3 col. |
| `lg` | 1024 px | Navigation desktop + méga-menu, hero en 2 colonnes, aside collant, univers 6 col., carrousel avec flèches |
| `xl` | 1280 px | Conteneur à largeur max |
| `2xl` | 1440 px | Nom « Services industriels de Lausanne » à côté du logo (masqué entre 1024 et 1439 px faute de place) |

---

## 5. Rayons, ombres, élévation

**Rayons** (écho des terminaisons arrondies du logo) : `xs 4` badges de format · `sm 8` petites vignettes · `md 12` pastilles d'icône, tuiles de date · `lg 16` **cartes, accordéons, tableaux, listes de documents** · `xl 24` images de hero, bandeau chiffres clés, carte produit · `2xl 32` image du hero d'accueil ≥ lg · `full` **boutons, chips, onglets mobiles, badges**.

**Ombres** (teintées neutral-900, très diffuses) : `xs` · `sm` header au scroll · `md` survol de carte · `lg` méga-menu, carte flottante du hero · `xl` drawer. Les cartes au repos n'ont **pas** d'ombre : bordure neutral-200 (style plat, moderne, lisible).

**Élévation / z-index** : onglets collants 30 · header 40 · voile 50 · méga-menu 60 · drawer 70 · lien d'évitement 100. Quand le méga-menu est ouvert, le header passe au-dessus du voile (`.header:has(.megamenu:not([hidden]))`, en React : classe conditionnelle).

---

## 6. Iconographie

- **Librairie : [`lucide-react`](https://lucide.dev)** (ISC) — trait 2 px, coins arrondis cohérents avec Figtree et le logo. Tailles : 16 (inline, méta), 18 (boutons), 20 (défaut), 24 (pastilles). Toujours `aria-hidden` si un libellé texte existe ; sinon `aria-label` sur le bouton parent.
- **Réseaux sociaux** : Lucide n'a plus de logos de marque → `@icons-pack/react-simple-icons` (CC0) ou SVG Simple Icons inline (Facebook, Instagram, LinkedIn, YouTube, X).
- **Les pictos d'onglets du site actuel (`assets/icons/picto-onglet-*.svg`, fill `#333`) sont remplacés** par Lucide :

| `tabs[].id` / icône source | Lucide | | `tabs[].id` / icône source | Lucide |
|---|---|---|---|---|
| `produits`, `solutions` | `Package` | | `electricite` (raccordements) | `Zap` |
| `tarifs` (`picto-onglet-prix`) | `ReceiptText` | | `gaz` | `Flame` |
| `raccordement` | `Cable` | | `chaleur` (`picto-onglet-cad`) | `Heater` |
| `securite` | `ShieldCheck` | | `ipe` (photovoltaïque) | `Sun` |
| `faq` | `CircleHelp` | | `fibre-optique` | `Wifi` |
| `simulateur-thermique`, `calculateur` | `Calculator` | | `eau` | `Droplets` |
| `pompe-a-chaleur` | `Fan` | | `assainissement` | `Waves` |
| `gaz-solaire` (solaire thermique) | `ThermometerSun` | | `conditions` | `FileCheck` |

- Icônes d'interface : `Search`, `CircleUserRound` (Espace client), `Menu`/`X`, `ChevronDown` (dépliables), `ChevronRight` (fil d'Ariane), `ArrowRight` (lien interne), `ArrowUpRight` (lien externe / site partenaire), `Download` (fichier), `Link` (document de type LINK), `Phone`, `MapPin`, `Bus` (transports publics), `Clock`, `TriangleAlert` (urgences), `Info`, `Leaf` (produits renouvelables), `ChartColumn` (graphique Datawrapper), `Play` (vidéo), `Map` (carte Google My Maps), `Quote`, `House`/`Building2`/`Handshake` (profils Particulier/Professionnel/Partenaire).
- Liens `icon-nav` hors univers (ex. « Valeurs, Histoire, Organigramme, Publications » sur `a-propos-notre-portrait`) : ne pas réutiliser les `<title>` SVG erronés de la source ; utiliser la variante **liste de liens** (sans icône) ou une icône générique choisie à la main.

---

## 7. Photographie et images

- **Ratios** : hero accueil 4:3 mobile / 5:4.4 desktop · hero intérieur 16:9 mobile / 4:3 desktop · cartes teaser **4:3** (format natif des visuels carrousel 620×462 et 500×375) · accroches carré 1:1 (visuels 310×310) · figures de contenu 3:2 · carte produit / Datawrapper 16:9 · galeries 1940×746 d'origine → **21:9** en bandeau.
- `object-fit: cover` pour les photos ; **`contain` sur fond neutral-50 pour les schémas et visuels avec texte** (`schema*.png`, `modele*.png`, `PAC_dessin.png`, `Site_SiL_Gaz_Schema_Biogaz…`, visuels de campagne comme « Prêts à batoiller » qui contiennent du texte : ne jamais les recadrer serré).
- **Overlay** : jamais de texte blanc directement sur photo sans `--sil-overlay-photo` (dégradé bas 0 → 82 % de neutral-950). La maquette privilégie le texte *sous* l'image (cartes) : plus lisible, plus robuste avec des visuels de campagne hétérogènes.
- **Qualité des sources** : beaucoup d'images crawlées sont petites (310 px de large : accroches, galeries `*-1940x746` réduites, pictos). Ne pas les agrandir au-delà de ~1.25× : les accroches sont donc des cartes horizontales à vignette ≤ 200 px. Images haute définition disponibles pour les grands formats : `back-business-2000x1334…png` (panneaux solaires, hero accueil), `back-priv-2000x1334…png` (ciel), `AdobeStock_227727671…-2.jpg` (ampoule/pousse, hero électricité), `AdobeStock_278552879…-2.jpg` (gaz), `SILPDP14-072…-2.jpg` (chaleur), `electricite-professionnels-AdobeStock_201844325…jpg`, `AdobeStock_2k_130665463…jpg`.
- **Performance** : les PNG de fond font 2.4–3.9 Mo → convertir en AVIF/WebP (≈ 150–250 Ko), `srcset` 640/1024/1600/2000, `loading="lazy"` sauf image LCP (`fetchpriority="high"`), `width`/`height` renseignés.
- **Alt** : le crawl remplit souvent `alt` avec un crédit (« © Ville de Lausanne ») → l'afficher en `figcaption` (crédit) et mettre `alt=""` si l'image est décorative, ou rédiger un alt descriptif.

---

## 8. Motion

| Token | Durée | Usage |
|---|---|---|
| `instant` | 80 ms | feedback de pression |
| `fast` | 150 ms | couleurs, soulignements, flèches (translateX 3 px) |
| `base` | 220 ms | ouverture accordéon / méga-menu (`opacity` + `translateY(-8px → 0)`), changement d'onglet (fondu) |
| `slow` | 320 ms | drawer (`translateX(100% → 0)`), défilement carrousel |
| `slower` | 480 ms | zoom d'image au survol (1 → 1.04) |

Easings : `standard cubic-bezier(.2,0,0,1)` · `out cubic-bezier(.05,.7,.1,1)` (entrées) · `in cubic-bezier(.3,0,.8,.15)` (sorties).
**`prefers-reduced-motion: reduce`** : les tokens de durée passent à 1 ms (`tokens.css`), `scroll-behavior: auto`, aucun `transform` au survol (zoom, translate), carrousel sans défilement animé. Pas d'autoplay (carrousel, vidéo) — jamais.

---

## 9. Logo

- **Fichiers** : `assets/logo-sil-positif.svg` (lettres `#1d1d1b`, point `#e30613`), `logo-sil-negatif.svg` (lettres blanches, point rouge, pour footer et fonds ≤ neutral-800 / green-900), `logo-sil-monochrome.svg` (`currentColor`, filigrane décoratif uniquement). ViewBox recadré au plus juste (106.73×30) — la version header d'origine (`logo-sil.svg`, 188×75) contient 20 unités de vide en bas qui faussent l'alignement.
- **Tailles** : header 26 px de haut (mobile) / 32 px (≥ lg) ; footer 32 px ; carte contact 22 px. **Minimum 20 px de haut** (point rouge ≥ 3 px).
- **Zone de protection** : égale au diamètre du point rouge (≈ 31 % de la hauteur) sur les 4 côtés ; aucun texte ni bord d'écran dans cette zone. Le nom « Services industriels de Lausanne » s'appose à droite, séparé par un filet vertical neutral-300 et 12 px d'espace.
- **Interdits** : recolorer le point, placer le logo positif sur photo ou fond < 7:1, déformer, ajouter une ombre, utiliser la version filigrane comme logo.
- **Filigrane** : lettres du logo en `currentColor` blanc à 5–6 % d'opacité, recadrées hors du conteneur (bandeau CTA, chiffres clés) — reprise du `logo-sil-filigrane.svg` d'origine.
- **Double appartenance** : l'écusson « Ville de Lausanne » (`crawl/assets/brand/ecusson-lausanne.svg`, gris clair) reste dans la barre utilitaire et le pied de page, sur fond neutral-950.

---

## 10. Accessibilité — règles transverses
- Langue `fr-CH`, un seul `h1` par page, niveaux de titres continus. **Les niveaux du CMS (h4/h5 arbitraires) sont remappés** : h4 de premier niveau d'un onglet → `h2`, h5 → `h3`, etc.
- Lien d'évitement « Aller au contenu » (premier élément focusable) ; `main#contenu`, `nav[aria-label]`, `footer`.
- Cibles ≥ 44×44 px sur mobile ; sur desktop, liens de méga-menu ≥ 36 px de haut (≥ 44 px si `pointer: coarse`).
- Liens externes : icône `ArrowUpRight` + texte masqué « (site externe) » ; documents : format et poids annoncés (« (PDF, 286 Ko) »).
- Composants ARIA : onglets = pattern *Tabs* (flèches ←/→, Home/End, activation automatique) ; accordéon = `button[aria-expanded][aria-controls]` dans un titre + `region` ; méga-menu = *disclosure* (pas de `role=menu`), fermeture Échap / clic extérieur ; drawer = `dialog[aria-modal]` avec piège de focus et retour du focus au bouton Menu.
- Contenus tiers (Datawrapper, YouTube, Google My Maps) : chargés à la demande (bloc de consentement), `iframe[title]` obligatoire.
- Zoom 200 % et texte agrandi : aucun conteneur à hauteur fixe pour du texte ; boutons autorisés à passer sur deux lignes.

---

## 11. Composants

Convention : **Anatomie** → **Variantes** → **États** → **Mobile / Desktop** → **Données**. Les noms de classes cités renvoient à l'implémentation de référence dans `mockups/mockups.css`.

### 11.1 Barre utilitaire + Header (`.utility`, `.header`)
- **Anatomie** : (1) barre utilitaire neutral-950, 36 px : « Un site de la [écusson Ville de Lausanne] » à gauche ; à droite (≥ md) « ⚠ Urgences ou pannes 24h/24 : **021 315 88 88** » et « Contact ». (2) header blanc translucide (94 % + `backdrop-filter: blur(14px)`), bordure basse neutral-200 : logo + nom (2 lignes, 12–13 px, séparé par un filet) · navigation principale · actions.
- **Actions** : bouton icône Recherche (visuel, non fonctionnel) · bouton secondaire `sm` « Espace client » avec `CircleUserRound` (≥ lg ; icône seule entre sm et lg ; dans le drawer en dessous) · bouton « Menu » (< lg), pilule bordée avec libellé texte + icône `Menu`.
- **Navigation desktop (≥ lg)** : 5 entrées de `navigation.json › mainMenu` (Particuliers, Professionnels, Partenaires, À propos des SiL, Carrières) en boutons 16 px/600 avec `ChevronDown`, pilule 44 px au survol (neutral-100). Rubrique courante : **rail green-500 de 3 px à bouts ronds** collé au bas du header. Ouvert : fond green-50, texte green-800, chevron retourné.
- **Comportement** : seul le header est `sticky` (la barre utilitaire défile). Hauteur 64 px mobile / 80 px desktop. Ombre `sm` après 8 px de scroll (optionnel).
- **Données** : libellés normalisés (« A propos » → « À propos », « Electricité » → « Électricité »).

### 11.2 Méga-menu desktop (`.megamenu`)
- **Anatomie** : panneau pleine largeur sous le header, fond blanc, ombre `lg`, entrée `dropdown` 220 ms. Grille `15rem | 1fr | 18rem`, gap 48 px, padding 40/48 px :
  1. *Intro* : titre de la rubrique (h3), une phrase facultative (ex. Particuliers : « Vous êtes un particulier, un artisan ou un petit commerce? » — tirée du lead de `particuliers-je-choisis-mon-offre`), lien flèche « Vue d'ensemble ».
  2. *Groupes* (3 colonnes) : chaque enfant niveau 2 = titre-lien 16 px/700 ; ses enfants niveau 3 = liste 15 px neutral-700 avec filet gauche neutral-100 qui devient green-500 au survol. Un niveau 2 sans enfants (ex. « Contact ») reste un titre-lien seul. Rubrique sans niveau 3 (Partenaires) : une seule liste.
  3. *À la une* (facultatif) : carte image 16:10 + surtitre « À la une » + titre, alimentée par un teaser de l'accueil (ex. « Tarifs de l'électricité 2027 »).
- **Comportement** : ouverture **au clic** (pas au survol), une seule rubrique ouverte, voile `--sil-overlay-scrim` sur la page, fermeture Échap / clic voile / clic sur le bouton / navigation. `aria-expanded` + `aria-controls` sur le bouton.
- Capture : `screenshots/accueil-megamenu-desktop.png`.

### 11.3 Menu mobile — drawer (`.drawer`)
- **Anatomie** : panneau plein écran (max 26rem) glissant depuis la droite, 320 ms. En-tête collant 64 px (logo + bouton fermer 44 px bordé) · champ de recherche visuel (pilule neutral-100, 48 px) · liste niveau 1 (lignes 60 px, 19 px/700, `ChevronDown`, séparateurs) · pied neutral-50 : bouton primaire bloc « Espace client », bouton secondaire bloc « 021 315 88 88 », mention urgences 7j/7.
- **Déplié** (accordéon, une ou plusieurs rubriques) : niveau 2 en liens 16 px/650 (44 px), niveau 3 en liens 16 px/400 neutral-700 indentés avec filet gauche.
- **Comportement** : `role="dialog" aria-modal="true"`, piège de focus, `body` non scrollable, Échap / voile / bouton ferment, focus rendu au bouton Menu.
- Capture : `screenshots/accueil-menu-mobile.png`.

### 11.4 Fil d'Ariane (`.breadcrumb`)
- **Desktop / tablette (≥ md)** : `nav[aria-label="Fil d'Ariane"] > ol`, 14 px neutral-600, séparateur chevron 14 px à 60 %, page courante neutral-900/600 `aria-current="page"`. Premier élément renommé « Accueil » (le JSON dit « Services industriels (SiL) »).
- **Mobile** : remplacé par un **lien retour vers le parent** (« ← Je choisis mon offre », 44 px, 600) — évite les retours à la ligne sur 4 niveaux.
- Placé en haut du hero intérieur, sur son fond. **Données** : `breadcrumb[]` (liens vers `slug` si crawlé). Les niveaux « Particuliers », « Professionnels »… n'ont pas de page propre : lien vers la page d'accueil filtrée ou non cliquable.

### 11.5 Footer (`.footer`)
- **Anatomie** : fond neutral-950. Haut : colonne marque (logo négatif 32 px, adresse « Contact clients · Service commercial · Place Chauderon 23 · Case postale 7416, 1001 Lausanne », lien green-300 « S'y rendre en transports publics » `Bus`, 5 boutons sociaux ronds 44 px bordés) + 5 colonnes de liens (À propos, Produits, Subventions, Conseils énergétiques, Mon compte — reprises du footer actuel). Bas (filet 14 % blanc) : écusson Ville de Lausanne · Webmaster · Mentions légales · bouton « Haut de page ↑ ».
- **Mobile** : colonnes en `details/summary` 56 px (accordéons), fermées par défaut. **md** : 3 colonnes ouvertes. **lg** : grille `3.2fr | 8.8fr`, 5 colonnes.
- Le widget météo et les boutons de partage du site actuel sont **supprimés** (bruit, dépendances tierces).

### 11.6 Hero d'accueil (`.home-hero`)
- **Anatomie (desktop, 2 colonnes 6/6, gap 64)** : gauche — surtitre « Services industriels de Lausanne », H1 `display` « Bienvenue dans le monde de l'énergie**.** » (point final rouge = point du logo), lead (texte du `lead` d'accueil sans sa première phrase), deux boutons `lg` (primaire « Je choisis mon offre » → ancre univers ; secondaire « Nous contacter »), puis sous un filet « Vous êtes : » + 3 chips profil (Particulier `House`, Professionnel `Building2`, Partenaire `Handshake`). Droite — grande image arrondie `2xl` (`back-business-2000x1334…`), avec **carte flottante « À la une »** (vignette 64 px, surtitre rouge, titre, flèche) qui déborde de 40 px sur la gauche, ombre `lg`.
- **Mobile** : ordre texte → image (4:3, `xl`) avec carte flottante chevauchant le bas (−48 px) → chips profil. Boutons pleine largeur empilés.
- **Données** : `accueil.lead`, 1er teaser pertinent du carrousel (`teasers[variant=carousel]`) pour la carte flottante. Pas de carrousel plein écran en hero (moins lisible, mauvais LCP, pas d'autoplay accessible).

### 11.7 Hero de page intérieure (`.page-hero`)
- **Variante « produit » (avec `heroImage`)** : fond neutral-50, fil d'Ariane, grille 7/5 : tag d'univers (pilule `-soft` + pastille blanche avec icône + libellé de rubrique « Particuliers »), H1 `h1`, lead (`lead` HTML avec `<strong>`), groupe de boutons : primaire = `cta[0]` (« Nous contacter »), secondaire contextuel (« Tarifs 2027 » → `?tab=tarifs`). Image 4:3 rayon `xl` (16:9 rayon `lg` sous le texte sur mobile).
- **Variante « simple » (sans image : contact, rubriques, articles)** : même fond et fil d'Ariane, colonne unique max 48rem, H1 + lead ; option motif filigrane du logo à droite (≥ lg).
- Padding bas 40 → 64 px ; s'enchaîne directement avec la barre d'onglets le cas échéant.

### 11.8 Onglets de contenu (`.tabs-bar`, `.tablist`, `.tab`, `.tabpanel`)
- **Desktop / tablette (≥ md)** : barre blanche collante sous le header (`top: 64/80 px`), bordure basse. Onglets 56 px : icône Lucide 18 px + libellé 16 px/650 neutral-600 ; survol → neutral-900 + rail neutral-300 ; **sélectionné → texte neutral-900, icône green-700, rail green-500 3 px à bouts ronds**.
- **Mobile (< md)** : même barre collante, onglets en **pilules défilantes horizontalement** (44 px, neutral-100 ; sélectionnée neutral-900 texte blanc), `scroll-snap`, masque de fondu gauche/droite indiquant la suite, onglet actif centré automatiquement. Choix délibéré plutôt qu'une conversion en accordéon : on conserve le modèle d'URL `?tab=` du site (liens entrants existants, ex. teaser « Tarifs 2027 » → `electricite?tab=tarifs`), l'onglet reste visible en défilant et les pages à 7 onglets (`partenaires-raccordements`) restent navigables.
- **Comportement** : pattern ARIA *Tabs* (`role=tablist/tab/tabpanel`, `aria-selected`, tabindex itinérant, ←/→/Home/End). Synchroniser `?tab=<id>` via `history.replaceState` ; lire `?tab` au chargement (défaut : premier onglet). Panneau : fondu 220 ms, padding haut 40 → 56 px. Lors d'un lien interne vers un onglet, défiler jusqu'à la barre (`scroll-margin-top` = header + barre).
- **Contenu du panneau** : grille `contenu | aside 20rem` (≥ lg) ; aside collant : liens utiles (issus des couples `heading` « En relation / Conditions des prestations / Démarches en ligne » + paragraphes-liens) et bloc contact. Sur mobile, l'aside passe **après** le contenu.
- **Données** : `tabs[] {id,label,icon,blocks}` ; icône mappée § 6.

### 11.9 Accordéon (`.accordion`)
- **Anatomie** : conteneur blanc bordé neutral-200, rayon `lg`, items séparés par un filet. Déclencheur = `button` pleine largeur dans un titre (`h3`/`h4` selon contexte) : question 17 px/650 à gauche, pastille ronde 32 px (neutral-100, `ChevronDown`) à droite, min 60 px, padding 14/20. Panneau : fond neutral-25, padding 0/20/24, `prose` (paragraphes, listes, documents — récursif).
- **Variantes** : `default` (FAQ) · `compact` (56 px, 16 px — glossaire, archives de tarifs) · **groupe FAQ** (`.faq-group`) : titre h3 + compteur « 12 questions » au-dessus de chaque accordéon.
- **États** : survol fond neutral-25 ; **ouvert : pastille green-700 icône blanche tournée à 180°**, déclencheur fond neutral-25 ; focus : anneau intérieur (offset −3 px). Plusieurs items ouvrables simultanément ; premier item ouvert quand l'accordéon est un aperçu court (≤ 5 questions).
- **FAQ longue** (onglet FAQ électricité : 55 questions en 7 groupes) : sur desktop, aside « Thèmes » avec ancres + compteurs ; sur mobile, groupes à la suite. Pas de recherche (hors périmètre).
- **Données** : `accordion.items[{title, blocks}]` ; titres `heading` précédant un accordéon = titre de groupe (retirer les « : » finaux).

### 11.10 Cartes et teasers
| Variante | Classe | Anatomie | Données |
|---|---|---|---|
| **Carte teaser** | `.card` | image 4:3 (zoom 1.04 au survol) · titre 19 px/700 (lien étiré sur toute la carte) · texte muted 3 lignes max · pied « En savoir plus → » ou « Site partenaire ↗ » | `teasers[variant=carousel|grid]` |
| **Carte d'accroche** | `.prompt-card` | horizontale : vignette carrée 104 px (mobile) / 200 px (≥ lg) · question 17–21 px/700 · texte · « Découvrir → » | `teasers[variant=accroche]` (4 items accueil, 2+ sur `a-propos-nos-activites`) |
| **Carte produit** | `.product-card` | rayon `xl`, padding 24 → 36 : badge (« Produit par défaut » green-700 / « Sur simple demande » neutral) · label `Leaf` · nom « **nativa** – 100% renouvelable, 100% régionale » · texte · embed graphique · note · CTA primaire. Variante `--featured` : bordure green-300 | couples `heading` + `paragraph` + `video` + `cta` des onglets Produits |
| **Carte À la une (méga-menu)** | `.megamenu__feature` | image 16:10, surtitre, titre | teaser choisi |

- **Carrousel** (`.carousel`) : liste `ul` à défilement natif `scroll-snap` (aucune librairie), cartes à 82 % (mobile) / 2.15 visibles (sm) / 3.25 visibles (lg) avec **débord à droite jusqu'au bord de l'écran** (indique qu'il y a une suite), flèches rondes 44 px bordées en en-tête de section (≥ lg, désactivées aux extrémités), barre de progression 3 px. Pas d'autoplay.
- **Grille de teasers** (page rubrique) : 1 col → 2 (md) → 3 (lg), gap `grid`.
- États : survol ombre `md` + bordure `strong` + titre souligné ; focus : anneau sur la carte (`:focus-within`). Liens externes (`external: true`) : `ArrowUpRight` + « (site externe) » masqué.

### 11.11 Grilles de liens (`links`)
- **Grille d'univers** (`.universe-tile`, `variant=icon-nav` sur l'accueil) : mobile 2 colonnes, tuile horizontale 72 px (pastille 44 px `-soft`/`-ink` + libellé 16 px/700) ; md 3 col. ; lg **6 colonnes**, tuile verticale 152 px (pastille 52 px en haut, libellé 18 px en bas, flèche neutral-400 en bas à droite qui prend la couleur `-ink` et glisse au survol, bordure `-accent` + ombre `md` + `translateY(-2px)`).
- **Liste de liens** (`.link-list`) : lignes 44 px min, libellé 600, flèche 16 px, séparateurs ; description facultative en 14 px muted sous le lien (ex. « Règlements et conditions tarifaires — Relatives à la fourniture… »). Utilisée dans l'aside, pour `icon-nav` non-univers (portrait, activités) et pour les paragraphes-liens « En relation ».
- **Actualités** (`.news-item`, `variant=news`) : ligne avec tuile date 56 px (jour 18 px/750 + mois abrégé 11 px capitales, depuis le préfixe « 04.09 – »), titre 600 (lien étiré), flèche. 5 items + « Toutes les actualités → ».

### 11.12 Liste de documents (`.doc-list`)
- **Anatomie** : conteneur bordé rayon `lg` ; ligne min 72 px : badge de format 44 px rayon `sm` (**PDF** red-50/red-700 · **DOCX** blue-50/blue-700 · **JSON** amber-50/amber-700 · **LINK** neutral-100 + icône `Link`) · libellé 16 px/650 (lien étiré) + méta 14 px muted (« PDF · 286 Ko », « Page web · lausanne.ch ») · action ronde 44 px (`Download` ou `ArrowUpRight`).
- **États** : survol fond neutral-25, libellé souligné, action fond green-50 ; focus : anneau intérieur sur la ligne.
- **Données** : `documents.items[{label,url,format,size,date}]`. Retirer le suffixe « (PDF) » / « (JSON) » du libellé (redondant avec le badge). `date` (« 1 er janvier 2025 ») → méta « PDF · 144 Ko · 1er janvier 2025 » (corriger l'espace). Accessibilité : « (PDF, 286 Ko) » en texte masqué.
- Groupes de documents précédés d'un `heading` (« Tarifs 2026 », « Reprise de l'énergie 2026 ») → h3 + liste ; archives dans un accordéon compact.

### 11.13 Tableau de tarifs (`.price-table`) — responsive
- **Desktop / tablette (≥ md)** : conteneur `.table-wrap` bordé rayon `lg`. En-tête neutral-100 texte 14 px/700 ; légende au-dessus : titre h3 + « Tarifs en CHF, hors TVA » à droite. Cellules padding 16/20, séparateurs neutral-200. **Colonne libellé** (`th[scope=rowgroup]`, 30 %, 700, filet droit) ; **colonne description** neutral-700 ; **colonne prix** alignée à droite, `tabular-nums`, 17 px/750, format suisse « 150.– ». Lignes de complément (première cellule vide dans le JSON, ex. « Pour une installation supplémentaire ») = sous-lignes du même `tbody` sur fond neutral-25, le libellé en `rowspan`. Survol de ligne : green-50.
- **Mobile (< md)** : **chaque groupe devient une carte** (`tbody` en bloc, bordé, rayon `lg`, 12 px d'écart) : libellé 17 px/700 en tête, puis lignes « description | prix + CHF » en grille `1fr auto`, sous-lignes séparées par un filet pointillé. `thead` visuellement masqué mais lu.
- **Tableaux complexes** (> 4 colonnes, en-têtes fusionnés perdus au crawl — ex. tarif gaz `particuliers-gaz-naturel` 10 colonnes, tableaux de `partenaires-raccordements`) : **pas de conversion en cartes** ; conteneur `.table-scroll` à défilement horizontal (min 44rem), première colonne `position: sticky`, indice « Faire défiler → » sous le tableau (< lg), ombre intérieure au bord de défilement. Les en-têtes doivent être reconstruits à la main dans le POC (les `headers` du JSON sont vides ou décalés).
- **Tableaux-listes à 2 colonnes** (contact : lieux/horaires) : **ne pas les rendre en tableau** → liste de définitions ou cartes (voir gabarit Contact).
- Capture : `produit-onglets-securite-desktop.png` / `-mobile.png`.

### 11.14 Chiffres clés (`.keyfigures`)
- **Anatomie** : panneau green-900 rayon `xl`, padding 32 → 40, filigrane du logo en haut à droite ; surtitre + titre (« Les SiL, ce sont… ») ; grille `dl` 2 colonnes (mobile et dans une colonne de 5/12) ou **4 colonnes** en pleine largeur (≥ lg), séparateurs 16 % blanc. Chaque chiffre : préfixe éventuel en 14 px/650 green-200 au-dessus (« plus de »), valeur `figure` 36 → 56 px/800 blanche (unité « ans » à 45 %), libellé 15 px green-100 dessous. Lien flèche blanc facultatif.
- **Variante claire** (pages À propos, fond neutral-50) : valeurs green-800, libellés neutral-600.
- **Données** : `keyfigures {title, items[{value,label}]}` (`a-propos-notre-portrait`, `a-propos-c-for`). Découper `value` : préfixe « + de » → « plus de », « + 200 » → garder « +200 ».

### 11.15 Bloc contact (`.contact-card`)
- **Anatomie** : carte bordée rayon `lg`, padding 24 : logo 22 px · titre (« Contact clients ») · adresse (`lines` sans le titre répété ; retours à la ligne avant « Case postale ») · ligne téléphone (`Phone` + numéro 20 px/750 + horaires muted) si disponible · ligne `Bus` « S'y rendre en transports publics » (lien `t-l.ch`) · bouton primaire bloc « Nous contacter » · boutons sociaux 44 px (Facebook, Instagram, LinkedIn).
- **Variantes** : `aside` (colonne latérale collante, desktop) · `band` (pleine largeur neutral-50 en fin de page de contenu : logo + adresse | téléphone | CTA sur 3 colonnes ≥ lg, empilé sur mobile).
- **Données** : `contact {title, lines, logo, links}` présent sur les 20 pages. Le téléphone n'est pas dans le bloc : le reprendre de `particuliers-contact` (Tél. 021 315 88 88) comme donnée globale.

### 11.16 Boutons et liens (`.btn`)
| Variante | Fond / texte / bordure | Usage |
|---|---|---|
| `primary` | green-700 / blanc → hover green-800 → active green-900 | 1 action principale par zone (« Nous contacter », « Je choisis l'origine de mon électricité », CTA du JSON) |
| `secondary` | blanc / neutral-900 / neutral-300 1.5 px → hover bordure neutral-900 | action alternative |
| `ghost` | transparent / green-700 → hover green-50 | action tertiaire dans une barre (« Ouvrir ↗ ») |
| `inverse` | blanc / neutral-900 → hover green-50 | action principale sur fond sombre |
| `outline-inverse` | transparent / blanc / blanc 55 % | action secondaire sur fond sombre |
| `icon` | rond 44 px, transparent ou bordé | recherche, fermer, flèches de carrousel, réseaux sociaux |

- Tailles : `sm` 44 px (header, barres) · `md` 48 px (défaut) · `lg` 56 px (heros, bandeau). **Pilule** (`radius-full`), 16 px/650, padding horizontal 18/24/28, icône 18 px, gap 10. Icône flèche finale qui glisse de 3 px au survol.
- Texte autorisé sur 2 lignes (centré, `text-wrap: balance`) — jamais tronqué ni débordant. `btn-group--fluid` : boutons pleine largeur empilés < sm.
- **Liens dans le texte** : green-700, soulignement 1 px (offset 3 px) → 2 px et green-800 au survol. **Lien flèche** (`.arrow-link`) : 650, green-700, `ArrowRight`, 44 px de haut.
- **Données** : `cta {label,url}` (bloc) et `page.cta[]` (hero). Tous les CTA verts inline du site actuel deviennent `primary`.

### 11.17 Bloc vidéo / embed (`.embed`)
- **Anatomie** : cadre bordé rayon `lg`, fond neutral-50. **Avant consentement** : zone 16:9 (240 px min sur mobile) avec pastille icône (`ChartColumn` Datawrapper · `Play` YouTube + miniature · `Map` Google My Maps), titre, texte « Graphique interactif hébergé par Datawrapper. En l'affichant, vous acceptez le chargement de contenu externe. », bouton secondaire « Afficher le graphique / la vidéo / la carte ». Barre inférieure : « Source : datawrapper.dwcdn.net » + bouton ghost « Ouvrir ↗ ».
- **Après consentement** : `iframe[title][loading=lazy]` ; Datawrapper : hauteur auto via leur script `postMessage` (sinon 420 px) ; YouTube : 16:9 `youtube-nocookie.com` ; cartes : 4:3 mobile / 16:9 desktop. Mémoriser le choix par fournisseur (localStorage).
- **Données** : `video {url}` — détecter le type par domaine (`datawrapper.dwcdn.net`, `google.com/maps/d/embed`, `youtube.com`). Le titre n'existe pas dans le JSON : le déduire du titre/produit précédent (« Composition du produit nativa »).

### 11.18 Citation (`.quote`)
- **Anatomie** : `figure > blockquote + figcaption`. Icône `Quote` 32 px green-500, texte 22 → 28 px/500, interligne 1.35, neutral-900, rail gauche green-500 4 px arrondi (ou sans rail en variante centrée), attribution 14 px/650 + fonction muted. Option portrait rond 56 px.
- **Données** : **aucun bloc citation dans le crawl**. Composant prévu pour les contenus éditoriaux (ex. mettre en exergue « Rejoindre les SiL, c'est bien plus qu'un métier » sur `carrieres-nos-metiers`, dernier paragraphe en gras). Ne pas l'inventer automatiquement.

### 11.19 Image avec légende et galerie (`.figure`)
- **Figure** : image rayon `lg`, ratio 3:2 (photos) ou `contain` sur fond neutral-50 + padding 16 (schémas) ; `figcaption` 14 px muted (crédit « © EMO Photo »). **Média + texte** (`.media-row`) : vignette 14rem carrée à gauche du texte ≥ md (images 247 px de l'onglet Sécurité), empilé sur mobile.
- **Galerie** (`gallery`, pages À propos) : bandeau `scroll-snap` d'images 21:9 (mobile 16:10), crédit en pastille semi-opaque en bas à droite de chaque image, flèches et compteur « 1 / 4 ». Pas d'autoplay.

### 11.20 Bandeau d'appel à l'action (`.cta-band`)
- **Anatomie** : pleine largeur green-900, padding `section-sm`, filigrane des lettres du logo (5 %) en bas à droite. Gauche : titre h2 blanc (« Vous avez une question ? »), texte 18 px green-100 (« Formulaire, guichet ou téléphone, nos spécialistes sont à votre disposition ! »), note urgences avec `TriangleAlert` amber-400. Droite (≥ lg) / dessous (mobile, boutons pleine largeur) : `inverse` « Nous contacter » + `outline-inverse` « 021 315 88 88 » (`tel:`).
- Usage : fin de page d'accueil et de pages rubriques ; **un seul par page**, jamais deux fonds sombres consécutifs sans séparation (le footer est neutral-950, le bandeau green-900 : différence volontaire).

### 11.21 Éléments d'appoint
- **Callout** (`.callout`) : bloc rayon `lg` padding 20, icône 24 px + texte 18 px/550. `brand` (green-50/green-900, `Leaf`) pour une phrase-clé de marque (h5 d'intro de l'onglet Tarifs) ; `info` (blue-50, `Info`) pour les conditions (« Les tarifs sont valables dès le 1er janvier 2027 ») ; `urgent` (red-50, `TriangleAlert`).
- **Badge** (`.badge`) : pilule 24 px, 13 px/700 — `new` (green-700/blanc, « Nouveau »), `neutral`.
- **Étapes** (`.steps`) : liste ordonnée en cartes neutral-50 rayon `md` avec numéro rond 30 px ; 2 colonnes ≥ md pour des items courts (composition du prix), 1 colonne pour une marche à suivre. Titre d'étape en gras seulement si l'item a la forme « Libellé : description » (découpage sur le premier « : »).
- **Surtitre** (`.eyebrow`), **chip** (`.chip`, 44 px neutral-100 → green-50) : voir § 3 et § 11.6.

---

## 12. Gabarits de page

Tous : barre utilitaire → header → `main` → footer. Rythme : sections alternant blanc / neutral-50, padding `section`.

### 12.1 Accueil (`accueil`) — maquette `mockups/accueil.html`
1. **Hero d'accueil** (§ 11.6) — `lead` + carte flottante (teaser « Tarifs de l'électricité 2027 »).
2. **Je choisis mon offre** — grille d'univers 6 tuiles (`links[icon-nav]`), lien « Toutes nos offres » → `particuliers-je-choisis-mon-offre`.
3. **À la une** (neutral-50) — carrousel des 7 `teasers[carousel]`.
4. **Vos projets** — 4 cartes d'accroche (`teasers[accroche]`), grille 2×2.
5. **Quoi de neuf ? + Chiffres clés** (neutral-50) — 5 actualités (`links[news]`) sur 7/12, panneau chiffres clés (`keyfigures` de `a-propos-notre-portrait`) sur 5/12 ; empilés sur mobile.
6. **Bandeau CTA contact** (green-900).
7. Footer (le `contact` de l'accueil alimente la colonne marque du footer).

### 12.2 Page rubrique / sommaire (`particuliers-je-choisis-mon-offre`, `a-propos-nos-activites`)
1. Hero simple (fil d'Ariane, H1, `lead`).
2. Grille de teasers `grid` 3 colonnes (5 univers, image 4:3 + texte `<strong>` autorisé) — ou, pour `a-propos-nos-activites` : galerie → liste de liens `icon-nav` en tuiles → accroches.
3. Bandeau CTA contact **ou** bloc contact `band`.
4. Footer.

### 12.3 Page produit à onglets (`particuliers-electricite`, `-chaleur`, `-gaz-naturel`, `-solaire-photovoltaique`, `professionnels-*`, `partenaires-raccordements`) — maquette `mockups/produit-onglets.html`
1. Hero intérieur « produit » (§ 11.7) — tag d'univers, H1 (titre canonique sans « - Produits »), `lead`, `cta[0]` + raccourci vers l'onglet clé, `heroImage`.
2. **Barre d'onglets collante** (§ 11.8).
3. **Panneau** : contenu (blocs du `tab`) + aside collant (liens utiles extraits des `heading`+paragraphes-liens, puis bloc contact `aside`). Exemples implémentés :
   - *Produits* : titre de section + 2 cartes produit (nativa par défaut, nativaplus mise en avant) avec embed Datawrapper et CTA.
   - *Tarifs* : callout marque → paragraphe profils SIMPLE/DUO → section « Tarifs 2027 » (badge Nouveau, texte, composition du prix en 4 étapes, documents, callout validité, CTA) → « FAQ sur les tarifs 2027 » (accordéon 5 questions, 1re ouverte, lien vers l'onglet FAQ) → « Tarifs précédents » (documents 2026, reprise 2026, accordéon compact des archives).
   - *Raccordement* : image 16:9, titre, lead, texte, CTA.
   - *Sécurité* : média + texte, listes, marche à suivre en étapes, **tableau des frais** (§ 11.13), documents utiles ; aside « Bases légales ».
   - *FAQ* : titre + intro, glossaire (compact), 7 groupes d'accordéons avec compteurs ; aside « Thèmes » (ancres) + « En relation ».
4. Footer (le bloc `contact` est dans l'aside, pas de bandeau supplémentaire).

### 12.4 Page de contenu longue (`a-propos-notre-portrait`, `a-propos-c-for`, `a-propos-notre-engagement`, `carrieres-nos-metiers`, `particuliers-economies-energie`, `particuliers-renovation-bien-immobilier`, `a-propos-reglements`)
1. Hero simple (H1, `lead`).
2. Média d'ouverture : `gallery` (bandeau) ou première `image` (21:9 desktop / 3:2 mobile) ; `teasers[carousel]` de C-FOR en carrousel de cartes.
3. **Corps** : grille `prose 45rem | aside 20rem` (≥ lg). Aside collant : **sommaire** généré depuis les `heading` (ancres) + bloc contact. Blocs : `heading` → h2/h3 remappés, `paragraph`, `list`, `image` (figure pleine largeur de colonne, ou `media-row` si l'image suit un titre), `documents`, `accordion`, citation éditoriale éventuelle.
4. `links[icon-nav]` → tuiles de liens « Pour aller plus loin » ; `keyfigures` → panneau pleine largeur 4 colonnes.
5. Bloc contact `band` (mobile : fin de contenu).
6. Footer.

### 12.5 Page contact (`particuliers-contact`)
1. Hero simple : H1 « Contacter les Services industriels de Lausanne », lead.
2. **Cartes de contact rapide** (grille 3 col. ≥ lg, empilées mobile) :
   - *Par téléphone* : « Tél. 021 315 88 88 » (bouton `tel:` 56 px) + liste horaires (tableau `rows` → `dl` : « Questions administratives : Lundi-vendredi 8h-17h », « Support technique multimédia : 8h-19h ») ;
   - *Urgences ou pannes* : callout `urgent` « 7j/7, 24h/24 — au menu vocal, tapez 4 » ;
   - *Au guichet — Espace clients* : 2 lieux (`MapPin` Place Chauderon 23 / Place de l'Europe 2) avec horaires (`Clock`).
   - Note astérisque sur l'enregistrement des appels en 14 px muted.
3. **Foire aux questions** (neutral-50) : accordéon des 2 questions + lien flèche « Consulter toutes nos questions (FAQ) ».
4. **Nous écrire** : grille de **tuiles de sujets** non fonctionnelles (2 col. mobile, 4 col. desktop, icône + libellé) : Adresse et déménagement, Compteur / Compteur intelligent, Consommation et factures, Dépannage et coupure, Subvention 80, Tarifs et prestations, Mon compte / Compte pro, Conseils énergétiques, Formation, Raccordement au réseau, Contrôle, Pénurie. ⚠ Les blocs 13 à 19 du JSON sont le **formulaire aplati par le crawl** (texte concaténé, « actual page:Page 1 ») : les ignorer, la liste ci-dessus est extraite du début du paragraphe 14.
5. **Professionnels** : carte « Produits électricité, gaz, chauffage à distance et multimédia » (téléphone, lien courriel institutionnel du JSON, horaires).
6. Bloc contact `band` (« Direction Services industriels ») → footer.

---

## 13. Correspondance blocs JSON → composants

| `type` (variant) | Composant | Remarques |
|---|---|---|
| `heading` | `Heading` (h2–h4 remappés) | casse phrase si tout en capitales ; h5 d'intro en tête d'onglet → `Callout brand` |
| `paragraph` | `Prose` | paragraphe ne contenant qu'un lien (+ `<br>` description) après un heading « En relation »/« Démarches »… → `LinkList` |
| `list` | `Prose` (`ul/ol`) ou `Steps` | `Steps` si « marche à suivre » ou items « Libellé : texte » |
| `image` | `Figure` / `MediaRow` | `alt` = crédit → figcaption |
| `gallery` | `Gallery` | |
| `teasers` (`carousel` / `grid` / `accroche`) | `Carousel` de `Card` / grille de `Card` / `PromptCard` | |
| `links` (`icon-nav` / `news` / —) | `UniverseGrid` ou `LinkTiles` / `NewsList` / `LinkList` | univers détectés par libellé |
| `documents` | `DocumentList` | badge par `format` |
| `accordion` | `Accordion` (+ `FaqGroup`) | récursif |
| `table` | `PriceTable` / `ScrollTable` / `DefinitionList` | selon nb de colonnes et présence de prix |
| `contact` | `ContactCard` (`aside` / `band`) | |
| `keyfigures` | `KeyFigures` (`brand` / `light`) | |
| `cta` | `Button primary` | |
| `video` | `Embed` (datawrapper / youtube / map) | consentement |

---

## 14. Points d'attention pour l'architecte et le développeur
1. **Tokens** : importer `tokens.css` après `@import "tailwindcss"`. Valeurs à modifier uniquement dans `:root` ; `@theme inline` ne fait que mapper. `--color-*: initial` retire la palette Tailwind par défaut (volontaire). Copier `fonts/` à côté du CSS (URLs relatives) et précharger `figtree-latin.woff2`.
2. **Remappage des titres** CMS (h4/h5 → h2/h3), normalisation typographique (capitales accentuées « É », « À » ; « TARIFS 2027 » → « Tarifs 2027 » ; suffixes « (PDF) » retirés ; « 1 er » → « 1er »). Le `title` des pages à onglets contient « - Produits » (onglet par défaut) : H1 = partie avant « - ».
3. **Onglets ↔ URL** : `?tab=` est l'état source (liens entrants existants). Offsets de défilement : `scroll-margin-top` = header (64/80) + barre d'onglets (56).
4. **Collants imbriqués** : header `sticky top:0`, barre d'onglets `sticky top: header`, aside `sticky top: header + onglets + 32`. Aucun parent avec `overflow: hidden` au-dessus (sinon `sticky` casse) — c'est pourquoi le débordement horizontal est géré localement (carrousel, onglets, tableaux) et non par `overflow-x: hidden` sur un wrapper.
5. **Liens** : toutes les URL du JSON sont absolues vers lausanne.ch ; router en interne celles qui ont un `slug`, les autres en externe (`ArrowUpRight`). Plusieurs entrées de menu pointent vers des pages non crawlées (pas de `slug`) : page « bientôt disponible » ou lien externe.
6. **Tableaux** : seuls les tableaux simples (≤ 4 colonnes) passent en cartes. Le tableau gaz et ceux de raccordements ont des en-têtes perdus → saisie manuelle ou `ScrollTable`. Les tableaux 2 colonnes « lieu/horaire » sont des listes.
7. **Images** : convertir les PNG de 2–4 Mo, ne pas agrandir les sources 310 px au-delà de ~1.25×, `contain` pour les schémas. `alt` du crawl = crédits.
8. **Embeds tiers** : chargement sur consentement ; `iframe title` requis ; Datawrapper auto-height.
9. **`particuliers-contact`** : ignorer les paragraphes du formulaire aplati (blocs 13–19).
10. **Accessibilité à tester** : navigation clavier complète (méga-menu, drawer avec piège de focus, onglets flèches), zoom 200 %, lecteur d'écran sur tableaux en cartes (`thead` masqué visuellement mais présent), `prefers-reduced-motion`.
11. **Fallback `:has()`** (header au-dessus du voile) : en React, piloter une classe sur le header depuis l'état du méga-menu.
12. **Maquettes** : `mockups.css` est une référence de rendu, pas un code à copier tel quel — traduire en composants + utilitaires Tailwind ; les valeurs (tailles, espacements, états) font foi.
