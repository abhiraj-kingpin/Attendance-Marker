import { useState } from 'react';
import { motion } from 'framer-motion';
import { GRADES } from '../../lib/gpa';
import { ICONS } from '../../lib/icons';
import Card from '../common/Card';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Icon from '../common/Icon';

const gradeColor = {
  O: { on: '#1E7E34', container: '#E6F4EA' },
  'A+': { on: '#1E7E34', container: '#E6F4EA' },
  A: { on: '#006064', container: '#D0F4F7' },
  'B+': { on: '#1A56DB', container: '#D3E3FD' },
  B: { on: '#A35A00', container: '#FEEFC3' },
  C: { on: '#B4530A', container: '#FEE8D6' },
  P: { on: '#B4530A', container: '#FEE8D6' },
  F: { on: '#B3261E', container: '#FCE8E6' },
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
            className="flex-1 font-display font-medium text-lg text-on-surface border-b-2 border-g-blue outline-none bg-transparent"
          />
        ) : (
          <button className="flex items-center gap-1.5 flex-1 text-left min-h-11" onClick={() => setEditingName(true)}>
            <p className="font-display font-medium text-lg text-on-surface truncate">{semester.name}</p>
            <Icon svg={ICONS.edit} size={15} className="text-on-surface-tertiary shrink-0" />
          </button>
        )}
        <div className="text-right shrink-0">
          <p className="font-display font-medium text-xl text-g-blue">{sgpa === null ? '—' : sgpa.toFixed(2)}</p>
          <p className="text-[10px] font-medium text-on-surface-tertiary -mt-0.5">SGPA</p>
        </div>
        <ConfirmIconButton onConfirm={onRemove} />
      </div>

      <div className="flex flex-col gap-2.5">
        {semester.subjects.map((sub) => (
          <motion.div layout key={sub.id} className="bg-surface-variant-2 rounded-lg p-2.5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                value={sub.name}
                onChange={(e) => onUpdateSubject(sub.id, { name: e.target.value })}
                placeholder="Subject name"
                className="flex-1 min-w-0 bg-transparent font-medium text-sm text-on-surface outline-none placeholder:text-on-surface-tertiary"
              />
              <ConfirmIconButton onConfirm={() => onRemoveSubject(sub.id)} size={16} />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div>
                <label className="block text-[10px] font-medium text-on-surface-tertiary mb-0.5">Credits</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={sub.credits}
                  onChange={(e) => onUpdateSubject(sub.id, { credits: e.target.value })}
                  className="w-full bg-surface rounded-lg text-center font-medium text-sm text-on-surface outline-none py-2 border border-outline-variant"
                  aria-label="Credits"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-on-surface-tertiary mb-0.5">Internal</label>
                <input
                  type="number"
                  min="0"
                  value={sub.internal ?? ''}
                  onChange={(e) => onUpdateSubject(sub.id, { internal: e.target.value })}
                  placeholder="—"
                  className="w-full bg-surface rounded-lg text-center font-medium text-sm text-on-surface outline-none py-2 border border-outline-variant placeholder:text-on-surface-tertiary"
                  aria-label="Internal marks"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-on-surface-tertiary mb-0.5">External</label>
                <input
                  type="number"
                  min="0"
                  value={sub.external ?? ''}
                  onChange={(e) => onUpdateSubject(sub.id, { external: e.target.value })}
                  placeholder="—"
                  className="w-full bg-surface rounded-lg text-center font-medium text-sm text-on-surface outline-none py-2 border border-outline-variant placeholder:text-on-surface-tertiary"
                  aria-label="External marks"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-on-surface-tertiary mb-0.5">Grade</label>
                <select
                  value={sub.grade}
                  onChange={(e) => onUpdateSubject(sub.id, { grade: e.target.value })}
                  className="w-full rounded-lg text-center font-medium text-sm outline-none py-2 px-1 border-0"
                  style={{ color: gradeColor[sub.grade].on, background: gradeColor[sub.grade].container }}
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {(sub.internal || sub.external) && (
              <p className="text-[11px] font-medium text-on-surface-tertiary text-right">
                Total: {(Number(sub.internal) || 0) + (Number(sub.external) || 0)}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs font-medium text-on-surface-tertiary">{totalCredits} credit{totalCredits === 1 ? '' : 's'} total</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAddSubject}
          className="relative flex items-center gap-1 text-sm font-medium text-g-blue-dark bg-g-blue-container px-3 py-2.5 rounded-full min-h-11"
        >
          <Icon svg={ICONS.add} size={16} /> Subject
        </motion.button>
      </div>
    </Card>
  );
}
