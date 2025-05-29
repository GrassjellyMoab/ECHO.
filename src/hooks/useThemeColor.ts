import { useColorScheme } from 'react-native';

interface ColorScheme {
  light?: string;
  dark?: string;
}

export function useThemeColor(props: ColorScheme, colorName: 'background' | 'text') {
  const theme = useColorScheme() ?? 'light';
  const colorSet = {
    background: { light: '#FFFFFF', dark: '#000000' },
    text: { light: '#000000', dark: '#FFFFFF' },
  };

  return props[theme] ?? colorSet[colorName][theme];
} 