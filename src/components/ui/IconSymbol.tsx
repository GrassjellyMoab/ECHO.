import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

const iconMap: Record<string, string> = {
  'home': 'home',
  'home-outline': 'home-outline',
  'search': 'search',
  'search-outline': 'search-outline',
  'add': 'add',
  'podium': 'podium',
  'podium-outline': 'podium-outline',
  'person': 'person',
  'person-outline': 'person-outline',
  'chevron.up': 'chevron-up',
  'chevron.down': 'chevron-down',

  'paperplane.fill': 'paper-plane',
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