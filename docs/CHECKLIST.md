# Full build checklist

Every feature from the original spec, broken into checkable work items.
Updated as work lands — this is the source of truth for what's done versus
still pending across sessions. See `docs/ROADMAP-PLUS.md` for the two
deliberate deviations from the spec (GGSIPU login, location attendance) and
why.

Two codebases are being built against the same spec in parallel:
**`mobile/`** (the shipped, local-only React Native app) and **`backend/`**
(an optional server, not yet wired to the mobile app — see the note at the
end of this file).

## Phase A — Backend foundation
- [x] Express + TypeScript project scaffold (`backend/`)
- [x] Prisma schema: User, Subject, Attendance, SyllabusBlock, Geofence, CgpaSession
- [x] JWT email/password auth (signup, login)
- [x] Subjects CRUD API
- [x] Attendance mark/list/stats API
- [x] End-to-end smoke test (signup → subject → attendance → stats)
- [ ] Google OAuth login
- [ ] Phone number OTP login
- [ ] Deploy to a real Postgres host (needs you to provision one)

## Phase B — Timetable OCR classification
**Mobile** (`classifyTimetableEntry.js`, `parseTimetableText.js`):
- [x] Classifier: subject vs teacher vs room vs break-activity, with a confidence score
- [x] Break-activity blocklist, room/teacher pattern extraction
- [x] Merge multi-line OCR cells (teacher/room on their own line attach to the subject above)
- [x] Confidence-scored review UI, learning system (`learnActivity`), known-subjects dictionary
- [x] Unit tests (17 constructed cases, all passing)
- [ ] **Tuned against a real timetable photo** — still needed; heuristics only verified against constructed examples
- [x] Subject customization — tags, notes, teacher, room fields

**Backend** (`ocrService.ts`, `POST /api/ocr/scan-timetable` + `/confirm-timetable`):
- [x] Same classification approach, ported to TypeScript, real Tesseract.js OCR
- [x] `OcrCorrection` table remembers rejected classifications
- [x] **Most rigorously tested piece built this session** — verified against
  a *real generated image* through *real Tesseract OCR* through a *real
  multipart HTTP upload*, not just typed text. Correctly separated 3
  subjects, 2 teachers, and all 3 break activities (Library/NCC/Lunch —
  the original bug case) from one test image, zero confirmation flags
  needed, subjects saved with teacher/room intact.
- Note: `mobile/`'s scan is deliberately on-device only ("the photo never
  leaves your phone" is shown in its UI) — this backend endpoint is a
  separate, optional capability the shipped app doesn't currently call.

## Phase C — Syllabus PDF extraction + class predictions
**Mobile** (`extractPdfText.js`, `predictSyllabusProgress.js`):
- [x] PDF file picker + text extraction (self-contained: byte-level PDF
  parsing + `pako` for FlateDecode, no DOM dependency, avoiding
  `pdfjs-dist`'s browser-API assumptions that commonly break under Metro)
- [x] Keyword-based section detection, generalized to Unit/Chapter/Module
- [x] Prediction engine (weeks elapsed → expected unit), ahead/behind/on-track status, correction inferred from ticked-off topics
- [x] Progress banner per subject
- [x] Unit-tested (extraction against synthetic PDFs, predictions against several date/pace scenarios)
- [ ] **Not yet confirmed on a real device** — `pako` in Hermes and the document picker's native behavior are the unverified pieces
- [ ] OCR fallback for scanned/handwritten PDFs — out of scope; not practical on-device at any real page count

**Backend** (`syllabusService.ts`):
- [x] `extractTextFromPDF` — same byte-level approach as the mobile
  extractor, using Node's built-in `zlib` instead of `pako` (available
  natively server-side)
- [x] `detectSyllabusContent` — keyword search (Syllabus/Course Content/
  Unit/Chapter/Module/Topics), slices from the first match onward
- [x] `parseIntoBlocks` — same Unit/Chapter/Module header logic as the
  mobile parser, ported
- [x] `POST /api/syllabus/upload` (multipart `pdf_file`), `POST
  /api/syllabus/confirm-blocks`, `GET /api/syllabus/:subjectId`
- [x] `StudySchedule` table, one row auto-created per confirmed block
- [x] Live-tested end-to-end via curl with a real generated PDF (FlateDecode-compressed, deflated via Node's zlib) through a real multipart HTTP upload — correctly extracted and block-split Unit 1 / Chapter 2 / Module 3, confirmed, and queried back with schedule status attached
- [x] Predictions (`predictionService.ts`) — same linear-pace model as the
  mobile predictor (weeks elapsed / semester weeks → expected block),
  `POST /api/predictions/check/:subjectId` and `.../correct/:subjectId`.
  `Subject` gains `commencementDate`/`semesterWeeks`, new
  `PredictionCorrection` table tracks expected-vs-actual for an accuracy
  score. Live-tested via curl: no-data case before blocks exist, correct
  Unit 2 prediction at the 50%-through-semester mark with 4 blocks
  (matches the mobile predictor's own test case exactly), and corrections
  correctly raise `accuracy_percent`. Caught and fixed a real bug during
  testing — `accuracy_improved` read `false` on the very first correction
  ever because it compared against a `null` baseline instead of treating
  no-data-yet as 0.

## Phase D — Location, geofencing & auto-attendance
**Mobile** (`geofence.js`, `findCurrentPeriod.js`, `useAttendancePresence.js`):
- [x] College location capture via device GPS (not a typed name + Geocoding API)
- [x] Building-level geofence (Haversine, unit-tested against known reference distances)
- [x] Per-period class times — added an optional start/end time editor (periods had no time data at all before this)
- [x] Confirmation prompt when near campus during a scheduled class (`Alert.alert`, not silent auto-mark — see the deviation in ROADMAP-PLUS.md)
- [x] Settings: Manual/Partial/Automatic mode toggle, geofence radius
- [ ] **Foreground-only** — checks on app-open + every 5 min while open; real background tracking needs `expo-task-manager` + an Android foreground service, not attempted
- [ ] System-tray notification on confirmation — currently in-app only, consistent with the foreground-only limitation

**Backend** (`locationService.ts`, `attendanceService.ts`):
- [x] Geofence CRUD + location-check API — hardcoded college list (MAIT,
  GGSIPU, DTU) + plain Haversine, **zero external API calls, zero
  billing**. (Briefly built against Google's Geocoding/Distance Matrix
  REST APIs first; those needed manual API-activation in Cloud Console for
  no real benefit here, so replaced.)
- [x] `ClassSchedule` table (weekly class times per subject — the backend
  had no schedule concept at all before this)
- [x] `POST /api/attendance/auto-mark` — marks present for every subject
  whose geofence you're in AND has an active `ClassSchedule` entry AND
  isn't already marked today
- [x] Live-tested via curl: full geofence CRUD, marks once, refuses to
  double-mark same day, stays empty outside the geofence / with no
  schedule / outside the schedule's time window
- Not wired to `mobile/` — its `useAttendancePresence.js` does the
  equivalent entirely client-side; the two are parallel, unconnected
  implementations right now.

## Phase E — GGSIPU CGPA integration
**Mobile** (`CgpaPortalModal.js`) — the only implementation; no backend
version was built (see the deviation below):
- [x] In-app WebView loading the real `examweb.ggsipu.ac.in` login page directly — credentials never touch app or backend code
- [x] Generic table/CGPA-pattern extraction, shown as a raw review screen
- [x] Snapshot cached locally (holds no credentials)
- [ ] Structured CGPA dashboard — the existing manual GPA screen covers this; snapshot is a cross-check aid
- [ ] Export to PDF

**Deliberately not built:** a backend service that receives a user's
GGSIPU password (even encrypted) and logs into the portal on their
behalf. `examweb.ggsipu.ac.in` also refuses connections from outside
India (confirmed via repeated fetch attempts while building this), so its
exact page structure couldn't be inspected either way — the mobile
extraction is deliberately generic rather than targeting field IDs that
were never actually seen. **Needs a real on-device test with real
credentials** — the least-verified piece built this session.

## Phase F — Admin dashboard & polish
**Backend** (`isAdmin`/`requireAdmin`, `adminController.ts`):
- [x] `GET /api/admin/analytics` — total/active users, today's attendance
  split, OCR accuracy, geo-tracking health, average attendance — all
  computed from real data, no placeholders
- [x] `GET /api/admin/attendance-log`, `/api/admin/geofences` (usage
  count + last-used), `/api/admin/users` (with `?search=`)
- [x] `GET /api/admin/ocr-stats` — added `OcrScanLog` (every scan attempt)
  and `originalType` on `OcrCorrection` so `total_scans`/
  `common_misclassifications` are real counts, not fabricated
- [x] `GET`/`PUT /api/admin/settings` — mode toggle + feature flags,
  stored via a singleton `AppSettings` row (see caveat in
  `backend/README.md`: not yet enforced anywhere)
- [x] `GET /api/admin/errors` — backed by a real `ErrorLog` table that
  `errorHandler.ts` now writes to
- [x] **Found and fixed a serious pre-existing bug while wiring error
  logging**: Express 4 doesn't catch promise rejections from `async`
  route handlers — confirmed directly (isolated repro) that an unhandled
  error in *any* of the ~25 async controllers in this backend crashed the
  entire process, not just the failing request. Fixed with
  `express-async-errors`, required once at the top of `app.ts`. This
  predates the admin dashboard work; it affected the whole backend.
- [x] `make-admin` bootstrap script (no self-serve way to become the
  first admin, by design) — live-tested end to end
- [x] Live-tested via curl: 403 for non-admins, all endpoints against
  real seeded data, settings GET/PUT, error logging verified via an
  isolated repro of the async-error fix (before and after)

**Frontend** (`admin-dashboard/` — separate Vite + React + TypeScript app):
- [x] Login (shares backend auth; rejects non-admin accounts client-side
  after checking `isAdmin` from `/api/auth/me`)
- [x] Dashboard — metric cards, auto/manual pie chart, OCR accuracy bar
  chart (Recharts), recent attendance table, 30s auto-refresh
- [x] Users page — paginated table, search by email
- [x] Geofences page — table (usage count, last used) + add-geofence form
- [x] Settings page — mode toggle, feature flags, error log viewer
- [x] `AuthContext`, `PrivateRoute` (redirects to `/login` if not an
  authenticated admin), axios instance with JWT header +
  401-clears-session interceptor
- [x] TypeScript compiles clean, production build succeeds, dev server
  verified to boot and serve correctly; full request/response contract
  between frontend and backend live-tested via curl with the dashboard's
  actual `Origin` header (CORS confirmed permissive enough)
- [ ] **Not click-tested in an actual browser** — no browser automation
  tool available here. Confidence is: types check, build succeeds, every
  API call the UI makes was independently verified via curl against the
  real backend with matching field names/shapes. The one thing that
  genuinely needs a human: opening it and clicking through.
- [ ] Map visualization on the Geofences page — marked optional in the
  spec, not built (table + form only)
- [x] Onboarding tutorial (`OnboardingScreen.js`) — 6-step swipeable
  walkthrough (scan timetable, syllabus PDF, location prompts,
  predictions, GPA, wrap-up), progress dots, Skip, native `Animated` API
  pulsing icons rather than Lottie (no real Lottie JSON assets were
  available to use honestly). Shows once after the splash
  (`settings.hasSeenOnboarding`, persisted), replayable from Settings →
  Help & feedback. Gradle build succeeds; **not yet click-tested on a
  device** — this is the next thing to check when the phone connects.

Two deliberate deviations, both explained to you before starting:
- **Vite instead of Create React App** — CRA is deprecated by the React
  team; this repo's root web app already uses Vite, so it's consistent.
- **A second, parallel React Native mobile app was not built.** `mobile/`
  already exists as the real, shipped v1.0.0 app — a second Expo project
  calling these same APIs would fork the product in two rather than
  extend it.

## Already shipped before this checklist existed (v1.0.0, local-only)
- [x] Timetable scan (basic, now upgraded by Phase B), manual attendance, configurable target %
- [x] Leave/bunk planning, exam countdown
- [x] Syllabus paste-and-split into units
- [x] GPA/SGPA calculator (GGSIPU Ordinance 11, manual entry)
- [x] Light/dark theme, font size, free-pick accent color, local reminder notification

## Mobile ↔ backend: not connected yet
Everything backend-side (auth, subjects sync, auto-attendance, server OCR,
geofencing) is live-tested via curl but **the shipped mobile app doesn't
call any of it** — `mobile/` remains fully local-only/offline by design.
Wiring them together (optional account-based sync, letting the backend's
auto-mark and OCR endpoints actually back the app) is its own decision and
hasn't been asked for yet.
