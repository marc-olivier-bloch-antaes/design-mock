export type NavigationGroup = 'energies' | 'demarches' | 'institution' | 'footer'

/** A page contract shared by navigation, routing and future page templates. */
export interface SiteRoute {
  id: string
  path: string
  label: string
  description: string
  group: NavigationGroup
  showInNavigation?: boolean
}
