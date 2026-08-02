import sharp from 'sharp';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');
const source = path.join(import.meta.dirname, 'splash-source.svg');

const TARGETS = [
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

async function run() {
  // Render the source large enough that the biggest target is a downscale, not an upscale.
  const master = await sharp(source).resize(2200, 2200).png().toBuffer();

  for (const [rel, w, h] of TARGETS) {
    await sharp(master)
      .resize(w, h, { fit: 'cover', position: 'center' })
      .png()
      .toFile(path.join(resDir, rel));
  }
  console.log('Splash screens generated.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
