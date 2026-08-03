import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { colorForSubject } from '../../lib/colors';
import { ICONS } from '../../lib/icons';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import LinearProgress from '../common/LinearProgress';
import ConfirmIconButton from '../common/ConfirmIconButton';
import Icon from '../common/Icon';

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
      <button
        className="relative w-full flex items-center gap-3 min-h-11 rounded-lg"
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar color={color} size={40} label={subject.name.charAt(0).toUpperCase()} />
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium text-on-surface">{subject.name}</p>
          <p className="text-xs text-on-surface-tertiary">
            {total === 0 ? 'No topics yet' : `${done}/${total} topics · ${pct.toFixed(0)}%`}
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Icon svg={ICONS.arrowDown} size={20} className="text-on-surface-tertiary" />
        </motion.div>
      </button>

      <div className="mt-3">
        <LinearProgress value={pct} color={color.solid} height={6} />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pt-4 flex flex-col gap-2">
              {topics.map((topic) => (
                <motion.div layout key={topic.id} className="flex items-center gap-1 bg-surface-variant-2 rounded-lg pl-3 pr-1.5 py-1.5">
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
                          ? { background: color.solid, borderColor: color.solid }
                          : { borderColor: '#C4C7C5', background: 'transparent' }
                      }
                    >
                      <AnimatePresence>
                        {topic.done && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Icon svg={ICONS.check} size={13} className="text-white" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </motion.button>
                  <span className={`flex-1 text-sm font-medium ${topic.done ? 'text-on-surface-tertiary line-through' : 'text-on-surface'}`}>
                    {topic.title}
                  </span>
                  <ConfirmIconButton onConfirm={() => onRemoveTopic(topic.id)} size={16} />
                </motion.div>
              ))}

              <div className="flex gap-2 mt-1">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitTopic()}
                  placeholder="Add a topic or unit..."
                  className="flex-1 rounded-lg border border-outline-variant bg-surface focus:border-g-blue outline-none px-3.5 py-2.5 text-sm font-medium text-on-surface placeholder:text-on-surface-tertiary"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={submitTopic}
                  className="relative w-11 h-11 shrink-0 grid place-items-center rounded-full bg-g-blue text-white"
                  aria-label="Add topic"
                >
                  <Icon svg={ICONS.add} size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
