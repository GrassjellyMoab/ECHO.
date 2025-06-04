import { AntDesign, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

type IconLibrary = 'ionicons' | 'antdesign' | 'materialicons' | 'fontawesome6';
type IoniconsGlyph = keyof typeof Ionicons.glyphMap;
type AntDesignGlyph = keyof typeof AntDesign.glyphMap;
type MaterialIconsGlyph = keyof typeof MaterialIcons.glyphMap;
type FontAwesome6Glyph = keyof typeof FontAwesome6.glyphMap;

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  library?: IconLibrary;
}

const iconMap: Record<string, { name: IoniconsGlyph | AntDesignGlyph | MaterialIconsGlyph | FontAwesome6Glyph; library: IconLibrary }> = {
  'home': { name: 'home', library: 'ionicons' },
  'home-outline': { name: 'home-outline', library: 'ionicons' },
  'search': { name: 'search', library: 'ionicons' }, 
  'search-outline': { name: 'search-outline', library: 'ionicons' },
  'add': { name: 'add', library: 'ionicons' },
  'podium': { name: 'podium', library: 'ionicons' },
  'podium-outline': { name: 'podium-outline', library: 'ionicons' },
  'person': { name: 'person', library: 'ionicons' },
  'person-outline': { name: 'person-outline', library: 'ionicons' },
  'chevron.up': { name: 'chevron-up', library: 'ionicons' },
  'chevron.down': { name: 'chevron-down', library: 'ionicons' },
  'chevron.left': { name: 'chevron-left', library: 'ionicons' },

  'paperplane.fill': { name: 'paper-plane', library: 'ionicons' },
  'chevron.left.forwardslash.chevron.right': { name: 'code', library: 'ionicons' },
  'app': { name: 'apps', library: 'ionicons' },
  'photo': { name: 'image', library: 'ionicons' },
  'checkmark.circle.fill' : { name: 'shield-checkmark', library: 'ionicons' },
  'eye': { name: 'eye', library: 'ionicons' },
  'message': { name: 'message1', library: 'antdesign' },
  'arrow.up': { name: 'how-to-vote', library: 'materialicons' },
  'crown.fill': { name: 'crown', library: 'fontawesome6' },
};

export function IconSymbol({ name, size = 24, color = '#000000', style }: IconSymbolProps) {
  const iconConfig = iconMap[name] || { name: 'help-circle', library: 'ionicons' };
  
  if (iconConfig.library === 'antdesign') {
    return (
      <AntDesign
        name={iconConfig.name as AntDesignGlyph}
        size={size}
        color={color}
        style={style}
      />
    );
  } else if (iconConfig.library === 'materialicons') {
    return (
      <MaterialIcons
        name={iconConfig.name as MaterialIconsGlyph}
        size={size}
        color={color}
        style={style}
      />
    );
  } else if (iconConfig.library === 'fontawesome6') {
    return (
      <FontAwesome6
        name={iconConfig.name as FontAwesome6Glyph}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  // Default to Ionicons
  return (
    <Ionicons
      name={iconConfig.name as IoniconsGlyph}
      size={size}
      color={color}
      style={style}
    />
  );
}