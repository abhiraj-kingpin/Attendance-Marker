import { View } from 'react-native';

export default function Card({ children, className = '', style }) {
  return (
    <View
      className={`rounded-xl bg-surface border border-outline-variant ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
