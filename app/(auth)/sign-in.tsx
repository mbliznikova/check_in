import { useSignIn } from '@clerk/clerk-expo'
// import { SignIn as WebSignIn } from '@clerk/clerk-expo/web' // due to temporarily turned off sso, see #60
import { Link, useRouter, useLocalSearchParams, type Href } from 'expo-router'
import { Text, View, StyleSheet } from 'react-native'
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthColors, DESTRUCTIVE_COLOR, ACCENT_COLOR } from '@/constants/Colors';
import AuthShell from '@/components/AuthShell';
import AuthTextField from '@/components/AuthTextField';
import AuthPrimaryButton from '@/components/AuthPrimaryButton';
import AuthCodeInput from '@/components/AuthCodeInput';
import React, { useState } from "react";

export default function Page() {
  const colorScheme = useColorScheme();
  const colors = AuthColors[colorScheme];
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>()
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('');

  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  // due to temporarily turned off sso, see #60
  // if (Platform.OS === 'web') {
  //   return (
  //     <View style={[styles.container, {backgroundColor: isDark ? '#000' : '#fff' }]}>
  //       <WebSignIn fallbackRedirectUrl={(returnTo as string) ?? '/'} />
  //   </View>
  //   );
  // }

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
        router.replace((returnTo as Href) ?? '/')
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
        router.replace((returnTo as Href) ?? '/')
      } else {
        setErrorMsg('Verification incomplete. Check console.');
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.message ?? 'Verification failed');
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

        {errorMsg.length > 0 && (
          <Text style={[styles.errorText, { color: DESTRUCTIVE_COLOR }]}>{errorMsg}</Text>
        )}

        <AuthPrimaryButton label="Verify" onPress={onVerifyPress} />
      </AuthShell>
    );
  };

  function renderSignInForm() {
    return (
      <AuthShell>
        <Text style={[styles.titleText, { color: colors.text }]}>Sign in to Check In</Text>
        <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
          Welcome back — enter your details.
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
          placeholder="Enter password"
          secureTextEntry
          onChangeText={setPassword}
        />
        {errorMsg.length > 0 && (
          <Text style={[styles.errorText, { color: DESTRUCTIVE_COLOR }]}>{errorMsg}</Text>
        )}

        <AuthPrimaryButton label="Continue" onPress={onSignInPress} />

        <View style={styles.footerRow}>
          <Link href="/sign-up">
            <Text style={[styles.footerText, { color: colors.textMuted }]}>Don&apos;t have an account? </Text>
            <Text style={[styles.footerText, styles.footerLink, { color: ACCENT_COLOR }]}>Sign up</Text>
          </Link>
        </View>
      </AuthShell>
    );
  };

  return pendingVerification ? renderVerifyForm() : renderSignInForm();
};

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
  errorText: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  footerRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13.5,
  },
  footerLink: {
    fontWeight: '600',
  },
});
