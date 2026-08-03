import { useStore } from '../../store/useStore';
import { computeAllSubjectStats, computeOverallStats } from '../../lib/attendance';
import { ICONS, NAV_ICONS } from '../../lib/icons';
import AppHeader from '../layout/AppHeader';
import EmptyState from '../common/EmptyState';
import LinearProgress from '../common/LinearProgress';
import Icon from '../common/Icon';
import Card from '../common/Card';
import SubjectAttendanceCard from './SubjectAttendanceCard';

const TARGET_PRESETS = [60, 65, 70, 75, 80, 90];

export default function AttendanceView() {
  const subjects = useStore((s) => s.subjects);
  const attendance = useStore((s) => s.attendance);
  const excludedRanges = useStore((s) => s.excludedRanges);
  const attendanceTarget = useStore((s) => s.settings.attendanceTarget);
  const setAttendanceTarget = useStore((s) => s.setAttendanceTarget);

  const target = attendanceTarget / 100;
  const statsById = computeAllSubjectStats(subjects, attendance, excludedRanges, target);
  const overall = computeOverallStats(statsById, target);

  const sorted = [...subjects].sort((a, b) => {
    const pa = statsById[a.id].percentage;
    const pb = statsById[b.id].percentage;
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return pa - pb;
  });

  const overallSafe = overall.status === 'safe';
  const overallColor = overall.held === 0 ? '#5F6368' : overallSafe ? '#34A853' : '#EA4335';

  return (
    <div>
      <AppHeader title="Attendance" subtitle={`Your ${attendanceTarget}% goal, tracked live`} />
      <div className="px-5">
        <Card className="p-4 mb-4">
          <p className="text-sm font-medium text-on-surface-secondary mb-2">Attendance goal</p>
          <div className="flex gap-1.5 flex-wrap items-center">
            {TARGET_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAttendanceTarget(p)}
                className={`px-3 py-2 rounded-full text-sm font-medium border min-h-11 ${
                  attendanceTarget === p ? 'bg-g-blue-container border-g-blue text-g-blue-dark' : 'bg-surface border-outline-variant text-on-surface-tertiary'
                }`}
              >
                {p}%
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={100}
              value={attendanceTarget}
              onChange={(e) => setAttendanceTarget(e.target.value)}
              className="w-16 min-h-11 rounded-full border border-outline-variant bg-surface text-center text-sm font-medium text-on-surface outline-none focus:border-g-blue"
              aria-label="Custom attendance target percent"
            />
          </div>
        </Card>

        {subjects.length === 0 ? (
          <EmptyState
            icon={NAV_ICONS.monitoring.outlined}
            title="Nothing to show yet"
            subtitle="Add subjects and start marking attendance on the Today tab."
          />
        ) : (
          <>
            <div>
              <Card className="p-5 mb-4">
                <p className="text-sm font-medium text-on-surface-secondary">Overall attendance</p>
                <p className="font-display font-medium text-4xl mt-1" style={{ color: overallColor }}>
                  {overall.percentage === null ? '—' : `${overall.percentage.toFixed(1)}%`}
                </p>
                <div className="mt-3">
                  <LinearProgress value={overall.percentage ?? 0} color={overallColor} height={10} />
                </div>
                <p className="text-xs font-medium text-on-surface-tertiary mt-2">
                  {overall.attended} attended · {overall.missed} missed · {overall.held} classes held
                </p>
                {overall.held > 0 && (
                  <div
                    className="mt-3 flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2.5"
                    style={{ background: overallSafe ? '#E6F4EA' : '#FCE8E6', color: overallColor }}
                  >
                    <Icon svg={overallSafe ? ICONS.verified : ICONS.trendingDown} size={18} />
                    {overallSafe
                      ? overall.canMiss > 0
                        ? `Safe — ${overall.canMiss} class${overall.canMiss === 1 ? '' : 'es'} of slack overall`
                        : 'Right on the edge overall'
                      : `Attend next ${overall.mustAttend} in a row to reach ${attendanceTarget}% overall`}
                  </div>
                )}
              </Card>
            </div>

            <div className="flex flex-col gap-3">
              {sorted.map((subject) => (
                <SubjectAttendanceCard key={subject.id} subject={subject} stats={statsById[subject.id]} target={attendanceTarget} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
