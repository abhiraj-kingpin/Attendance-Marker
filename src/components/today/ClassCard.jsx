import { motion } from 'framer-motion';
import { colorForSubject } from '../../lib/colors';
import { ICONS } from '../../lib/icons';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';

const OPTIONS = [
  { status: 'present', label: 'Present', icon: ICONS.check },
  { status: 'absent', label: 'Absent', icon: ICONS.close },
  { status: 'noclass', label: 'No class', icon: ICONS.block },
];

function StatusButton({ opt, active, disabled, onClick }) {
  return (
    <motion.button
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.96 }}
      onClick={onClick}
      transition={{ duration: 0.15 }}
      className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border font-medium text-xs transition-colors disabled:opacity-40 min-h-11 ${
        active ? statusClasses[opt.status] : 'bg-surface border-outline-variant text-on-surface-tertiary'
      }`}
    >
      <Icon svg={opt.icon} size={18} />
      {opt.label}
    </motion.button>
  );
}

export default function ClassCard({ index, subject, status, onSetStatus, disabled }) {
  const color = colorForSubject(subject);

  return (
    <div>
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar color={color} size={36} label={index + 1} />
          <div className="min-w-0">
            <p className="font-medium text-on-surface">{subject?.name || 'Unknown subject'}</p>
            <p className="text-xs text-on-surface-tertiary">Period {index + 1}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {OPTIONS.map((opt) => (
            <StatusButton
              key={opt.status}
              opt={opt}
              active={status === opt.status}
              disabled={disabled}
              onClick={() => onSetStatus(opt.status)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

const statusClasses = {
  present: 'bg-g-green-container border-g-green text-g-green-dark',
  absent: 'bg-g-red-container border-g-red text-g-red-dark',
  noclass: 'bg-surface-variant-2 border-outline text-on-surface-secondary',
};
