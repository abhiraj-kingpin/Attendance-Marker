import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import BottomNav from './components/layout/BottomNav';
import Splash from './components/layout/Splash';
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
  const [showSplash, setShowSplash] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const ActiveView = VIEWS[tab];

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), reducedMotion ? 400 : 1100);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  return (
    <div className="min-h-dvh relative bg-surface-variant">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#323232',
            color: '#ffffff',
            fontWeight: 500,
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
          },
          success: { iconTheme: { primary: '#34A853', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#EA4335', secondary: '#ffffff' } },
        }}
      />
      <main className="mx-auto max-w-lg pb-28">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={tab}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.18, ease: [0.2, 0, 0, 1] }}
          >
            <ActiveView onNavigate={setTab} />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={tab} onChange={setTab} />
      <AnimatePresence>{showSplash && <Splash key="splash" />}</AnimatePresence>
    </div>
  );
}
