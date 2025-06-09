import { AntDesign, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

type IconLibrary = 'ionicons' | 'antdesign' | 'materialicons' | 'materialcommunityicons' | 'fontawesome6' ;
type IoniconsGlyph = keyof typeof Ionicons.glyphMap;
type AntDesignGlyph = keyof typeof AntDesign.glyphMap;
type MaterialIconsGlyph = keyof typeof MaterialIcons.glyphMap;
type FontAwesome6Glyph = keyof typeof FontAwesome6.glyphMap;
type MaterialCommunityGlyph = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  library?: IconLibrary;
}

const iconMap: Record<string, { name: IoniconsGlyph | AntDesignGlyph | MaterialIconsGlyph | MaterialCommunityGlyph | FontAwesome6Glyph ; library: IconLibrary }> = {
  'home': { name: 'home', library: 'ionicons' },
  'home-outline': { name: 'home-outline', library: 'ionicons' },
  'search': { name: 'search', library: 'ionicons' }, 
  'search-outline': { name: 'search-outline', library: 'ionicons' },
  'moderate': { name: 'shield-account', library: 'materialcommunityicons' }, 
  'moderate-outline': { name: 'shield-account-outline', library: 'materialcommunityicons' },
  'add': { name: 'add', library: 'ionicons' },
  'podium': { name: 'podium', library: 'ionicons' },
  'podium-outline': { name: 'podium-outline', library: 'ionicons' },
  'person': { name: 'person', library: 'ionicons' },
  'person-outline': { name: 'person-outline', library: 'ionicons' },
  'chevron.up': { name: 'chevron-up', library: 'ionicons' },
  'chevron.down': { name: 'chevron-down', library: 'ionicons' },
  'chevron.back': { name: 'chevron-back', library: 'ionicons' },
  'checkmark-circle': { name: 'checkmark-circle', library: 'ionicons' },
  'close-circle': { name: 'close-circle', library: 'ionicons' },
  'close': { name: 'close', library: 'ionicons' },
  'info': { name: 'circle-info', library: 'fontawesome6' },
  'paperplane.fill': { name: 'paper-plane', library: 'ionicons' },
  'chevron.left.forwardslash.chevron.right': { name: 'code', library: 'ionicons' },
  'app': { name: 'apps', library: 'ionicons' },
  'photo': { name: 'image', library: 'ionicons' },
  'checkmark.circle.fill' : { name: 'shield-checkmark', library: 'ionicons' },
  'eye': { name: 'eye', library: 'ionicons' },
  'message': { name: 'message1', library: 'antdesign' },
  'arrow.up': { name: 'how-to-vote', library: 'materialicons' },
  'crown.fill': { name: 'crown', library: 'fontawesome6' },
  'logout': { name: 'logout', library: 'materialicons' },    
  'arrow-back': { name: 'arrow-back', library: 'ionicons' }, 
  'health': { name: 'health-and-safety', library: 'materialicons' },
  'politics': { name: 'globe', library: 'fontawesome6' },
  'finance': { name: 'finance', library: 'materialcommunityicons' },
  'technology': { name: 'code', library: 'materialicons' },
  'cybersecurity': { name: 'security', library: 'materialicons' },
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
  } else if (iconConfig.library === 'materialcommunityicons') {
    return (
      <MaterialCommunityIcons
        name={iconConfig.name as MaterialCommunityGlyph}
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