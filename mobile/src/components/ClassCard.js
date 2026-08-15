import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Card from './Card';
import Avatar from './Avatar';
import { colorForSubject } from '../lib/colors';
import { useTheme } from '../lib/useTheme';

const OPTIONS = [
  { status: 'present', label: 'Present', icon: 'check' },
  { status: 'absent', label: 'Absent', icon: 'close' },
  { status: 'noclass', label: 'No class', icon: 'block' },
];

function StatusButton({ opt, active, disabled, onPress, colors }) {
  const statusStyle = {
    present: { bg: colors.gGreenContainer, border: colors.gGreen, text: colors.gGreenDark },
    absent: { bg: colors.gRedContainer, border: colors.gRed, text: colors.gRedDark },
    noclass: { bg: colors.surfaceVariant2, border: colors.outline, text: colors.onSurfaceSecondary },
  };
  const style = active ? statusStyle[opt.status] : null;
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 items-center gap-1 py-2.5 rounded-lg border min-h-11"
      style={{
        backgroundColor: style?.bg ?? colors.surface,
        borderColor: style?.border ?? colors.outlineVariant,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <MaterialIcons name={opt.icon} size={18} color={style?.text ?? colors.onSurfaceTertiary} />
      <Text className="text-xs font-medium" style={{ color: style?.text ?? colors.onSurfaceTertiary }}>
        {opt.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ClassCard({ index, subject, status, onSetStatus, disabled }) {
  const color = colorForSubject(subject);
  const { colors } = useTheme();

  return (
    <Card className="p-4">
      <View className="flex-row items-center gap-3 mb-3">
        <Avatar color={color} size={36} label={String(index + 1)} />
        <View className="flex-1 min-w-0">
          <Text className="font-medium text-on-surface">{subject?.name || 'Unknown subject'}</Text>
          <Text className="text-xs text-on-surface-tertiary">Period {index + 1}</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {OPTIONS.map((opt) => (
          <StatusButton
            key={opt.status}
            opt={opt}
            active={status === opt.status}
            disabled={disabled}
            onPress={() => onSetStatus(opt.status)}
            colors={colors}
          />
        ))}
      </View>
    </Card>
  );
}
