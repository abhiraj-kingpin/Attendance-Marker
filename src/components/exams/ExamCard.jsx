import { colorForSubject } from '../../lib/colors';
import { formatDayMonth, msUntil, formatCountdown } from '../../lib/dates';
import { ICONS } from '../../lib/icons';
import Card from '../common/Card';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';

export default function ExamCard({ exam, subject, onRemove, past = false }) {
  const color = colorForSubject(subject);
  const ms = msUntil(exam.date, exam.time);
  const urgent = !past && ms <= 3 * 24 * 60 * 60 * 1000;

  return (
    <div>
      <Card className={`p-4 flex items-center gap-3 ${past ? 'opacity-50' : ''} ${urgent ? 'border-g-red' : ''}`}>
        {urgent ? (
          <span className="w-10 h-10 shrink-0 rounded-full grid place-items-center bg-g-red-container">
            <Icon svg={ICONS.warning} size={20} className="text-g-red-dark" />
          </span>
        ) : (
          <Avatar color={color} size={40} label={(subject?.name || 'E').charAt(0).toUpperCase()} />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-on-surface truncate">{exam.name}</p>
          <p className="text-xs text-on-surface-tertiary truncate">
            {subject?.name || 'General'} · {formatDayMonth(exam.date)}
            {exam.time ? ` · ${exam.time}` : ''}
          </p>
        </div>
        {!past ? (
          <p className={`font-display font-medium text-lg shrink-0 ${urgent ? 'text-g-red-dark' : 'text-on-surface-secondary'}`}>
            {formatCountdown(ms)}
          </p>
        ) : (
          <span className="text-xs font-medium text-on-surface-tertiary shrink-0">Past</span>
        )}
        <ConfirmIconButton onConfirm={onRemove} />
      </Card>
    </div>
  );
}
