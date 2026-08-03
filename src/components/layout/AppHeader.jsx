export default function AppHeader({ title, subtitle, right }) {
  return (
    <header className="sticky top-0 z-20 safe-top bg-surface-variant">
      <div className="mx-auto max-w-lg px-5 pt-6 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[26px] font-medium text-on-surface leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-on-surface-tertiary mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
      </div>
    </header>
  );
}
