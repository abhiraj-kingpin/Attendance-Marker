export default function Card({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`rounded-3xl glass-panel shadow-pop-sm ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
