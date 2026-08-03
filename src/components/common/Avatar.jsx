/** Flat colored circular avatar — Google Tasks/Gmail style leading icon for list rows. */
export default function Avatar({ color, size = 40, label, icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 font-medium ${className}`}
      style={{
        width: size,
        height: size,
        background: color.container,
        color: color.on,
        fontSize: size * 0.42,
      }}
    >
      {icon ? (
        <span className="msym" style={{ width: size * 0.55, height: size * 0.55 }} dangerouslySetInnerHTML={{ __html: icon }} />
      ) : (
        label
      )}
    </span>
  );
}
