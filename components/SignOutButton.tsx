import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? styles.lightColor : styles.darkColor;

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      Linking.openURL(Linking.createURL('/'))
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
      <Text style={textColor}>Sign out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  darkColor: {
      color: 'black',
  },
  lightColor: {
      color: 'white',
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3,
    backgroundColor: 'blue',
    borderRadius: 8,
  },
});
