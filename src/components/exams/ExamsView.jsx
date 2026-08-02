import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Timer, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { msUntil, isPastExam, todayISO } from '../../lib/dates';
import { useTicker } from '../../lib/useTicker';
import AppHeader from '../layout/AppHeader';
import BottomSheet from '../common/BottomSheet';
import EmptyState from '../common/EmptyState';
import ExamCard from './ExamCard';

const PRESETS = ['Mid-Sem', 'End-Sem', 'Practical', 'Viva', 'Quiz'];

export default function ExamsView() {
  useTicker(30000);
  const exams = useStore((s) => s.exams);
  const subjects = useStore((s) => s.subjects);
  const addExam = useStore((s) => s.addExam);
  const removeExam = useStore((s) => s.removeExam);
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const [sheetOpen, setSheetOpen] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('');

  function openAdd() {
    setSubjectId(subjects[0]?.id || '');
    setName('');
    setDate(todayISO());
    setTime('');
    setSheetOpen(true);
  }

  function handleSave() {
    if (!name.trim() || !date) return;
    addExam({ subjectId: subjectId || null, name: name.trim(), date, time: time || null });
    toast.success('Exam added');
    setSheetOpen(false);
  }

  const upcoming = exams
    .filter((e) => !isPastExam(e.date, e.time))
    .sort((a, b) => msUntil(a.date, a.time) - msUntil(b.date, b.time));
  const past = exams
    .filter((e) => isPastExam(e.date, e.time))
    .sort((a, b) => msUntil(b.date, b.time) - msUntil(a.date, a.time));

  return (
    <div>
      <AppHeader title="Exams" subtitle="Countdown to what's next" />
      <div className="px-5">
        <div className="flex justify-end mb-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-gradient-to-br from-nova-500 to-comet-500 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-glow-nova min-h-11"
          >
            <Plus size={16} /> Add exam
          </motion.button>
        </div>

        {exams.length === 0 ? (
          <EmptyState icon={Timer} title="No exams yet" subtitle="Add an exam to start the countdown." />
        ) : (
          <>
            {upcoming.length === 0 ? (
              <EmptyState icon={Timer} title="No upcoming exams" subtitle="All caught up — nice." />
            ) : (
              <div className="flex flex-col gap-2.5">
                {upcoming.map((exam, i) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    subject={subjectById[exam.subjectId]}
                    onRemove={() => removeExam(exam.id)}
                    index={i}
                  />
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="mt-5">
                <button
                  onClick={() => setPastOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-sm font-bold text-ink-400 mb-2 min-h-11"
                >
                  <motion.span animate={{ rotate: pastOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown size={16} />
                  </motion.span>
                  Past exams ({past.length})
                </button>
                <AnimatePresence initial={false}>
                  {pastOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden flex flex-col gap-2.5"
                    >
                      {past.map((exam, i) => (
                        <ExamCard
                          key={exam.id}
                          exam={exam}
                          subject={subjectById[exam.subjectId]}
                          onRemove={() => removeExam(exam.id)}
                          past
                          index={i}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add exam">
        <label className="text-sm font-bold text-ink-300">Subject</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="mt-1.5 mb-3 w-full rounded-2xl border border-white/15 bg-space-800 focus:border-nova-400 outline-none px-4 py-3 font-semibold text-ink-50"
        >
          <option value="">General / Other</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <label className="text-sm font-bold text-ink-300">Exam name / type</label>
        <div className="flex gap-1.5 flex-wrap mt-1.5 mb-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setName(p)}
              className={`px-3 py-2 rounded-full text-xs font-bold border min-h-11 ${
                name === p ? 'bg-nova-500/25 border-nova-400/60 text-ink-50' : 'bg-white/5 border-white/10 text-ink-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mid-Sem"
          className="mb-3 w-full rounded-2xl border border-white/15 bg-white/5 focus:border-nova-400 outline-none px-4 py-3 font-semibold text-ink-50 placeholder:text-ink-500"
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-bold text-ink-300">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/5 focus:border-nova-400 outline-none px-3 py-3 font-semibold text-ink-50"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-bold text-ink-300">Time (optional)</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/5 focus:border-nova-400 outline-none px-3 py-3 font-semibold text-ink-50"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          disabled={!name.trim() || !date}
          className="mt-4 w-full bg-gradient-to-br from-nova-500 to-comet-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-glow-nova"
        >
          Add exam
        </motion.button>
      </BottomSheet>
    </div>
  );
}
