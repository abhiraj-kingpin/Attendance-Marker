import { useState } from 'react';
import AppHeader from '../layout/AppHeader';
import SegmentedTabs from '../common/SegmentedTabs';
import SubjectsSection from './SubjectsSection';
import TimetableSection from './TimetableSection';
import ExcludedRangesSection from './ExcludedRangesSection';

const SECTIONS = [
  { value: 'subjects', label: 'Subjects' },
  { value: 'timetable', label: 'Timetable' },
  { value: 'excluded', label: 'Excluded' },
];

export default function SetupView() {
  const [section, setSection] = useState('subjects');

  return (
    <div>
      <AppHeader title="Setup" subtitle="Subjects, timetable & leave dates" />
      <div className="px-5">
        <SegmentedTabs
          options={SECTIONS}
          value={section}
          onChange={setSection}
          layoutId="setupPill"
        />
      </div>
      <div className="px-5 mt-4">
        {section === 'subjects' && <SubjectsSection />}
        {section === 'timetable' && <TimetableSection />}
        {section === 'excluded' && <ExcludedRangesSection />}
      </div>
    </div>
  );
}
