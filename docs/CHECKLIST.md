# Full build checklist

Every feature from the original spec, broken into checkable work items.
Updated as work lands — this is the source of truth for what's done versus
still pending across sessions. See `docs/ROADMAP-PLUS.md` for the two
deliberate deviations from the spec (GGSIPU login, location attendance) and
why.

## Phase A — Backend foundation
- [x] Express + TypeScript project scaffold (`backend/`)
- [x] Prisma schema: User, Subject, Attendance, SyllabusBlock, Geofence, CgpaSession
- [x] JWT email/password auth (signup, login)
- [x] Subjects CRUD API
- [x] Attendance mark/list/stats API
- [x] End-to-end smoke test (signup → subject → attendance → stats)
- [x] Geofence CRUD + location-check API (`backend/src/services/
  locationService.ts`) — runs on a hardcoded college list (MAIT, GGSIPU,
  DTU) plus plain Haversine math, **zero external API calls, zero
  billing**. (Briefly built against Google's Geocoding/Distance Matrix
  REST APIs first; those needed manual API-activation in Google Cloud
  Console which added friction for no real benefit here, so replaced with
  this simpler approach.) Full CRUD (create/list/update/delete) plus
  location-check all live-tested via curl end-to-end.
- [ ] Google OAuth login
- [ ] Phone number OTP login
- [ ] Deploy to a real Postgres host (needs you to provision one)

## Phase B — Timetable OCR classification
- [x] Classifier: subject vs teacher vs room vs break-activity, with a confidence score
- [x] Break-activity blocklist (Library, NCC, Sports, Lunch, Gym, ...)
- [x] Room number pattern extraction (e.g. "431", "A204", "LT-2")
- [x] Teacher name pattern extraction (Dr./Prof./Mr./Ms./Er. prefixes)
- [x] Merge multi-line OCR cells (teacher/room on their own line attach to the subject above)
- [x] Confidence-scored review UI — flags low-confidence and activity-like entries for confirmation
- [x] Learning system — rejected activities remembered (`learnActivity`) and checked first on future scans
- [x] Known-subjects dictionary — existing subjects matched with high confidence
- [x] Unit tests (17 constructed cases, all passing)
- [ ] **Tuned against a real timetable photo** — still needed; heuristics only verified against constructed examples so far
- [ ] Subject code pattern validation (beyond the current all-caps heuristic)
- [x] Subject customization — custom tags (comma-separated, shown as pills) and a free-text notes field, added to the manual Add/Edit subject sheet
- [ ] Auto-fetch subject metadata from a college database — no such API exists to query

## Phase C — Syllabus PDF extraction + class predictions
- [x] PDF file picker (`expo-document-picker`) + text extraction
- [x] Keyword-based section detection, generalized to Unit/Chapter/Module (was Unit-only)
- [x] Split into editable study blocks, linked to a subject (reuses existing paste-review flow)
- [x] Prediction engine (weeks elapsed → expected unit covered), with ahead/behind/on-track status
- [x] Prediction correction — inferred from which unit's topics you've actually started ticking off
- [x] Progress banner on each subject's syllabus card (expected vs actual)
- [ ] OCR fallback for scanned/handwritten PDFs — out of scope for now, see note below
- [ ] Dedicated full-screen progress dashboard (currently a compact per-card banner, not a separate screen)

**PDF extraction implementation note:** built as a small self-contained
extractor (`extractPdfText.js`) — byte-level PDF object parsing + `pako`
for FlateDecode stream decompression, both pure JS with no DOM
dependency, rather than pulling in `pdfjs-dist` (relies on browser APIs
that don't reliably exist in React Native's JS engine, and is a common
source of Metro-bundling breakage). Unit-tested against synthetic PDFs
covering uncompressed streams, FlateDecode-compressed streams, `Tj`/`TJ`
operators, kerning-based word-space detection, and escaped characters —
all passing. It handles typeset (real, non-scanned) PDFs, which covers
the realistic case for an official syllabus document; a genuinely
scanned/handwritten 800-page PDF is out of scope — OCR'ing that many
pages on-device isn't practical regardless of library choice. **Not yet
confirmed against a real device** — the JS logic is Node-verified and the
app compiles/bundles clean, but `pako` running inside Hermes and the
document picker's real native behavior need an actual on-device test.

Note: `mobile/` already had a lighter version of syllabus tracking —
paste-text-and-split-into-units (`PasteSyllabusModal.js`,
`parseSyllabusText.js`) — built in an earlier session. This phase extended
that with PDF upload and the prediction engine rather than replacing it.

## Phase D — Location & building-level attendance prompts
- [x] College location capture — via device GPS ("stand here, tap Capture"), **not** a typed name + Google Geocoding API, so the Maps API key is no longer a blocker for this feature. The key would only add a "type your college's name" convenience on top later.
- [x] Building-level geofence (Haversine distance, unit-tested against known reference distances)
- [x] Per-period class times (start/end) — timetable periods had no time data at all before this; added an optional time editor per period, since presence checking needs to know when a class is happening
- [x] Confirmation prompt when near campus during a scheduled class (`Alert.alert`, not silent auto-mark — see deviation)
- [x] Settings: Manual/Partial/Automatic mode toggle, geofence radius (defaults 150m, re-capturable)
- [ ] **Foreground-only** — checks on app-open and every 5 minutes while the app stays open. True background tracking (checking while the app is closed) needs `expo-task-manager` + an Android foreground service, a materially larger and riskier native integration not yet attempted — flagging this honestly rather than claiming background coverage that isn't there.
- [ ] Notification (system tray) on confirmation — currently an in-app `Alert`, not a push/local notification, so it only fires while the app is open (consistent with the foreground-only limitation above)

## Phase E — GGSIPU CGPA integration
- [x] In-app WebView (`react-native-webview`) loading the real `https://examweb.ggsipu.ac.in/web/login.jsp` — login is GGSIPU's own rendered page, credentials never touch app or backend code
- [x] Generic table/CGPA-pattern extraction from the currently displayed page, shown as a raw review screen
- [x] Snapshot cached locally (`cgpaSnapshot` in the store — holds no credentials, just what was visible at extraction time)
- [ ] Structured CGPA dashboard (trend chart, subject-by-subject) — not built; the existing manual GPA screen already covers this, snapshot is a cross-check aid, not a replacement
- [ ] Export to PDF

**Honesty note:** `examweb.ggsipu.ac.in` refuses connections from outside
India (confirmed — every fetch attempt while building this got
`ECONNREFUSED`), so the real page's exact HTML structure could not be
inspected or tested against while building this. The extraction script is
deliberately generic (grab every `<table>`, regex-search for "CGPA"/"SGPA"
followed by a number) rather than targeting specific field IDs that were
never actually seen — it surfaces raw content for you to read and
cross-check, not a claim of precise auto-parsed fields. **Needs a real
on-device test with real GGSIPU credentials to confirm the extraction
finds anything useful at all** — this is the least-verified piece built so
far this session.

## Phase F — Admin dashboard & polish
- [ ] Web dashboard: active users, attendance stats, error logs
- [ ] Automatic / Partial / Manual mode toggle
- [ ] Onboarding tutorial animations
- [ ] Notification preference screen
- [ ] Multi-device / spoofing sanity checks on attendance records

## Already shipped before this checklist existed (v1.0.0, local-only)
- [x] Timetable scan (basic, now upgraded by Phase B)
- [x] Manual attendance marking, configurable target %
- [x] Leave/bunk planning
- [x] Syllabus paste-and-split into units
- [x] Exam countdown
- [x] GPA/SGPA calculator (GGSIPU Ordinance 11, manual entry)
- [x] Light/dark theme, font size, free-pick accent color
- [x] Local reminder notification for unmarked attendance
