import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../lib/useTheme';

export default function SegmentedTabs({ options, value, onChange }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row bg-surface-variant-2 rounded-full p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className="flex-1 items-center py-2.5 rounded-full"
            style={{ backgroundColor: active ? colors.gBlue : 'transparent' }}
          >
            <Text className="text-sm font-medium" style={{ color: active ? '#FFFFFF' : colors.onSurfaceSecondary }}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
