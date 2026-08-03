import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { colorForSubject } from '../../lib/colors';
import { DAYS, DAY_LABELS } from '../../lib/dates';
import { ICONS } from '../../lib/icons';
import Card from '../common/Card';
import BottomSheet from '../common/BottomSheet';
import EmptyState from '../common/EmptyState';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import Fab from '../common/Fab';

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
              className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors min-h-11 ${
                active ? 'bg-g-blue border-g-blue text-white' : 'bg-surface border-outline-variant text-on-surface-tertiary'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <p className="text-sm font-medium text-on-surface-secondary mt-4 mb-3">
        {DAY_LABELS[day]} · {periods.length} period{periods.length === 1 ? '' : 's'}
      </p>

      {subjects.length === 0 ? (
        <EmptyState
          icon={ICONS.eventBusy}
          title="Add subjects first"
          subtitle="Head to the Subjects tab to add subjects, then build your timetable here."
        />
      ) : periods.length === 0 ? (
        <EmptyState icon={ICONS.eventBusy} title={`No classes on ${DAY_LABELS[day]}`} subtitle="Tap the add button to schedule a class for this day." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {periods.map((period, idx) => {
            const subject = subjectById[period.subjectId];
            const color = colorForSubject(subject);
            return (
              <div key={period.id}>
                <Card className="flex items-center gap-3 p-3.5">
                  <Avatar color={color} size={36} label={idx + 1} />
                  <span className="flex-1 font-medium text-on-surface">{subject ? subject.name : 'Unknown subject'}</span>
                  <div className="flex flex-col">
                    <button
                      disabled={idx === 0}
                      onClick={() => movePeriod(day, period.id, -1)}
                      className="p-2 text-on-surface-tertiary disabled:opacity-20"
                      aria-label="Move up"
                    >
                      <Icon svg={ICONS.arrowUp} size={16} />
                    </button>
                    <button
                      disabled={idx === periods.length - 1}
                      onClick={() => movePeriod(day, period.id, 1)}
                      className="p-2 text-on-surface-tertiary disabled:opacity-20"
                      aria-label="Move down"
                    >
                      <Icon svg={ICONS.arrowDown} size={16} />
                    </button>
                  </div>
                  <ConfirmIconButton onConfirm={() => removePeriod(day, period.id)} />
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <Fab icon={ICONS.add} label="Add period" onClick={() => subjects.length > 0 && setSheetOpen(true)} />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={`Add period · ${day}`}>
        <p className="text-sm font-medium text-on-surface-secondary mb-3">Pick a subject</p>
        <div className="grid grid-cols-2 gap-2.5">
          {subjects.map((subject) => {
            const color = colorForSubject(subject);
            return (
              <motion.button
                key={subject.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAdd(subject.id)}
                className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium text-sm min-h-11"
                style={{ background: color.container, color: color.on }}
              >
                <Avatar color={{ container: color.solid, on: '#fff' }} size={22} label={subject.name.charAt(0).toUpperCase()} />
                <span className="">{subject.name}</span>
              </motion.button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
