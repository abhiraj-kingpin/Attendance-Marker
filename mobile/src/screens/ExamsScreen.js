import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '../store/useStore';
import { msUntil, isPastExam, todayISO } from '../lib/dates';
import { useTicker } from '../lib/useTicker';
import { useTheme } from '../lib/useTheme';
import AppHeader from '../components/AppHeader';
import BottomSheet from '../components/BottomSheet';
import EmptyState from '../components/EmptyState';
import Fab from '../components/Fab';
import ExamCard from '../components/ExamCard';

const PRESETS = ['Mid-Sem', 'End-Sem', 'Practical', 'Viva', 'Quiz'];

export default function ExamsScreen() {
  const { colors } = useTheme();
  useTicker(30000);
  const exams = useStore((s) => s.exams);
  const subjects = useStore((s) => s.subjects);
  const addExam = useStore((s) => s.addExam);
  const removeExam = useStore((s) => s.removeExam);
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const [sheetOpen, setSheetOpen] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('');

  function openAdd() {
    setName('');
    setDate(todayISO());
    setTime('');
    setSheetOpen(true);
  }

  function handleSave() {
    if (!name.trim() || !date) return;
    addExam({ subjectId: null, name: name.trim(), date, time: time || null });
    setSheetOpen(false);
  }

  const upcoming = exams
    .filter((e) => !isPastExam(e.date, e.time))
    .sort((a, b) => msUntil(a.date, a.time) - msUntil(b.date, b.time));
  const past = exams
    .filter((e) => isPastExam(e.date, e.time))
    .sort((a, b) => msUntil(b.date, b.time) - msUntil(a.date, a.time));

  return (
    <View className="flex-1 bg-surface-variant">
      <AppHeader title="Exams" subtitle="Countdown to what's next" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        {exams.length === 0 ? (
          <EmptyState icon="timer" title="No exams yet" subtitle="Add an exam to start the countdown." />
        ) : (
          <>
            {upcoming.length === 0 ? (
              <EmptyState icon="timer" title="No upcoming exams" subtitle="All caught up — nice." />
            ) : (
              <View className="gap-2.5">
                {upcoming.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} subject={subjectById[exam.subjectId]} onRemove={() => removeExam(exam.id)} />
                ))}
              </View>
            )}

            {past.length > 0 && (
              <View className="mt-5">
                <TouchableOpacity onPress={() => setPastOpen((o) => !o)} className="flex-row items-center gap-1.5 mb-2 min-h-11">
                  <MaterialIcons name={pastOpen ? 'expand-less' : 'expand-more'} size={18} color={colors.onSurfaceTertiary} />
                  <Text className="text-sm font-medium text-on-surface-tertiary">Past exams ({past.length})</Text>
                </TouchableOpacity>
                {pastOpen && (
                  <View className="gap-2.5">
                    {past.map((exam) => (
                      <ExamCard key={exam.id} exam={exam} subject={subjectById[exam.subjectId]} onRemove={() => removeExam(exam.id)} past />
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Fab icon="add" label="Add exam" onPress={openAdd} />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add exam">
        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Exam name / type</Text>
        <View className="flex-row gap-1.5 flex-wrap mb-2">
          {PRESETS.map((p) => {
            const active = name === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setName(p)}
                className="px-3 py-2 rounded-full border min-h-11 items-center justify-center"
                style={{ backgroundColor: active ? colors.gBlueContainer : colors.surface, borderColor: active ? colors.gBlue : colors.outlineVariant }}
              >
                <Text className="text-xs font-medium" style={{ color: active ? colors.gBlueDark : colors.onSurfaceTertiary }}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mid-Sem"
          className="mb-3 rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />
        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2026-08-20"
          className="mb-3 rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />
        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Time (optional, HH:MM)</Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="14:00"
          className="mb-3 rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={!name.trim() || !date}
          className="mt-1 bg-g-blue rounded-full py-3.5 items-center"
          style={{ opacity: !name.trim() || !date ? 0.4 : 1 }}
        >
          <Text className="text-white font-medium">Add exam</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}
