import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  format,
} from 'date-fns';
import { useStore } from '../store/useStore';
import { dayStatus } from '../lib/attendance';
import { dayKeyFromISO, toISODate, todayISO } from '../lib/dates';
import { useTheme } from '../lib/useTheme';
import BottomSheet from './BottomSheet';

const STATUS_DOT = {
  present: '#34A853',
  absent: '#EA4335',
  mixed: '#FBBC04',
  excluded: '#9AA0A6',
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarSheet({ open, onClose, selectedDate, onSelectDate }) {
  const { colors } = useTheme();
  const [monthAnchor, setMonthAnchor] = useState(() => parseISO(selectedDate));
  const timetable = useStore((s) => s.timetable);
  const attendance = useStore((s) => s.attendance);
  const excludedRanges = useStore((s) => s.excludedRanges);

  const today = todayISO();
  const todayDate = useMemo(() => parseISO(today), [today]);
  const isOnCurrentMonth = isSameMonth(monthAnchor, todayDate);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthAnchor]);

  const dayStats = useMemo(() => {
    if (!open) return null;
    const map = {};
    for (const day of days) {
      const iso = toISODate(day);
      const periods = timetable[dayKeyFromISO(iso)] || [];
      map[iso] = dayStatus(iso, periods, attendance, excludedRanges);
    }
    return map;
  }, [open, days, timetable, attendance, excludedRanges]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Jump to a date">
      <View className="flex-row items-center justify-between mb-1">
        <TouchableOpacity
          onPress={() => setMonthAnchor((m) => subMonths(m, 1))}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-variant-2"
        >
          <MaterialIcons name="chevron-left" size={20} color={colors.onSurfaceSecondary} />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="font-semibold text-lg text-on-surface">{format(monthAnchor, 'MMMM yyyy')}</Text>
          {!isOnCurrentMonth && (
            <TouchableOpacity onPress={() => setMonthAnchor(todayDate)} className="mt-0.5">
              <Text className="text-xs font-medium text-g-blue">Jump to today</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setMonthAnchor((m) => addMonths(m, 1))}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-variant-2"
        >
          <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceSecondary} />
        </TouchableOpacity>
      </View>

      <View className="flex-row mt-3">
        {WEEKDAYS.map((d, i) => (
          <Text
            key={i}
            className="flex-1 text-center text-2xs font-semibold text-on-surface-tertiary py-1"
            style={{ letterSpacing: 0.5 }}
          >
            {d}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const iso = toISODate(day);
          const inMonth = isSameMonth(day, monthAnchor);
          const isSelected = isSameDay(day, parseISO(selectedDate));
          const isToday = iso === today;
          const status = dayStats?.[iso] ?? null;

          return (
            <TouchableOpacity
              key={iso}
              onPress={() => {
                onSelectDate(iso);
                onClose();
              }}
              activeOpacity={0.6}
              style={{ width: `${100 / 7}%`, aspectRatio: 1, opacity: inMonth ? 1 : 0.35 }}
              className="items-center justify-center"
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isSelected ? colors.gBlue : 'transparent',
                  borderWidth: isToday && !isSelected ? 1.5 : 0,
                  borderColor: colors.gBlue,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: isSelected ? '#FFFFFF' : isToday ? colors.gBlueDark : colors.onSurface,
                  }}
                >
                  {day.getDate()}
                </Text>
              </View>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  marginTop: 3,
                  backgroundColor: status ? STATUS_DOT[status] : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-4 pt-3.5 border-t border-outline-variant">
        {[
          ['present', 'All present'],
          ['absent', 'Had absence'],
          ['mixed', 'Mixed'],
          ['excluded', 'Excluded'],
        ].map(([key, label]) => (
          <View key={key} className="flex-row items-center gap-1.5">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: STATUS_DOT[key] }} />
            <Text className="text-2xs font-medium text-on-surface-tertiary">{label}</Text>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}
