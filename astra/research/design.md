# SiL — direction UX et visuelle du POC

Direction confirmée : lumineuse, contemporaine et professionnelle. Le POC présente les Services industriels de Lausanne à travers 19 pages navigables. Son rôle est de rendre les offres et les démarches compréhensibles, avec une identité locale forte.

## Base documentaire et périmètre

Sources publiques consultées le 16 septembre 2026 :

- [Accueil SiL](https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels)
- [Électricité](https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels/particuliers/je-choisis-mon-offre/electricite.html)
- [Chaleur](https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels/particuliers/je-choisis-mon-offre/chaleur.html)
- [À propos](https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels/a-propos-sil.html)

Les six univers de la source sont Électricité, Chaleur, Gaz, Multimédia, Mobilité et Solaire. Éviter d'intégrer une rubrique Eau comme offre SiL. Le service existe dans l'arborescence municipale mais ne fait pas partie de ces six univers. La source distingue produits et tarifs électriques ; chauffage à distance et pompes à chaleur ; mobilité électrique ; démarches de déménagement et factures. Ne pas inventer de prix, chiffres clients ou dates d'actualités.

## Direction artistique

Une grande photographie réelle de Lausanne donne la première impression. L’identité propre des SiL repose sur le rouge, le noir et le blanc. Le vert du site municipal existant appartient à une autre entité et ne devient pas une couleur de marque SiL. La direction retenue est lumineuse, moderne et institutionnelle, avec des neutres chauds pour structurer les contenus. Éviter les dégradés, les carrousels et les ombres épaisses. Les photos ne doivent pas avoir l'air de publicité générique internationale.

### Tokens proposés

Les rouges sont des valeurs de travail à confirmer avec le CSS/logo récupérés par le crawler. Le logo lui-même conserve ses couleurs originales.

```css
--brand: #e6323a;
--brand-strong: #ba202a; /* texte et boutons si le contraste de brand est insuffisant */
--ink: #171717;
--muted: #686868;
--paper: #ffffff;
--canvas: #f5f5f2;
--line: #dededb;
--radius: 16px;
--radius-small: 8px;
--container: 1280px;
--gutter: clamp(20px, 4vw, 64px);
```

Police : sans-serif humaniste disponible localement ou système (`Inter, Arial, sans-serif`), poids 400/500/600/700. H1 accueil 72–80 px desktop, interligne 1.04, légère chasse négative ; H1 intérieur 52–64 px ; H2 36–44 px ; texte 17–18 px, interligne 1.6. Mobile H1 42–46 px, H2 30 px, texte 16 px. Garder les légendes à 12 px minimum, les liens à 14–16 px minimum.

## Arborescence de 19 pages

| Route | Nom visible | Gabarit / rôle |
| --- | --- | --- |
| `/` | Accueil | Vitrine éditoriale et accès aux démarches |
| `/energies-solutions` | Énergies & solutions | Six univers réunis |
| `/electricite` | Électricité | Offre et liens utiles |
| `/chaleur` | Chaleur | CAD et pompes à chaleur |
| `/gaz` | Gaz | Offre et accompagnement |
| `/solaire` | Solaire | Production et valorisation |
| `/multimedia` | Multimédia | Internet, TV et téléphonie |
| `/mobilite` | Mobilité | Recharge et mobilité électrique |
| `/vos-demarches` | Vos démarches | Index des tâches |
| `/demenagement` | Déménagement | Guide pratique |
| `/raccordement` | Raccordement | Guide pratique |
| `/facturation-paiement` | Factures & paiements | Guide pratique |
| `/depannage-urgences` | Dépannage & urgences | Contacts vérifiés uniquement |
| `/les-sil` | Les SiL | Mission, histoire, activités |
| `/actualites` | Actualités | Liste éditoriale |
| `/economies-energie` | Économies d'énergie | Conseils et equiwatt |
| `/carriere` | Carrières & formation | Métiers et apprentissages |
| `/contact` | Contact | Coordonnées et orientation |
| `/mentions-legales` | Mentions légales | Texte institutionnel bref |

Éviter de multiplier les sous-pages à faible contenu pour atteindre le quota : les sections internes peuvent rester des ancres. Les boutons du POC doivent tous ouvrir une route, une ancre réelle ou une destination publique pertinente. Aucune soumission de formulaire ni faux paiement.

## Navigation

Desktop : barre utilitaire discrète 34 px avec « Un service de la Ville de Lausanne » à gauche, Contact et Dépannage à droite. Header principal 88–96 px : logo SiL et signature courte à gauche, trois entrées « Énergies & solutions », « Vos démarches », « Les SiL », bouton Recherche si implémenté et bouton « Mon espace » vers le portail réel. Une alternative valide consiste à faire pointer « Mon espace » vers `/facturation-paiement` avec liens officiels explicites sur cette page. Ne pas créer de faux écran de connexion.

Les trois groupes peuvent ouvrir un mega-menu accessible au clic avec fermeture Échap et clic extérieur. Un simple lien vers les trois pages index reste acceptable si le temps manque. Ne pas afficher de chevron laissant supposer un menu inexistant. Indiquer la rubrique active avec soulignement rouge fin.

Mobile : header 72 px, logo 64–78 px de large, boutons espace et menu. Menu plein panneau avec liens regroupés, focus visible et retour sur le bouton à la fermeture. Les mêmes destinations sont disponibles sans survol.

## Accueil : composition précise

1. **Hero éditorial** : fond blanc chaud, colonne texte 46 %, photographie 54 %. Hauteur image 490–540 px desktop, arrondis 16 px, cadrage panoramique de la ville. Petit surtitre « L'ÉNERGIE DE LAUSANNE ». H1 proposé « Ensemble, faisons vivre\nl'énergie de demain. » ; souligner visuellement seulement « demain. » par la couleur rouge, sans artifice. Corps « De l'électricité à la chaleur, du solaire à la mobilité : des solutions proches de vous, pour chaque jour et pour demain. » Deux actions : « Découvrir nos solutions » et lien « Mieux connaître les SiL ». Un petit cartouche blanc sur l'image peut indiquer « Ancrés à Lausanne. Tournés vers demain. » sans chiffre fabriqué.
2. **Accès pratiques** : immédiatement après le hero, bandeau blanc avec titre « Comment pouvons-nous vous aider ? » et quatre cartes compactes : Je déménage, Mes factures, Raccorder mon bâtiment, Nous contacter. Icônes traits simples, fond gris très léger, flèche à droite. Le bloc ne doit pas être caché très bas sous le hero.
3. **Les énergies de votre quotidien** : H2 à gauche, lien « Toutes nos solutions » à droite. Six tuiles en grille 3 × 2. Chaque tuile : icône simple, nom, une phrase, flèche. Des neutres chauds et quelques teintes très pâles différencient les univers sans diluer l’identité rouge et noire.
4. **Focus transition** : grand bloc image + fond neutre « Votre toit a de l'énergie. » présentant l'offre solaire, CTA vers `/solaire`. Une photo solaire réelle est prioritaire.
5. **Actualités / À la une** : trois cartes : photo 16:10, étiquette de catégorie, titre, courte phrase. Utiliser les sujets existants (tarifs électriques, cadastre solaire, mobilité) ; ne pas recopier de promotion expirée. Si aucune date ne peut être vérifiée, afficher des « À découvrir » permanents et lier aux pages thèmes.
6. **Contact humain** : bloc court « Une question, un projet ? Parlons-en. », descriptif et bouton Contact.
7. **Footer** : fond noir, logo sur surface blanche pour préserver le dessin, trois colonnes Solutions / Démarches / Les SiL. Adresse vérifiée Place Chauderon 23, Lausanne ; mentions légales. Tout lien du footer fonctionne.

## Gabarits intérieurs

### Page offre

Breadcrumb compact → surtitre famille → H1 et introduction de 2–3 lignes → hero image de 360 px ou image en moitié droite. Bandeau de trois bénéfices qualitatifs. Section « Une solution pour votre projet » avec 2–3 cartes informatives, puis « Comment avancer ? » avec trois étapes et CTA Contact. Bloc « À consulter aussi » avec 3 pages connexes. Pour Électricité, parler de produits d'origine renouvelable et renvoyer aux tarifs officiels ; ne pas intégrer de tableau tarifaire inventé. Pour Chaleur, expliquer distinctement CAD et PAC.

### Démarche

Breadcrumb → H1 orienté tâche → courte introduction. Corps 8 colonnes et encart utile 4 colonnes. Checklist ou trois étapes clairement ordonnées. Pour déménagement, source indique de prévenir au moins 15 jours avant l'arrivée : reprendre ce délai avec un lien source. Un CTA « Effectuer ma démarche » va à une destination officielle vérifiée ; si elle manque, CTA « Contacter les SiL ». Rubrique « Préparez votre demande » et liens connexes. Aucun champ factice demandant des données personnelles.

### Institutionnel / carrières

H1, introduction, belle photo, sections alternées texte/images. Histoire : création le 4 janvier 1896 vérifiée. Exposer les activités et les engagements sans statistiques nouvelles. Carrières : métiers, apprentissages, lien vers offre/formation officielle si trouvée.

### Index / actualités

H1, intro, grille cohérente de cartes. Si filtres présents, ils doivent filtrer réellement. Sinon catégories statiques. Ne pas donner une affordance de bouton à une étiquette inactive.

## Responsive et qualité

- ≥ 1100 px : grille 12 colonnes, hero en deux colonnes, espacements de section 88–112 px.
- 768–1099 px : grille flexible, navigation mobile si nécessaire, hero en deux colonnes seulement si texte lisible ; cartes 2 colonnes.
- < 768 px : contenu sur une colonne, image hero sous le texte, hauteur 260–310 px, tuiles tâches 2 × 2, cartes solutions 1 ou 2 colonnes selon le texte ; pas de scroll horizontal.
- Cibles tactiles 44 px minimum. Focus très visible. Liens et boutons accessibles au clavier. Contraste WCAG AA. Respect de `prefers-reduced-motion`.
- Photo décorative : alt vide. Photo qui identifie un lieu : alt descriptif bref. Crédit original conservé quand présent.
- Un seul H1 par page ; titres hiérarchiques, landmark main, lien d'évitement, état actif annoncé dans la navigation.
- Liens externes signalés discrètement. Éviter d'ouvrir tout dans un nouvel onglet.
- Images locales optimisées ; `object-fit: cover` avec focal point adapté. Images sous le fold chargées tardivement.

## Microcopie

Ton direct, chaleureux et public : « Votre projet », « Nous vous accompagnons », « Découvrez les solutions », « Parler à notre équipe ». Titres courts et concrets. Éviter le jargon réseau sur l'accueil. Français suisse, accents conservés, SiL avec casse officielle. Pas de badges « POC », « simulation » ou de détails d'implémentation dans l'expérience marketing ; la nature du POC est documentée dans le README.

## Vérification visuelle

Contrôler au minimum 1440 × 1000 et 390 × 844 : hero lisible sans chevauchement, accès pratiques visibles rapidement, logo net, menu mobile complet, images effectivement chargées, toutes les routes accessibles, absence de trous de contenu et footer homogène. La cohérence des 19 pages est plus importante qu'une animation spectaculaire.
