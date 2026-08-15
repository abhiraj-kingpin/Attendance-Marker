import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createGeofence, listGeofencesForSubject, checkLocation } from '../controllers/geofenceController';

export const geofencesRouter = Router();

geofencesRouter.use(requireAuth);
geofencesRouter.post('/', createGeofence);
geofencesRouter.get('/:subjectId', listGeofencesForSubject);

export const locationRouter = Router();
locationRouter.use(requireAuth);
locationRouter.post('/check', checkLocation);
