export default function Icon({ svg, size = 24, className = '', style }) {
  return (
    <span
      className={`msym inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
