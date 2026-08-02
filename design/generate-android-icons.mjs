import sharp from 'sharp';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

const source = path.join(import.meta.dirname, 'icon-source.svg');
const foreground = path.join(import.meta.dirname, 'icon-foreground.svg');

const DENSITIES = {
  mdpi: { legacy: 48, adaptive: 108 },
  hdpi: { legacy: 72, adaptive: 162 },
  xhdpi: { legacy: 96, adaptive: 216 },
  xxhdpi: { legacy: 144, adaptive: 324 },
  xxxhdpi: { legacy: 192, adaptive: 432 },
};

function circleMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  );
}

async function run() {
  for (const [density, sizes] of Object.entries(DENSITIES)) {
    const dir = path.join(resDir, `mipmap-${density}`);

    // legacy square-ish icon (launcher applies its own mask on older Android)
    await sharp(source).resize(sizes.legacy, sizes.legacy).png().toFile(path.join(dir, 'ic_launcher.png'));

    // true round icon: render then clip to a circle
    const base = await sharp(source).resize(sizes.legacy, sizes.legacy).png().toBuffer();
    await sharp(base)
      .composite([{ input: circleMask(sizes.legacy), blend: 'dest-in' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // adaptive icon foreground layer (transparent bg, content in safe zone)
    await sharp(foreground)
      .resize(sizes.adaptive, sizes.adaptive)
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }
  console.log('Android launcher icons generated.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
