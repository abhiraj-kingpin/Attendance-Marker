import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Card from './Card';
import Avatar from './Avatar';
import LinearProgress from './LinearProgress';
import PasteSyllabusModal from './PasteSyllabusModal';
import { colorForSubject } from '../lib/colors';
import { useTheme } from '../lib/useTheme';

const NO_UNIT = '__none__';

function TopicRow({ topic, color, colors, onToggle, onRemove }) {
  return (
    <View className="flex-row items-center gap-1 bg-surface-variant-2 rounded-lg pl-3 pr-1.5 py-1.5">
      <TouchableOpacity onPress={onToggle} className="w-11 h-11 items-center justify-center">
        <View
          className="w-5 h-5 rounded-md items-center justify-center border-2"
          style={{
            backgroundColor: topic.done ? color.solid : 'transparent',
            borderColor: topic.done ? color.solid : colors.outline,
          }}
        >
          {topic.done && <MaterialIcons name="check" size={13} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
      <Text
        className="flex-1 text-sm font-medium"
        style={{
          color: topic.done ? colors.onSurfaceTertiary : colors.onSurface,
          textDecorationLine: topic.done ? 'line-through' : 'none',
        }}
      >
        {topic.title}
      </Text>
      <TouchableOpacity onPress={onRemove} className="w-9 h-9 items-center justify-center">
        <MaterialIcons name="delete-outline" size={16} color={colors.onSurfaceTertiary} />
      </TouchableOpacity>
    </View>
  );
}

function UnitGroup({ name, topics, color, colors, onToggle, onRemove, startOpen }) {
  const [open, setOpen] = useState(startOpen);
  const done = topics.filter((t) => t.done).length;

  return (
    <View className="mb-3">
      <TouchableOpacity onPress={() => setOpen((o) => !o)} className="flex-row items-center gap-2 py-1.5 min-h-11">
        <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={18} color={colors.onSurfaceTertiary} />
        <Text className="flex-1 text-xs font-semibold text-on-surface-tertiary uppercase">{name}</Text>
        <Text className="text-xs font-medium text-on-surface-tertiary">{done}/{topics.length}</Text>
      </TouchableOpacity>
      {open && (
        <View className="gap-2 mt-1">
          {topics.map((topic) => (
            <TopicRow key={topic.id} topic={topic} color={color} colors={colors} onToggle={() => onToggle(topic.id)} onRemove={() => onRemove(topic.id)} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function SyllabusSubjectCard({ subject, topics, onAddTopic, onToggleTopic, onRemoveTopic, onImportUnits, startOpen }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(!!startOpen);
  const [draft, setDraft] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const color = colorForSubject(subject);

  const done = topics.filter((t) => t.done).length;
  const total = topics.length;
  const pct = total === 0 ? 0 : (done / total) * 100;

  const groups = [];
  const groupByKey = new Map();
  for (const topic of topics) {
    const key = topic.unit || NO_UNIT;
    let group = groupByKey.get(key);
    if (!group) {
      group = { key, name: topic.unit || null, topics: [] };
      groupByKey.set(key, group);
      groups.push(group);
    }
    group.topics.push(topic);
  }

  function submitTopic() {
    if (!draft.trim()) return;
    onAddTopic(draft);
    setDraft('');
  }

  return (
    <Card className="p-4">
      <TouchableOpacity className="flex-row items-center gap-3" onPress={() => setOpen((o) => !o)}>
        <Avatar color={color} size={40} label={subject.name.charAt(0).toUpperCase()} />
        <View className="flex-1 min-w-0">
          <Text className="font-medium text-on-surface">{subject.name}</Text>
          <Text className="text-xs text-on-surface-tertiary">
            {total === 0 ? 'No topics yet' : `${done}/${total} topics · ${pct.toFixed(0)}% complete`}
          </Text>
        </View>
        <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={20} color={colors.onSurfaceTertiary} />
      </TouchableOpacity>

      <View className="mt-3">
        <LinearProgress value={pct} color={color.solid} height={6} />
      </View>

      {open && (
        <View className="pt-4">
          {groups.map((group) =>
            group.name ? (
              <UnitGroup
                key={group.key}
                name={group.name}
                topics={group.topics}
                color={color}
                colors={colors}
                onToggle={onToggleTopic}
                onRemove={onRemoveTopic}
                startOpen
              />
            ) : (
              <View key={group.key} className="gap-2 mb-3">
                {group.topics.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} color={color} colors={colors} onToggle={() => onToggleTopic(topic.id)} onRemove={() => onRemoveTopic(topic.id)} />
                ))}
              </View>
            )
          )}

          <TouchableOpacity
            onPress={() => setPasteOpen(true)}
            className="flex-row items-center justify-center gap-2 rounded-lg border border-outline-variant py-3 mb-3 min-h-11"
          >
            <MaterialIcons name="content-paste" size={16} color={colors.gBlue} />
            <Text className="text-sm font-medium text-g-blue">Paste whole syllabus, split into units</Text>
          </TouchableOpacity>

          <View className="flex-row gap-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={submitTopic}
              placeholder="Or add one topic..."
              className="flex-1 rounded-lg border border-outline-variant px-3.5 py-2.5 text-sm font-medium text-on-surface"
            />
            <TouchableOpacity
              onPress={submitTopic}
              className="w-11 h-11 items-center justify-center rounded-full bg-g-blue"
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PasteSyllabusModal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        subjectName={subject.name}
        onSave={onImportUnits}
      />
    </Card>
  );
}
