import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { colorForSubject } from '../../lib/colors';
import { ICONS, NAV_ICONS } from '../../lib/icons';
import Card from '../common/Card';
import BottomSheet from '../common/BottomSheet';
import EmptyState from '../common/EmptyState';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import Fab from '../common/Fab';

const TYPES = [
  { value: 'theory', label: 'Theory' },
  { value: 'lab', label: 'Lab' },
];

function SubjectRow({ subject, onEdit, onRemove }) {
  const color = colorForSubject(subject);
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <Avatar color={color} size={36} label={subject.name.charAt(0).toUpperCase()} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-on-surface">{subject.name}</p>
        <p className="text-xs text-on-surface-tertiary">{subject.credits ?? 4} credit{(subject.credits ?? 4) === 1 ? '' : 's'}</p>
      </div>
      <button
        onClick={onEdit}
        className="min-w-11 min-h-11 grid place-items-center rounded-full text-on-surface-tertiary active:bg-surface-variant-2 transition-colors"
        aria-label="Edit subject"
      >
        <Icon svg={ICONS.edit} size={18} />
      </button>
      <ConfirmIconButton onConfirm={onRemove} />
    </Card>
  );
}

export default function SubjectsSection() {
  const subjects = useStore((s) => s.subjects);
  const addSubject = useStore((s) => s.addSubject);
  const updateSubject = useStore((s) => s.updateSubject);
  const removeSubject = useStore((s) => s.removeSubject);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null); // subject or null
  const [name, setName] = useState('');
  const [type, setType] = useState('theory');
  const [credits, setCredits] = useState(4);

  function openAdd() {
    setEditing(null);
    setName('');
    setType('theory');
    setCredits(4);
    setSheetOpen(true);
  }

  function openEdit(subject) {
    setEditing(subject);
    setName(subject.name);
    setType(subject.type === 'lab' ? 'lab' : 'theory');
    setCredits(subject.credits ?? 4);
    setSheetOpen(true);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing) {
      updateSubject(editing.id, { name: trimmed, type, credits: Number(credits) || 4 });
      toast.success('Subject updated');
    } else {
      addSubject(trimmed, { type, credits });
      toast.success('Subject added');
    }
    setSheetOpen(false);
  }

  const theory = subjects.filter((s) => s.type !== 'lab');
  const labs = subjects.filter((s) => s.type === 'lab');

  return (
    <div>
      <p className="text-sm font-medium text-on-surface-secondary mb-3">{subjects.length} subject{subjects.length === 1 ? '' : 's'}</p>

      {subjects.length === 0 ? (
        <EmptyState
          icon={NAV_ICONS.checklist.outlined}
          title="No subjects yet"
          subtitle="Add your first subject to start building your timetable."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {theory.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-on-surface-tertiary uppercase tracking-wide mb-2">Theory</p>
              <div className="flex flex-col gap-2.5">
                {theory.map((subject) => (
                  <SubjectRow
                    key={subject.id}
                    subject={subject}
                    onEdit={() => openEdit(subject)}
                    onRemove={() => { removeSubject(subject.id); toast('Subject removed'); }}
                  />
                ))}
              </div>
            </div>
          )}

          {labs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-on-surface-tertiary uppercase tracking-wide mb-2">Labs</p>
              <div className="flex flex-col gap-2.5">
                {labs.map((subject) => (
                  <SubjectRow
                    key={subject.id}
                    subject={subject}
                    onEdit={() => openEdit(subject)}
                    onRemove={() => { removeSubject(subject.id); toast('Subject removed'); }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Fab icon={ICONS.add} label="Add subject" onClick={openAdd} />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Edit subject' : 'Add subject'}>
        <label className="text-sm font-medium text-on-surface-secondary">Subject name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="e.g. Data Structures"
          className="mt-1.5 mb-3 w-full rounded-lg border border-outline-variant bg-surface focus:border-g-blue outline-none px-4 py-3 font-medium text-on-surface placeholder:text-on-surface-tertiary"
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-on-surface-secondary">Type</label>
            <div className="mt-1.5 flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex-1 rounded-lg px-3 py-3 text-sm font-medium border min-h-11 ${
                    type === t.value ? 'bg-g-blue-container border-g-blue text-g-blue-dark' : 'bg-surface border-outline-variant text-on-surface-tertiary'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-24">
            <label className="text-sm font-medium text-on-surface-secondary">Credits</label>
            <input
              type="number"
              min="0"
              max="10"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface focus:border-g-blue outline-none px-3 py-3 text-center font-medium text-on-surface"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!name.trim()}
          className="mt-4 w-full bg-g-blue disabled:opacity-40 text-white font-medium py-3.5 rounded-full"
        >
          {editing ? 'Save changes' : 'Add subject'}
        </motion.button>
      </BottomSheet>
    </div>
  );
}
