import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { colorForSubject } from '../../lib/colors';
import { msUntil, formatCountdown, isPastExam } from '../../lib/dates';
import { useTicker } from '../../lib/useTicker';
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion';
import { ICONS } from '../../lib/icons';
import Icon from '../common/Icon';

export default function ExamWidget({ onNavigate }) {
  useTicker(30000);
  const reducedMotion = usePrefersReducedMotion();
  const exams = useStore((s) => s.exams);
  const subjects = useStore((s) => s.subjects);
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const upcoming = exams
    .filter((e) => !isPastExam(e.date, e.time))
    .sort((a, b) => msUntil(a.date, a.time) - msUntil(b.date, b.time))
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <p className="font-display font-medium text-base text-on-surface flex items-center gap-1.5">
          <Icon svg={ICONS.schedule} size={18} className="text-on-surface-tertiary" /> Upcoming exams
        </p>
        <button onClick={() => onNavigate?.('exams')} className="flex items-center text-sm font-medium text-g-blue min-h-11">
          See all
          <Icon svg={ICONS.chevronRight} size={16} />
        </button>
      </div>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
        {upcoming.map((exam, i) => {
          const subject = subjectById[exam.subjectId];
          const color = colorForSubject(subject);
          const ms = msUntil(exam.date, exam.time);
          const urgent = ms <= 3 * 24 * 60 * 60 * 1000;
          const mostUrgent = urgent && i === 0;
          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={
                mostUrgent && !reducedMotion
                  ? { opacity: 1, scale: 1, backgroundColor: ['#FCE8E6', '#FBD3CF', '#FCE8E6'] }
                  : { opacity: 1, scale: 1 }
              }
              transition={mostUrgent && !reducedMotion ? { backgroundColor: { duration: 2, repeat: Infinity, ease: 'easeInOut' } } : undefined}
              className={`shrink-0 w-40 rounded-xl p-3.5 border ${
                urgent ? 'border-g-red bg-g-red-container' : 'border-outline-variant bg-surface'
              }`}
            >
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md mb-2"
                style={urgent ? { background: '#FBD3CF', color: '#B3261E' } : { background: color.container, color: color.on }}
              >
                {urgent && <Icon svg={ICONS.warning} size={12} />}
                {subject?.name || 'Exam'}
              </span>
              <p className={`font-medium text-sm truncate ${urgent ? 'text-g-red-dark' : 'text-on-surface'}`}>{exam.name}</p>
              <p className={`font-display font-medium text-xl mt-1 ${urgent ? 'text-g-red-dark' : 'text-on-surface-secondary'}`}>
                {formatCountdown(ms)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
