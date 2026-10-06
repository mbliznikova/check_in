import { Redirect } from 'expo-router';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useUserRole } from '@/context/UserContext';
import LandingPage from '@/components/LandingPage';
import LoadErrorView from '@/components/LoadErrorView';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading, error, retrySetup } = useUserRole();

  if (!isLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <LoadErrorView message={error} onRetry={retrySetup} />;
  }

  if (!isSignedIn) {
    if (Platform.OS === 'web') {
      return <LandingPage />;
    }
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href={role === null ? '/schools' : '/check-in'} />;
}
