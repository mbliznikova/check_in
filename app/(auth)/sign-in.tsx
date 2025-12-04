import { useSignIn } from '@clerk/clerk-expo'
import { SignIn as WebSignIn } from '@clerk/clerk-expo/web'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, useColorScheme, StyleSheet, Platform } from 'react-native'
import React, { useState } from "react";

export default function Page() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, {backgroundColor: isDark ? '#000' : '#fff' }]}>
        <WebSignIn />
    </View>
    );
  }

  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('');

  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  const textColor = isDark ? styles.lightColor : styles.darkColor;

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'needs_second_factor') {
        await signInAttempt.prepareSecondFactor({
          strategy: 'email_code',
        });

        setPendingVerification(true)
        setErrorMsg('')

    } else if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        setErrorMsg('Additional steps required. Check console.');
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setErrorMsg(err?.errors?.[0]?.message ?? 'Sign-in failed');
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded || !pendingVerification) return;

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        setErrorMsg('Verification incomplete. Check console.');
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.message ?? 'Verification failed');
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>

        <View style={styles.titleTextContainer}>
          <Text>Verify your email</Text>
        </View>

        <View style={[styles.itemContainer]}>
          <TextInput
            value={code}
            placeholder='Enter your verification code'
            placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
            onChangeText={(code) => setCode(code)}
            style={[textColor, styles.inputFeld]}
          />
      </View>

        <View>
          <View style={styles.itemContainer}>
            <TouchableOpacity
              onPress={onVerifyPress}
              style={[styles.button]}
            >
              <Text style={textColor}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={[styles.itemContainer]}>

        <View style={styles.titleTextContainer}>
          <Text style={[textColor, styles.titleText]}>Sign in to CHECK_IN</Text>
        </View>
        <TextInput
          autoCapitalize='none'
          value={emailAddress}
          placeholder='Enter email'
          placeholderTextColor={isDark ? '#999' : '#666'}
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          style={[textColor, styles.inputFeld]}
        />
        <TextInput
          value={password}
          placeholder='Enter password'
          placeholderTextColor={isDark ? '#999' : '#666'}
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          style={[textColor, styles.inputFeld]}
        />
        {errorMsg.length > 0 && (
          <Text style={[styles.errorText]}>{errorMsg}</Text>
        )}
      </View>

      <View>
        <View style={styles.itemContainer}>
          <TouchableOpacity
            onPress={onSignInPress}
            style={[styles.button]}
          >
            <Text style={textColor}>Continue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemContainer}>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
            <Link href="/sign-up">
              <Text style={[textColor, styles.regularText]}>Don't have an account? </Text>
              <Text style={[textColor, styles.signUpText, styles.regularText]}>Sign up</Text>
            </Link>
          </View>
        </View>

      </View>
    </View>
  );
};

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
  titleTextContainer: {
    margin: 10,
    paddingBottom: 10,
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'heavy',
  },
  regularText: {
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  signUpText: {
    color: 'blue',
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3,
    backgroundColor: 'blue',
    borderRadius: 8,
},
});
