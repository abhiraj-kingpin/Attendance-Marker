import Icon from './Icon';

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-10 px-6">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-surface-variant-2 grid place-items-center mb-1">
          <Icon svg={icon} size={30} className="text-on-surface-tertiary" />
        </div>
      )}
      <p className="font-display font-medium text-lg text-on-surface">{title}</p>
      {subtitle && <p className="text-sm text-on-surface-tertiary max-w-xs">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
