import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const iconsDir = path.join(root, 'public', 'icons');
mkdirSync(iconsDir, { recursive: true });

const source = path.join(import.meta.dirname, 'icon-source.svg');
const maskableSource = path.join(import.meta.dirname, 'icon-source-maskable.svg');

async function run() {
  await sharp(source).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(source).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(maskableSource).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-maskable-192.png'));
  await sharp(maskableSource).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-maskable-512.png'));
  await sharp(source).resize(180, 180).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));
  await sharp(source).resize(32, 32).png().toFile(path.join(root, 'public', 'favicon-32.png'));
  console.log('Icons generated.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
