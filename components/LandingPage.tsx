import { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ACCENT_COLOR, LandingColors } from '@/constants/Colors';

// The CTA band stays a fixed dark navy regardless of theme — it's an
// intentional high-contrast band in the design, with no light variant.
const DARK_BAND = '#151b26';

const CONTAINER_MAX_WIDTH = 1160;
const WIDE_BREAKPOINT = 760;

const FEATURES: { icon: IconSymbolName; title: string; description: string }[] = [
  {
    icon: 'checkmark.circle.fill',
    title: 'Attendance tracking',
    description: "One-tap check-in, plus history so you can see who's consistent and who's slipping.",
  },
  {
    icon: 'person.2.fill',
    title: 'Student & class management',
    description: 'Organize students by class, level, and instructor. Move them anytime.',
  },
  {
    icon: 'dollarsign.circle.fill',
    title: 'Payment tracking',
    description: "Keep tabs on who's paid and who owes, per student.",
  },
  {
    icon: 'calendar',
    title: 'Scheduling',
    description: 'Set up classes and sessions on a weekly schedule.',
  },
];

function BrowserWindowFrame({ url, label }: { url: string; label: string }) {
  return (
    <View style={styles.browserFrame}>
      <View style={styles.browserTabBar}>
        <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
        <View style={[styles.dot, { backgroundColor: '#febc2e' }]} />
        <View style={[styles.dot, { backgroundColor: '#28c840' }]} />
        <View style={styles.browserTab}>
          <Text style={styles.browserTabText}>New Tab</Text>
        </View>
      </View>
      <View style={styles.browserAddressRow}>
        <View style={styles.addressDot} />
        <View style={styles.browserAddressBar}>
          <Text style={styles.browserAddressText} numberOfLines={1}>{url}</Text>
        </View>
        <View style={styles.addressDot} />
      </View>
      <View style={styles.browserBody}>
        <Text style={styles.placeholderText}>{label}</Text>
      </View>
    </View>
  );
}

function PhoneFrame({ label }: { label: string }) {
  return (
    <View style={styles.phoneFrame}>
      <View style={styles.phoneStatusBar}>
        <Text style={styles.phoneTime}>9:41</Text>
        <View style={styles.phoneStatusIcons}>
          <View style={styles.signalBars}>
            <View style={[styles.signalBar, { height: 4 }]} />
            <View style={[styles.signalBar, { height: 6 }]} />
            <View style={[styles.signalBar, { height: 8 }]} />
            <View style={[styles.signalBar, { height: 10 }]} />
          </View>
          <View style={styles.wifiIcon} />
          <View style={styles.batteryIcon} />
        </View>
      </View>
      <View style={styles.phoneScreen}>
        <Text style={styles.placeholderTextDark}>{label}</Text>
      </View>
      <View style={styles.phoneHomeIndicator} />
    </View>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [featuresY, setFeaturesY] = useState(0);
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;
  const colorScheme = useColorScheme();
  const colors = LandingColors[colorScheme];

  const scrollToFeatures = () => {
    scrollRef.current?.scrollTo({ y: featuresY, animated: true });
  };

  const handleFeaturesLayout = (e: LayoutChangeEvent) => {
    setFeaturesY(e.nativeEvent.layout.y);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        {/* Top bar */}
        <View style={[styles.container, styles.topBar]}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" />
            </View>
            <Text style={[styles.wordmark, { color: colors.text }]}>Check_in</Text>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={scrollToFeatures}>
              <Text style={[styles.linkText, { color: colors.text }]}>Product</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text style={[styles.linkText, { color: colors.text }]}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navPillButton, { backgroundColor: colors.text }]}
              onPress={() => router.push('/sign-up')}
            >
              <Text style={[styles.navPillButtonText, { color: colors.background }]}>Get started</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero */}
        <View style={[styles.container, styles.hero, isWide && styles.heroWide]}>
          <View style={[styles.heroText, isWide && styles.heroTextWide]}>
            <View style={[styles.eyebrow, { backgroundColor: colors.eyebrowBg }]}>
              <Text style={styles.eyebrowText}>Attendance for studios</Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Know who showed up. Every class, every time.
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
              Runs in any browser — nothing to install — with mobile apps for the studio floor.
              Attendance, rosters, payments, and scheduling, from the front desk or your phone.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/sign-up')}>
              <Text style={styles.primaryButtonText}>Get started</Text>
            </TouchableOpacity>
            <Text style={[styles.heroCaption, { color: colors.textMuted }]}>
              Built for dance, music, and art studios.
            </Text>
          </View>
          <View style={[styles.heroImageWrap, isWide && styles.heroImageWrapWide]}>
            <BrowserWindowFrame url="app.checkin.app/classes" label="dashboard screenshot" />
          </View>
        </View>

        {/* Feature grid */}
        <View
          style={[styles.featureSection, { backgroundColor: colors.featureBg }]}
          onLayout={handleFeaturesLayout}
        >
          <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Everything a studio needs to track attendance
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Replaces the paper roster, the spreadsheet, and the group chat.
            </Text>
            <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
              {FEATURES.map((feature) => (
                <View key={feature.title} style={[styles.featureItem, isWide && styles.featureItemWide]}>
                  <View style={styles.featureIcon}>
                    <IconSymbol name={feature.icon} size={22} color="#fff" />
                  </View>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                  <Text style={[styles.featureDescription, { color: colors.textMuted }]}>
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Product showcase */}
        <View style={[styles.container, styles.section]}>
          <Text style={[styles.sectionTitle, styles.centeredText, { color: colors.text }]}>
            One system, front desk to phone
          </Text>
          <Text style={[styles.sectionSubtitle, styles.centeredText, { color: colors.textMuted }]}>
            Run the full dashboard at the front desk, or check students in from the studio floor.
            Real screenshots coming soon.
          </Text>
          <View style={[styles.showcaseRow, isWide && styles.showcaseRowWide]}>
            <View style={[styles.showcaseItem, isWide && styles.showcaseItemWide]}>
              <BrowserWindowFrame url="app.checkin.app/occurrences" label="weekly schedule screenshot" />
              <Text style={[styles.showcaseCaption, { color: colors.textMuted }]}>Web dashboard</Text>
            </View>
            <View style={styles.showcaseItem}>
              <PhoneFrame label="check-in screen screenshot" />
              <Text style={[styles.showcaseCaption, { color: colors.textMuted }]}>Mobile check-in</Text>
            </View>
          </View>
        </View>

        {/* CTA band */}
        <View style={styles.ctaBand}>
          <Text style={styles.ctaTitle}>Ready to simplify attendance?</Text>
          <Text style={styles.ctaSubtitle}>Get started free — no credit card required.</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/sign-up')}>
            <Text style={styles.ctaButtonText}>Get started</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.container, styles.footer]}>
          <View style={styles.brandRow}>
            <View style={styles.logoMarkSmall} />
            <Text style={[styles.wordmark, { color: colors.text }]}>Check_in</Text>
          </View>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={scrollToFeatures}>
              <Text style={[styles.linkText, { color: colors.text }]}>Product</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text style={[styles.linkText, { color: colors.text }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    width: '100%',
    maxWidth: CONTAINER_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: ACCENT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkSmall: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: ACCENT_COLOR,
  },
  wordmark: {
    fontSize: 17,
    fontWeight: '600',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
  },
  navPillButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  navPillButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    flexDirection: 'column',
    paddingTop: 32,
    paddingBottom: 44,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  heroText: {
    width: '100%',
  },
  heroTextWide: {
    flex: 1,
  },
  heroImageWrap: {
    marginTop: 28,
  },
  heroImageWrapWide: {
    flex: 1,
    maxWidth: 480,
    marginTop: 0,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: ACCENT_COLOR,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 22,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 100,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroCaption: {
    fontSize: 13,
    marginTop: 18,
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#8a8f98',
  },
  placeholderTextDark: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#9aa0ac',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  browserFrame: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  browserTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1c1f26',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  browserTab: {
    marginLeft: 8,
    backgroundColor: '#2c303a',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  browserTabText: {
    fontSize: 11,
    color: '#c6cad2',
  },
  browserAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14161b',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3a3f4a',
  },
  browserAddressBar: {
    flex: 1,
    backgroundColor: '#2c303a',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  browserAddressText: {
    fontSize: 11,
    color: '#c6cad2',
  },
  browserBody: {
    height: 220,
    backgroundColor: '#e9ebef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingTop: 56,
  },
  featureSection: {
    paddingVertical: 56,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 32,
  },
  centeredText: {
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'column',
  },
  featureGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    marginBottom: 24,
  },
  featureItemWide: {
    width: '25%',
    paddingRight: 24,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: ACCENT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  showcaseRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  showcaseRowWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 56,
  },
  showcaseItem: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    marginBottom: 32,
  },
  showcaseItemWide: {
    flex: 1,
  },
  showcaseCaption: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
  },
  phoneFrame: {
    width: 220,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0b0b0d',
    borderWidth: 6,
    borderColor: '#0b0b0d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  phoneStatusBar: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  phoneTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  phoneStatusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
    height: 10,
  },
  signalBar: {
    width: 2.5,
    borderRadius: 1,
    backgroundColor: '#fff',
  },
  wifiIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  batteryIcon: {
    width: 16,
    height: 9,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  phoneScreen: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneHomeIndicator: {
    alignSelf: 'center',
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  ctaBand: {
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: DARK_BAND,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaSubtitle: {
    color: '#c7d0e0',
    fontSize: 15,
    marginBottom: 22,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 100,
  },
  ctaButtonText: {
    color: DARK_BAND,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    rowGap: 12,
    columnGap: 16,
    paddingVertical: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  copyright: {
    fontSize: 13,
  },
});
