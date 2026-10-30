import { useClerk } from '@clerk/clerk-expo'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()

  const textStyle = useThemeTextStyle();

  const handleSignOut = async () => {
    try {
      await signOut()
      // (tabs)/_layout.tsx's <SignedOut><Redirect .../></SignedOut> handles navigation
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }
  return (
    <TouchableOpacity
      onPress={handleSignOut}
      style={styles.button}
    >
      <Text style={textStyle}>Sign out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3,
    backgroundColor: 'blue',
    borderRadius: 8,
  },
});
