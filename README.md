# Attendance Marker

_A local-first attendance, syllabus, exam, and GPA tracker for college students — no backend, no account, no data that ever leaves the device._

![Platform](https://img.shields.io/badge/Platform-Android-3DDC84)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB)
![Expo](https://img.shields.io/badge/Expo_SDK-57-000020)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8)
![License](https://img.shields.io/badge/License-Proprietary-lightgrey)

---

## Overview

Attendance Marker is a **local-first companion app for GGSIPU college students** — attendance, syllabus progress, exam countdowns, and GPA math in one place, with everything stored on-device only.

It started as a web PWA and was later rewritten natively in **React Native (Expo)** for a faster, more reliable Android experience. The native app in [`mobile/`](mobile/) is the actively maintained version; the original web app still lives in this repo as a lighter browser-based alternative.

A few things beyond basic tracking:

- **On-device OCR timetable import** — photograph a printed timetable and it's parsed straight into the app. No cloud call, no image ever leaves the phone.
- **Configurable attendance target**, not hardcoded at the usual 75%, with live guidance on how many classes can be missed or must be attended to stay above it.
- **Leave & bunk planning** — before skipping a class (or a whole date range), see exactly how many extra classes it takes to recover.
- **GPA / SGPA calculator** built around GGSIPU's actual Ordinance 11 grading table, including the pre-/post-2024 percentage formula change.

## Download

Grab the latest signed APK from [Releases](https://github.com/abhiraj-kingpin/Attendance-Marker/releases/latest) and sideload it — Android will ask you to allow installs from this source the first time.

## Features

- **Subjects & timetable** — Theory or Lab subjects with credit values, arranged into a weekly timetable.
- **Daily attendance** — mark each period Present / Absent / No Class, with day-by-day navigation and a calendar month view.
- **Attendance target calculator** — per-subject and overall guidance based on your own target percentage.
- **Excluded date ranges** — camps, holidays, or leave that don't count for or against attendance.
- **Syllabus tracker** — paste a syllabus and it's split into units automatically, each with a topic checklist and progress bar.
- **Exam countdown** — live countdown to upcoming exams, with a collapsible history of past ones.
- **GPA calculator** — SGPA/CGPA with optional internal/external marks per subject.
- **Reminders** — a local notification if attendance for the day is still unmarked.
- **Theming** — light/dark mode, adjustable font size and family, and a free-pick accent/background color.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.86 (Expo SDK 57) |
| Styling | NativeWind (Tailwind for React Native) |
| State | Zustand, persisted to AsyncStorage |
| Navigation | React Navigation |
| OCR | ML Kit Text Recognition (on-device) |
| Notifications | Expo Notifications |

## Project Structure

```
mobile/                  React Native app (actively developed)
├── src/
│   ├── screens/          Today, Setup, Syllabus, Exams, GPA, Settings
│   ├── components/       Reusable UI + feature components
│   ├── lib/               Pure business logic, hooks
│   └── store/             Zustand global store
└── android/               Native Android project

src/                      Original Vite/React web app (PWA)
```

## Getting Started

Requires [Node.js](https://nodejs.org/) 20+ and [Android Studio](https://developer.android.com/studio) (for its SDK/NDK).

```bash
cd mobile
npm install
npx expo start          # run in Expo Go / a dev build
```

To build an installable APK:

```bash
cd mobile/android
./gradlew assembleDebug
```

The APK is written to `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

### Web version

The original PWA still works and lives at the repo root:

```bash
npm install
npm run dev
```

## Roadmap

- **iOS support** — the app is Android-only right now since that's the only device it's been tested on. The React Native code isn't tied to Android, so this is mostly a matter of time and a Mac to build on.
- **Automated tests** — correctness is currently verified by hand on a real device before every release. Tests around the attendance-target and GPA math would catch regressions faster.
- **Play Store listing** — right now the only way to install is sideloading the APK from Releases. Publishing properly would remove the "install from unknown sources" step.
- **Optional encrypted backup** — everything stays on-device today, which is the whole point, but an opt-in backup would help anyone switching phones.

## License

No license is currently granted. All rights are reserved by the author.
