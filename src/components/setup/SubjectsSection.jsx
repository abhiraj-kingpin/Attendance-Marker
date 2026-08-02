import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, BookMarked } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { colorForSubject } from '../../lib/colors';
import Card from '../common/Card';
import BottomSheet from '../common/BottomSheet';
import EmptyState from '../common/EmptyState';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Planet from '../space/Planet';

export default function SubjectsSection() {
  const subjects = useStore((s) => s.subjects);
  const addSubject = useStore((s) => s.addSubject);
  const updateSubject = useStore((s) => s.updateSubject);
  const removeSubject = useStore((s) => s.removeSubject);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null); // subject or null
  const [name, setName] = useState('');

  function openAdd() {
    setEditing(null);
    setName('');
    setSheetOpen(true);
  }

  function openEdit(subject) {
    setEditing(subject);
    setName(subject.name);
    setSheetOpen(true);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing) {
      updateSubject(editing.id, { name: trimmed });
      toast.success('Subject updated');
    } else {
      addSubject(trimmed);
      toast.success('Subject added');
    }
    setSheetOpen(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-ink-300">{subjects.length} subject{subjects.length === 1 ? '' : 's'}</p>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-gradient-to-br from-nova-500 to-comet-500 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-glow-nova min-h-11"
        >
          <Plus size={16} /> Add subject
        </motion.button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No subjects yet"
          subtitle="Add your first subject to start building your timetable."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {subjects.map((subject, i) => {
            const color = colorForSubject(subject);
            return (
              <motion.div
                key={subject.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="flex items-center gap-3 p-3.5">
                  <Planet color={color} size={26} ring={false} />
                  <span className="flex-1 font-bold text-ink-50 truncate">{subject.name}</span>
                  <button
                    onClick={() => openEdit(subject)}
                    className="min-w-11 min-h-11 grid place-items-center rounded-full bg-white/8 text-ink-300 active:scale-90 transition-transform"
                    aria-label="Edit subject"
                  >
                    <Pencil size={16} />
                  </button>
                  <ConfirmIconButton onConfirm={() => { removeSubject(subject.id); toast('Subject removed'); }} />
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Edit subject' : 'Add subject'}>
        <label className="text-sm font-bold text-ink-300">Subject name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="e.g. Data Structures"
          className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/5 focus:border-nova-400 outline-none px-4 py-3 font-semibold text-ink-50 placeholder:text-ink-500"
        />
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          disabled={!name.trim()}
          className="mt-4 w-full bg-gradient-to-br from-nova-500 to-comet-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-glow-nova"
        >
          {editing ? 'Save changes' : 'Add subject'}
        </motion.button>
      </BottomSheet>
    </div>
  );
}
