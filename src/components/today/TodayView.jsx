import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { attendanceKey } from '../../lib/attendance';
import {
  todayISO,
  addDaysISO,
  isTodayISO,
  dayKeyFromISO,
  formatFriendly,
  isDateExcluded,
} from '../../lib/dates';
import { ICONS, NAV_ICONS } from '../../lib/icons';
import AppHeader from '../layout/AppHeader';
import ExamWidget from './ExamWidget';
import ClassCard from './ClassCard';
import CalendarSheet from './CalendarSheet';
import EmptyState from '../common/EmptyState';
import Icon from '../common/Icon';

function DayNavButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-11 h-11 grid place-items-center rounded-full text-on-surface-secondary active:bg-surface-variant-2 transition-colors"
      aria-label={label}
    >
      <Icon svg={icon} size={20} />
    </button>
  );
}

export default function TodayView({ onNavigate }) {
  const [date, setDate] = useState(todayISO());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const subjects = useStore((s) => s.subjects);
  const timetable = useStore((s) => s.timetable);
  const attendance = useStore((s) => s.attendance);
  const excludedRanges = useStore((s) => s.excludedRanges);
  const setAttendanceStatus = useStore((s) => s.setAttendanceStatus);

  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const dayKey = dayKeyFromISO(date);
  const periods = timetable[dayKey] || [];
  const excluded = isDateExcluded(date, excludedRanges);

  return (
    <div>
      <AppHeader
        title={isTodayISO(date) ? 'Today' : dayKey}
        subtitle={formatFriendly(date)}
        right={
          <div className="flex items-center gap-1">
            <DayNavButton icon={NAV_ICONS.today.outlined} label="Open calendar" onClick={() => setCalendarOpen(true)} />
            <DayNavButton icon={ICONS.chevronLeft} label="Previous day" onClick={() => setDate((d) => addDaysISO(d, -1))} />
            <DayNavButton icon={ICONS.chevronRight} label="Next day" onClick={() => setDate((d) => addDaysISO(d, 1))} />
          </div>
        }
      />

      <div className="px-5">
        {!isTodayISO(date) && (
          <button
            onClick={() => setDate(todayISO())}
            className="text-sm font-medium text-g-blue mb-3"
          >
            Jump back to today
          </button>
        )}

        <ExamWidget onNavigate={onNavigate} />

        {excluded && (
          <div className="flex items-center gap-2.5 bg-g-green-container text-g-green-dark rounded-xl px-4 py-3 mb-4 font-medium text-sm">
            <Icon svg={ICONS.eventBusy} size={20} className="shrink-0" />
            Excluded day — {excluded.label}. Nothing counts today.
          </div>
        )}

        {periods.length === 0 ? (
          <EmptyState
            icon={ICONS.eventBusy}
            title="No classes scheduled"
            subtitle={`Nothing on your ${dayKey} timetable. Add periods from the Setup tab.`}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {periods.map((period, idx) => {
              const key = attendanceKey(date, period.id);
              const record = attendance[key];
              return (
                <ClassCard
                  key={period.id}
                  index={idx}
                  subject={subjectById[period.subjectId]}
                  status={record?.status || null}
                  disabled={!!excluded}
                  onSetStatus={(status) =>
                    setAttendanceStatus(date, period.id, period.subjectId, status)
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      <CalendarSheet
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={date}
        onSelectDate={setDate}
      />
    </div>
  );
}
