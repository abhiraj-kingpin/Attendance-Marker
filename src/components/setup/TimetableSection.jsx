import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronUp, ChevronDown, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { colorForSubject } from '../../lib/colors';
import { DAYS, DAY_LABELS } from '../../lib/dates';
import Card from '../common/Card';
import BottomSheet from '../common/BottomSheet';
import EmptyState from '../common/EmptyState';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Planet from '../space/Planet';

export default function TimetableSection() {
  const subjects = useStore((s) => s.subjects);
  const timetable = useStore((s) => s.timetable);
  const addPeriod = useStore((s) => s.addPeriod);
  const removePeriod = useStore((s) => s.removePeriod);
  const movePeriod = useStore((s) => s.movePeriod);

  const [day, setDay] = useState(DAYS[0]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const periods = timetable[day] || [];
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  function handleAdd(subjectId) {
    addPeriod(day, subjectId);
    setSheetOpen(false);
    toast.success(`Added to ${day}`);
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
        {DAYS.map((d) => {
          const active = d === day;
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-colors min-h-11 ${
                active
                  ? 'bg-nova-500/25 border-nova-400/60 text-ink-50 shadow-glow-nova'
                  : 'bg-white/5 border-white/10 text-ink-400'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 mb-3">
        <p className="text-sm font-bold text-ink-300">{DAY_LABELS[day]} · {periods.length} period{periods.length === 1 ? '' : 's'}</p>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setSheetOpen(true)}
          disabled={subjects.length === 0}
          className="flex items-center gap-1.5 bg-gradient-to-br from-nova-500 to-comet-500 disabled:opacity-40 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-glow-nova min-h-11"
        >
          <Plus size={16} /> Add period
        </motion.button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Add subjects first"
          subtitle="Head to the Subjects tab to add subjects, then build your timetable here."
        />
      ) : periods.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={`No classes on ${DAY_LABELS[day]}`}
          subtitle="Tap “Add period” to schedule a class for this day."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {periods.map((period, idx) => {
            const subject = subjectById[period.subjectId];
            const color = colorForSubject(subject);
            return (
              <motion.div key={period.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="flex items-center gap-3 p-3.5">
                  <Planet color={color} size={32} label={idx + 1} />
                  <span className="flex-1 font-bold text-ink-50 truncate">
                    {subject ? subject.name : 'Unknown subject'}
                  </span>
                  <div className="flex flex-col">
                    <button
                      disabled={idx === 0}
                      onClick={() => movePeriod(day, period.id, -1)}
                      className="p-2 text-ink-400 disabled:opacity-20"
                      aria-label="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      disabled={idx === periods.length - 1}
                      onClick={() => movePeriod(day, period.id, 1)}
                      className="p-2 text-ink-400 disabled:opacity-20"
                      aria-label="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <ConfirmIconButton onConfirm={() => removePeriod(day, period.id)} />
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={`Add period · ${day}`}>
        <p className="text-sm font-bold text-ink-300 mb-3">Pick a subject</p>
        <div className="grid grid-cols-2 gap-2.5">
          {subjects.map((subject) => {
            const color = colorForSubject(subject);
            return (
              <motion.button
                key={subject.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleAdd(subject.id)}
                className="flex items-center gap-2 rounded-2xl px-3 py-3 font-bold text-sm border min-h-11"
                style={{ background: color.soft, color: color.text, borderColor: color.strong + '55' }}
              >
                <Planet color={color} size={18} ring={false} />
                <span className="truncate">{subject.name}</span>
              </motion.button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
