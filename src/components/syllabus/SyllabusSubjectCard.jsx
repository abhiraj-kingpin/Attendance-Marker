import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { colorForSubject } from '../../lib/colors';
import Card from '../common/Card';
import { OrbitRing } from '../common/OrbitProgress';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Planet from '../space/Planet';

export default function SyllabusSubjectCard({ subject, topics, onAddTopic, onToggleTopic, onRemoveTopic, index }) {
  const [open, setOpen] = useState(index === 0);
  const [draft, setDraft] = useState('');
  const color = colorForSubject(subject);

  const done = topics.filter((t) => t.done).length;
  const total = topics.length;
  const pct = total === 0 ? 0 : (done / total) * 100;

  function submitTopic() {
    if (!draft.trim()) return;
    onAddTopic(draft);
    setDraft('');
  }

  return (
    <Card className="p-4">
      <button className="w-full flex items-center gap-3 min-h-11" onClick={() => setOpen((o) => !o)}>
        <OrbitRing value={pct} size={46} strokeWidth={4} color={color.strong} trackColor="rgba(255,255,255,0.08)">
          <Planet color={color} size={24} ring={false} />
        </OrbitRing>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-bold text-ink-50 truncate">{subject.name}</p>
          <p className="text-xs text-ink-400 font-semibold">
            {total === 0 ? 'No topics yet' : `${done}/${total} topics · ${pct.toFixed(0)}%`}
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-ink-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4 flex flex-col gap-2">
              {topics.map((topic) => (
                <motion.div
                  layout
                  key={topic.id}
                  className="flex items-center gap-1 bg-white/5 rounded-2xl pl-3 pr-1.5 py-1.5"
                >
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onToggleTopic(topic.id)}
                    className="w-11 h-11 shrink-0 grid place-items-center"
                    aria-label={topic.done ? 'Mark topic incomplete' : 'Mark topic complete'}
                  >
                    <span
                      className="w-5 h-5 rounded-md grid place-items-center border-2"
                      style={
                        topic.done
                          ? { background: color.strong, borderColor: color.strong }
                          : { borderColor: 'rgba(255,255,255,0.25)', background: 'transparent' }
                      }
                    >
                      <AnimatePresence>
                        {topic.done && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check size={12} className="text-space-950" strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </motion.button>
                  <span
                    className={`flex-1 text-sm font-semibold ${
                      topic.done ? 'text-ink-500 line-through' : 'text-ink-100'
                    }`}
                  >
                    {topic.title}
                  </span>
                  <ConfirmIconButton onConfirm={() => onRemoveTopic(topic.id)} size={13} />
                </motion.div>
              ))}

              <div className="flex gap-2 mt-1">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitTopic()}
                  placeholder="Add a topic or unit..."
                  className="flex-1 rounded-2xl border border-white/15 bg-white/5 focus:border-nova-400 outline-none px-3.5 py-2.5 text-sm font-semibold text-ink-50 placeholder:text-ink-500"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={submitTopic}
                  className="w-11 h-11 shrink-0 grid place-items-center rounded-2xl bg-gradient-to-br from-nova-500 to-comet-500 text-white shadow-glow-nova"
                  aria-label="Add topic"
                >
                  <Plus size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
