import { motion } from 'framer-motion';
import { Timer, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { colorForSubject } from '../../lib/colors';
import { msUntil, formatCountdown, isPastExam } from '../../lib/dates';
import { useTicker } from '../../lib/useTicker';
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion';

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
        <p className="font-display text-base text-ink-100 flex items-center gap-1.5">
          <Timer size={16} className="text-solar-400" /> Upcoming exams
        </p>
        <button
          onClick={() => onNavigate?.('exams')}
          className="flex items-center text-xs font-bold text-nova-300 min-h-11"
        >
          See all <ChevronRight size={14} />
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                mostUrgent && !reducedMotion
                  ? {
                      opacity: 1,
                      scale: 1,
                      boxShadow: [
                        '0 0 0px rgba(251,113,133,0.0)',
                        '0 0 26px rgba(251,113,133,0.65)',
                        '0 0 0px rgba(251,113,133,0.0)',
                      ],
                    }
                  : { opacity: 1, scale: 1 }
              }
              transition={
                mostUrgent && !reducedMotion
                  ? { boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }
                  : undefined
              }
              className={`shrink-0 w-40 rounded-2xl p-3.5 ${
                urgent ? 'bg-flare-500/18 border border-flare-400/50' : 'glass-panel'
              }`}
            >
              <span
                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
                style={
                  urgent
                    ? { background: 'rgba(251,113,133,0.22)', color: '#FDA4AF' }
                    : { background: color.soft, color: color.text }
                }
              >
                {subject?.name || 'Exam'}
              </span>
              <p className={`font-bold text-sm truncate ${urgent ? 'text-flare-400' : 'text-ink-50'}`}>
                {exam.name}
              </p>
              <p className={`font-display text-xl mt-1 ${urgent ? 'text-flare-400' : 'text-ink-200'}`}>
                {formatCountdown(ms)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
