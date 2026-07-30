import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ACCENT_COLOR, AuthColors } from '@/constants/Colors';

type AuthTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
  containerStyle?: StyleProp<ViewStyle>;
};

export default function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType,
  containerStyle,
}: AuthTextFieldProps) {
  const colorScheme = useColorScheme();
  const colors = AuthColors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.label }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBackground,
            borderColor: isFocused ? ACCENT_COLOR : colors.inputBorder,
            color: colors.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
});
