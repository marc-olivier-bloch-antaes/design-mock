import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Racine de l'app (`opus/app`). */
export const APP_DIR = path.resolve(here, "../..");
/** Entrées en lecture seule. Surchargeables pour la CI : SIL_CRAWL_DIR / SIL_DESIGN_DIR. */
export const CRAWL_DIR = path.resolve(process.env.SIL_CRAWL_DIR ?? path.join(APP_DIR, "../crawl"));
export const DESIGN_DIR = path.resolve(
  process.env.SIL_DESIGN_DIR ?? path.join(APP_DIR, "../design"),
);

export const OUT = {
  content: path.join(APP_DIR, "src/content"),
  pages: path.join(APP_DIR, "src/content/pages"),
  styles: path.join(APP_DIR, "src/styles"),
  fonts: path.join(APP_DIR, "src/styles/fonts"),
  brand: path.join(APP_DIR, "src/assets/brand"),
  publicImages: path.join(APP_DIR, "public/images"),
  public: path.join(APP_DIR, "public"),
};
