import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { ImageAsset, ImageSource } from "../../src/content/types.ts";

/** Largeurs cibles des variantes responsive (jamais d'agrandissement, plafond 1920 px). */
export const TARGET_WIDTHS = [480, 960, 1440, 1920] as const;
const MAX_WIDTH = 1920;
const AVIF = { quality: 52, effort: 4 } as const;
const WEBP = { quality: 76, effort: 4 } as const;

/** Schémas et visuels contenant du texte : `object-fit: contain` (DESIGN.md § 7). */
const CONTAIN_RE = /schema|modele|dessin|calculateur|guide_fond|infographie|cecb/i;

/** « AdobeStock_227727671.2026-09-10-09-30-28-2.jpg » → « adobestock-227727671-2026-09-10-09-30-28-2 ». */
export function imageIdFromAsset(assetPath: string): string {
  const base = path.basename(assetPath).replace(/\.[a-z0-9]+$/i, "");
  return base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Largeurs à produire : cibles < source, + largeur source (plafonnée) ; on saute une cible trop proche du max. */
export function widthsFor(sourceWidth: number): number[] {
  const max = Math.min(sourceWidth, MAX_WIDTH);
  const widths = TARGET_WIDTHS.filter((w) => w < max && w < max * 0.85);
  return [...widths, max];
}

function isFresh(out: string, src: string): boolean {
  return fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs;
}

/**
 * Optimise une image du crawl vers `public/images/` et renvoie son entrée de manifeste.
 * Incrémental : une variante déjà produite et plus récente que la source n'est pas régénérée.
 */
export async function processImage(
  srcFile: string,
  id: string,
  outDir: string,
): Promise<ImageAsset> {
  const fit = CONTAIN_RE.test(path.basename(srcFile)) ? "contain" : "cover";

  if (srcFile.toLowerCase().endsWith(".svg")) {
    const out = path.join(outDir, `${id}.svg`);
    fs.copyFileSync(srcFile, out);
    const svg = fs.readFileSync(srcFile, "utf8");
    const vb = /viewBox="[\d.\s-]*?\s([\d.]+)\s+([\d.]+)"/.exec(svg);
    return {
      width: Math.round(Number(vb?.[1] ?? 100)),
      height: Math.round(Number(vb?.[2] ?? 100)),
      fit: "contain",
      fallback: `/images/${id}.svg`,
    };
  }

  const meta = await sharp(srcFile).metadata();
  const width = meta.autoOrient?.width ?? meta.width ?? 0;
  const height = meta.autoOrient?.height ?? meta.height ?? 0;
  if (!width || !height) throw new Error(`Dimensions illisibles : ${srcFile}`);

  const avif: ImageSource[] = [];
  const webp: ImageSource[] = [];
  for (const w of widthsFor(width)) {
    const avifOut = path.join(outDir, `${id}-${w}.avif`);
    const webpOut = path.join(outDir, `${id}-${w}.webp`);
    if (!isFresh(avifOut, srcFile)) {
      await sharp(srcFile)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .avif(AVIF)
        .toFile(avifOut);
    }
    if (!isFresh(webpOut, srcFile)) {
      await sharp(srcFile)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp(WEBP)
        .toFile(webpOut);
    }
    avif.push({ width: w, src: `/images/${id}-${w}.avif` });
    webp.push({ width: w, src: `/images/${id}-${w}.webp` });
  }
  const scale = Math.min(width, MAX_WIDTH) / width;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    fit,
    avif,
    webp,
    fallback: webp[webp.length - 1]!.src,
  };
}

/** Exécute des tâches asynchrones avec une concurrence bornée. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return results;
}
