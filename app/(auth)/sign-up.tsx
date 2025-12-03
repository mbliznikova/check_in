import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, useColorScheme, StyleSheet } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  const colorScheme = useColorScheme();

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <>
        <Text>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={[styles.itemContainer]}>

        <View style={styles.titleTextContainer}>
          <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.titleText]}>Sign up</Text>
        </View>
        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
          onChangeText={(email) => setEmailAddress(email)}
          style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
        />
        <TextInput
          value={password}
          placeholder="Enter password"
          placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
        />
      </View>

      <View>
        <View style={styles.itemContainer}>
          <TouchableOpacity
            onPress={onSignUpPress}
            style={[styles.button]}
          >
            <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Continue</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.regularText]}>Already have an account? </Text>
            <Link href="/sign-in">
              <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.signInText, styles.regularText]}>Sign in</Text>
            </Link>
          </View>
        </View>

      </View>
    </View>
  )
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
  signInText: {
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
