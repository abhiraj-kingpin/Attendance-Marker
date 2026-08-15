import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format, parseISO } from 'date-fns';
import BottomSheet from './BottomSheet';
import Avatar from './Avatar';
import { colorForSubject } from '../lib/colors';
import { useTheme } from '../lib/useTheme';

function reasonFor(stats) {
  if (stats.status === 'risk') {
    return `At risk — needs ${stats.mustAttend} in a row to recover`;
  }
  if (stats.status === 'safe') {
    return stats.canMiss <= 1 ? 'Right on the edge — keep it up' : `Safe, but only ${stats.canMiss} to spare`;
  }
  return 'No attendance recorded yet';
}

export default function CompensationSheet({ open, onClose, ranked }) {
  const { colors } = useTheme();
  return (
    <BottomSheet open={open} onClose={onClose} title="Prioritize this week">
      <Text className="text-sm text-on-surface-tertiary mb-3">
        Since you're skipping this one, here's what to attend instead, ranked by how much each class helps your attendance.
      </Text>

      {ranked.length === 0 ? (
        <View className="items-center py-8 gap-2">
          <MaterialIcons name="event-available" size={28} color={colors.onSurfaceTertiary} />
          <Text className="text-sm text-on-surface-tertiary text-center">
            No other unmarked classes scheduled in the next week.
          </Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {ranked.slice(0, 8).map((item, i) => {
            const color = colorForSubject(item.subject);
            const urgent = item.stats.status === 'risk';
            return (
              <View
                key={`${item.date}-${item.period.id}`}
                className="flex-row items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: i === 0 ? colors.gBlueContainer : colors.surfaceVariant2 }}
              >
                <Avatar color={color} size={36} label={item.subject.name.charAt(0).toUpperCase()} />
                <View className="flex-1 min-w-0">
                  <Text className="font-medium text-on-surface" numberOfLines={1}>{item.subject.name}</Text>
                  <Text className="text-xs" style={{ color: urgent ? colors.gRed : colors.onSurfaceTertiary }} numberOfLines={1}>
                    {reasonFor(item.stats)}
                  </Text>
                </View>
                <Text className="text-xs font-medium text-on-surface-tertiary">
                  {format(parseISO(item.date), 'EEE d MMM')}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </BottomSheet>
  );
}
