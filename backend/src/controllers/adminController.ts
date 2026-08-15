import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAnalytics(_req: Request, res: Response) {
  const [totalUsers, activeToday, todaysAttendance, ocrLogs, allAttendance, geofences] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: startOfToday() } } }),
    prisma.attendance.findMany({ where: { date: todayISO() } }),
    prisma.ocrScanLog.findMany(),
    prisma.attendance.findMany(),
    prisma.geofence.count(),
  ]);

  const autoMarked = todaysAttendance.filter((a) => a.method === 'automatic').length;
  const manualMarked = todaysAttendance.filter((a) => a.method === 'manual').length;

  const ocrSuccess = ocrLogs.filter((l) => l.success).length;
  const ocrAccuracyPercent = ocrLogs.length === 0 ? null : Math.round((ocrSuccess / ocrLogs.length) * 1000) / 10;

  const automaticAttendance = allAttendance.filter((a) => a.method === 'automatic').length;
  const geoTrackingHealthPercent =
    allAttendance.length === 0 ? null : Math.round((automaticAttendance / allAttendance.length) * 1000) / 10;

  const countable = allAttendance.filter((a) => a.status !== 'leave');
  const present = countable.filter((a) => a.status === 'present').length;
  const averageAttendancePercent = countable.length === 0 ? null : Math.round((present / countable.length) * 1000) / 10;

  res.json({
    total_users: totalUsers,
    active_users_today: activeToday,
    attendance_today: { auto_marked: autoMarked, manual_marked: manualMarked, total: todaysAttendance.length },
    ocr_accuracy_percent: ocrAccuracyPercent,
    geo_tracking_health_percent: geoTrackingHealthPercent,
    average_attendance_percent: averageAttendancePercent,
    total_geofences: geofences,
  });
}

export async function getAttendanceLog(req: Request, res: Response) {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  const records = await prisma.attendance.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
    include: { user: true, subject: true, geofence: true },
  });

  res.json(
    records.map((r) => ({
      id: r.id,
      user_id: r.userId,
      user_email: r.user.email,
      subject_id: r.subjectId,
      subject_name: r.subject.name,
      timestamp: r.createdAt,
      marking_method: r.method,
      latitude: r.latitude,
      longitude: r.longitude,
      room_number: r.geofence?.roomNumber ?? null,
    }))
  );
}

export async function getGeofences(_req: Request, res: Response) {
  const geofences = await prisma.geofence.findMany({ include: { subject: true } });

  const results = await Promise.all(
    geofences.map(async (g) => {
      const usage = await prisma.attendance.findMany({ where: { geofenceId: g.id }, orderBy: { createdAt: 'desc' } });
      return {
        id: g.id,
        room_number: g.roomNumber,
        building: g.building,
        subject_name: g.subject?.name ?? null,
        latitude: g.latitude,
        longitude: g.longitude,
        radius_meters: g.radiusM,
        usage_count: usage.length,
        last_used: usage[0]?.createdAt ?? null,
      };
    })
  );

  res.json(results);
}

export async function getSettings(_req: Request, res: Response) {
  const settings = await prisma.appSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  res.json(settings);
}

const updateSettingsSchema = z.object({
  default_attendance_mode: z.enum(['manual', 'partial', 'automatic']).optional(),
  ocr_enabled: z.boolean().optional(),
  predictions_enabled: z.boolean().optional(),
  location_tracking_enabled: z.boolean().optional(),
});

export async function updateSettings(req: Request, res: Response) {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;

  const settings = await prisma.appSettings.upsert({
    where: { id: 'singleton' },
    update: {
      ...(d.default_attendance_mode !== undefined ? { defaultAttendanceMode: d.default_attendance_mode } : {}),
      ...(d.ocr_enabled !== undefined ? { ocrEnabled: d.ocr_enabled } : {}),
      ...(d.predictions_enabled !== undefined ? { predictionsEnabled: d.predictions_enabled } : {}),
      ...(d.location_tracking_enabled !== undefined ? { locationTrackingEnabled: d.location_tracking_enabled } : {}),
    },
    create: { id: 'singleton' },
  });
  res.json(settings);
}

export async function getErrorLogs(req: Request, res: Response) {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const logs = await prisma.errorLog.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
  res.json(logs);
}

export async function getOcrStats(_req: Request, res: Response) {
  const [logs, corrections] = await Promise.all([
    prisma.ocrScanLog.findMany(),
    prisma.ocrCorrection.findMany(),
  ]);

  const successful = logs.filter((l) => l.success).length;
  const accuracyPercent = logs.length === 0 ? null : Math.round((successful / logs.length) * 1000) / 10;

  const misclassificationCounts = new Map<string, number>();
  for (const c of corrections) {
    if (!c.originalType || c.originalType === c.correctedType) continue;
    const key = `${c.originalType}|${c.correctedType}`;
    misclassificationCounts.set(key, (misclassificationCounts.get(key) ?? 0) + 1);
  }
  const commonMisclassifications = Array.from(misclassificationCounts.entries())
    .map(([key, count]) => {
      const [misclassifiedAs, actualType] = key.split('|');
      return { misclassified_as: misclassifiedAs, actual_type: actualType, count };
    })
    .sort((a, b) => b.count - a.count);

  res.json({
    total_scans: logs.length,
    successful_scans: successful,
    accuracy_percent: accuracyPercent,
    common_misclassifications: commonMisclassifications,
  });
}

export async function getUsers(req: Request, res: Response) {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const users = await prisma.user.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
    where: search ? { email: { contains: search } } : undefined,
  });

  const results = await Promise.all(
    users.map(async (u) => {
      const [subjectsCount, attendance, lastAttendance] = await Promise.all([
        prisma.subject.count({ where: { userId: u.id } }),
        prisma.attendance.findMany({ where: { userId: u.id } }),
        prisma.attendance.findFirst({ where: { userId: u.id }, orderBy: { createdAt: 'desc' } }),
      ]);

      const countable = attendance.filter((a) => a.status !== 'leave');
      const present = countable.filter((a) => a.status === 'present').length;
      const attendancePercent = countable.length === 0 ? null : Math.round((present / countable.length) * 1000) / 10;

      return {
        id: u.id,
        email: u.email,
        created_at: u.createdAt,
        last_login: u.lastLoginAt,
        subjects_count: subjectsCount,
        attendance_percent: attendancePercent,
        last_activity: lastAttendance?.createdAt ?? null,
      };
    })
  );

  res.json(results);
}
