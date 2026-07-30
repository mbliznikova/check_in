import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ACCENT_COLOR, AuthColors } from '@/constants/Colors';

type AuthShellProps = {
  children: React.ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
};

export default function AuthShell({ children, cardStyle }: AuthShellProps) {
  const colorScheme = useColorScheme();
  const colors = AuthColors[colorScheme];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.centerWrap}>
        <View style={styles.column}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <IconSymbol name="checkmark.circle.fill" size={18} color="#fff" />
            </View>
            <Text style={[styles.wordmark, { color: colors.text }]}>Check In</Text>
          </View>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
              cardStyle,
            ]}
          >
            {children}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  column: {
    width: '100%',
    maxWidth: 380,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 40,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: ACCENT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 19,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 36,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
});
