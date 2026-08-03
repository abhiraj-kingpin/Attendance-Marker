import { colorForSubject } from '../../lib/colors';
import { ICONS } from '../../lib/icons';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import LinearProgress from '../common/LinearProgress';
import Icon from '../common/Icon';

export default function SubjectAttendanceCard({ subject, stats, target = 75 }) {
  const color = colorForSubject(subject);
  const { held, attended, missed, percentage, status, canMiss, mustAttend } = stats;

  const safe = status === 'safe';
  const barColor = held === 0 ? '#C4C7C5' : safe ? '#34A853' : '#EA4335';

  return (
    <div>
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar color={color} size={40} label={subject.name.charAt(0).toUpperCase()} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-on-surface">{subject.name}</p>
            <p className="text-xs text-on-surface-tertiary">
              {attended} attended · {missed} missed · {held} held
            </p>
          </div>
          <p className="font-display font-medium text-2xl shrink-0" style={{ color: barColor }}>
            {percentage === null ? '—' : `${percentage.toFixed(1)}%`}
          </p>
        </div>

        <LinearProgress value={percentage ?? 0} color={barColor} />

        {held > 0 && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
              safe ? 'bg-g-green-container text-g-green-dark' : 'bg-g-red-container text-g-red-dark'
            }`}
          >
            <Icon svg={safe ? ICONS.verified : ICONS.trendingDown} size={18} className="shrink-0" />
            {safe ? (
              canMiss > 0 ? (
                <span>Safe — you can miss {canMiss} more class{canMiss === 1 ? '' : 'es'}</span>
              ) : (
                <span>Right on the edge — don't miss the next one</span>
              )
            ) : (
              <span>
                At risk — attend the next {mustAttend} class{mustAttend === 1 ? '' : 'es'} in a row to reach {target}%
              </span>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
