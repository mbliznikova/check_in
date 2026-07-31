import * as React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthColors, ACCENT_COLOR } from '@/constants/Colors';
import { mixpanel } from '@/utils/mixpanel';
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter, useLocalSearchParams, type Href } from 'expo-router'
import AuthShell from '@/components/AuthShell';
import AuthTextField from '@/components/AuthTextField';
import AuthPrimaryButton from '@/components/AuthPrimaryButton';
import AuthCodeInput from '@/components/AuthCodeInput';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  const colorScheme = useColorScheme();
  const colors = AuthColors[colorScheme];

  React.useEffect(() => {
    mixpanel.track('Sign Up Page Viewed');
  }, []);

  const onSignUpPress = async () => {
    if (!isLoaded) return

    mixpanel.track('Sign Up Submitted');

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

    mixpanel.track('Sign Up Verification Submitted');

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace((returnTo as Href) ?? '/')
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
      <AuthShell>
        <Text style={[styles.titleText, { color: colors.text }]}>Verify your email</Text>
        <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
          Enter your verification code.
        </Text>

        <AuthCodeInput value={code} onChange={setCode} />

        <AuthPrimaryButton label="Verify" onPress={onVerifyPress} />
      </AuthShell>
    )
  };

  function renderSignUpForm() {
    return (
      <AuthShell>
        <Text style={[styles.titleText, { color: colors.text }]}>Sign up to Check In</Text>
        <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
          Set up your studio in a couple minutes.
        </Text>

        <AuthTextField
          label="Email"
          value={emailAddress}
          placeholder="you@studio.com"
          onChangeText={setEmailAddress}
        />
        <AuthTextField
          label="Password"
          value={password}
          placeholder="Create a password"
          secureTextEntry
          onChangeText={setPassword}
        />

        <AuthPrimaryButton label="Continue" onPress={onSignUpPress} />

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Already have an account? </Text>
          <Link href="/sign-in" onPress={() => mixpanel.track('Sign Up Footer Sign In Clicked')}>
            <Text style={[styles.footerText, styles.footerLink, { color: ACCENT_COLOR }]}>Sign in</Text>
          </Link>
        </View>
      </AuthShell>
    );
  };

  return pendingVerification ? renderVerifyForm() : renderSignUpForm();
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  footerRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 13.5,
  },
  footerLink: {
    fontWeight: '600',
  },
});
