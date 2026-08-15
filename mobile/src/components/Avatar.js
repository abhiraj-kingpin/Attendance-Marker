import { View, Text } from 'react-native';

export default function Avatar({ color, size = 40, label }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color.container,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: color.on, fontWeight: '600', fontSize: size * 0.4 }}>{label}</Text>
    </View>
  );
}
