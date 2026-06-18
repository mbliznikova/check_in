import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUserRole } from '@/context/UserContext';

export default function Index() {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={role === null ? '/schools' : '/check-in'} />;
}
