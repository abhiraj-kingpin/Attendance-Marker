import { motion } from 'framer-motion';
import { PieChart, ShieldCheck, TrendingDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { computeAllSubjectStats, computeOverallStats } from '../../lib/attendance';
import AppHeader from '../layout/AppHeader';
import EmptyState from '../common/EmptyState';
import { CometBar } from '../common/OrbitProgress';
import SubjectAttendanceCard from './SubjectAttendanceCard';

export default function AttendanceView() {
  const subjects = useStore((s) => s.subjects);
  const attendance = useStore((s) => s.attendance);
  const excludedRanges = useStore((s) => s.excludedRanges);

  const statsById = computeAllSubjectStats(subjects, attendance, excludedRanges);
  const overall = computeOverallStats(statsById);

  const sorted = [...subjects].sort((a, b) => {
    const pa = statsById[a.id].percentage;
    const pb = statsById[b.id].percentage;
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return pa - pb;
  });

  const overallSafe = overall.status === 'safe';
  const overallColor = overall.held === 0 ? '#8078B0' : overallSafe ? '#34D399' : '#FB7185';

  return (
    <div>
      <AppHeader title="Attendance" subtitle="The 75% rule, tracked live" />
      <div className="px-5">
        {subjects.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="Nothing to show yet"
            subtitle="Add subjects and start marking attendance on the Today tab."
          />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl p-5 mb-4 glass-panel shadow-pop overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{ background: `radial-gradient(circle at 15% 10%, ${overallColor}, transparent 60%)` }}
              />
              <div className="relative">
                <p className="text-sm font-bold text-ink-300">Overall attendance</p>
                <p className="font-display text-4xl mt-1" style={{ color: overallColor }}>
                  {overall.percentage === null ? '—' : `${overall.percentage.toFixed(1)}%`}
                </p>
                <div className="mt-3">
                  <CometBar value={overall.percentage ?? 0} color={overallColor} height={10} />
                </div>
                <p className="text-xs font-bold text-ink-400 mt-2">
                  {overall.attended} attended · {overall.missed} missed · {overall.held} classes held
                </p>
                {overall.held > 0 && (
                  <div
                    className="mt-3 flex items-center gap-2 text-sm font-bold rounded-2xl px-3 py-2"
                    style={{ background: `${overallColor}22`, color: overallColor }}
                  >
                    {overallSafe ? <ShieldCheck size={16} /> : <TrendingDown size={16} />}
                    {overallSafe
                      ? overall.canMiss > 0
                        ? `Safe — ${overall.canMiss} class${overall.canMiss === 1 ? '' : 'es'} of slack overall`
                        : 'Right on the edge overall'
                      : `Attend next ${overall.mustAttend} in a row to reach 75% overall`}
                  </div>
                )}
              </div>
            </motion.div>

            <div className="flex flex-col gap-3">
              {sorted.map((subject, i) => (
                <SubjectAttendanceCard key={subject.id} subject={subject} stats={statsById[subject.id]} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
