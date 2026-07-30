import { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, type NativeSyntheticEvent, type TextInputKeyPressEventData } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ACCENT_COLOR, AuthColors } from '@/constants/Colors';

const CODE_LENGTH = 6;

type AuthCodeInputProps = {
  value: string;
  onChange: (code: string) => void;
};

export default function AuthCodeInput({ value, onChange }: AuthCodeInputProps) {
  const colorScheme = useColorScheme();
  const colors = AuthColors[colorScheme];
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '');

  const focusBox = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      // Pasted or autofilled content — spread it across the remaining boxes.
      const chars = text.split('');
      const next = boxes.slice();
      let lastFilled = index;
      chars.forEach((char, offset) => {
        const targetIndex = index + offset;
        if (targetIndex < CODE_LENGTH) {
          next[targetIndex] = char;
          lastFilled = targetIndex;
        }
      });
      onChange(next.join('').slice(0, CODE_LENGTH));
      focusBox(Math.min(lastFilled + 1, CODE_LENGTH - 1));
      return;
    }

    const next = boxes.slice();
    next[index] = text;
    onChange(next.join(''));

    if (text.length === 1 && index < CODE_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && boxes[index] === '' && index > 0) {
      const next = boxes.slice();
      next[index - 1] = '';
      onChange(next.join(''));
      focusBox(index - 1);
    }
  };

  return (
    <View style={styles.row}>
      {boxes.map((char, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          value={char}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
          maxLength={CODE_LENGTH}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          selectTextOnFocus
          style={[
            styles.box,
            {
              backgroundColor: colors.inputBackground,
              borderColor: focusedIndex === index ? ACCENT_COLOR : colors.inputBorder,
              color: colors.text,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  box: {
    flex: 1,
    minWidth: 0,
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
