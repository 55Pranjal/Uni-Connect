/**
 * Renders PWA icons from public/logomark.svg.
 *
 *   npm run icons:render
 *
 * Output:
 *   public/icon-192.png             192×192, "any" purpose
 *   public/icon-512.png             512×512, "any" purpose
 *   public/icon-192-maskable.png    192×192, "maskable" purpose
 *   public/icon-512-maskable.png    512×512, "maskable" purpose
 *
 * The "any" icons render the SVG as-is (rounded square + Uc). The
 * "maskable" variants render onto a full-bleed black canvas with the Uc
 * mark scaled to fit Android's adaptive-icon safe zone (inner 80%) — this
 * prevents the launcher from cropping the rounded corners or the
 * letters when it applies a circular / squircle / teardrop mask.
 *
 * Re-run whenever public/logomark.svg changes. The PNGs are committed to
 * the repo (Vite copies public/ verbatim to dist/, no build-time render).
 */

import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const SOURCE_SVG = path.join(PUBLIC, "logomark.svg");

// Maskable safe zone: per the W3C maskable-icon spec, content must fit
// within a circle of diameter 80% of the icon. Using a square inner 80%
// is the conservative approximation that virtually every launcher honors.
const MASKABLE_SAFE_RATIO = 0.8;

// Solid black background (var(--pl-ink)) so Android's circular / squircle
// mask still produces an on-brand result after cropping.
const BRAND_INK = "#0a0a0a";

/**
 * Build a maskable SVG variant: solid black canvas (no rounded corners,
 * since the launcher applies its own mask) with the Uc glyphs scaled to
 * fit inside the safe zone.
 */
function buildMaskableSvg(size) {
  const safe = Math.round(size * MASKABLE_SAFE_RATIO);
  const fontSize = Math.round(safe * 0.6);
  const baselineY = Math.round(size / 2 + fontSize * 0.34);
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND_INK}"/>
  <text
    x="${size / 2}"
    y="${baselineY}"
    text-anchor="middle"
    font-family="Helvetica, Arial, sans-serif"
    font-weight="800"
    font-size="${fontSize}"
  ><tspan fill="#ff5a1f">U</tspan><tspan fill="#ffffff" dx="-${Math.round(fontSize * 0.08)}">c</tspan></text>
</svg>`;
}

async function renderTo(buffer, outPath, size) {
  await sharp(buffer, { density: 384 })
    .resize(size, size, { fit: "contain" })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  ✓ ${path.relative(ROOT, outPath)}`);
}

async function main() {
  const svg = await readFile(SOURCE_SVG);
  console.log(`Rendering icons from ${path.relative(ROOT, SOURCE_SVG)}\n`);

  // "any"-purpose icons: render the source SVG directly. The rounded
  // corners stay visible since the launcher won't crop these.
  await renderTo(svg, path.join(PUBLIC, "icon-192.png"), 192);
  await renderTo(svg, path.join(PUBLIC, "icon-512.png"), 512);

  // "maskable"-purpose icons: full-bleed background, glyphs in the safe
  // zone. Built inline rather than from a static SVG file so the size /
  // safe-zone math stays co-located with this renderer.
  for (const size of [192, 512]) {
    const maskableSvg = Buffer.from(buildMaskableSvg(size));
    await renderTo(
      maskableSvg,
      path.join(PUBLIC, `icon-${size}-maskable.png`),
      size
    );
  }

  console.log("\nDone. Don't forget to commit the regenerated PNGs.");
}

main().catch((err) => {
  console.error("Icon render failed:", err);
  process.exit(1);
});
