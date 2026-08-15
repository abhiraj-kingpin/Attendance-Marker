import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet from './BottomSheet';
import Avatar from './Avatar';
import { colorForSubject } from '../lib/colors';
import { simulateAdditionalMisses } from '../lib/attendance';
import { useTheme } from '../lib/useTheme';
import { todayISO, addDaysISO, dayKeyFromISO, isDateExcluded, formatShort } from '../lib/dates';

const MODES = [
  { value: 'subject', label: 'One subject' },
  { value: 'range', label: 'Leave dates' },
];

function ResultRow({ subject, after, count, colors }) {
  const color = colorForSubject(subject);
  const willBeRisk = after.status === 'risk';
  return (
    <View className="flex-row items-center gap-3 p-3 rounded-lg bg-surface-variant-2">
      <Avatar color={color} size={36} label={subject.name.charAt(0).toUpperCase()} />
      <View className="flex-1 min-w-0">
        <Text className="font-medium text-on-surface" numberOfLines={1}>{subject.name}</Text>
        <Text className="text-xs font-medium" style={{ color: willBeRisk ? colors.gRed : colors.gGreen }}>
          {willBeRisk
            ? `Attend the next ${after.mustAttend} in a row to recover`
            : after.canMiss > 0
              ? `Still safe — ${after.canMiss} to spare after`
              : 'Right on the edge after'}
        </Text>
      </View>
      {count != null && (
        <Text className="text-xs font-medium text-on-surface-tertiary mr-1">{count} class{count === 1 ? '' : 'es'}</Text>
      )}
      <Text className="text-sm font-medium text-on-surface-tertiary">
        {after.percentage === null ? '—' : `${after.percentage.toFixed(0)}%`}
      </Text>
    </View>
  );
}

export default function LeavePlanner({ open, onClose, subjects, statsById, timetable, excludedRanges, target }) {
  const { colors } = useTheme();
  const [mode, setMode] = useState('subject');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? null);
  const [count, setCount] = useState(1);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());

  const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0];

  const singleResult = useMemo(() => {
    if (!subject) return null;
    const before = statsById[subject.id];
    if (!before) return null;
    return { subject, after: simulateAdditionalMisses(before, count, target) };
  }, [subject, count, statsById, target]);

  const rangeResults = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return { rows: [], dayCount: 0 };
    const tally = {};
    let dayCount = 0;
    let cursor = startDate;
    let guard = 0;
    while (cursor <= endDate && guard < 366) {
      guard += 1;
      if (!isDateExcluded(cursor, excludedRanges)) {
        dayCount += 1;
        const periods = timetable[dayKeyFromISO(cursor)] || [];
        for (const period of periods) {
          tally[period.subjectId] = (tally[period.subjectId] || 0) + 1;
        }
      }
      if (cursor === endDate) break;
      cursor = addDaysISO(cursor, 1);
    }
    const rows = Object.entries(tally)
      .map(([subjectId, skipCount]) => {
        const s = subjects.find((x) => x.id === subjectId);
        const before = s && statsById[s.id];
        if (!s || !before) return null;
        return { subject: s, count: skipCount, after: simulateAdditionalMisses(before, skipCount, target) };
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count);
    return { rows, dayCount };
  }, [startDate, endDate, timetable, excludedRanges, subjects, statsById, target]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Plan a leave">
      <Text className="text-sm text-on-surface-tertiary mb-3">
        Thinking about taking leave or bunking? See what you'd need to attend afterward to stay on target — this is just a
        preview, nothing is saved until you actually mark attendance.
      </Text>

      <View className="flex-row bg-surface-variant-2 rounded-full p-1 mb-4">
        {MODES.map((m) => {
          const active = m.value === mode;
          return (
            <TouchableOpacity
              key={m.value}
              onPress={() => setMode(m.value)}
              className="flex-1 items-center py-2.5 rounded-full"
              style={{ backgroundColor: active ? colors.gBlue : 'transparent' }}
            >
              <Text className="text-sm font-medium" style={{ color: active ? '#FFFFFF' : colors.onSurfaceSecondary }}>{m.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mode === 'subject' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 8 }}>
            {subjects.map((s) => {
              const active = s.id === subject?.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSubjectId(s.id)}
                  className="px-4 py-2.5 rounded-full border min-h-11 items-center justify-center"
                  style={{ backgroundColor: active ? colors.gBlue : colors.surface, borderColor: active ? colors.gBlue : colors.outlineVariant }}
                >
                  <Text className="text-sm font-medium" numberOfLines={1} style={{ color: active ? '#FFFFFF' : colors.onSurfaceTertiary, maxWidth: 160 }}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-medium text-on-surface-secondary">Classes to skip</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setCount((c) => Math.max(1, c - 1))}
                className="w-9 h-9 rounded-full items-center justify-center bg-surface-variant-2"
              >
                <MaterialIcons name="remove" size={18} color={colors.onSurfaceSecondary} />
              </TouchableOpacity>
              <Text className="text-base font-semibold text-on-surface" style={{ width: 24, textAlign: 'center' }}>{count}</Text>
              <TouchableOpacity
                onPress={() => setCount((c) => Math.min(30, c + 1))}
                className="w-9 h-9 rounded-full items-center justify-center bg-surface-variant-2"
              >
                <MaterialIcons name="add" size={18} color={colors.onSurfaceSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {singleResult ? (
            <ResultRow subject={singleResult.subject} after={singleResult.after} colors={colors} />
          ) : (
            <Text className="text-sm text-on-surface-tertiary">Add a subject first.</Text>
          )}
        </>
      ) : (
        <>
          <View className="flex-row gap-3 mb-1">
            <View className="flex-1">
              <Text className="text-xs font-medium text-on-surface-secondary mb-1.5">From</Text>
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                className="rounded-lg border border-outline-variant px-3 py-2.5 text-sm font-medium text-on-surface"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-on-surface-secondary mb-1.5">To</Text>
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                className="rounded-lg border border-outline-variant px-3 py-2.5 text-sm font-medium text-on-surface"
              />
            </View>
          </View>

          {endDate < startDate ? (
            <Text className="text-xs font-medium mb-3" style={{ color: colors.gRed }}>End date is before the start date.</Text>
          ) : (
            <Text className="text-xs text-on-surface-tertiary mb-3">
              {formatShort(startDate)} – {formatShort(endDate)} · {rangeResults.dayCount} day{rangeResults.dayCount === 1 ? '' : 's'} counted
            </Text>
          )}

          {rangeResults.rows.length === 0 ? (
            <Text className="text-sm text-on-surface-tertiary">Nothing scheduled in that range.</Text>
          ) : (
            <View className="gap-2">
              {rangeResults.rows.map((r) => (
                <ResultRow key={r.subject.id} subject={r.subject} after={r.after} count={r.count} colors={colors} />
              ))}
            </View>
          )}
        </>
      )}
    </BottomSheet>
  );
}
