import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { formatShort, todayISO } from '../../lib/dates';
import { ICONS } from '../../lib/icons';
import Card from '../common/Card';
import BottomSheet from '../common/BottomSheet';
import EmptyState from '../common/EmptyState';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Icon from '../common/Icon';
import Fab from '../common/Fab';

export default function ExcludedRangesSection() {
  const ranges = useStore((s) => s.excludedRanges);
  const addExcludedRange = useStore((s) => s.addExcludedRange);
  const removeExcludedRange = useStore((s) => s.removeExcludedRange);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState(todayISO());

  function openAdd() {
    setLabel('');
    setStart(todayISO());
    setEnd(todayISO());
    setSheetOpen(true);
  }

  function handleSave() {
    if (!label.trim() || !start || !end || end < start) return;
    addExcludedRange({ label: label.trim(), start, end });
    toast.success('Excluded range added');
    setSheetOpen(false);
  }

  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div>
      <p className="text-sm text-on-surface-tertiary font-medium mb-3">
        Days inside these ranges (camps, leave, holidays) are skipped entirely — no classes counted for or against you.
      </p>
      <p className="text-sm font-medium text-on-surface-secondary mb-3">{ranges.length} range{ranges.length === 1 ? '' : 's'}</p>

      {sorted.length === 0 ? (
        <EmptyState icon={ICONS.eventBusy} title="No excluded dates" subtitle="Add camps, leave, or holiday ranges here." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((range) => (
            <Card key={range.id} className="flex items-center gap-3 p-3.5">
              <span className="w-10 h-10 shrink-0 rounded-full bg-g-green-container grid place-items-center">
                <Icon svg={ICONS.eventBusy} size={18} className="text-g-green-dark" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface truncate">{range.label}</p>
                <p className="text-xs text-on-surface-tertiary">
                  {formatShort(range.start)} – {formatShort(range.end)}
                </p>
              </div>
              <ConfirmIconButton onConfirm={() => { removeExcludedRange(range.id); toast('Range removed'); }} />
            </Card>
          ))}
        </div>
      )}

      <Fab icon={ICONS.add} label="Add range" onClick={openAdd} />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add excluded range">
        <label className="text-sm font-medium text-on-surface-secondary">Label</label>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. NCC / Camp"
          className="mt-1.5 mb-3 w-full rounded-lg border border-outline-variant bg-surface focus:border-g-blue outline-none px-4 py-3 font-medium text-on-surface placeholder:text-on-surface-tertiary"
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-on-surface-secondary">Start date</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface focus:border-g-blue outline-none px-3 py-3 font-medium text-on-surface"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-on-surface-secondary">End date</label>
            <input
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface focus:border-g-blue outline-none px-3 py-3 font-medium text-on-surface"
            />
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!label.trim() || end < start}
          className="mt-4 w-full bg-g-blue disabled:opacity-40 text-white font-medium py-3.5 rounded-full"
        >
          Add range
        </motion.button>
      </BottomSheet>
    </div>
  );
}
