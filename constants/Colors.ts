/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const TOGGLE_COLOR = '#1a73e8';
export const TOGGLE_TEXT = '#fff';
export const INPUT_BORDER_COLOR = 'gray';
export const DESTRUCTIVE_COLOR = 'indianred';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#e0e0e0',
    textMuted: '#777',
  },
  dark: {
    text: '#ECEDEE',
    background: 'rgb(1, 1, 1)',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#333',
    textMuted: '#888',
  },
};

// Palette for components/LandingPage.tsx — a marketing page with its own
// distinct look (off-white background, different muted tone), kept separate
// from the in-app Colors above so it doesn't affect other screens.
export const LandingColors = {
  light: {
    background: '#f8f9fb',
    featureBg: '#eef0f5',
    text: '#12181f',
    textMuted: '#5b6672',
    eyebrowBg: '#e7edff',
  },
  dark: {
    background: '#000',
    featureBg: '#15171c',
    text: '#fff',
    textMuted: '#9aa1ac',
    eyebrowBg: '#182238',
  },
};

// Shared brand accent for the marketing/auth surfaces (landing page + sign-in/
// sign-up/verify). Fixed across light and dark so the blue can't diverge.
export const ACCENT_COLOR = '#156CDD';

// Palette for the Sign In / Sign Up / Verify screens (components/AuthShell.tsx
// and friends) — mirrors the LandingColors pattern above, kept separate from
// the in-app Colors so it doesn't affect other screens.
export const AuthColors = {
  light: {
    background: '#F6F9FC',
    cardBackground: '#FFFFFF',
    cardBorder: '#DFE1E5',
    text: '#0C121A',
    textMuted: '#4F5661',
    label: '#343B45',
    inputBackground: '#F7F8FA',
    inputBorder: '#D5D7DB',
    placeholder: '#7D8086',
  },
  dark: {
    background: '#000000',
    cardBackground: '#111318',
    cardBorder: '#2A2E37',
    text: '#ECEDEE',
    textMuted: '#9AA1AC',
    label: '#C6CBD3',
    inputBackground: '#181B21',
    inputBorder: '#333333',
    placeholder: '#6B7280',
  },
};
