import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Card from './Card';
import Avatar from './Avatar';
import ConfirmIconButton from './ConfirmIconButton';
import { colorForSubject } from '../lib/colors';
import { formatDayMonth, msUntil, formatCountdown } from '../lib/dates';
import { useTheme } from '../lib/useTheme';

export default function ExamCard({ exam, subject, onRemove, past = false }) {
  const { colors } = useTheme();
  const color = colorForSubject(subject);
  const ms = msUntil(exam.date, exam.time);
  const urgent = !past && ms <= 3 * 24 * 60 * 60 * 1000;

  return (
    <Card className="p-4 flex-row items-center gap-3" style={{ opacity: past ? 0.5 : 1, borderColor: urgent ? colors.gRed : undefined }}>
      {urgent ? (
        <View className="w-10 h-10 rounded-full items-center justify-center bg-g-red-container">
          <MaterialIcons name="warning" size={20} color={colors.gRedDark} />
        </View>
      ) : (
        <Avatar color={color} size={40} label={(subject?.name || 'E').charAt(0).toUpperCase()} />
      )}
      <View className="flex-1 min-w-0">
        <Text className="font-medium text-on-surface" numberOfLines={1}>{exam.name}</Text>
        <Text className="text-xs text-on-surface-tertiary" numberOfLines={1}>
          {subject?.name || 'General'} · {formatDayMonth(exam.date)}
          {exam.time ? ` · ${exam.time}` : ''}
        </Text>
      </View>
      {!past ? (
        <Text className="text-lg font-medium" style={{ color: urgent ? colors.gRedDark : colors.onSurfaceSecondary }}>
          {formatCountdown(ms)}
        </Text>
      ) : (
        <Text className="text-xs font-medium text-on-surface-tertiary">Past</Text>
      )}
      <ConfirmIconButton onConfirm={onRemove} />
    </Card>
  );
}
