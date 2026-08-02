import { BookOpen } from 'lucide-react';
import { useStore } from '../../store/useStore';
import AppHeader from '../layout/AppHeader';
import EmptyState from '../common/EmptyState';
import SyllabusSubjectCard from './SyllabusSubjectCard';

export default function SyllabusView() {
  const subjects = useStore((s) => s.subjects);
  const syllabus = useStore((s) => s.syllabus);
  const addTopic = useStore((s) => s.addTopic);
  const toggleTopic = useStore((s) => s.toggleTopic);
  const removeTopic = useStore((s) => s.removeTopic);

  return (
    <div>
      <AppHeader title="Syllabus" subtitle="Track what you've covered" />
      <div className="px-5">
        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            subtitle="Add subjects from the Setup tab, then track topics here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {subjects.map((subject, i) => (
              <SyllabusSubjectCard
                key={subject.id}
                subject={subject}
                topics={syllabus[subject.id] || []}
                onAddTopic={(title) => addTopic(subject.id, title)}
                onToggleTopic={(topicId) => toggleTopic(subject.id, topicId)}
                onRemoveTopic={(topicId) => removeTopic(subject.id, topicId)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
