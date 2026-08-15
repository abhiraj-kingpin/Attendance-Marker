# Attendance Marker — Admin Dashboard

A separate React app (Vite + TypeScript + Tailwind) for viewing usage
analytics, attendance logs, geofences, and settings from `backend/`. Not
part of the mobile app or the backend — a standalone tool.

## Setup

```bash
npm install
cp .env.example .env   # points at the backend; defaults to localhost:4000
npm run dev             # http://localhost:5173
```

The backend must be running (`cd ../backend && npm run dev`) and you need
an admin account:

```bash
# from backend/, after signing up normally via POST /api/auth/signup
npm run make-admin -- you@example.com
```

## Notes

- **Vite, not Create React App** — CRA is deprecated; this repo's root web
  app already uses Vite too, so it's the consistent choice.
- **Port**: this dev server runs on Vite's default `5173`. The backend
  runs on `4000` (`backend/.env`'s `PORT`) — set via `VITE_API_URL` if
  yours differs. The two never collide.
- **Settings page caveat**: the mode toggle and feature flags are stored
  server-side (`AppSettings`) and shown here, but nothing in the backend
  or the mobile app currently reads them to change behavior — `mobile/`'s
  attendance mode is a per-user local setting, and this backend's own
  logic doesn't check these flags either. Storage + UI exist; wiring real
  enforcement is a separate step.
- Map visualization on the Geofences page wasn't built (marked optional
  in the spec) — it's a table with an add-geofence form.
