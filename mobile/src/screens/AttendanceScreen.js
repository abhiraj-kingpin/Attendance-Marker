import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '../store/useStore';
import { computeAllSubjectStats, computeOverallStats } from '../lib/attendance';
import { useTheme } from '../lib/useTheme';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LinearProgress from '../components/LinearProgress';
import SubjectAttendanceCard from '../components/SubjectAttendanceCard';
import LeavePlanner from '../components/LeavePlanner';

const TARGET_PRESETS = [60, 65, 70, 75, 80, 90];

export default function AttendanceScreen() {
  const { colors } = useTheme();
  const [plannerOpen, setPlannerOpen] = useState(false);
  const timetable = useStore((s) => s.timetable);
  const subjects = useStore((s) => s.subjects);
  const attendance = useStore((s) => s.attendance);
  const excludedRanges = useStore((s) => s.excludedRanges);
  const attendanceTarget = useStore((s) => s.settings.attendanceTarget);
  const setAttendanceTarget = useStore((s) => s.setAttendanceTarget);

  const target = attendanceTarget / 100;
  const statsById = computeAllSubjectStats(subjects, attendance, excludedRanges, target);
  const overall = computeOverallStats(statsById, target);

  const sorted = [...subjects].sort((a, b) => {
    const pa = statsById[a.id].percentage;
    const pb = statsById[b.id].percentage;
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return pa - pb;
  });

  const overallSafe = overall.status === 'safe';
  const overallColor = overall.held === 0 ? colors.onSurfaceTertiary : overallSafe ? colors.gGreen : colors.gRed;

  return (
    <View className="flex-1 bg-surface-variant">
      <AppHeader title="Attendance" subtitle={`Your ${attendanceTarget}% goal, tracked live`} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
        <Card className="p-4 mb-4">
          <Text className="text-sm font-medium text-on-surface-secondary mb-2">Attendance goal</Text>
          <View className="flex-row flex-wrap items-center gap-1.5">
            {TARGET_PRESETS.map((p) => {
              const active = attendanceTarget === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setAttendanceTarget(p)}
                  className="px-3 py-2 rounded-full border min-h-11 items-center justify-center"
                  style={{
                    backgroundColor: active ? colors.gBlueContainer : colors.surface,
                    borderColor: active ? colors.gBlue : colors.outlineVariant,
                  }}
                >
                  <Text className="text-sm font-medium" style={{ color: active ? colors.gBlueDark : colors.onSurfaceTertiary }}>
                    {p}%
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TextInput
              value={String(attendanceTarget)}
              onChangeText={(v) => setAttendanceTarget(v)}
              keyboardType="number-pad"
              className="w-16 min-h-11 rounded-full border border-outline-variant text-center text-sm font-medium text-on-surface"
            />
          </View>
        </Card>

        {subjects.length === 0 ? (
          <EmptyState
            icon="insights"
            title="Nothing to show yet"
            subtitle="Add subjects and start marking attendance on the Today tab."
          />
        ) : (
          <>
            <Card className="p-5 mb-4">
              <Text className="text-sm font-medium text-on-surface-secondary">Overall attendance</Text>
              <Text className="text-4xl font-medium mt-1" style={{ color: overallColor }}>
                {overall.percentage === null ? '—' : `${overall.percentage.toFixed(1)}%`}
              </Text>
              <View className="mt-3">
                <LinearProgress value={overall.percentage ?? 0} color={overallColor} height={10} />
              </View>
              <Text className="text-xs font-medium text-on-surface-tertiary mt-2">
                {overall.attended} attended · {overall.missed} missed · {overall.held} classes held
              </Text>
              {overall.held > 0 && (
                <View
                  className="mt-3 flex-row items-center gap-2 rounded-lg px-3 py-2.5"
                  style={{ backgroundColor: overallSafe ? colors.gGreenContainer : colors.gRedContainer }}
                >
                  <MaterialIcons
                    name={overallSafe ? 'verified' : 'trending-down'}
                    size={18}
                    color={overallColor}
                  />
                  <Text className="flex-1 text-sm font-medium" style={{ color: overallColor }}>
                    {overallSafe
                      ? overall.canMiss > 0
                        ? `Safe — ${overall.canMiss} class${overall.canMiss === 1 ? '' : 'es'} of slack overall`
                        : 'Right on the edge overall'
                      : `Attend next ${overall.mustAttend} in a row to reach ${attendanceTarget}% overall`}
                  </Text>
                </View>
              )}
            </Card>

            <TouchableOpacity
              onPress={() => setPlannerOpen(true)}
              className="flex-row items-center gap-3 rounded-xl border border-outline-variant px-4 py-3.5 mb-4"
            >
              <View className="w-9 h-9 rounded-full items-center justify-center bg-g-blue-container">
                <MaterialIcons name="event-busy" size={18} color={colors.gBlueDark} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-on-surface">Planning to take leave or bunk?</Text>
                <Text className="text-xs text-on-surface-tertiary">See what you'd need to attend after, before you skip anything</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceTertiary} />
            </TouchableOpacity>

            <View className="gap-3">
              {sorted.map((subject) => (
                <SubjectAttendanceCard key={subject.id} subject={subject} stats={statsById[subject.id]} target={attendanceTarget} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <LeavePlanner
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        subjects={subjects}
        statsById={statsById}
        timetable={timetable}
        excludedRanges={excludedRanges}
        target={target}
      />
    </View>
  );
}
