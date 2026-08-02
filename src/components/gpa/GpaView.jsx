import { motion } from 'framer-motion';
import { Plus, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { computeCGPA, cgpaToPercentage } from '../../lib/gpa';
import AppHeader from '../layout/AppHeader';
import EmptyState from '../common/EmptyState';
import SemesterCard from './SemesterCard';

export default function GpaView() {
  const gpa = useStore((s) => s.gpa);
  const setAdmissionPeriod = useStore((s) => s.setAdmissionPeriod);
  const addSemester = useStore((s) => s.addSemester);
  const renameSemester = useStore((s) => s.renameSemester);
  const removeSemester = useStore((s) => s.removeSemester);
  const addSemesterSubject = useStore((s) => s.addSemesterSubject);
  const updateSemesterSubject = useStore((s) => s.updateSemesterSubject);
  const removeSemesterSubject = useStore((s) => s.removeSemesterSubject);

  const { cgpa, perSemester } = computeCGPA(gpa.semesters);
  const sgpaBySemId = Object.fromEntries(perSemester.map((p) => [p.id, p]));
  const percentage = cgpaToPercentage(cgpa, gpa.admissionPeriod);

  return (
    <div>
      <AppHeader title="GPA" subtitle="GGSIPU Ordinance 11 grading" />
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-5 mb-4 shadow-pop glass-panel overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 85% 0%, #8B5CF6, transparent 60%)' }}
          />
          <div className="relative">
            <p className="text-sm font-bold text-ink-300">Running CGPA</p>
            <p className="font-display text-4xl mt-1 text-ink-50">{cgpa === null ? '—' : cgpa.toFixed(2)}</p>
            <p className="text-sm font-bold text-nova-300 mt-1">
              {percentage === null ? 'Set your admission year to see %' : `≈ ${percentage.toFixed(2)}% equivalent`}
            </p>
          </div>
        </motion.div>

        <div className="glass-panel rounded-2xl p-4 shadow-pop-sm mb-4">
          <p className="text-sm font-bold text-ink-200 mb-2">When were you admitted?</p>
          <div className="flex gap-2">
            {[
              { value: 'before2024', label: 'Before 2024', hint: 'CGPA × 10' },
              { value: '2024plus', label: '2024 or later', hint: '(CGPA − 0.75) × 10' },
            ].map((opt) => {
              const active = gpa.admissionPeriod === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setAdmissionPeriod(opt.value)}
                  className={`flex-1 rounded-2xl px-3 py-2.5 border text-left transition-colors min-h-11 ${
                    active ? 'bg-nova-500/25 border-nova-400/60 text-ink-50 shadow-glow-nova' : 'bg-white/5 border-white/10 text-ink-300'
                  }`}
                >
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className={`text-[11px] font-semibold ${active ? 'text-nova-200' : 'text-ink-500'}`}>{opt.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-ink-300">
            {gpa.semesters.length} semester{gpa.semesters.length === 1 ? '' : 's'}
          </p>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              addSemester();
              toast.success('Semester added');
            }}
            className="flex items-center gap-1.5 bg-gradient-to-br from-nova-500 to-comet-500 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-glow-nova min-h-11"
          >
            <Plus size={16} /> Add semester
          </motion.button>
        </div>

        {gpa.semesters.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No semesters yet"
            subtitle="Add a semester, then add subjects with credits and grades to calculate your SGPA."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {gpa.semesters.map((sem) => (
              <SemesterCard
                key={sem.id}
                semester={sem}
                sgpa={sgpaBySemId[sem.id]?.sgpa ?? null}
                totalCredits={sgpaBySemId[sem.id]?.totalCredits ?? 0}
                onRename={(name) => renameSemester(sem.id, name)}
                onRemove={() => removeSemester(sem.id)}
                onAddSubject={() => addSemesterSubject(sem.id, { name: '', credits: 4, grade: 'O' })}
                onUpdateSubject={(subId, patch) => updateSemesterSubject(sem.id, subId, patch)}
                onRemoveSubject={(subId) => removeSemesterSubject(sem.id, subId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
