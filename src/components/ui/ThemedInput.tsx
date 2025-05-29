import { useThemeColor } from '@hooks/useThemeColor';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface ThemedInputProps extends TextInputProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedInput({ style, lightColor, darkColor, ...otherProps }: ThemedInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor ?? '#F3F3F3', dark: darkColor ?? '#1A1A1A' }, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <TextInput
      style={[
        styles.input,
        { backgroundColor, color: textColor },
        style,
      ]}
      placeholderTextColor="#999"
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'System',
  },
}); 