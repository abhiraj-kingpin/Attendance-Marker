import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '../store/useStore';
import { computeCGPA, cgpaToPercentage, gpaToGrade } from '../lib/gpa';
import { useTheme } from '../lib/useTheme';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Fab from '../components/Fab';
import SemesterCard from '../components/SemesterCard';
import CgpaPortalModal from '../components/CgpaPortalModal';

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

export default function GpaScreen() {
  const { colors } = useTheme();
  const gpa = useStore((s) => s.gpa);
  const setAdmissionPeriod = useStore((s) => s.setAdmissionPeriod);
  const addSemester = useStore((s) => s.addSemester);
  const renameSemester = useStore((s) => s.renameSemester);
  const removeSemester = useStore((s) => s.removeSemester);
  const addSemesterSubject = useStore((s) => s.addSemesterSubject);
  const updateSemesterSubject = useStore((s) => s.updateSemesterSubject);
  const removeSemesterSubject = useStore((s) => s.removeSemesterSubject);
  const cgpaSnapshot = useStore((s) => s.cgpaSnapshot);
  const setCgpaSnapshot = useStore((s) => s.setCgpaSnapshot);
  const [portalOpen, setPortalOpen] = useState(false);

  const { cgpa, perSemester } = computeCGPA(gpa.semesters);
  const sgpaBySemId = Object.fromEntries(perSemester.map((p) => [p.id, p]));
  const percentage = cgpaToPercentage(cgpa, gpa.admissionPeriod);
  const overallGrade = gpaToGrade(cgpa);

  return (
    <View className="flex-1 bg-surface-variant">
      <AppHeader title="GPA" subtitle="GGSIPU Ordinance 11 grading" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="p-5 mb-4">
          <Text className="text-sm font-medium text-on-surface-secondary">Running CGPA</Text>
          <View className="flex-row items-end gap-2 mt-1">
            <Text className="text-4xl font-medium text-on-surface">{cgpa === null ? '—' : cgpa.toFixed(2)}</Text>
            {overallGrade && (
              <View
                className="rounded-full px-3 py-1 items-center justify-center mb-1.5"
                style={{ backgroundColor: gradeColor[overallGrade].container }}
              >
                <Text className="text-sm font-bold" style={{ color: gradeColor[overallGrade].on }}>
                  {overallGrade}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm font-medium text-g-blue mt-1">
            {percentage === null ? 'Set your admission year to see %' : `≈ ${percentage.toFixed(2)}% equivalent`}
          </Text>
        </Card>

        <TouchableOpacity
          onPress={() => setPortalOpen(true)}
          className="flex-row items-center justify-center gap-2 rounded-lg border border-outline-variant py-3 mb-4"
        >
          <MaterialIcons name="sync" size={16} color={colors.gBlue} />
          <Text className="text-sm font-medium text-g-blue">
            {cgpaSnapshot ? 'Re-check against GGSIPU portal' : 'Cross-check with GGSIPU portal'}
          </Text>
        </TouchableOpacity>
        {cgpaSnapshot && (
          <Text className="text-2xs text-on-surface-tertiary -mt-3 mb-4">
            Last checked {new Date(cgpaSnapshot.fetchedAt).toLocaleString()}
          </Text>
        )}

        <Card className="p-4 mb-4">
          <Text className="text-sm font-medium text-on-surface-secondary mb-2">When were you admitted?</Text>
          <View className="flex-row gap-2">
            {[
              { value: 'before2024', label: 'Before 2024', hint: 'CGPA × 10' },
              { value: '2024plus', label: '2024 or later', hint: '(CGPA − 0.75) × 10' },
            ].map((opt) => {
              const active = gpa.admissionPeriod === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setAdmissionPeriod(opt.value)}
                  className="flex-1 rounded-lg px-3 py-2.5 border min-h-11"
                  style={{ backgroundColor: active ? colors.gBlueContainer : colors.surface, borderColor: active ? colors.gBlue : colors.outlineVariant }}
                >
                  <Text className="font-medium text-sm" style={{ color: active ? colors.gBlueDark : colors.onSurfaceTertiary }}>{opt.label}</Text>
                  <Text className="text-2xs font-medium" style={{ color: active ? colors.gBlueDark : colors.onSurfaceTertiary, opacity: 0.8 }}>{opt.hint}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {gpa.semesters.length === 0 ? (
          <EmptyState
            icon="grading"
            title="No semesters yet"
            subtitle="Add a semester, then add subjects with credits and grades to calculate your SGPA."
          />
        ) : (
          <View className="gap-3">
            {gpa.semesters.map((sem) => (
              <SemesterCard
                key={sem.id}
                semester={sem}
                sgpa={sgpaBySemId[sem.id]?.sgpa ?? null}
                totalCredits={sgpaBySemId[sem.id]?.totalCredits ?? 0}
                onRename={(name) => renameSemester(sem.id, name)}
                onRemove={() => removeSemester(sem.id)}
                onAddSubject={() => addSemesterSubject(sem.id, { name: '', credits: 4, grade: 'O', internal: '', external: '' })}
                onUpdateSubject={(subId, patch) => updateSemesterSubject(sem.id, subId, patch)}
                onRemoveSubject={(subId) => removeSemesterSubject(sem.id, subId)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Fab icon="add" label="Add semester" onPress={() => addSemester()} />

      <CgpaPortalModal open={portalOpen} onClose={() => setPortalOpen(false)} onSave={setCgpaSnapshot} />
    </View>
  );
}
