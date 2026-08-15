import { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '../store/useStore';
import { colorForSubject } from '../lib/colors';
import { useTheme } from '../lib/useTheme';
import { DAYS, DAY_LABELS } from '../lib/dates';
import Card from './Card';
import BottomSheet from './BottomSheet';
import EmptyState from './EmptyState';
import ConfirmIconButton from './ConfirmIconButton';
import Avatar from './Avatar';
import ScanTimetableModal from './ScanTimetableModal';

const TimetableSection = forwardRef(function TimetableSection(_props, ref) {
  const { colors } = useTheme();
  const subjects = useStore((s) => s.subjects);
  const timetable = useStore((s) => s.timetable);
  const addPeriod = useStore((s) => s.addPeriod);
  const removePeriod = useStore((s) => s.removePeriod);
  const movePeriod = useStore((s) => s.movePeriod);

  const [day, setDay] = useState(DAYS[0]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openAdd: () => subjects.length > 0 && setSheetOpen(true),
  }));

  const periods = timetable[day] || [];
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => setScanOpen(true)}
        className="flex-row items-center justify-center gap-2 rounded-lg border border-outline-variant py-3 mb-4"
      >
        <MaterialIcons name="document-scanner" size={18} color={colors.gBlue} />
        <Text className="text-sm font-medium text-g-blue">Scan a timetable photo</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-1" contentContainerStyle={{ gap: 8 }}>
        {DAYS.map((d) => {
          const active = d === day;
          return (
            <TouchableOpacity
              key={d}
              onPress={() => setDay(d)}
              className="px-4 py-2.5 rounded-full border min-h-11 items-center justify-center"
              style={{ backgroundColor: active ? colors.gBlue : colors.surface, borderColor: active ? colors.gBlue : colors.outlineVariant }}
            >
              <Text className="text-sm font-medium" style={{ color: active ? '#FFFFFF' : colors.onSurfaceTertiary }}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text className="text-sm font-medium text-on-surface-secondary mt-4 mb-3">
        {DAY_LABELS[day]} · {periods.length} period{periods.length === 1 ? '' : 's'}
      </Text>

      {subjects.length === 0 ? (
        <EmptyState icon="event-busy" title="Add subjects first" subtitle="Head to the Subjects tab to add subjects, then build your timetable here." />
      ) : periods.length === 0 ? (
        <EmptyState icon="event-busy" title={`No classes on ${DAY_LABELS[day]}`} subtitle="Tap the add button to schedule a class for this day." />
      ) : (
        <View className="gap-2.5">
          {periods.map((period, idx) => {
            const subject = subjectById[period.subjectId];
            const color = colorForSubject(subject);
            return (
              <Card key={period.id} className="flex-row items-center gap-3 p-3.5">
                <Avatar color={color} size={36} label={String(idx + 1)} />
                <Text className="flex-1 font-medium text-on-surface">{subject ? subject.name : 'Unknown subject'}</Text>
                <View>
                  <TouchableOpacity disabled={idx === 0} onPress={() => movePeriod(day, period.id, -1)} className="p-2" style={{ opacity: idx === 0 ? 0.2 : 1 }}>
                    <MaterialIcons name="keyboard-arrow-up" size={18} color={colors.onSurfaceTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity disabled={idx === periods.length - 1} onPress={() => movePeriod(day, period.id, 1)} className="p-2" style={{ opacity: idx === periods.length - 1 ? 0.2 : 1 }}>
                    <MaterialIcons name="keyboard-arrow-down" size={18} color={colors.onSurfaceTertiary} />
                  </TouchableOpacity>
                </View>
                <ConfirmIconButton onConfirm={() => removePeriod(day, period.id)} />
              </Card>
            );
          })}
        </View>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={`Add period · ${day}`}>
        <Text className="text-sm font-medium text-on-surface-secondary mb-3">Pick a subject</Text>
        <View className="gap-2">
          {subjects.map((subject) => {
            const color = colorForSubject(subject);
            const isLab = subject.type === 'lab';
            return (
              <TouchableOpacity
                key={subject.id}
                onPress={() => {
                  addPeriod(day, subject.id);
                  setSheetOpen(false);
                }}
                className="flex-row items-center gap-3 rounded-lg px-3 py-3 min-h-11"
                style={{ backgroundColor: color.container }}
              >
                <Avatar color={{ container: color.solid, on: '#fff' }} size={28} label={subject.name.charAt(0).toUpperCase()} />
                <Text className="text-sm font-medium flex-1" style={{ color: color.on }}>{subject.name}</Text>
                <View className="rounded-full px-2 py-1" style={{ backgroundColor: color.solid }}>
                  <Text className="text-2xs font-bold" style={{ color: '#FFFFFF' }}>{isLab ? 'LAB' : 'THEORY'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>

      <ScanTimetableModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </View>
  );
});

export default TimetableSection;
