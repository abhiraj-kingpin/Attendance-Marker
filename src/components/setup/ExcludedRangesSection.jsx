import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tent } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { formatShort, todayISO } from '../../lib/dates';
import Card from '../common/Card';
import BottomSheet from '../common/BottomSheet';
import EmptyState from '../common/EmptyState';
import ConfirmIconButton from '../common/ConfirmIconButton';

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
      <p className="text-sm text-ink-400 font-semibold mb-3">
        Days inside these ranges (camps, leave, holidays) are skipped entirely — no classes counted for or against you.
      </p>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-ink-300">{ranges.length} range{ranges.length === 1 ? '' : 's'}</p>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-gradient-to-br from-nova-500 to-comet-500 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-glow-nova min-h-11"
        >
          <Plus size={16} /> Add range
        </motion.button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Tent} title="No excluded dates" subtitle="Add camps, leave, or holiday ranges here." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((range, i) => (
            <motion.div key={range.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="flex items-center gap-3 p-3.5">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-aurora-500/15 grid place-items-center">
                  <Tent size={18} className="text-aurora-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-50 truncate">{range.label}</p>
                  <p className="text-xs text-ink-400 font-semibold">
                    {formatShort(range.start)} – {formatShort(range.end)}
                  </p>
                </div>
                <ConfirmIconButton onConfirm={() => { removeExcludedRange(range.id); toast('Range removed'); }} />
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add excluded range">
        <label className="text-sm font-bold text-ink-300">Label</label>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. NCC / Camp"
          className="mt-1.5 mb-3 w-full rounded-2xl border border-white/15 bg-white/5 focus:border-nova-400 outline-none px-4 py-3 font-semibold text-ink-50 placeholder:text-ink-500"
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-bold text-ink-300">Start date</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/5 focus:border-nova-400 outline-none px-3 py-3 font-semibold text-ink-50"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-bold text-ink-300">End date</label>
            <input
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/5 focus:border-nova-400 outline-none px-3 py-3 font-semibold text-ink-50"
            />
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          disabled={!label.trim() || end < start}
          className="mt-4 w-full bg-gradient-to-br from-nova-500 to-comet-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-glow-nova"
        >
          Add range
        </motion.button>
      </BottomSheet>
    </div>
  );
}
