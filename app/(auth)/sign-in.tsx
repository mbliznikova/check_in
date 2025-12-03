import { useSignIn } from '@clerk/clerk-expo'
import { SignIn } from '@clerk/clerk-expo/web'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, useColorScheme, StyleSheet } from 'react-native'
import React from 'react'

export default function Page() {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <SignIn />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    },
  itemContainer: {
      padding: 10,
      alignItems: 'center',
  },
  itemRow: {
      flexDirection: 'row'
  },
  darkColor: {
      color: 'black',
  },
  lightColor: {
      color: 'white',
  },
  inputFeld: {
      height: 30,
      width: 200,
      borderWidth: 1,
      borderColor: 'gray',
      padding: 10,
      borderRadius: 15,
      margin: 10,
  },
});
