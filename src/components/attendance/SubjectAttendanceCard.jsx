import { motion } from 'framer-motion';
import { TrendingDown, ShieldCheck } from 'lucide-react';
import { colorForSubject } from '../../lib/colors';
import Card from '../common/Card';
import { OrbitRing } from '../common/OrbitProgress';
import Planet from '../space/Planet';

export default function SubjectAttendanceCard({ subject, stats, index }) {
  const color = colorForSubject(subject);
  const { held, attended, missed, percentage, status, canMiss, mustAttend } = stats;

  const safe = status === 'safe';
  const ringColor = held === 0 ? '#635C8F' : safe ? '#34D399' : status === 'risk' ? '#FB7185' : '#635C8F';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <OrbitRing value={percentage ?? 0} size={54} strokeWidth={5} color={ringColor} trackColor="rgba(255,255,255,0.08)">
            <Planet color={color} size={30} ring={false} />
          </OrbitRing>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink-50 truncate">{subject.name}</p>
            <p className="text-xs text-ink-400 font-semibold">
              {attended} attended · {missed} missed · {held} held
            </p>
          </div>
          <p className="font-display text-2xl shrink-0" style={{ color: ringColor }}>
            {percentage === null ? '—' : `${percentage.toFixed(1)}%`}
          </p>
        </div>

        {held > 0 && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold ${
              safe ? 'bg-aurora-500/12 text-aurora-400' : 'bg-flare-500/12 text-flare-400'
            }`}
          >
            {safe ? <ShieldCheck size={17} className="shrink-0" /> : <TrendingDown size={17} className="shrink-0" />}
            {safe ? (
              canMiss > 0 ? (
                <span>Safe — you can miss {canMiss} more class{canMiss === 1 ? '' : 'es'}</span>
              ) : (
                <span>Right on the edge — don't miss the next one</span>
              )
            ) : (
              <span>
                At risk — attend the next {mustAttend} class{mustAttend === 1 ? '' : 'es'} in a row to reach 75%
              </span>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
