import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { mixpanel } from '@/utils/mixpanel';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ACCENT_COLOR, LandingColors } from '@/constants/Colors';

// The CTA band stays a fixed dark navy regardless of theme — it's an
// intentional high-contrast band in the design, with no light variant.
const DARK_BAND = '#151b26';

const CONTAINER_MAX_WIDTH = 1160;
const WIDE_BREAKPOINT = 760;

// Real screenshot pixel dimensions — used to compute an explicit height from
// the measured container width. Image + resizeMode="contain" doesn't reliably
// respect a CSS `aspectRatio` on web, so we compute pixel height ourselves.
const WEB_SCREENSHOT_HEIGHT_RATIO = 1316 / 2000;
const PHONE_SCREENSHOT_WIDTH = 195;
const PHONE_SCREENSHOT_HEIGHT = Math.round(PHONE_SCREENSHOT_WIDTH * (2000 / 924));

function WebDashboardScreenshot({ source }: { source: number }) {
  const [width, setWidth] = useState(0);
  return (
    <View style={styles.webScreenshotWrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Image
          source={source}
          resizeMode="contain"
          style={[styles.webScreenshot, { width, height: width * WEB_SCREENSHOT_HEIGHT_RATIO }]}
        />
      )}
    </View>
  );
}

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

export default function LandingPage() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [featuresY, setFeaturesY] = useState(0);
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;
  const colorScheme = useColorScheme();
  const colors = LandingColors[colorScheme];

  const goSignUp = (location: string) => {
    mixpanel.track('Landing CTA Clicked', { location });
    router.push('/sign-up');
  };

  const goSignIn = (location: string) => {
    mixpanel.track('Landing Sign In Clicked', { location });
    router.push('/sign-in');
  };

  const goFeatures = (location: string) => {
    mixpanel.track('Landing Product Clicked', { location });
    scrollRef.current?.scrollTo({ y: featuresY, animated: true });
  };

  const handleFeaturesLayout = (e: LayoutChangeEvent) => {
    setFeaturesY(e.nativeEvent.layout.y);
  };

  useEffect(() => {
    mixpanel.track('Landing Page Viewed');
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        {/* Top bar */}
        <View style={[styles.container, styles.topBar]}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" />
            </View>
            <Text style={[styles.wordmark, { color: colors.text }]}>Check In</Text>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={() => goFeatures('nav')}>
              <Text style={[styles.linkText, { color: colors.text }]}>Product</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goSignIn('nav')}>
              <Text style={[styles.linkText, { color: colors.text }]}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navPillButton, { backgroundColor: colors.text }]}
              onPress={() => goSignUp('nav')}
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
            <TouchableOpacity style={styles.primaryButton} onPress={() => goSignUp('hero')}>
              <Text style={styles.primaryButtonText}>Get started</Text>
            </TouchableOpacity>
            <Text style={[styles.heroCaption, { color: colors.textMuted }]}>
            Built for dance, martial arts, music, and other class-based studios.
            </Text>
          </View>
          <View style={[styles.heroImageWrap, isWide && styles.heroImageWrapWide]}>
            <WebDashboardScreenshot source={require('../docs/images/landing/web-check-in.png')} />
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
          </Text>
          <View style={[styles.showcaseRow, isWide && styles.showcaseRowWide]}>
            <View style={[styles.showcaseItem, isWide && styles.showcaseItemWide]}>
              <WebDashboardScreenshot source={require('../docs/images/landing/web-occurrences.png')} />
              <Text style={[styles.showcaseCaption, { color: colors.textMuted }]}>Web dashboard</Text>
            </View>
            <View style={styles.showcaseItem}>
              <Image
                source={require('../docs/images/landing/mobile-check-in.png')}
                style={styles.phoneScreenshot}
                resizeMode="contain"
              />
              <Text style={[styles.showcaseCaption, { color: colors.textMuted }]}>Mobile check-in</Text>
            </View>
          </View>
        </View>

        {/* CTA band */}
        <View style={styles.ctaBand}>
          <Text style={styles.ctaTitle}>Ready to simplify attendance?</Text>
          <Text style={styles.ctaSubtitle}>Get started free — no credit card required.</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => goSignUp('cta_band')}>
            <Text style={styles.ctaButtonText}>Get started</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.container, styles.footer]}>
          <View style={styles.brandRow}>
            <View style={styles.logoMarkSmall} />
            <Text style={[styles.wordmark, { color: colors.text }]}>Check In</Text>
          </View>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => goFeatures('footer')}>
              <Text style={[styles.linkText, { color: colors.text }]}>Product</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goSignIn('footer')}>
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
    alignItems: 'flex-start',
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
  webScreenshotWrap: {
    width: '100%',
  },
  webScreenshot: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
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
    maxWidth: 680,
  },
  showcaseCaption: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
  },
  phoneScreenshot: {
    width: PHONE_SCREENSHOT_WIDTH,
    height: PHONE_SCREENSHOT_HEIGHT,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
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
