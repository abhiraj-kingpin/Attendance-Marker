import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { marksToGrade, gpaToGrade } from '../lib/gpa';
import { useTheme } from '../lib/useTheme';
import Card from './Card';
import ConfirmIconButton from './ConfirmIconButton';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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

export default function SemesterCard({ semester, sgpa, totalCredits, onRename, onRemove, onAddSubject, onUpdateSubject, onRemoveSubject }) {
  const { colors } = useTheme();
  const overallGrade = gpaToGrade(sgpa);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(semester.name);

  function saveName() {
    onRename(nameDraft.trim() || semester.name);
    setEditingName(false);
  }

  function updateMarks(sub, patch) {
    const next = { ...patch };
    const internal = 'internal' in patch ? patch.internal : sub.internal;
    const external = 'external' in patch ? patch.external : sub.external;
    if (internal !== '' && internal != null && external !== '' && external != null) {
      const grade = marksToGrade((Number(internal) || 0) + (Number(external) || 0));
      if (grade) next.grade = grade;
    }
    onUpdateSubject(sub.id, next);
  }

  return (
    <Card className="p-4">
      <View className="flex-row items-center gap-2 mb-3">
        {editingName ? (
          <TextInput
            autoFocus
            value={nameDraft}
            onChangeText={setNameDraft}
            onSubmitEditing={saveName}
            onBlur={saveName}
            className="flex-1 text-lg font-medium text-on-surface border-b-2 border-g-blue"
          />
        ) : (
          <TouchableOpacity className="flex-row items-center gap-1.5 flex-1 min-h-11" onPress={() => setEditingName(true)}>
            <Text className="text-lg font-medium text-on-surface" numberOfLines={1}>{semester.name}</Text>
            <MaterialIcons name="edit" size={15} color={colors.onSurfaceTertiary} />
          </TouchableOpacity>
        )}
        <View className="flex-row items-center gap-1.5">
          <View className="items-end">
            <Text className="text-xl font-medium text-g-blue">{sgpa === null ? '—' : sgpa.toFixed(2)}</Text>
            <Text className="text-2xs font-medium text-on-surface-tertiary">SGPA</Text>
          </View>
          {overallGrade && (
            <View
              className="rounded-full px-2 py-1 items-center justify-center min-w-8"
              style={{ backgroundColor: gradeColor[overallGrade].container }}
            >
              <Text className="text-xs font-bold" style={{ color: gradeColor[overallGrade].on }}>
                {overallGrade}
              </Text>
            </View>
          )}
        </View>
        <ConfirmIconButton onConfirm={onRemove} />
      </View>

      <View className="gap-2.5">
        {semester.subjects.map((sub, i) => (
          <View key={sub.id} className="bg-surface-variant-2 rounded-lg p-2.5 gap-2">
            <View className="flex-row items-center gap-2">
              <View className="w-5 h-5 rounded-full bg-g-blue-container items-center justify-center">
                <Text className="text-2xs font-bold text-g-blue-dark">{i + 1}</Text>
              </View>
              <TextInput
                value={sub.name}
                onChangeText={(v) => onUpdateSubject(sub.id, { name: v })}
                placeholder="Subject name"
                className="flex-1 min-w-0 font-medium text-sm text-on-surface"
              />
              <ConfirmIconButton onConfirm={() => onRemoveSubject(sub.id)} size={16} />
            </View>
            <View className="flex-row gap-1.5">
              <View className="flex-1">
                <Text className="text-2xs font-medium text-on-surface-tertiary mb-0.5">Credits</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={String(sub.credits)}
                  onChangeText={(v) => onUpdateSubject(sub.id, { credits: v })}
                  className="bg-surface rounded-lg text-center font-medium text-sm text-on-surface py-2 border border-outline-variant"
                />
              </View>
              <View className="flex-1">
                <Text className="text-2xs font-medium text-on-surface-tertiary mb-0.5">Internal</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={sub.internal ?? ''}
                  onChangeText={(v) => updateMarks(sub, { internal: v })}
                  placeholder="—"
                  className="bg-surface rounded-lg text-center font-medium text-sm text-on-surface py-2 border border-outline-variant"
                />
              </View>
              <View className="flex-1">
                <Text className="text-2xs font-medium text-on-surface-tertiary mb-0.5">External</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={sub.external ?? ''}
                  onChangeText={(v) => updateMarks(sub, { external: v })}
                  placeholder="—"
                  className="bg-surface rounded-lg text-center font-medium text-sm text-on-surface py-2 border border-outline-variant"
                />
              </View>
            </View>
            {(sub.internal || sub.external) && (
              <Text className="text-2xs font-medium text-on-surface-tertiary text-right">
                Total: {(Number(sub.internal) || 0) + (Number(sub.external) || 0)}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-xs font-medium text-on-surface-tertiary">
          {totalCredits} credit{totalCredits === 1 ? '' : 's'} total
        </Text>
        <TouchableOpacity
          onPress={onAddSubject}
          className="flex-row items-center gap-1 bg-g-blue-container px-3 py-2.5 rounded-full min-h-11"
        >
          <MaterialIcons name="add" size={16} color={colors.gBlueDark} />
          <Text className="text-sm font-medium text-g-blue-dark">Subject</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
