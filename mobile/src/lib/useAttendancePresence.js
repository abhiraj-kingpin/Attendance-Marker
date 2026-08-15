import { useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useStore } from '../store/useStore';
import { findCurrentPeriod } from './findCurrentPeriod';
import { isWithinGeofence } from './geofence';
import { attendanceKey } from './attendance';
import { todayISO } from './dates';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // only meaningful while the app is open — see note below

// Prompts (never silently marks — see docs/ROADMAP-PLUS.md) attendance
// when the phone is within the college geofence during a period that has
// both start/end times set. This only runs while the app is in the
// foreground: real background tracking needs expo-task-manager + a
// foreground service, a much larger and riskier native integration that
// hasn't been built yet (see docs/CHECKLIST.md, Phase D).
export function useAttendancePresence() {
  const attendanceMode = useStore((s) => s.settings.attendanceMode);
  const collegeLocation = useStore((s) => s.settings.collegeLocation);
  const timetable = useStore((s) => s.timetable);
  const excludedRanges = useStore((s) => s.excludedRanges);
  const attendance = useStore((s) => s.attendance);
  const subjects = useStore((s) => s.subjects);
  const setAttendanceStatus = useStore((s) => s.setAttendanceStatus);

  const latest = useRef({});
  latest.current = { attendanceMode, collegeLocation, timetable, excludedRanges, attendance, subjects };
  const promptedPeriodIds = useRef(new Set());

  async function checkPresence() {
    const { attendanceMode, collegeLocation, timetable, excludedRanges, attendance, subjects } = latest.current;
    if (attendanceMode === 'manual' || !collegeLocation) return;

    const period = findCurrentPeriod({ timetable, excludedRanges });
    if (!period) return;
    if (promptedPeriodIds.current.has(period.id)) return;

    const key = attendanceKey(todayISO(), period.id);
    if (attendance[key]) return; // already marked, nothing to prompt

    const perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted) return;

    let position;
    try {
      position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    } catch {
      return;
    }

    const near = isWithinGeofence(
      { latitude: position.coords.latitude, longitude: position.coords.longitude },
      { latitude: collegeLocation.latitude, longitude: collegeLocation.longitude },
      collegeLocation.radiusM
    );
    if (!near) return;

    promptedPeriodIds.current.add(period.id);
    const subject = subjects.find((s) => s.id === period.subjectId);
    Alert.alert(
      'Mark attendance?',
      `You're near college and ${subject ? subject.name : 'a class'} is in session — mark yourself present?`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Mark present',
          onPress: () => setAttendanceStatus(todayISO(), period.id, period.subjectId, 'present'),
        },
      ]
    );
  }

  useEffect(() => {
    checkPresence();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPresence();
    });
    const interval = setInterval(checkPresence, CHECK_INTERVAL_MS);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, []);
}
