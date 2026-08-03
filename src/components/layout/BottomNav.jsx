import { TABS } from '../../lib/tabs';
import { NAV_ICONS } from '../../lib/icons';
import Icon from '../common/Icon';

function NavTab({ tab, isActive, onChange }) {
  const icons = NAV_ICONS[tab.icon];

  return (
    <button
      onClick={() => onChange(tab.key)}
      className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-14 rounded-2xl"
      aria-label={tab.label}
    >
      <span className="relative flex items-center justify-center w-16 h-8">
        {isActive && <span className="absolute inset-0 bg-g-blue-container rounded-full" />}
        <Icon
          svg={isActive ? icons.filled : icons.outlined}
          size={24}
          className={`relative z-10 ${isActive ? 'text-g-blue-dark' : 'text-on-surface-tertiary'}`}
        />
      </span>
      <span className={`text-[12px] font-medium ${isActive ? 'text-g-blue-dark' : 'text-on-surface-tertiary'}`}>
        {tab.label}
      </span>
    </button>
  );
}

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="gpu-layer fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-outline-variant safe-bottom">
      <div className="mx-auto max-w-lg flex items-stretch justify-between px-1">
        {TABS.map((tab) => (
          <NavTab key={tab.key} tab={tab} isActive={tab.key === active} onChange={onChange} />
        ))}
      </div>
    </nav>
  );
}
