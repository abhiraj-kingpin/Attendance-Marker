import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useStore } from '../store/useStore';
import { attendanceKey } from './attendance';
import { todayISO, dayKeyFromISO, isDateExcluded } from './dates';
import { syncDailyReminder } from './notifications';

export function useReminderSync() {
  const remindersEnabled = useStore((s) => s.settings.remindersEnabled);
  const subjects = useStore((s) => s.subjects);
  const timetable = useStore((s) => s.timetable);
  const attendance = useStore((s) => s.attendance);
  const excludedRanges = useStore((s) => s.excludedRanges);
  const latest = useRef({});
  latest.current = { remindersEnabled, timetable, attendance, excludedRanges };

  function resync() {
    const { remindersEnabled, timetable, attendance, excludedRanges } = latest.current;
    const today = todayISO();
    const excluded = isDateExcluded(today, excludedRanges);
    const periods = excluded ? [] : timetable[dayKeyFromISO(today)] || [];
    const pendingCount = periods.filter((p) => !attendance[attendanceKey(today, p.id)]).length;
    syncDailyReminder({ enabled: remindersEnabled, pendingCount });
  }

  useEffect(() => {
    resync();
  }, [remindersEnabled, subjects, timetable, attendance, excludedRanges]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resync();
    });
    return () => sub.remove();
  }, []);
}
