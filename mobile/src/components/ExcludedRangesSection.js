import { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '../store/useStore';
import { formatShort, todayISO } from '../lib/dates';
import Card from './Card';
import BottomSheet from './BottomSheet';
import EmptyState from './EmptyState';
import ConfirmIconButton from './ConfirmIconButton';

const ExcludedRangesSection = forwardRef(function ExcludedRangesSection(_props, ref) {
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

  useImperativeHandle(ref, () => ({ openAdd }));

  function handleSave() {
    if (!label.trim() || !start || !end || end < start) return;
    addExcludedRange({ label: label.trim(), start, end });
    setSheetOpen(false);
  }

  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <View className="flex-1">
      <Text className="text-sm text-on-surface-tertiary font-medium mb-3">
        Days inside these ranges (camps, leave, holidays) are skipped entirely — no classes counted for or against you.
      </Text>
      <Text className="text-sm font-medium text-on-surface-secondary mb-3">
        {ranges.length} range{ranges.length === 1 ? '' : 's'}
      </Text>

      {sorted.length === 0 ? (
        <EmptyState icon="event-busy" title="No excluded dates" subtitle="Add camps, leave, or holiday ranges here." />
      ) : (
        <View className="gap-2.5">
          {sorted.map((range) => (
            <Card key={range.id} className="flex-row items-center gap-3 p-3.5">
              <View className="w-10 h-10 rounded-full items-center justify-center bg-g-green-container">
                <MaterialIcons name="event-busy" size={18} color="#1E7E34" />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-medium text-on-surface" numberOfLines={1}>{range.label}</Text>
                <Text className="text-xs text-on-surface-tertiary">{formatShort(range.start)} – {formatShort(range.end)}</Text>
              </View>
              <ConfirmIconButton onConfirm={() => removeExcludedRange(range.id)} />
            </Card>
          ))}
        </View>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add excluded range">
        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Label</Text>
        <TextInput
          autoFocus
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Medical leave, holidays"
          className="mb-3 rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />
        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Start date (YYYY-MM-DD)</Text>
        <TextInput
          value={start}
          onChangeText={setStart}
          className="mb-3 rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />
        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">End date (YYYY-MM-DD)</Text>
        <TextInput
          value={end}
          onChangeText={setEnd}
          className="mb-3 rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />
        <TouchableOpacity
          onPress={handleSave}
          disabled={!label.trim() || end < start}
          className="mt-1 bg-g-blue rounded-full py-3.5 items-center"
          style={{ opacity: !label.trim() || end < start ? 0.4 : 1 }}
        >
          <Text className="text-white font-medium">Add range</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
});

export default ExcludedRangesSection;
