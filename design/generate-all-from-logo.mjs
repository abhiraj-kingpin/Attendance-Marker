import sharp from 'sharp';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');
const iconsDir = path.join(publicDir, 'icons');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');
mkdirSync(iconsDir, { recursive: true });

const RAW_SOURCE = path.join(import.meta.dirname, 'logo-original.png');
const MASTER = path.join(import.meta.dirname, 'logo-master.png');

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/** Scale `input` to `scale` of `canvasSize` and center it on a canvas filled with `background`. */
async function composeOnCanvas(input, canvasSize, scale, background) {
  const contentSize = Math.round(canvasSize * scale);
  const resized = await sharp(input)
    .resize(contentSize, contentSize, { fit: 'contain', background: TRANSPARENT })
    .toBuffer();
  return sharp({ create: { width: canvasSize, height: canvasSize, channels: 4, background } })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toBuffer();
}

const ANDROID_DENSITIES = {
  mdpi: { legacy: 48, adaptive: 108 },
  hdpi: { legacy: 72, adaptive: 162 },
  xhdpi: { legacy: 96, adaptive: 216 },
  xxhdpi: { legacy: 144, adaptive: 324 },
  xxxhdpi: { legacy: 192, adaptive: 432 },
};

const SPLASH_TARGETS = [
  ['drawable/splash.png', 480, 320],
  ['drawable-port-mdpi/splash.png', 320, 480],
  ['drawable-port-hdpi/splash.png', 480, 800],
  ['drawable-port-xhdpi/splash.png', 720, 1280],
  ['drawable-port-xxhdpi/splash.png', 960, 1600],
  ['drawable-port-xxxhdpi/splash.png', 1280, 1920],
  ['drawable-land-mdpi/splash.png', 480, 320],
  ['drawable-land-hdpi/splash.png', 800, 480],
  ['drawable-land-xhdpi/splash.png', 1280, 720],
  ['drawable-land-xxhdpi/splash.png', 1600, 960],
  ['drawable-land-xxxhdpi/splash.png', 1920, 1280],
];

function circleMask(size) {
  return Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
}

async function run() {
  // 1. Trim the real exported PNG down to just the icon (drops the transparent margin) and
  //    pad it into a clean square master. This source is already just the pictograph (no
  //    border/frame), so no extra cropping needed.
  await sharp(RAW_SOURCE).trim().resize(512, 512, { fit: 'contain', background: TRANSPARENT }).toFile(MASTER);

  // 2. PWA icons
  await sharp(MASTER).resize(192, 192).toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(MASTER).resize(512, 512).toFile(path.join(iconsDir, 'icon-512.png'));

  const maskable192 = await composeOnCanvas(MASTER, 192, 0.72, WHITE);
  await sharp(maskable192).toFile(path.join(iconsDir, 'icon-maskable-192.png'));
  const maskable512 = await composeOnCanvas(MASTER, 512, 0.72, WHITE);
  await sharp(maskable512).toFile(path.join(iconsDir, 'icon-maskable-512.png'));

  const appleTouch = await composeOnCanvas(MASTER, 512, 0.92, WHITE);
  await sharp(appleTouch).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(MASTER).resize(64, 64).toFile(path.join(publicDir, 'favicon.png'));

  // logo.svg is replaced by a plain PNG the Splash screen references
  await sharp(MASTER).resize(512, 512).toFile(path.join(publicDir, 'logo.png'));

  // 3. Android launcher icons
  for (const [density, sizes] of Object.entries(ANDROID_DENSITIES)) {
    const dir = path.join(resDir, `mipmap-${density}`);

    const legacy = await composeOnCanvas(MASTER, sizes.legacy, 0.92, WHITE);
    await sharp(legacy).toFile(path.join(dir, 'ic_launcher.png'));

    await sharp(legacy)
      .composite([{ input: circleMask(sizes.legacy), blend: 'dest-in' }])
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    const foreground = await composeOnCanvas(MASTER, sizes.adaptive, 0.62, TRANSPARENT);
    await sharp(foreground).toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }

  // 4. Android splash screens
  const splashMaster = await composeOnCanvas(MASTER, 1024, 0.42, WHITE);
  for (const [rel, w, h] of SPLASH_TARGETS) {
    await sharp(splashMaster).resize(w, h, { fit: 'cover', position: 'center' }).toFile(path.join(resDir, rel));
  }

  console.log('All icons and splash screens generated from the real logo file.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
