# Architecture du POC SiL

## Principes

Le projet est une application Vite à page unique. React Router gère les URLs publiques et l’interface est rendue côté client. La liste de `src/routes.ts` est la source de vérité : elle alimente le routeur et devra aussi alimenter le menu desktop et mobile.

Les 19 routes couvrent les univers `energies`, `demarches`, `institution` et `footer`. Pour ajouter une page, ajouter un objet `SiteRoute` dans cette liste : aucun changement au routeur n’est nécessaire. Une URL inconnue redirige vers l’accueil.

## Conventions UI

- L’implémentation visuelle remplace `src/App.tsx`, en conservant si utile la prop `route`.
- Garder les composants de mise en page et de navigation dans `src/components/`; placer les sections propres aux pages dans `src/sections/` quand elles apparaissent.
- Les styles globaux et les tokens vivent dans `src/styles/`; les composants peuvent avoir un fichier CSS associé. Éviter les styles inline pour les règles répétées.
- Utiliser `lucide-react` pour les pictogrammes d’interface, avec un libellé accessible pour chaque action iconique.
- Le menu mobile doit être utilisable au clavier, annoncer son état ouvert/fermé et conserver une cible tactile d’au moins 44 px.

## Contenu et médias

- `research/content.json` contient les faits et textes source collectés. Préférer ces données aux textes inventés et respecter les références qui les accompagnent.
- Placer les images, logos et fichiers statiques dans `public/assets/`, puis les référencer avec `/assets/...`.
- Ne pas incorporer de données métier dans les composants quand elles peuvent être ajoutées à une structure de contenu.

## Validation

Exécuter `npm run build` avant livraison. `npm test` et `npm run test:e2e` exécutent les tests de navigation et de rendu avec Playwright. Les captures et le rapport de validation sont conservés dans `research/`.
