import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider, useUserRole } from '@/context/UserContext';
import '@/utils/mixpanel';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppReadyGate({ fontsLoaded, children }: { fontsLoaded: boolean; children: React.ReactElement }) {
  const { isLoaded: authLoaded } = useAuth();
  const { isLoading: userLoading } = useUserRole();

  // On native, keep the splash screen up until auth/role state resolves too,
  // so we go straight to sign-in/tabs instead of flashing a spinner or the landing page.
  const ready = fontsLoaded && (Platform.OS === 'web' || (authLoaded && !userLoading));

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  return children;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error("Missing Clerk publishable key");
    }

  if (!loaded && Platform.OS !== 'web') {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}>
        <UserProvider>
          <AppReadyGate fontsLoaded={loaded}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
          </AppReadyGate>
        </UserProvider>
    </ClerkProvider>
  );
}
