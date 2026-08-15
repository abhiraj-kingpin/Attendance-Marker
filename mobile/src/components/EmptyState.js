import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../lib/useTheme';

export default function EmptyState({ icon, title, subtitle }) {
  const { colors } = useTheme();
  return (
    <View className="items-center py-10 px-6 gap-2">
      {icon && (
        <View className="w-16 h-16 rounded-full bg-surface-variant-2 items-center justify-center mb-1">
          <MaterialIcons name={icon} size={30} color={colors.onSurfaceTertiary} />
        </View>
      )}
      <Text className="text-lg font-medium text-on-surface text-center">{title}</Text>
      {subtitle && <Text className="text-sm text-on-surface-tertiary text-center max-w-xs">{subtitle}</Text>}
    </View>
  );
}
