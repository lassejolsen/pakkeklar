import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "_site");
const pages = [
  "index.html", "styles.css", "dashboard.css", "app.js", "packing.js",
  "carousel.js", "trip-images.js", "dashboard.js", "adventure-data.js", "settings-data.js"
];
const assetTypes = new Set([".jpg", ".png", ".webp", ".svg", ".woff2"]);
const assets = await readdir(resolve(root, "assets"), { withFileTypes: true });
const publicAssets = assets.filter(entry => !entry.name.startsWith("."));
for (const entry of publicAssets) {
  if (!entry.isFile() || (!assetTypes.has(extname(entry.name)) && entry.name !== "FONT-LICENSE.txt")) {
    throw new Error(`Unexpected publishing asset: ${entry.name}`);
  }
}

// Only this generated folder is replaced; documentation and local QA files stay outside it.
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, "assets"), { recursive: true });
for (const file of pages) await copyFile(resolve(root, file), resolve(output, file));
for (const entry of publicAssets) {
  await copyFile(resolve(root, "assets", entry.name), resolve(output, "assets", entry.name));
}
await writeFile(resolve(output, ".nojekyll"), "");
console.log(`Built _site with ${pages.length} app files and ${publicAssets.length} assets.`);
