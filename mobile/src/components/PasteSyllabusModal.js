import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parseSyllabusText } from '../lib/parseSyllabusText';
import { useTheme } from '../lib/useTheme';

export default function PasteSyllabusModal({ open, onClose, subjectName, onSave }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [step, setStep] = useState('paste');
  const [raw, setRaw] = useState('');
  const [units, setUnits] = useState([]);

  function reset() {
    setStep('paste');
    setRaw('');
    setUnits([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleParse() {
    const parsed = parseSyllabusText(raw);
    if (parsed.length === 0) {
      setUnits([{ name: 'General', topics: [] }]);
    } else {
      setUnits(parsed);
    }
    setStep('review');
  }

  function updateTopic(unitIdx, topicIdx, text) {
    setUnits((u) => {
      const next = [...u];
      const topics = [...next[unitIdx].topics];
      topics[topicIdx] = text;
      next[unitIdx] = { ...next[unitIdx], topics };
      return next;
    });
  }

  function removeTopic(unitIdx, topicIdx) {
    setUnits((u) => {
      const next = [...u];
      next[unitIdx] = { ...next[unitIdx], topics: next[unitIdx].topics.filter((_, i) => i !== topicIdx) };
      return next;
    });
  }

  function addTopic(unitIdx) {
    setUnits((u) => {
      const next = [...u];
      next[unitIdx] = { ...next[unitIdx], topics: [...next[unitIdx].topics, ''] };
      return next;
    });
  }

  function renameUnit(unitIdx, name) {
    setUnits((u) => {
      const next = [...u];
      next[unitIdx] = { ...next[unitIdx], name };
      return next;
    });
  }

  function removeUnit(unitIdx) {
    setUnits((u) => u.filter((_, i) => i !== unitIdx));
  }

  function addUnit() {
    setUnits((u) => [...u, { name: `Unit ${u.length + 1}`, topics: [''] }]);
  }

  function handleSave() {
    const cleaned = units
      .map((u) => ({ name: u.name.trim() || 'General', topics: u.topics.map((t) => t.trim()).filter(Boolean) }))
      .filter((u) => u.topics.length > 0);
    onSave(cleaned);
    handleClose();
  }

  const totalTopics = units.reduce((sum, u) => sum + u.topics.filter((t) => t.trim()).length, 0);

  return (
    <Modal visible={open} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-outline-variant">
          <Text className="text-lg font-medium text-on-surface" numberOfLines={1}>
            Paste syllabus{subjectName ? ` · ${subjectName}` : ''}
          </Text>
          <TouchableOpacity onPress={handleClose} className="w-11 h-11 items-center justify-center rounded-full">
            <MaterialIcons name="close" size={20} color={colors.onSurfaceSecondary} />
          </TouchableOpacity>
        </View>

        {step === 'paste' && (
          <View className="flex-1 px-5 pt-4">
            <Text className="text-sm text-on-surface-tertiary mb-3">
              Copy the whole syllabus from your PDF or document and paste it below. Mark it up with "Unit 1", "Unit 2"
              (or "Unit I", "Unit II") wherever the source breaks it up — everything else gets grouped under whichever
              unit it falls under, or "General" if there's no unit heading at all.
            </Text>
            <TextInput
              value={raw}
              onChangeText={setRaw}
              placeholder={'Unit 1\nIntroduction: ...\n\nUnit 2\nTheory of ...'}
              multiline
              textAlignVertical="top"
              className="flex-1 rounded-lg border border-outline-variant px-3.5 py-3 text-sm font-medium text-on-surface"
            />
            <TouchableOpacity
              onPress={handleParse}
              disabled={!raw.trim()}
              className="bg-g-blue rounded-full py-3.5 items-center my-4"
              style={{ opacity: raw.trim() ? 1 : 0.4 }}
            >
              <Text className="text-white font-medium">Split into units</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'review' && (
          <>
            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
              <Text className="text-sm text-on-surface-tertiary mb-4">
                Review what got split out — edit, remove, or add topics in each unit, then save. {totalTopics} topic
                {totalTopics === 1 ? '' : 's'} total.
              </Text>
              {units.map((unit, unitIdx) => (
                <View key={unitIdx} className="mb-5">
                  <View className="flex-row items-center gap-2 mb-2">
                    <TextInput
                      value={unit.name}
                      onChangeText={(v) => renameUnit(unitIdx, v)}
                      className="flex-1 text-sm font-semibold text-on-surface-tertiary uppercase"
                    />
                    <TouchableOpacity onPress={() => removeUnit(unitIdx)} className="w-9 h-9 items-center justify-center">
                      <MaterialIcons name="delete-outline" size={16} color={colors.onSurfaceTertiary} />
                    </TouchableOpacity>
                  </View>
                  <View className="gap-2">
                    {unit.topics.map((topic, topicIdx) => (
                      <View key={topicIdx} className="flex-row items-center gap-2">
                        <TextInput
                          value={topic}
                          onChangeText={(v) => updateTopic(unitIdx, topicIdx, v)}
                          multiline
                          className="flex-1 rounded-lg border border-outline-variant px-3 py-2.5 text-sm font-medium text-on-surface"
                        />
                        <TouchableOpacity onPress={() => removeTopic(unitIdx, topicIdx)} className="w-9 h-9 items-center justify-center">
                          <MaterialIcons name="delete-outline" size={18} color={colors.onSurfaceTertiary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => addTopic(unitIdx)} className="flex-row items-center gap-1 mt-2 min-h-11">
                    <MaterialIcons name="add" size={16} color={colors.gBlue} />
                    <Text className="text-sm font-medium text-g-blue">Add topic</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={addUnit}
                className="flex-row items-center justify-center gap-1 rounded-lg border border-outline-variant py-3 min-h-11"
              >
                <MaterialIcons name="add" size={16} color={colors.onSurfaceSecondary} />
                <Text className="text-sm font-medium text-on-surface-secondary">Add unit</Text>
              </TouchableOpacity>
            </ScrollView>
            <View className="px-5 py-3 border-t border-outline-variant" style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
              <TouchableOpacity onPress={handleSave} disabled={totalTopics === 0} className="bg-g-blue rounded-full py-3.5 items-center" style={{ opacity: totalTopics === 0 ? 0.4 : 1 }}>
                <Text className="text-white font-medium">Save syllabus</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
