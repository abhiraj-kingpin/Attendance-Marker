# Attendance Marker

A personal attendance tracker, syllabus tracker, exam countdown, and GPA
calculator, styled to match Google's Material 3 design system (the same
tokens, spacing, and components as Google Calendar/Tasks/Gmail). Ships both
as an installable offline-first PWA and as a native Android app.

## Features

- **Timetable & subjects** — build a weekly Mon–Sun timetable from your subjects, each with a colored avatar.
- **Daily attendance** — mark Present / Absent / No Class per period, with prev/next day navigation.
- **75% rule calculator** — live per-subject and overall attendance %, with how-many-to-attend / how-many-you-can-miss guidance.
- **Excluded date ranges** — camps, leave, or holidays that don't count for or against attendance.
- **Syllabus tracker** — per-subject topic checklists with progress bars.
- **Exam countdown** — live days/hours countdown, urgent flag inside 3 days, collapsible past exams.
- **GPA calculator** — GGSIPU Ordinance 11 grading (SGPA/CGPA), with the pre/post-2024 percentage formula toggle.

All data is stored locally (localStorage via Zustand) — nothing leaves your device.

## Stack

React + Vite (rolldown-vite), Tailwind CSS v4, Framer Motion, Zustand, Google
Material Symbols (`@material-symbols/svg-400`), `vite-plugin-pwa`, Capacitor
(Android). Typography is Roboto — Google's own display face ("Google Sans")
isn't publicly licensed for embedding in third-party apps, so headings use
Roboto Medium/Bold instead.

## Web development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build (also generates the service worker)
npm run preview  # preview the production build
npm run lint      # oxlint
```

## Android (native app via Capacitor)

Requires Android Studio + SDK installed locally (used for both the JDK and
the SDK/build-tools — no separate Java install needed).

```bash
npm run android:build   # web build + cap sync + gradle assembleDebug
```

The signed-for-debug APK lands at
`android/app/build/outputs/apk/debug/app-debug.apk` — sideload it directly,
or run `npm run android:open` to open the project in Android Studio and
build/run from there (needed for a release build with your own signing key).

## Regenerating design assets

The app icon/logo is `design/logo-original.png` (the real exported source
file — not hand-drawn). One script derives every size the app needs —
favicon, PWA icons (incl. maskable), Android launcher icons (legacy, round,
and adaptive foreground, all 5 densities), and the Android splash screens
(all density/orientation variants) — by trimming that source and compositing
it at the right scale/background for each target:

```bash
npm install -D sharp
node design/generate-all-from-logo.mjs
npm uninstall sharp
```

If you replace `design/logo-original.png` with a new export, just re-run the
script above, then `npm run android:sync` (or `npm run android:build`) so
the native project picks up the refreshed assets.
