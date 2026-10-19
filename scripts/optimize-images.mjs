import { readdir, stat, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const dir = process.argv[2] || "_site/media";
const MAX = 2400;
const MIN_BYTES = 500 * 1024;

async function* walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let n = 0;
for await (const file of walk(dir)) {
  const ext = extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;
  const before = (await stat(file)).size;
  const img = sharp(file, { failOn: "none" }).rotate();
  const { width = 0, height = 0 } = await img.metadata();
  if (before < MIN_BYTES && Math.max(width, height) <= MAX) continue;
  let pipe = img.resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true });
  pipe = ext === ".png" ? pipe.png({ compressionLevel: 9, palette: true }) : ext === ".webp" ? pipe.webp({ quality: 80 }) : pipe.jpeg({ quality: 82, mozjpeg: true });
  const out = await pipe.toBuffer();
  if (out.length < before) {
    await writeFile(file, out);
    n++;
    console.log(`${file}: ${(before / 1048576).toFixed(1)}MB -> ${(out.length / 1048576).toFixed(1)}MB`);
  }
}
console.log(`Optimized ${n} image(s)`);
