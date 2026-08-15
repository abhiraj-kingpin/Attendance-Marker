import { View, ScrollView } from 'react-native';
import { useStore } from '../store/useStore';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import SyllabusSubjectCard from '../components/SyllabusSubjectCard';

export default function SyllabusScreen() {
  const subjects = useStore((s) => s.subjects);
  const syllabus = useStore((s) => s.syllabus);
  const addTopic = useStore((s) => s.addTopic);
  const toggleTopic = useStore((s) => s.toggleTopic);
  const removeTopic = useStore((s) => s.removeTopic);
  const setSyllabusUnits = useStore((s) => s.setSyllabusUnits);
  const updateSubject = useStore((s) => s.updateSubject);

  return (
    <View className="flex-1 bg-surface-variant">
      <AppHeader title="Syllabus" subtitle="Track what you've covered" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {subjects.length === 0 ? (
          <EmptyState
            icon="checklist"
            title="No subjects yet"
            subtitle="Add subjects from the Setup tab, then track topics here."
          />
        ) : (
          <View className="gap-3">
            {subjects.map((subject, i) => (
              <SyllabusSubjectCard
                key={subject.id}
                subject={subject}
                topics={syllabus[subject.id] || []}
                startOpen={i === 0}
                onAddTopic={(title) => addTopic(subject.id, title)}
                onToggleTopic={(topicId) => toggleTopic(subject.id, topicId)}
                onRemoveTopic={(topicId) => removeTopic(subject.id, topicId)}
                onImportUnits={(units) => setSyllabusUnits(subject.id, units)}
                onSetCommencementDate={(date) => updateSubject(subject.id, { commencementDate: date })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
