# Rapport de validation

Validation réalisée le 16 septembre 2026 avec TypeScript, Vite et Playwright/Chromium.

## Résultats

- Build de production : réussi. La suite compte 63 contrôles réussis sur ordinateur, tablette et mobile; 9 variantes de scénarios non applicables à certains formats sont volontairement ignorées.
- 19 routes directes : réussies à 1440 × 1000, 768 × 1024 et 390 × 844.
- Aucun débordement horizontal détecté sur les trois tailles.
- Liens internes : toutes les destinations correspondent à une route déclarée; navigation React sans rechargement vérifiée.
- Recherche : filtrage et navigation vers le solaire vérifiés.
- Menu mobile : ouverture, fermeture avec Échap, restitution du focus et navigation vérifiées.
- Images : chargement et textes alternatifs vérifiés sur l’ensemble des routes.
- Erreurs JavaScript et ressources en échec : aucune pendant les parcours retenus.

Les captures de réception se trouvent dans `research/screenshots/` pour l’accueil desktop/mobile et la page Électricité desktop.

## Commandes

```bash
npm run build
npm test
```
