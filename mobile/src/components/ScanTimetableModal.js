import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { DAYS, DAY_LABELS } from '../lib/dates';
import { parseTimetableText } from '../lib/parseTimetableText';
import { useTheme } from '../lib/useTheme';

export default function ScanTimetableModal({ open, onClose }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const subjects = useStore((s) => s.subjects);
  const addSubject = useStore((s) => s.addSubject);
  const setTimetable = useStore((s) => s.setTimetable);
  const timetable = useStore((s) => s.timetable);

  const [step, setStep] = useState('pick');
  const [imageUri, setImageUri] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);

  function reset() {
    setStep('pick');
    setImageUri(null);
    setDraft(null);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function pickAndScan(fromCamera) {
    setError(null);
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Permission needed to access the ' + (fromCamera ? 'camera' : 'photo library') + '.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    setStep('scanning');

    try {
      const recognized = await TextRecognition.recognize(uri);
      const lines = recognized.blocks.flatMap((b) => b.lines.map((l) => l.text));
      const parsed = parseTimetableText(lines);
      setDraft(parsed);
      setStep('review');
    } catch (e) {
      setError('Could not read text from that photo. Try a clearer, well-lit shot.');
      setStep('pick');
    }
  }

  function updateEntry(day, idx, text) {
    setDraft((d) => {
      const next = { ...d, [day]: [...d[day]] };
      next[day][idx] = text;
      return next;
    });
  }

  function removeEntry(day, idx) {
    setDraft((d) => ({ ...d, [day]: d[day].filter((_, i) => i !== idx) }));
  }

  function addEntry(day) {
    setDraft((d) => ({ ...d, [day]: [...d[day], ''] }));
  }

  function handleSave() {
    const byName = new Map(subjects.map((s) => [s.name.trim().toLowerCase(), s]));
    const nextTimetable = { ...timetable };

    for (const day of DAYS) {
      const names = (draft[day] || []).map((n) => n.trim()).filter(Boolean);
      if (names.length === 0) continue;

      const periods = [];
      for (const name of names) {
        const key = name.toLowerCase();
        let subject = byName.get(key);
        if (!subject) {
          addSubject(name, {});
          const created = useStore.getState().subjects.find((s) => s.name.trim().toLowerCase() === key);
          subject = created;
          if (subject) byName.set(key, subject);
        }
        if (subject) periods.push({ id: `${subject.id}-${day}-${periods.length}-${Date.now()}`, subjectId: subject.id });
      }
      nextTimetable[day] = periods;
    }

    setTimetable(nextTimetable);
    handleClose();
  }

  return (
    <Modal visible={open} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-outline-variant">
          <Text className="text-lg font-medium text-on-surface">Scan timetable</Text>
          <TouchableOpacity onPress={handleClose} className="w-11 h-11 items-center justify-center rounded-full">
            <MaterialIcons name="close" size={20} color={colors.onSurfaceSecondary} />
          </TouchableOpacity>
        </View>

        {step === 'pick' && (
          <View className="flex-1 items-center justify-center px-8 gap-4">
            <MaterialIcons name="document-scanner" size={48} color={colors.onSurfaceTertiary} />
            <Text className="text-base font-medium text-on-surface text-center">
              Take or choose a photo of your timetable
            </Text>
            <Text className="text-sm text-on-surface-tertiary text-center">
              Text is recognized entirely on your device — the photo never leaves your phone. You'll get to review and
              correct everything before it's saved.
            </Text>
            {error && <Text className="text-sm text-g-red text-center">{error}</Text>}
            <TouchableOpacity onPress={() => pickAndScan(true)} className="bg-g-blue rounded-full px-6 py-3.5 flex-row items-center gap-2">
              <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" />
              <Text className="text-white font-medium">Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pickAndScan(false)} className="rounded-full px-6 py-3.5 flex-row items-center gap-2 border border-outline-variant">
              <MaterialIcons name="photo-library" size={20} color={colors.onSurfaceSecondary} />
              <Text className="text-on-surface-secondary font-medium">Choose from gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'scanning' && (
          <View className="flex-1 items-center justify-center gap-4">
            {imageUri && <Image source={{ uri: imageUri }} style={{ width: 160, height: 160, borderRadius: 12 }} resizeMode="cover" />}
            <ActivityIndicator size="large" color="#4285F4" />
            <Text className="text-sm text-on-surface-tertiary">Reading text on-device…</Text>
          </View>
        )}

        {step === 'review' && draft && (
          <>
            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
              <Text className="text-sm text-on-surface-tertiary mb-4">
                Review what was detected — edit, remove, or add classes for each day, then save. Saving replaces that
                day's timetable.
              </Text>
              {DAYS.map((day) => (
                <View key={day} className="mb-5">
                  <Text className="text-xs font-semibold text-on-surface-tertiary uppercase mb-2">{DAY_LABELS[day]}</Text>
                  {(draft[day] || []).length === 0 && (
                    <Text className="text-sm text-on-surface-tertiary mb-2">Nothing detected</Text>
                  )}
                  <View className="gap-2">
                    {(draft[day] || []).map((name, idx) => (
                      <View key={idx} className="flex-row items-center gap-2">
                        <TextInput
                          value={name}
                          onChangeText={(v) => updateEntry(day, idx, v)}
                          className="flex-1 rounded-lg border border-outline-variant px-3 py-2.5 text-sm font-medium text-on-surface"
                        />
                        <TouchableOpacity onPress={() => removeEntry(day, idx)} className="w-9 h-9 items-center justify-center">
                          <MaterialIcons name="delete-outline" size={18} color={colors.onSurfaceTertiary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => addEntry(day)} className="flex-row items-center gap-1 mt-2 min-h-11">
                    <MaterialIcons name="add" size={16} color="#4285F4" />
                    <Text className="text-sm font-medium text-g-blue">Add class</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View className="px-5 py-3 border-t border-outline-variant" style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
              <TouchableOpacity onPress={handleSave} className="bg-g-blue rounded-full py-3.5 items-center">
                <Text className="text-white font-medium">Save timetable</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
