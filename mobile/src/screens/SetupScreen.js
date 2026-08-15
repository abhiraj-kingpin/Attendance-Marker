import { useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import AppHeader from '../components/AppHeader';
import SegmentedTabs from '../components/SegmentedTabs';
import SubjectsSection from '../components/SubjectsSection';
import TimetableSection from '../components/TimetableSection';
import ExcludedRangesSection from '../components/ExcludedRangesSection';
import SettingsSection from '../components/SettingsSection';
import Fab from '../components/Fab';

const SECTIONS = [
  { value: 'subjects', label: 'Subjects', fabLabel: 'Add subject' },
  { value: 'timetable', label: 'Timetable', fabLabel: 'Add period' },
  { value: 'excluded', label: 'Excluded', fabLabel: 'Add range' },
  { value: 'settings', label: 'Settings', fabLabel: null },
];

export default function SetupScreen() {
  const [section, setSection] = useState('subjects');
  const subjectsRef = useRef(null);
  const timetableRef = useRef(null);
  const excludedRef = useRef(null);

  const activeRef = { subjects: subjectsRef, timetable: timetableRef, excluded: excludedRef }[section];
  const activeMeta = SECTIONS.find((s) => s.value === section);

  return (
    <View className="flex-1 bg-surface-variant">
      <AppHeader title="Setup" subtitle="Subjects, timetable & leave dates" />
      <View className="px-5">
        <SegmentedTabs options={SECTIONS} value={section} onChange={setSection} />
      </View>
      <ScrollView className="flex-1 px-5 mt-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {section === 'subjects' && <SubjectsSection ref={subjectsRef} />}
        {section === 'timetable' && <TimetableSection ref={timetableRef} />}
        {section === 'excluded' && <ExcludedRangesSection ref={excludedRef} />}
        {section === 'settings' && <SettingsSection />}
      </ScrollView>

      {activeMeta.fabLabel && <Fab icon="add" label={activeMeta.fabLabel} onPress={() => activeRef.current?.openAdd()} />}
    </View>
  );
}
