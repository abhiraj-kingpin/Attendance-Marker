import { TouchableOpacity, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Fab({ icon = 'add', label, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="absolute bottom-6 right-5 flex-row items-center gap-2 bg-g-blue rounded-full pl-4 pr-5 py-4 min-h-14"
      style={{ elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}
    >
      <MaterialIcons name={icon} size={24} color="#FFFFFF" />
      {label && <Text className="text-white font-medium text-sm">{label}</Text>}
    </TouchableOpacity>
  );
}
