import {
  format,
  parseISO,
  addDays as fnsAddDays,
  isWithinInterval,
  startOfDay,
  isSameDay,
  differenceInCalendarDays,
} from 'date-fns';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LABELS = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const JS_DAY_TO_KEY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toISODate(date) {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO() {
  return toISODate(new Date());
}

export function dayKeyFromISO(iso) {
  const d = parseISO(iso);
  return JS_DAY_TO_KEY[d.getDay()];
}

export function addDaysISO(iso, amount) {
  return toISODate(fnsAddDays(parseISO(iso), amount));
}

export function isTodayISO(iso) {
  return isSameDay(parseISO(iso), new Date());
}

export function formatFriendly(iso) {
  return format(parseISO(iso), 'EEEE, d MMM yyyy');
}

export function formatShort(iso) {
  return format(parseISO(iso), 'd MMM yyyy');
}

export function formatDayMonth(iso) {
  return format(parseISO(iso), 'd MMM');
}

export function isDateExcluded(iso, excludedRanges) {
  if (!excludedRanges?.length) return null;
  const d = startOfDay(parseISO(iso));
  for (const range of excludedRanges) {
    const start = startOfDay(parseISO(range.start));
    const end = startOfDay(parseISO(range.end));
    if (isWithinInterval(d, { start, end })) return range;
  }
  return null;
}

export function daysUntil(iso, timeStr) {
  const target = timeStr ? parseISO(`${iso}T${timeStr}`) : parseISO(`${iso}T23:59:59`);
  return differenceInCalendarDays(target, new Date());
}

export function msUntil(iso, timeStr) {
  const target = timeStr ? parseISO(`${iso}T${timeStr}`) : parseISO(`${iso}T23:59:59`);
  return target.getTime() - Date.now();
}

export function isPastExam(iso, timeStr) {
  return msUntil(iso, timeStr) < 0;
}

export function formatCountdown(ms) {
  if (ms <= 0) return 'Now';
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
