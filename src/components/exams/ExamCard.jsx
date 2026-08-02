import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { colorForSubject } from '../../lib/colors';
import { formatDayMonth, msUntil, formatCountdown } from '../../lib/dates';
import Card from '../common/Card';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Planet from '../space/Planet';

export default function ExamCard({ exam, subject, onRemove, past = false, index = 0 }) {
  const color = colorForSubject(subject);
  const ms = msUntil(exam.date, exam.time);
  const urgent = !past && ms <= 3 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card
        className={`p-4 flex items-center gap-3 ${past ? 'opacity-50' : ''} ${
          urgent ? 'ring-2 ring-flare-400/70' : ''
        }`}
      >
        {urgent ? (
          <span className="w-11 h-11 shrink-0 rounded-2xl grid place-items-center bg-flare-500/18">
            <AlertTriangle size={19} className="text-flare-400" />
          </span>
        ) : (
          <Planet color={color} size={40} />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink-50 truncate">{exam.name}</p>
          <p className="text-xs text-ink-400 font-semibold truncate">
            {subject?.name || 'General'} · {formatDayMonth(exam.date)}
            {exam.time ? ` · ${exam.time}` : ''}
          </p>
        </div>
        {!past ? (
          <p className={`font-display text-lg shrink-0 ${urgent ? 'text-flare-400' : 'text-ink-200'}`}>
            {formatCountdown(ms)}
          </p>
        ) : (
          <span className="text-xs font-bold text-ink-500 shrink-0">Past</span>
        )}
        <ConfirmIconButton onConfirm={onRemove} />
      </Card>
    </motion.div>
  );
}
