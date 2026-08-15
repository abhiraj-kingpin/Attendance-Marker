import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Card from './Card';
import Avatar from './Avatar';
import LinearProgress from './LinearProgress';
import { colorForSubject } from '../lib/colors';
import { useTheme } from '../lib/useTheme';

export default function SubjectAttendanceCard({ subject, stats, target = 75 }) {
  const { colors } = useTheme();
  const color = colorForSubject(subject);
  const { held, attended, missed, percentage, status, canMiss, mustAttend } = stats;

  const safe = status === 'safe';
  const barColor = held === 0 ? colors.outline : safe ? colors.gGreen : colors.gRed;

  return (
    <Card className="p-4">
      <View className="flex-row items-center gap-3 mb-3">
        <Avatar color={color} size={40} label={subject.name.charAt(0).toUpperCase()} />
        <View className="flex-1 min-w-0">
          <Text className="font-medium text-on-surface">{subject.name}</Text>
          <Text className="text-xs text-on-surface-tertiary">
            {attended} attended · {missed} missed · {held} held
          </Text>
        </View>
        <Text className="text-2xl font-medium" style={{ color: barColor }}>
          {percentage === null ? '—' : `${percentage.toFixed(1)}%`}
        </Text>
      </View>

      <LinearProgress value={percentage ?? 0} color={barColor} />

      {held > 0 && (
        <View
          className="mt-3 flex-row items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ backgroundColor: safe ? colors.gGreenContainer : colors.gRedContainer }}
        >
          <MaterialIcons name={safe ? 'verified' : 'trending-down'} size={18} color={safe ? colors.gGreenDark : colors.gRedDark} />
          <Text className="flex-1 text-sm font-medium" style={{ color: safe ? colors.gGreenDark : colors.gRedDark }}>
            {safe
              ? canMiss > 0
                ? `Safe — you can miss ${canMiss} more class${canMiss === 1 ? '' : 'es'}`
                : "Right on the edge — don't miss the next one"
              : `At risk — attend the next ${mustAttend} class${mustAttend === 1 ? '' : 'es'} in a row to reach ${target}%`}
          </Text>
        </View>
      )}
    </Card>
  );
}
