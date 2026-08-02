# Attendance Marker

A personal attendance tracker, syllabus tracker, exam countdown, and GPA
calculator, with an immersive "universe" visual theme (real-time 3D
starfield, glass-panel cards, glowing planet avatars per subject). Ships
both as an installable offline-first PWA and as a native Android app.

## Features

- **Timetable & subjects** — build a weekly Mon–Sun timetable from your subjects, each rendered as its own glowing "planet" avatar.
- **Daily attendance** — mark Present / Absent / No Class per period, with a particle-burst micro-animation and prev/next day navigation.
- **75% rule calculator** — live per-subject and overall attendance %, shown as animated orbit rings, with how-many-to-attend / how-many-you-can-miss guidance.
- **Excluded date ranges** — camps, leave, or holidays that don't count for or against attendance.
- **Syllabus tracker** — per-subject topic checklists with orbit-ring progress.
- **Exam countdown** — live days/hours countdown, pulsing glow + red flag inside 3 days, collapsible past exams.
- **GPA calculator** — GGSIPU Ordinance 11 grading (SGPA/CGPA), with the pre/post-2024 percentage formula toggle.

All data is stored locally (localStorage via Zustand) — nothing leaves your device.
Respects `prefers-reduced-motion` throughout (starfield, particle bursts, pulses all simplify/disable).

## Stack

React + Vite (rolldown-vite), Tailwind CSS v4, Framer Motion, `react-three-fiber` + `drei` (starfield), Zustand, `vite-plugin-pwa`, Capacitor (Android).

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

Source SVGs live in `design/`. Regenerate PWA icons, Android launcher icons,
or the Android splash screen with:

```bash
npm install -D sharp
node design/generate-icons.mjs           # PWA icons -> public/icons
node design/generate-android-icons.mjs   # Android launcher icons -> android/app/.../mipmap-*
node design/generate-splash.mjs          # Android splash screens -> android/app/.../drawable*
npm uninstall sharp
```

After changing anything under `design/`, also re-run `npm run android:sync`
(or `npm run android:build`) so the native project picks up the new PWA
build and assets.
