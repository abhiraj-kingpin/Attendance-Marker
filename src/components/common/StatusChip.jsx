export default function StatusChip({ label, icon, container, on, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${className}`}
      style={{ background: container, color: on }}
    >
      {icon && <span className="msym" style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: icon }} />}
      {label}
    </span>
  );
}
