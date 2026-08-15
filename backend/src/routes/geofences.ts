import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createGeofence,
  listGeofencesForSubject,
  updateGeofence,
  deleteGeofence,
  checkLocation,
} from '../controllers/geofenceController';

export const geofencesRouter = Router();

geofencesRouter.use(requireAuth);
geofencesRouter.post('/', createGeofence);
geofencesRouter.get('/:subjectId', listGeofencesForSubject);
geofencesRouter.put('/:id', updateGeofence);
geofencesRouter.delete('/:id', deleteGeofence);

export const locationRouter = Router();
locationRouter.use(requireAuth);
locationRouter.post('/check', checkLocation);
