import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
  // Optional — only geocoding/distance-matrix endpoints need this; the app
  // starts fine without it, those specific calls just fail with a clear
  // error until it's set.
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? null,
};
