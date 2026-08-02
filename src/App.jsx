import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import SpaceBackground from './components/space/SpaceBackground';
import BottomNav from './components/layout/BottomNav';
import { usePrefersReducedMotion } from './lib/usePrefersReducedMotion';
import TodayView from './components/today/TodayView';
import AttendanceView from './components/attendance/AttendanceView';
import SyllabusView from './components/syllabus/SyllabusView';
import ExamsView from './components/exams/ExamsView';
import GpaView from './components/gpa/GpaView';
import SetupView from './components/setup/SetupView';

const VIEWS = {
  today: TodayView,
  attendance: AttendanceView,
  syllabus: SyllabusView,
  exams: ExamsView,
  gpa: GpaView,
  setup: SetupView,
};

export default function App() {
  const [tab, setTab] = useState('today');
  const reducedMotion = usePrefersReducedMotion();
  const ActiveView = VIEWS[tab];

  return (
    <div className="min-h-dvh relative">
      <SpaceBackground />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(20, 18, 46, 0.9)',
            color: '#EAE6FF',
            fontWeight: 700,
            borderRadius: '16px',
            border: '1px solid rgba(160, 140, 255, 0.25)',
            boxShadow: '0 10px 30px -8px rgba(0,0,0,0.6)',
          },
          success: { iconTheme: { primary: '#6EE7C4', secondary: '#0B0B23' } },
          error: { iconTheme: { primary: '#FF7A9C', secondary: '#0B0B23' } },
        }}
      />
      <main className="mx-auto max-w-lg pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.28, ease: 'easeOut' }}
          >
            <ActiveView onNavigate={setTab} />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
