/** Onglets : pictos du site actuel remplacés par Lucide (DESIGN.md § 6). */
import {
  Cable,
  Calculator,
  CircleHelp,
  Droplets,
  Fan,
  FileCheck,
  Flame,
  Heater,
  Package,
  ReceiptText,
  ShieldCheck,
  Sun,
  ThermometerSun,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

const TAB_ICONS: Record<string, LucideIcon> = {
  produits: Package,
  solutions: Package,
  tarifs: ReceiptText,
  raccordement: Cable,
  securite: ShieldCheck,
  faq: CircleHelp,
  "simulateur-thermique": Calculator,
  calculateur: Calculator,
  "pompe-a-chaleur": Fan,
  "gaz-solaire": ThermometerSun,
  electricite: Zap,
  gaz: Flame,
  chaleur: Heater,
  ipe: Sun,
  "fibre-optique": Wifi,
  eau: Droplets,
  assainissement: Waves,
  conditions: FileCheck,
};

export function tabIcon(tabId: string): LucideIcon {
  return TAB_ICONS[tabId] ?? Package;
}
