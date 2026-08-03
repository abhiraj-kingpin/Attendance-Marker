import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { computeCGPA, cgpaToPercentage } from '../../lib/gpa';
import { ICONS, NAV_ICONS } from '../../lib/icons';
import AppHeader from '../layout/AppHeader';
import EmptyState from '../common/EmptyState';
import Card from '../common/Card';
import Fab from '../common/Fab';
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
      <div className="px-5 pb-20">
        <Card className="p-5 mb-4">
          <p className="text-sm font-medium text-on-surface-secondary">Running CGPA</p>
          <p className="font-display font-medium text-4xl mt-1 text-on-surface">{cgpa === null ? '—' : cgpa.toFixed(2)}</p>
          <p className="text-sm font-medium text-g-blue mt-1">
            {percentage === null ? 'Set your admission year to see %' : `≈ ${percentage.toFixed(2)}% equivalent`}
          </p>
        </Card>

        <Card className="p-4 mb-4">
          <p className="text-sm font-medium text-on-surface-secondary mb-2">When were you admitted?</p>
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
                  className={`flex-1 rounded-lg px-3 py-2.5 border text-left transition-colors min-h-11 ${
                    active ? 'bg-g-blue-container border-g-blue text-g-blue-dark' : 'bg-surface border-outline-variant text-on-surface-tertiary'
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-[11px] font-medium opacity-80">{opt.hint}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <p className="text-sm font-medium text-on-surface-secondary mb-3">
          {gpa.semesters.length} semester{gpa.semesters.length === 1 ? '' : 's'}
        </p>

        {gpa.semesters.length === 0 ? (
          <EmptyState
            icon={NAV_ICONS.grading.outlined}
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
                onAddSubject={() => addSemesterSubject(sem.id, { name: '', credits: 4, grade: 'O', internal: '', external: '' })}
                onUpdateSubject={(subId, patch) => updateSemesterSubject(sem.id, subId, patch)}
                onRemoveSubject={(subId) => removeSemesterSubject(sem.id, subId)}
              />
            ))}
          </div>
        )}
      </div>

      <Fab
        icon={ICONS.add}
        label="Add semester"
        onClick={() => {
          addSemester();
          toast.success('Semester added');
        }}
      />
    </div>
  );
}
