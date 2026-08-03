export default function Card({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`rounded-xl bg-surface border border-outline-variant ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
