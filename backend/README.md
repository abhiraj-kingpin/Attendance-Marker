# Attendance Marker — Backend

Node.js + Express + TypeScript API, backing the optional cloud features on
top of the local-first mobile app: account sync, automatic attendance,
syllabus predictions, and CGPA tracking.

The mobile app in `mobile/` keeps working fully offline without this — this
backend is additive, for the features that genuinely need a server (cross-
device sync, background location processing, shared class predictions).

## Status

**Phase A (done):** project scaffold, Postgres-compatible schema (via
Prisma), JWT email/password auth, subjects CRUD, attendance marking + stats.
Smoke-tested end-to-end (signup → login → create subject → mark attendance
→ stats).

**Not built yet:** syllabus PDF extraction, class-progress predictions,
geofencing/automatic attendance, GGSIPU CGPA integration, admin dashboard,
push notifications. See the repo root's `docs/ROADMAP-PLUS.md` for the full
phase breakdown.

## Local development

No Docker or Postgres install needed — local dev runs on SQLite via Prisma;
swapping to real Postgres for deployment is a one-line `DATABASE_URL` /
`provider` change in `prisma/schema.prisma`.

```bash
cd backend
npm install
cp .env.example .env    # edit JWT_SECRET before any real use
npx prisma migrate dev
npm run dev              # http://localhost:4000
```

## What you'll need to provide before later phases work

- **A real Postgres instance** (e.g. Railway, Render, Supabase, or your own
  server) — only needed when you're ready to deploy; local dev doesn't need
  it.
- **Firebase project** (optional) — only if you want push notifications via
  FCM instead of local-only notifications, or Google OAuth login.

No Google Maps API key needed for anything — geofencing runs on a
hardcoded college list (`locationService.ts`) plus plain Haversine math,
zero external calls, zero billing.

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Liveness check |
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Get a JWT |
| GET | `/api/subjects` | ✓ | List your subjects |
| POST | `/api/subjects` | ✓ | Create a subject |
| PUT | `/api/subjects/:id` | ✓ | Update a subject |
| DELETE | `/api/subjects/:id` | ✓ | Delete a subject |
| POST | `/api/attendance` | ✓ | Mark attendance (upserts per subject+date) |
| GET | `/api/attendance` | ✓ | List attendance, optional `?subjectId=` |
| GET | `/api/attendance/stats` | ✓ | Per-subject present/total/percentage |
| POST | `/api/geofences` | ✓ | Create — `latitude`+`longitude` directly, or `college_name` (hardcoded list, no external API) |
| GET | `/api/geofences/:subject_id` | ✓ | List geofences for a subject |
| PUT | `/api/geofences/:id` | ✓ | Update a geofence |
| DELETE | `/api/geofences/:id` | ✓ | Delete a geofence |
| POST | `/api/location/check` | ✓ | Given `user_latitude`+`user_longitude`, which geofences (if any) you're currently inside |
| POST | `/api/schedule` | ✓ | Add a weekly class time to a subject (`day_of_week`, `start_time`, `end_time`) |
| GET | `/api/schedule/:subjectId` | ✓ | List a subject's weekly class times |
| POST | `/api/attendance/auto-mark` | ✓ | Given `user_latitude`+`user_longitude`, marks present for every subject whose geofence you're in AND that has a class scheduled right now AND isn't already marked today |
| POST | `/api/ocr/scan-timetable` | ✓ | Multipart `image_file` → OCR (Tesseract) + subject/teacher/room/break classification with confidence scores |
| POST | `/api/ocr/confirm-timetable` | ✓ | Save reviewed subjects, and any corrections (checked before the classifier next time) |

Geofence request/response bodies use `snake_case` (`subject_id`,
`room_number`, `radius_meters`, ...) — the rest of the API is camelCase;
this one endpoint deliberately matches how it's actually being tested.
