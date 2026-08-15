import { View } from 'react-native';
import { useTheme } from '../lib/useTheme';

export default function LinearProgress({ value = 0, color, height = 8 }) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View
      style={{ height, borderRadius: height / 2, backgroundColor: colors.surfaceVariant2, overflow: 'hidden' }}
    >
      <View style={{ width: `${clamped}%`, height: '100%', backgroundColor: color ?? colors.gBlue, borderRadius: height / 2 }} />
    </View>
  );
}
