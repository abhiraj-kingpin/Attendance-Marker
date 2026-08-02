import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil } from 'lucide-react';
import { GRADES } from '../../lib/gpa';
import Card from '../common/Card';
import ConfirmIconButton from '../common/ConfirmIconButton';

const gradeColor = {
  O: '#34D399',
  'A+': '#34D399',
  A: '#22D3EE',
  'B+': '#8B5CF6',
  B: '#FBBF24',
  C: '#F59E0B',
  P: '#F59E0B',
  F: '#FB7185',
};

export default function SemesterCard({
  semester,
  sgpa,
  totalCredits,
  onRename,
  onRemove,
  onAddSubject,
  onUpdateSubject,
  onRemoveSubject,
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(semester.name);

  function saveName() {
    onRename(nameDraft.trim() || semester.name);
    setEditingName(false);
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            onBlur={saveName}
            className="flex-1 font-display text-lg text-ink-50 border-b-2 border-nova-400 outline-none bg-transparent"
          />
        ) : (
          <button className="flex items-center gap-1.5 flex-1 text-left min-h-11" onClick={() => setEditingName(true)}>
            <p className="font-display text-lg text-ink-50 truncate">{semester.name}</p>
            <Pencil size={13} className="text-ink-500 shrink-0" />
          </button>
        )}
        <div className="text-right shrink-0">
          <p className="font-display text-xl text-nova-300">{sgpa === null ? '—' : sgpa.toFixed(2)}</p>
          <p className="text-[10px] font-bold text-ink-500 -mt-0.5">SGPA</p>
        </div>
        <ConfirmIconButton onConfirm={onRemove} />
      </div>

      <div className="flex flex-col gap-2">
        {semester.subjects.map((sub) => (
          <motion.div layout key={sub.id} className="flex items-center gap-2 bg-white/5 rounded-2xl px-2.5 py-2">
            <input
              value={sub.name}
              onChange={(e) => onUpdateSubject(sub.id, { name: e.target.value })}
              placeholder="Subject name"
              className="flex-1 min-w-0 bg-transparent font-semibold text-sm text-ink-50 outline-none placeholder:text-ink-500"
            />
            <input
              type="number"
              min="0"
              max="30"
              value={sub.credits}
              onChange={(e) => onUpdateSubject(sub.id, { credits: e.target.value })}
              className="w-12 shrink-0 bg-space-800 rounded-lg text-center font-bold text-sm text-ink-100 outline-none py-2 border border-white/10"
              aria-label="Credits"
            />
            <select
              value={sub.grade}
              onChange={(e) => onUpdateSubject(sub.id, { grade: e.target.value })}
              className="shrink-0 bg-space-800 rounded-lg text-center font-bold text-sm outline-none py-2 px-1.5 border"
              style={{ color: gradeColor[sub.grade], borderColor: gradeColor[sub.grade] + '55' }}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <ConfirmIconButton onConfirm={() => onRemoveSubject(sub.id)} size={13} />
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs font-bold text-ink-500">{totalCredits} credit{totalCredits === 1 ? '' : 's'} total</p>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onAddSubject}
          className="flex items-center gap-1 text-sm font-bold text-ink-100 bg-white/8 px-3 py-2.5 rounded-xl min-h-11"
        >
          <Plus size={14} /> Subject
        </motion.button>
      </div>
    </Card>
  );
}
