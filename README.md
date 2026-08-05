# Attendance Marker

A personal attendance, syllabus, exam, and GPA tracker for college students,
built as a Material 3–styled web app that ships both as an installable
offline-first PWA and as a native Android application.

## Overview

Attendance Marker replaces a spreadsheet-and-memory approach to tracking
college coursework with a single local-first app. All data — subjects,
timetable, attendance records, syllabus progress, exams, and GPA — is stored
on-device only; there is no backend, no account system, and no data leaves
the device.

The visual design follows Google's Material Design 3 system (the same
design tokens, spacing, and component patterns used by Google
Calendar/Tasks/Gmail), using Google's own Material Symbols icon set and
Roboto typography.

## Features

- **Subjects & timetable** — subjects are categorized as Theory or Lab, each
  with a credit value, and arranged into a Monday–Sunday weekly timetable.
- **Daily attendance** — mark each period Present / Absent / No Class, with
  day-by-day navigation and a calendar month view for jumping to any past or
  future date.
- **Attendance target calculator** — a configurable target percentage (not
  fixed at 75%) with live per-subject and overall guidance: how many classes
  can be missed while staying above target, or how many consecutive classes
  must be attended to reach it.
- **Excluded date ranges** — camps, leave, or holidays that are skipped
  entirely and don't count for or against attendance.
- **Syllabus tracker** — per-subject topic checklists with progress bars.
- **Exam countdown** — live countdown to upcoming exams, an urgency flag
  inside the final 3 days, and a collapsible list of past exams.
- **GPA calculator** — SGPA/CGPA under GGSIPU Ordinance 11 grading, with
  optional internal/external mark entry per subject and a percentage
  conversion toggle for the pre-/post-2024 formula change.

## Screenshots

_No screenshots are currently checked into the repository. Add device
screenshots or screen recordings here (e.g. under `docs/screenshots/`) when
available._

## Architecture

The app is a client-only single-page application — there is no server
component. State is held in one global [Zustand](https://github.com/pmndrs/zustand)
store (`src/store/useStore.js`), persisted to `localStorage`, with
components subscribing to only the slices of state they use to avoid
unnecessary re-renders.

Navigation is a fixed set of six tabs managed with local `useState` in
`App.jsx` rather than a routing library — the app has no deep-linkable
routes or nested navigation, so a router would add indirection without
solving a problem the app actually has.

Business logic (attendance-target math, GPA/SGPA calculation, date
handling) is implemented as pure functions in `src/lib/`, independent of
React, so it's testable and reusable in isolation from the UI.

The native Android app is produced by [Capacitor](https://capacitorjs.com/),
which packages the built web app into a WebView-based native shell — the
Android app and the PWA share the exact same web codebase.

## Technology Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| State management | Zustand (with `persist` middleware) |
| Date handling | date-fns |
| Icons | Google Material Symbols (`@material-symbols/svg-400`) |
| Notifications | react-hot-toast |
| PWA / service worker | vite-plugin-pwa (Workbox) |
| Native shell | Capacitor 8 (Android) |
| Linting | oxlint |

## Folder Structure

```
├── android/                 Native Android project (Capacitor)
│   └── app/src/main/        Manifest, Java source, resources
├── design/                  Icon/splash source assets and generation script
├── public/                  Static assets served as-is (icons, manifest inputs)
├── src/
│   ├── components/
│   │   ├── common/          Shared UI primitives (Card, Fab, BottomSheet, ErrorBoundary, ...)
│   │   ├── layout/           App shell (AppHeader, BottomNav, Splash)
│   │   ├── today/            Daily attendance marking + calendar
│   │   ├── attendance/       Attendance target calculator
│   │   ├── syllabus/         Syllabus tracker
│   │   ├── exams/            Exam countdown
│   │   ├── gpa/               GPA/SGPA calculator
│   │   └── setup/            Subjects, timetable, and excluded-range setup
│   ├── lib/                  Pure business logic and hooks (framework-agnostic)
│   ├── store/                 Zustand global store
│   ├── App.jsx                Root component: tab navigation and transitions
│   └── main.jsx                Entry point
├── capacitor.config.json     Capacitor native shell configuration
└── vite.config.js             Vite + PWA plugin configuration
```

## Installation

Requires [Node.js](https://nodejs.org/) 20 or later.

```bash
npm install
```

## Environment Variables

None. The app has no backend and no third-party API integration — all
configuration lives in `vite.config.js` and `capacitor.config.json`, and all
user data is stored locally via `localStorage`.

## Running Locally

```bash
npm run dev
```

Starts the Vite dev server with hot module reloading.

## Building for Production

```bash
npm run build
```

Produces an optimized, service-worker-enabled build in `dist/`. Preview it
locally with:

```bash
npm run preview
```

## Android Build Instructions

Requires [Android Studio](https://developer.android.com/studio) installed
locally — its bundled JDK and SDK are used for the build, no separate Java
installation is needed.

```bash
npm run android:build
```

This runs the production web build, syncs it into the native project via
`cap sync android`, and invokes Gradle's `assembleDebug` task. The resulting
debug APK is written to:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

This APK can be sideloaded directly onto a device. To produce a signed
release build, open the project with `npm run android:open` and build from
Android Studio, which requires configuring your own signing key.

## PWA Support

The web build is installable as a Progressive Web App and works fully
offline after the first load. `vite-plugin-pwa` generates a service worker
(`registerType: 'autoUpdate'`) that precaches the app shell and static
assets, with a network-first strategy for the HTML document so updates are
picked up automatically on the next successful network fetch.

## Deployment

The `dist/` output from `npm run build` is a static site and can be
deployed to any static hosting provider (Vercel, Cloudflare Pages, GitHub
Pages, or similar) — no server-side runtime is required.

The Android APK is not currently published to Google Play; it's built and
distributed directly (see Android Build Instructions above).

## Performance Optimizations

- **Font subsetting** — `@fontsource/roboto` is imported with Latin-only
  subsets, avoiding the full multi-script font payload.
- **Per-icon imports** — Material Symbols icons are imported individually as
  raw SVG strings, so only icons actually used in the UI are bundled, rather
  than pulling in an icon font or full icon library.
- **Selective store subscriptions** — components subscribe to individual
  Zustand state slices rather than the whole store, limiting re-renders to
  components whose relevant data actually changed.
- **Single bundle, no route-based code splitting** — the production
  JavaScript bundle is small (roughly 130 KB gzipped) and ships inside the
  Android APK rather than being fetched over the network per navigation, so
  route-level lazy loading would add complexity without a measurable
  benefit for either the PWA or the native app.
- **GPU-composited fixed elements** — the bottom navigation bar and floating
  action button are pinned to their own compositing layer to avoid
  reflow-triggered repaint jank in the Android WebView.

## Future Improvements

- Automated test coverage (unit tests for the `src/lib/` calculation
  functions; component/integration tests for critical flows).
- A continuous integration workflow to run linting and build checks on
  every push.
- An iOS Capacitor target, if there is demand — the current codebase is
  already platform-agnostic at the web layer.
- Optional encrypted cloud backup/sync, kept opt-in to preserve the
  local-only-by-default data model.

## License

No license is currently granted. All rights are reserved by the author. If
you intend to reuse this code, add an explicit `LICENSE` file specifying
the terms.
