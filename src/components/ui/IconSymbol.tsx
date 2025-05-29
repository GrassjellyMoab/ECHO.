import { Ionicons } from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

const iconMap: Record<string, string> = {
  'house.fill': 'home',
  'paperplane.fill': 'paper-plane',
  'chevron.up': 'chevron-up',
  'chevron.down': 'chevron-down',
  'chevron.left.forwardslash.chevron.right': 'code',
  'app': 'apps',
  'photo': 'image',
};

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function IconSymbol({ name, size = 24, color = '#000000', style }: IconSymbolProps) {
  const ionIconName = iconMap[name] || 'help-circle';
  
  return (
    <Ionicons
      name={ionIconName as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
      style={style}
    />
  );
} 