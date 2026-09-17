import type { SiteRoute } from './types'

/**
 * Single source of truth for public pages. Navigation components should filter
 * this list by `group` and `showInNavigation`; the router consumes every entry.
 */
export const siteRoutes: SiteRoute[] = [
  { id: 'home', path: '/', label: 'Accueil', description: 'Services industriels de Lausanne', group: 'institution' },
  { id: 'energies-solutions', path: '/energies-solutions', label: 'Énergies & solutions', description: 'Toutes nos énergies et solutions', group: 'energies' },
  { id: 'electricite', path: '/electricite', label: 'Électricité', description: 'Votre électricité à Lausanne', group: 'energies' },
  { id: 'gaz', path: '/gaz', label: 'Gaz', description: 'Le gaz naturel et renouvelable', group: 'energies' },
  { id: 'chaleur', path: '/chaleur', label: 'Chaleur', description: 'Des solutions locales de chauffage', group: 'energies' },
  { id: 'solaire', path: '/solaire', label: 'Solaire', description: 'Produire votre énergie solaire', group: 'energies' },
  { id: 'multimedia', path: '/multimedia', label: 'Multimédia', description: 'Vos services multimédia', group: 'energies' },
  { id: 'mobilite', path: '/mobilite', label: 'Mobilité', description: 'Des solutions pour vous déplacer', group: 'energies' },
  { id: 'vos-demarches', path: '/vos-demarches', label: 'Vos démarches', description: 'Gérer vos besoins en ligne', group: 'demarches' },
  { id: 'demenagement', path: '/demenagement', label: 'Déménagement', description: 'Annoncer une arrivée ou un départ', group: 'demarches' },
  { id: 'raccordement', path: '/raccordement', label: 'Raccordement', description: 'Raccorder votre bâtiment aux réseaux', group: 'demarches' },
  { id: 'facturation-paiement', path: '/facturation-paiement', label: 'Facturation & paiement', description: 'Comprendre et régler vos factures', group: 'demarches' },
  { id: 'depannage-urgences', path: '/depannage-urgences', label: 'Dépannage & urgences', description: 'Signaler une panne ou une urgence', group: 'demarches' },
  { id: 'les-sil', path: '/les-sil', label: 'Les SiL', description: 'Les Services industriels de Lausanne', group: 'institution' },
  { id: 'actualites', path: '/actualites', label: 'Actualités', description: 'Les dernières nouvelles des SiL', group: 'institution' },
  { id: 'carriere', path: '/carriere', label: 'Carrières', description: 'Rejoindre les SiL', group: 'institution' },
  { id: 'contact', path: '/contact', label: 'Contact', description: 'Contacter les SiL', group: 'institution' },
  { id: 'economies-energie', path: '/economies-energie', label: 'Économies d’énergie', description: 'Réduire votre consommation', group: 'footer', showInNavigation: false },
  { id: 'mentions-legales', path: '/mentions-legales', label: 'Mentions légales', description: 'Informations légales', group: 'footer', showInNavigation: false },
]
