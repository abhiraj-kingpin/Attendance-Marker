import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  format,
} from 'date-fns';
import { useStore } from '../../store/useStore';
import { dayStatus } from '../../lib/attendance';
import { dayKeyFromISO, toISODate, todayISO } from '../../lib/dates';
import { ICONS } from '../../lib/icons';
import BottomSheet from '../common/BottomSheet';
import Icon from '../common/Icon';

const STATUS_DOT = {
  present: 'bg-g-green',
  absent: 'bg-g-red',
  mixed: 'bg-g-yellow',
  excluded: 'bg-outline',
};

export default function CalendarSheet({ open, onClose, selectedDate, onSelectDate }) {
  const [monthAnchor, setMonthAnchor] = useState(() => parseISO(selectedDate));
  const timetable = useStore((s) => s.timetable);
  const attendance = useStore((s) => s.attendance);
  const excludedRanges = useStore((s) => s.excludedRanges);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthAnchor]);

  const today = todayISO();

  return (
    <BottomSheet open={open} onClose={onClose} title="Jump to a date">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMonthAnchor((m) => subMonths(m, 1))}
          className="w-11 h-11 grid place-items-center rounded-full text-on-surface-secondary active:bg-surface-variant-2"
          aria-label="Previous month"
        >
          <Icon svg={ICONS.chevronLeft} size={20} />
        </button>
        <p className="font-display font-medium text-base text-on-surface">{format(monthAnchor, 'MMMM yyyy')}</p>
        <button
          onClick={() => setMonthAnchor((m) => addMonths(m, 1))}
          className="w-11 h-11 grid place-items-center rounded-full text-on-surface-secondary active:bg-surface-variant-2"
          aria-label="Next month"
        >
          <Icon svg={ICONS.chevronRight} size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <p key={i} className="text-center text-xs font-medium text-on-surface-tertiary py-1">
            {d}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = toISODate(day);
          const inMonth = isSameMonth(day, monthAnchor);
          const isSelected = isSameDay(day, parseISO(selectedDate));
          const isToday = iso === today;
          const periods = timetable[dayKeyFromISO(iso)] || [];
          const status = dayStatus(iso, periods, attendance, excludedRanges);

          return (
            <button
              key={iso}
              onClick={() => {
                onSelectDate(iso);
                onClose();
              }}
              className={`relative aspect-square rounded-full flex flex-col items-center justify-center text-sm font-medium ${
                !inMonth ? 'text-on-surface-tertiary/40' : isSelected ? 'bg-g-blue text-white' : isToday ? 'bg-g-blue-container text-g-blue-dark' : 'text-on-surface'
              }`}
            >
              {day.getDate()}
              {status && (
                <span
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]} ${isSelected ? 'opacity-90' : ''}`}
                  style={isSelected ? { background: 'white' } : undefined}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {[
          ['present', 'All present'],
          ['absent', 'Had absence'],
          ['mixed', 'Mixed'],
          ['excluded', 'Excluded'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[key]}`} />
            <span className="text-[11px] font-medium text-on-surface-tertiary">{label}</span>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
