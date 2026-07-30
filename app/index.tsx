import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useUserRole } from '@/context/UserContext';
import LandingPage from '@/components/LandingPage';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading } = useUserRole();

  if (!isLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  return <Redirect href={role === null ? '/schools' : '/check-in'} />;
}
