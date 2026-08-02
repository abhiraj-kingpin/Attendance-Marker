import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarOff, CalendarX2 } from 'lucide-react';
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
import AppHeader from '../layout/AppHeader';
import ExamWidget from './ExamWidget';
import ClassCard from './ClassCard';
import EmptyState from '../common/EmptyState';

export default function TodayView({ onNavigate }) {
  const [date, setDate] = useState(todayISO());

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
          <div className="flex items-center gap-1 glass-panel rounded-full p-1 shadow-pop-sm">
            <button
              onClick={() => setDate((d) => addDaysISO(d, -1))}
              className="w-11 h-11 grid place-items-center rounded-full text-ink-200 active:scale-90 transition-transform"
              aria-label="Previous day"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setDate((d) => addDaysISO(d, 1))}
              className="w-11 h-11 grid place-items-center rounded-full text-ink-200 active:scale-90 transition-transform"
              aria-label="Next day"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        }
      />

      <div className="px-5">
        {!isTodayISO(date) && (
          <button
            onClick={() => setDate(todayISO())}
            className="text-xs font-bold text-nova-300 underline mb-3"
          >
            Jump back to today
          </button>
        )}

        <ExamWidget onNavigate={onNavigate} />

        {excluded && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 bg-aurora-500/12 border border-aurora-400/40 text-aurora-400 rounded-2xl px-4 py-3 mb-4 font-bold text-sm"
          >
            <CalendarOff size={18} className="shrink-0" />
            Excluded day — {excluded.label}. Nothing counts today.
          </motion.div>
        )}

        {periods.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
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
    </div>
  );
}
