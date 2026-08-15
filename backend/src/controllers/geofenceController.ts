import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';
import { getCollegeCoordinates, getDistanceBetween, isUserInGeofence, LocationServiceError } from '../services/locationService';

// Wire format uses snake_case (subject_id, room_number, radius_meters, ...)
// to match how this API is actually being tested; Prisma/JS stays
// camelCase internally, translated here at the boundary.
function toApi(g: {
  id: string;
  subjectId: string | null;
  label: string;
  roomNumber: string | null;
  building: string | null;
  latitude: number;
  longitude: number;
  radiusM: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: g.id,
    subject_id: g.subjectId,
    label: g.label,
    room_number: g.roomNumber,
    building: g.building,
    latitude: g.latitude,
    longitude: g.longitude,
    radius_meters: g.radiusM,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

const createSchema = z
  .object({
    subject_id: z.string().optional(),
    label: z.string().optional(),
    room_number: z.string().optional(),
    building: z.string().optional(),
    radius_meters: z.number().positive().default(50),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    college_name: z.string().optional(),
  })
  .refine((d) => (d.latitude != null && d.longitude != null) || d.college_name, {
    message: 'Provide either latitude+longitude or college_name',
  });

export async function createGeofence(req: AuthedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  if (data.subject_id) {
    const subject = await prisma.subject.findFirst({ where: { id: data.subject_id, userId: req.userId! } });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
  }

  let latitude = data.latitude;
  let longitude = data.longitude;
  let label = data.label;
  if (latitude == null || longitude == null) {
    try {
      const college = getCollegeCoordinates(data.college_name!);
      latitude = college.latitude;
      longitude = college.longitude;
      label = label ?? college.name;
    } catch (e) {
      const message = e instanceof LocationServiceError ? e.message : 'Could not resolve college_name';
      return res.status(400).json({ error: message });
    }
  }

  const geofence = await prisma.geofence.create({
    data: {
      userId: req.userId!,
      subjectId: data.subject_id ?? null,
      label: label ?? data.room_number ?? 'Geofence',
      roomNumber: data.room_number ?? null,
      building: data.building ?? null,
      radiusM: data.radius_meters,
      latitude,
      longitude,
    },
  });
  res.status(201).json(toApi(geofence));
}

export async function listGeofencesForSubject(req: AuthedRequest, res: Response) {
  const geofences = await prisma.geofence.findMany({
    where: { userId: req.userId!, subjectId: req.params.subjectId },
  });
  res.json(geofences.map(toApi));
}

const updateSchema = z.object({
  label: z.string().optional(),
  room_number: z.string().optional(),
  building: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius_meters: z.number().positive().optional(),
});

export async function updateGeofence(req: AuthedRequest, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.geofence.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!existing) return res.status(404).json({ error: 'Geofence not found' });

  const { room_number, radius_meters, ...rest } = parsed.data;
  const geofence = await prisma.geofence.update({
    where: { id: req.params.id },
    data: { ...rest, ...(room_number !== undefined ? { roomNumber: room_number } : {}), ...(radius_meters !== undefined ? { radiusM: radius_meters } : {}) },
  });
  res.json(toApi(geofence));
}

export async function deleteGeofence(req: AuthedRequest, res: Response) {
  const existing = await prisma.geofence.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!existing) return res.status(404).json({ error: 'Geofence not found' });
  await prisma.geofence.delete({ where: { id: req.params.id } });
  res.json({ message: 'Geofence deleted' });
}

const checkSchema = z.object({
  user_latitude: z.number(),
  user_longitude: z.number(),
});

export async function checkLocation(req: AuthedRequest, res: Response) {
  const parsed = checkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { user_latitude, user_longitude } = parsed.data;

  const geofences = await prisma.geofence.findMany({ where: { userId: req.userId! } });

  const within = geofences
    .map((g) => ({
      subject_id: g.subjectId,
      geofence_id: g.id,
      room_number: g.roomNumber,
      building: g.building,
      distance_meters: Math.round(getDistanceBetween(user_latitude, user_longitude, g.latitude, g.longitude)),
      inside: isUserInGeofence(user_latitude, user_longitude, g.latitude, g.longitude, g.radiusM),
    }))
    .filter((r) => r.inside)
    .map(({ inside, ...rest }) => rest);

  res.json(within);
}
