/**
 * Renders a Material Symbols SVG (imported elsewhere via `?raw`) at a fixed
 * box size, colored via currentColor — see src/lib/icons.js for the map of
 * available icons and index.css `.msym svg` for the sizing/color rule.
 */
export default function Icon({ svg, size = 24, className = '', style }) {
  return (
    <span
      className={`msym inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
