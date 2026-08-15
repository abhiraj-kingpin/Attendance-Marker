import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, ScrollView, Keyboard, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/useTheme';

function useKeyboardHeight(active) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!active) {
      setHeight(0);
      return;
    }
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setHeight(e.endCoordinates?.height ?? 0));
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [active]);
  return height;
}

export default function BottomSheet({ open, onClose, title, children }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const keyboardHeight = useKeyboardHeight(open);

  function close() {
    Keyboard.dismiss();
    onClose();
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <Pressable className="flex-1" style={{ backgroundColor: colors.overlay }} onPress={close} />
      <View className="absolute left-0 right-0 bottom-0" style={{ paddingBottom: keyboardHeight }}>
        <View className="rounded-t-[28px] bg-surface" style={{ maxHeight: '85%' }}>
          <View className="items-center pt-2.5 pb-1">
            <View className="w-8 h-1 rounded-full bg-outline" />
          </View>
          <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
            <Text className="text-lg font-medium text-on-surface">{title}</Text>
            <TouchableOpacity onPress={close} className="w-11 h-11 items-center justify-center rounded-full">
              <MaterialIcons name="close" size={20} color={colors.onSurfaceSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 28 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
