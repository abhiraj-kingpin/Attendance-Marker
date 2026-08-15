import { TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../lib/useTheme';

export default function ConfirmIconButton({ onConfirm, size = 18 }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onConfirm} className="w-9 h-9 items-center justify-center rounded-full">
      <MaterialIcons name="delete-outline" size={size} color={colors.gRed} />
    </TouchableOpacity>
  );
}
