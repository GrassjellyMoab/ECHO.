import React from 'react';
import { Text, TextProps, TextStyle, useColorScheme } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';
}

const TextStyles: Record<ThemedTextProps['type'] & string, TextStyle> = {
  default: {
    fontSize: 16,
    fontFamily: 'System',
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    fontFamily: 'System',
    textDecorationLine: 'underline',
  },
};

const Colors = {
  light: {
    text: '#000000',
    link: '#007AFF',
  },
  dark: {
    text: '#FFFFFF',
    link: '#0A84FF',
  },
};

export const ThemedText: React.FC<ThemedTextProps> = ({ style, type = 'default', ...props }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const color = type === 'link' ? Colors[colorScheme].link : Colors[colorScheme].text;
  
  return (
    <Text
      style={[
        TextStyles[type],
        { color },
        style,
      ]}
      {...props}
    />
  );
};
