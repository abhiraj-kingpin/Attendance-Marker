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

These are external accounts/keys I can't provision on your behalf:

- **Google Maps / Geocoding API key** — needed to resolve a college name to
  coordinates for geofencing (Phase D).
- **A real Postgres instance** (e.g. Railway, Render, Supabase, or your own
  server) — only needed when you're ready to deploy; local dev doesn't need
  it.
- **Firebase project** (optional) — only if you want push notifications via
  FCM instead of local-only notifications, or Google OAuth login.

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
