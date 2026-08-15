# Roadmap: backend + intelligence features

Tracks the larger feature set requested on top of the shipped v1.0.0 app
(local-only React Native app in `mobile/`). This is a multi-session build —
each phase below is a real unit of work, done incrementally so every phase
lands in a working, tested state rather than one giant untested change.

Two deliberate deviations from the original spec, decided 2026-08-15:

- **CGPA/GGSIPU integration** will be an in-app browser against the real
  `examweb.ggsipu.ac.in` login page, not a backend that receives/relays your
  portal password. No server ever sees your GGSIPU credentials.
- **Location-based attendance** detects building-level presence and prompts
  for confirmation, not silent per-room auto-marking. Phone GPS accuracy
  (15–50m, no floor/altitude data) can't reliably tell rooms apart on
  different floors — building it as "silent auto-mark by room" would be
  shipping something that quietly gets attendance wrong.

## Phase A — Backend foundation ✅ done (2026-08-15)

Express + TypeScript API in `backend/`, Prisma schema (SQLite for local dev,
Postgres-ready for deploy), JWT email/password auth, subjects CRUD,
attendance marking + stats. Smoke-tested end-to-end. See `backend/README.md`.

## Phase B — OCR subject/teacher/room classification

Improve `mobile/`'s existing timetable scan (`ScanTimetableModal.js` +
`parseTimetableText.js`) to separate subject names from teacher names, break
activities (Library/NCC/Sports/Lunch), and room numbers, with a confidence
score and a confirmation dialog for anything below ~70%. Needs real sample
timetable photos to tune against — general heuristics without them risk
overfitting to imagined examples.

## Phase C — Syllabus PDF extraction + class-progress predictions

PDF upload → text extraction → split into units/chapters by keyword
detection (Unit/Chapter/Module/Topic headers). Prediction engine: given a
commencement date and syllabus block count, estimate which unit classes
should currently be on, shown alongside the user's actual marked progress
with a correction input that feeds back into future estimates.

## Phase D — Location & building-level attendance prompts

Onboarding step to set the college's coordinates (needs a Maps/Geocoding
API key — see `backend/README.md`), a building-level geofence, background
presence check during class hours, and a confirmation prompt (not silent
auto-marking — see deviation above) when the student is near campus during
a scheduled class.

## Phase E — GGSIPU CGPA integration (in-app browser)

In-app WebView pointed at the real GGSIPU exam portal login. After the
student logs in directly with GGSIPU (nothing passes through app code or
the backend), read the rendered marks page, cache CGPA/semester data
locally and in `CgpaSession` (holds no credentials — see schema).

## Phase F — Admin dashboard & polish

Web dashboard (active users, attendance-marking stats, error logs),
Automatic/Partial/Manual mode toggle, onboarding tutorial animations,
notification preferences.

## Provisioning needed from you before certain phases work

- Google Maps / Geocoding API key (Phase D)
- A real Postgres host, when deploying the backend beyond local dev
- Firebase project, only if you want push notifications or Google OAuth
  instead of local-only notifications and email/password auth
