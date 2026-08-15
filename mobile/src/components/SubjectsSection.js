import { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '../store/useStore';
import { colorForSubject } from '../lib/colors';
import { useTheme } from '../lib/useTheme';
import Card from './Card';
import BottomSheet from './BottomSheet';
import EmptyState from './EmptyState';
import ConfirmIconButton from './ConfirmIconButton';
import Avatar from './Avatar';

const TYPES = [
  { value: 'theory', label: 'Theory' },
  { value: 'lab', label: 'Lab' },
];

function SubjectRow({ subject, onEdit, onRemove, colors }) {
  const color = colorForSubject(subject);
  return (
    <Card className="flex-row items-center gap-3 p-3.5">
      <Avatar color={color} size={36} label={subject.name.charAt(0).toUpperCase()} />
      <View className="flex-1 min-w-0">
        <Text className="font-medium text-on-surface">{subject.name}</Text>
        <Text className="text-xs text-on-surface-tertiary">
          {subject.credits ?? 4} credit{(subject.credits ?? 4) === 1 ? '' : 's'}
          {subject.teacher ? ` · ${subject.teacher}` : ''}
          {subject.room ? ` · Room ${subject.room}` : ''}
        </Text>
        {subject.tags?.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-1">
            {subject.tags.map((tag) => (
              <View key={tag} className="rounded-full px-2 py-0.5 bg-surface-variant-2">
                <Text className="text-2xs font-medium text-on-surface-tertiary">#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onEdit} className="w-11 h-11 items-center justify-center rounded-full">
        <MaterialIcons name="edit" size={18} color={colors.onSurfaceTertiary} />
      </TouchableOpacity>
      <ConfirmIconButton onConfirm={onRemove} />
    </Card>
  );
}

const SubjectsSection = forwardRef(function SubjectsSection(_props, ref) {
  const { colors } = useTheme();
  const subjects = useStore((s) => s.subjects);
  const addSubject = useStore((s) => s.addSubject);
  const updateSubject = useStore((s) => s.updateSubject);
  const removeSubject = useStore((s) => s.removeSubject);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('theory');
  const [credits, setCredits] = useState('4');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsText, setTagsText] = useState('');

  function openAdd() {
    setEditing(null);
    setName('');
    setType('theory');
    setCredits('4');
    setTeacher('');
    setRoom('');
    setNotes('');
    setTagsText('');
    setSheetOpen(true);
  }

  useImperativeHandle(ref, () => ({ openAdd }));

  function openEdit(subject) {
    setEditing(subject);
    setName(subject.name);
    setType(subject.type === 'lab' ? 'lab' : 'theory');
    setCredits(String(subject.credits ?? 4));
    setTeacher(subject.teacher ?? '');
    setRoom(subject.room ?? '');
    setNotes(subject.notes ?? '');
    setTagsText((subject.tags ?? []).join(', '));
    setSheetOpen(true);
  }

  function parseTags() {
    return tagsText.split(',').map((t) => t.trim()).filter(Boolean);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const tags = parseTags();
    if (editing) {
      updateSubject(editing.id, {
        name: trimmed,
        type,
        credits: Number(credits) || 4,
        teacher: teacher.trim() || null,
        room: room.trim() || null,
        notes: notes.trim() || null,
        tags,
      });
    } else {
      addSubject(trimmed, { type, credits, teacher, room, notes, tags });
    }
    setSheetOpen(false);
  }

  const theory = subjects.filter((s) => s.type !== 'lab');
  const labs = subjects.filter((s) => s.type === 'lab');

  return (
    <View className="flex-1">
      <Text className="text-sm font-medium text-on-surface-secondary mb-3">
        {subjects.length} subject{subjects.length === 1 ? '' : 's'}
      </Text>

      {subjects.length === 0 ? (
        <EmptyState icon="checklist" title="No subjects yet" subtitle="Add your first subject to start building your timetable." />
      ) : (
        <View className="gap-5">
          {theory.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-on-surface-tertiary uppercase mb-2">Theory</Text>
              <View className="gap-2.5">
                {theory.map((subject) => (
                  <SubjectRow key={subject.id} subject={subject} onEdit={() => openEdit(subject)} onRemove={() => removeSubject(subject.id)} colors={colors} />
                ))}
              </View>
            </View>
          )}
          {labs.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-on-surface-tertiary uppercase mb-2">Labs</Text>
              <View className="gap-2.5">
                {labs.map((subject) => (
                  <SubjectRow key={subject.id} subject={subject} onEdit={() => openEdit(subject)} onRemove={() => removeSubject(subject.id)} colors={colors} />
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Edit subject' : 'Add subject'}>
        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Subject name</Text>
        <TextInput
          autoFocus
          value={name}
          onChangeText={setName}
          placeholder="e.g. Data Structures"
          className="mb-3 rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Type</Text>
            <View className="flex-row gap-2">
              {TYPES.map((t) => {
                const active = type === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setType(t.value)}
                    className="flex-1 rounded-lg px-3 py-3 border min-h-11 items-center"
                    style={{ backgroundColor: active ? colors.gBlueContainer : colors.surface, borderColor: active ? colors.gBlue : colors.outlineVariant }}
                  >
                    <Text className="text-sm font-medium" style={{ color: active ? colors.gBlueDark : colors.onSurfaceTertiary }}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View className="w-24">
            <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Credits</Text>
            <TextInput
              keyboardType="number-pad"
              value={credits}
              onChangeText={setCredits}
              className="rounded-lg border border-outline-variant px-3 py-3 text-center font-medium text-on-surface"
            />
          </View>
        </View>

        <View className="flex-row gap-3 mt-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Teacher (optional)</Text>
            <TextInput
              value={teacher}
              onChangeText={setTeacher}
              placeholder="e.g. Dr. Sharma"
              className="rounded-lg border border-outline-variant px-3 py-3 font-medium text-on-surface"
            />
          </View>
          <View className="w-24">
            <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Room</Text>
            <TextInput
              value={room}
              onChangeText={setRoom}
              placeholder="431"
              className="rounded-lg border border-outline-variant px-3 py-3 text-center font-medium text-on-surface"
            />
          </View>
        </View>

        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5 mt-3">Tags (comma-separated)</Text>
        <TextInput
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="difficult, lab, assignment-pending"
          className="mb-3 rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />

        <Text className="text-sm font-medium text-on-surface-secondary mb-1.5">Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything worth remembering about this subject"
          multiline
          className="rounded-lg border border-outline-variant px-4 py-3 font-medium text-on-surface"
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={!name.trim()}
          className="mt-4 bg-g-blue rounded-full py-3.5 items-center"
          style={{ opacity: !name.trim() ? 0.4 : 1 }}
        >
          <Text className="text-white font-medium">{editing ? 'Save changes' : 'Add subject'}</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
});

export default SubjectsSection;
