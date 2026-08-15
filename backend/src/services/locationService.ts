import axios from 'axios';
import { env } from '../config/env';

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
const EARTH_RADIUS_M = 6371000;

export class LocationServiceError extends Error {}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Resolves a college/place name to coordinates via Google's Geocoding API. */
export async function getCollegeCoordinates(collegeName: string): Promise<Coordinates> {
  if (!env.googleMapsApiKey) {
    throw new LocationServiceError('GOOGLE_MAPS_API_KEY is not set');
  }
  const { data } = await axios.get(GEOCODE_URL, {
    params: { address: collegeName, key: env.googleMapsApiKey },
  });

  if (data.status !== 'OK' || !data.results?.length) {
    throw new LocationServiceError(`Could not geocode "${collegeName}": ${data.status}${data.error_message ? ` — ${data.error_message}` : ''}`);
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { latitude: lat, longitude: lng };
}

/** Road-network distance/duration between two points via Google's Distance Matrix API. */
export async function getDistanceBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  if (!env.googleMapsApiKey) {
    throw new LocationServiceError('GOOGLE_MAPS_API_KEY is not set');
  }
  const { data } = await axios.get(DISTANCE_MATRIX_URL, {
    params: {
      origins: `${lat1},${lng1}`,
      destinations: `${lat2},${lng2}`,
      key: env.googleMapsApiKey,
    },
  });

  if (data.status !== 'OK') {
    throw new LocationServiceError(`Distance Matrix request failed: ${data.status}${data.error_message ? ` — ${data.error_message}` : ''}`);
  }

  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== 'OK') {
    throw new LocationServiceError(`Distance Matrix could not resolve a route: ${element?.status ?? 'unknown'}`);
  }

  return {
    distanceMeters: element.distance.value as number,
    distanceText: element.distance.text as string,
    durationSeconds: element.duration.value as number,
    durationText: element.duration.text as string,
  };
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Straight-line (great-circle) distance in meters — used for the actual
 * geofence check. Deliberately not the Distance Matrix API: that returns
 * road-network travel distance, which is the wrong question for "is this
 * device physically within N meters of this point" and would burn an API
 * call on every check for no benefit. Mirrors mobile/src/lib/geofence.js
 * exactly, unit-tested there against known reference distances.
 */
export function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function isUserInGeofence(
  userLat: number,
  userLng: number,
  geofenceLat: number,
  geofenceLng: number,
  radiusMeters: number
): boolean {
  return haversineDistanceMeters(userLat, userLng, geofenceLat, geofenceLng) <= radiusMeters;
}
