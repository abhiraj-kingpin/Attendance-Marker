import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';
import { getCollegeCoordinates, isUserInGeofence, LocationServiceError } from '../services/locationService';

const createSchema = z
  .object({
    subjectId: z.string().optional(),
    label: z.string().min(1),
    roomNumber: z.string().optional(),
    building: z.string().optional(),
    radiusM: z.number().positive().default(150),
    // Provide either coordinates directly, or a place name to geocode.
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    collegeName: z.string().optional(),
  })
  .refine((d) => (d.latitude != null && d.longitude != null) || d.collegeName, {
    message: 'Provide either latitude+longitude or collegeName',
  });

export async function createGeofence(req: AuthedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  if (data.subjectId) {
    const subject = await prisma.subject.findFirst({ where: { id: data.subjectId, userId: req.userId! } });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
  }

  let latitude = data.latitude;
  let longitude = data.longitude;
  if (latitude == null || longitude == null) {
    try {
      const coords = await getCollegeCoordinates(data.collegeName!);
      latitude = coords.latitude;
      longitude = coords.longitude;
    } catch (e) {
      const message = e instanceof LocationServiceError ? e.message : 'Geocoding failed';
      return res.status(502).json({ error: message });
    }
  }

  const geofence = await prisma.geofence.create({
    data: {
      userId: req.userId!,
      subjectId: data.subjectId ?? null,
      label: data.label,
      roomNumber: data.roomNumber ?? null,
      building: data.building ?? null,
      radiusM: data.radiusM,
      latitude,
      longitude,
    },
  });
  res.status(201).json(geofence);
}

export async function listGeofencesForSubject(req: AuthedRequest, res: Response) {
  const geofences = await prisma.geofence.findMany({
    where: { userId: req.userId!, subjectId: req.params.subjectId },
  });
  res.json(geofences);
}

const checkSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  geofenceId: z.string().optional(),
});

export async function checkLocation(req: AuthedRequest, res: Response) {
  const parsed = checkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { latitude, longitude, geofenceId } = parsed.data;

  const geofences = await prisma.geofence.findMany({
    where: { userId: req.userId!, ...(geofenceId ? { id: geofenceId } : {}) },
  });

  const results = geofences.map((g) => ({
    geofenceId: g.id,
    label: g.label,
    subjectId: g.subjectId,
    within: isUserInGeofence(latitude, longitude, g.latitude, g.longitude, g.radiusM),
  }));

  res.json({ withinAny: results.some((r) => r.within), results });
}
