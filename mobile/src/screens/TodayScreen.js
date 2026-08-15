import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '../store/useStore';
import { attendanceKey, rankUpcomingClasses } from '../lib/attendance';
import { todayISO, addDaysISO, isTodayISO, dayKeyFromISO, formatFriendly, isDateExcluded } from '../lib/dates';
import AppHeader from '../components/AppHeader';
import ClassCard from '../components/ClassCard';
import EmptyState from '../components/EmptyState';
import CalendarSheet from '../components/CalendarSheet';
import CompensationSheet from '../components/CompensationSheet';
import { useTheme } from '../lib/useTheme';

function DayNavButton({ icon, onPress, label, color }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-11 h-11 items-center justify-center rounded-full"
    >
      <MaterialIcons name={icon} size={22} color={color} />
    </TouchableOpacity>
  );
}

export default function TodayScreen() {
  const { colors } = useTheme();
  const [date, setDate] = useState(todayISO());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [compensation, setCompensation] = useState({ open: false, ranked: [] });

  const subjects = useStore((s) => s.subjects);
  const timetable = useStore((s) => s.timetable);
  const attendance = useStore((s) => s.attendance);
  const excludedRanges = useStore((s) => s.excludedRanges);
  const attendanceTarget = useStore((s) => s.settings.attendanceTarget);
  const setAttendanceStatus = useStore((s) => s.setAttendanceStatus);

  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const dayKey = dayKeyFromISO(date);
  const periods = timetable[dayKey] || [];
  const excluded = isDateExcluded(date, excludedRanges);

  function handleSetStatus(period, status) {
    const key = attendanceKey(date, period.id);
    const existing = attendance[key];
    const willBecomeAbsent = status === 'absent' && existing?.status !== 'absent';

    setAttendanceStatus(date, period.id, period.subjectId, status);

    if (willBecomeAbsent && isTodayISO(date)) {
      const fresh = useStore.getState();
      const ranked = rankUpcomingClasses({
        subjects,
        timetable,
        attendance: fresh.attendance,
        excludedRanges,
        target: attendanceTarget / 100,
        fromDate: date,
        excludePeriodId: period.id,
      });
      setCompensation({ open: true, ranked });
    }
  }

  return (
    <View className="flex-1 bg-surface-variant">
      <AppHeader
        title={isTodayISO(date) ? 'Today' : dayKey}
        subtitle={formatFriendly(date)}
        right={
          <View className="flex-row gap-1">
            <DayNavButton icon="calendar-today" label="Open calendar" onPress={() => setCalendarOpen(true)} color={colors.onSurfaceTertiary} />
            <DayNavButton icon="chevron-left" label="Previous day" onPress={() => setDate((d) => addDaysISO(d, -1))} color={colors.onSurfaceTertiary} />
            <DayNavButton icon="chevron-right" label="Next day" onPress={() => setDate((d) => addDaysISO(d, 1))} color={colors.onSurfaceTertiary} />
          </View>
        }
      />

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {!isTodayISO(date) && (
          <TouchableOpacity onPress={() => setDate(todayISO())} className="mb-3">
            <Text className="text-sm font-medium text-g-blue">Jump back to today</Text>
          </TouchableOpacity>
        )}

        {excluded && (
          <View className="flex-row items-center gap-2.5 bg-g-green-container rounded-xl px-4 py-3 mb-4">
            <MaterialIcons name="event-busy" size={20} color={colors.gGreenDark} />
            <Text className="flex-1 text-g-green-dark font-medium text-sm">
              Excluded day — {excluded.label}. Nothing counts today.
            </Text>
          </View>
        )}

        {periods.length === 0 ? (
          <EmptyState
            icon="event-busy"
            title="No classes scheduled"
            subtitle={`Nothing on your ${dayKey} timetable. Add periods from the Setup tab.`}
          />
        ) : (
          <View className="gap-3">
            {periods.map((period, idx) => {
              const key = attendanceKey(date, period.id);
              const record = attendance[key];
              return (
                <ClassCard
                  key={period.id}
                  index={idx}
                  subject={subjectById[period.subjectId]}
                  status={record?.status || null}
                  disabled={!!excluded}
                  onSetStatus={(status) => handleSetStatus(period, status)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <CalendarSheet
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={date}
        onSelectDate={setDate}
      />

      <CompensationSheet
        open={compensation.open}
        onClose={() => setCompensation((c) => ({ ...c, open: false }))}
        ranked={compensation.ranked}
      />
    </View>
  );
}
