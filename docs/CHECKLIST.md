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
- [ ] Onboarding: set college coordinates (needs a Maps/Geocoding API key from you)
- [ ] Building-level geofence
- [ ] Background presence check during class hours
- [ ] Confirmation prompt when near campus during a scheduled class (not silent auto-mark — see deviation)
- [ ] Notification on confirmation ("Mark attendance for [Subject]?")
- [ ] Settings: geofence radius, tracking on/off, notification preferences

## Phase E — GGSIPU CGPA integration
- [ ] In-app WebView login against the real `examweb.ggsipu.ac.in` (no credentials touch app/backend code — see deviation)
- [ ] Read rendered marks page after login
- [ ] Cache CGPA/semester data locally (`CgpaSession`, already in Phase A schema — holds no credentials)
- [ ] CGPA dashboard: current CGPA, semester trend, subject marks
- [ ] Export to PDF

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
