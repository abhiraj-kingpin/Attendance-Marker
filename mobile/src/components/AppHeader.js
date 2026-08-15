import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppHeader({ title, subtitle, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-surface-variant px-5 pb-4" style={{ paddingTop: insets.top + 20 }}>
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-3xl font-medium text-on-surface leading-tight">{title}</Text>
          {subtitle && <Text className="text-sm text-on-surface-tertiary mt-0.5">{subtitle}</Text>}
        </View>
        {right}
      </View>
    </View>
  );
}
