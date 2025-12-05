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
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? styles.lightColor : styles.darkColor;

  const onSignUpPress = async () => {
    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  function renderVerifyForm() {
    return (
      <View>

        <View style={styles.titleTextContainer}>
          <Text style={[textColor, styles.titleText]}>Verify your email</Text>
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
    )
  };

  function renderSignUpForm() {
    return (
      <View>

        <View style={styles.titleTextContainer}>
          <Text style={[textColor, styles.titleText]}>Sign up to CHECK_IN</Text>
        </View>

        <View style={[styles.itemContainer]}>
          <TextInput
            autoCapitalize='none'
            value={emailAddress}
            placeholder='Enter email'
            placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
            onChangeText={(email) => setEmailAddress(email)}
            style={[textColor, styles.inputFeld]}
          />
          <TextInput
            value={password}
            placeholder='Enter password'
            placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
            style={[textColor, styles.inputFeld]}
          />
        </View>

        <View style={styles.itemContainer}>
          <TouchableOpacity
            onPress={onSignUpPress}
            style={[styles.button]}
          >
            <Text style={textColor}>Continue</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
            <Text style={[textColor, styles.regularText]}>Already have an account? </Text>
            <Link href="/sign-in">
              <Text style={[textColor, styles.signInText, styles.regularText]}>Sign in</Text>
            </Link>
          </View>
        </View>

      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {pendingVerification ? renderVerifyForm() : renderSignUpForm()}
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
  titleTextContainer: {
    alignItems: 'center',
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
