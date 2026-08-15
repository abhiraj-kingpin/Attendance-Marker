const EARTH_RADIUS_M = 6371000;

// Hardcoded — no Geocoding API, no billing, no network call. Add more
// colleges here as needed; lookups are case-insensitive by key.
const COLLEGES: Record<string, { latitude: number; longitude: number; name: string }> = {
  MAIT: { latitude: 28.5355, longitude: 77.391, name: 'MAIT, Delhi' },
  GGSIPU: { latitude: 28.7041, longitude: 77.1025, name: 'GGSIPU, Delhi' },
  DTU: { latitude: 28.7411, longitude: 77.1084, name: 'DTU, Delhi' },
};

export class LocationServiceError extends Error {}

export interface Coordinates {
  latitude: number;
  longitude: number;
  name: string;
}

export function getCollegeCoordinates(collegeName: string): Coordinates {
  const entry = COLLEGES[collegeName.trim().toUpperCase()];
  if (!entry) {
    throw new LocationServiceError(
      `Unknown college "${collegeName}" — known colleges: ${Object.keys(COLLEGES).join(', ')}`
    );
  }
  return entry;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle (Haversine) distance in meters — pure math, no API call. */
export function getDistanceBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function isUserInGeofence(
  userLat: number,
  userLng: number,
  geofenceLat: number,
  geofenceLng: number,
  radiusMeters: number
): boolean {
  return getDistanceBetween(userLat, userLng, geofenceLat, geofenceLng) <= radiusMeters;
}
