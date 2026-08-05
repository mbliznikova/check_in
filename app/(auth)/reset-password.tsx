import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter, useLocalSearchParams, type Href } from 'expo-router'
import { Text, View, StyleSheet } from 'react-native'
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthColors, DESTRUCTIVE_COLOR, ACCENT_COLOR } from '@/constants/Colors';
import { mixpanel } from '@/utils/mixpanel';
import AuthShell from '@/components/AuthShell';
import AuthTextField from '@/components/AuthTextField';
import AuthPrimaryButton from '@/components/AuthPrimaryButton';
import AuthCodeInput from '@/components/AuthCodeInput';
import React, { useState, useEffect } from "react";

export default function Page() {
  const colorScheme = useColorScheme();
  const colors = AuthColors[colorScheme];
  const { returnTo, email: emailParam } = useLocalSearchParams<{ returnTo?: string; email?: string }>()
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState(emailParam ?? '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('');

  const [pendingReset, setPendingReset] = useState(false)

  useEffect(() => {
    mixpanel.track('Reset Password Page Viewed');
  }, []);

  const onRequestResetPress = async () => {
    if (!isLoaded) return;

    mixpanel.track('Reset Password Submitted');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })

      setPendingReset(true)
      setErrorMsg('')
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      if (err?.errors?.[0]?.code === 'form_identifier_not_found') {
        // Enumeration protection: behave identically to a real account so a
        // failed lookup can't be distinguished from a successful one.
        setPendingReset(true)
        setErrorMsg('')
      } else {
        setErrorMsg(err?.errors?.[0]?.message ?? 'Could not send reset code');
      }
    }
  }

  const onResetPasswordPress = async () => {
    if (!isLoaded || !pendingReset) return;

    mixpanel.track('Reset Password Verification Submitted');

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
      });

      if (attempt.status === 'needs_new_password') {
        const result = await signIn.resetPassword({ password: newPassword })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          router.replace((returnTo as Href) ?? '/')
        } else {
          setErrorMsg('Additional steps required. Check console.');
          console.error(JSON.stringify(result, null, 2))
        }
      } else {
        setErrorMsg('Verification incomplete. Check console.');
        console.error(JSON.stringify(attempt, null, 2))
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setErrorMsg('Invalid or expired code. Please try again.');
    }
  }

  function renderRequestForm() {
    return (
      <AuthShell>
        <Text style={[styles.titleText, { color: colors.text }]}>Reset your password</Text>
        <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
          Enter your email and we&apos;ll send you a reset code.
        </Text>

        <AuthTextField
          label="Email"
          value={email}
          placeholder="you@studio.com"
          onChangeText={setEmail}
        />

        {errorMsg.length > 0 && (
          <Text style={[styles.errorText, { color: DESTRUCTIVE_COLOR }]}>{errorMsg}</Text>
        )}

        <AuthPrimaryButton label="Send reset code" onPress={onRequestResetPress} />

        <View style={styles.footerRow}>
          <Link href="/sign-in" onPress={() => mixpanel.track('Reset Password Back To Sign In Clicked')}>
            <Text style={[styles.footerText, styles.footerLink, { color: ACCENT_COLOR }]}>Back to sign in</Text>
          </Link>
        </View>
      </AuthShell>
    );
  };

  function renderResetForm() {
    return (
      <AuthShell>
        <Text style={[styles.titleText, { color: colors.text }]}>Check your email</Text>
        <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
          If an account exists for that email, we&apos;ve sent a code. Enter it below to set a new password.
        </Text>

        <AuthCodeInput value={code} onChange={setCode} />

        <AuthTextField
          label="New password"
          value={newPassword}
          placeholder="Enter new password"
          secureTextEntry
          onChangeText={setNewPassword}
        />

        {errorMsg.length > 0 && (
          <Text style={[styles.errorText, { color: DESTRUCTIVE_COLOR }]}>{errorMsg}</Text>
        )}

        <AuthPrimaryButton label="Reset password" onPress={onResetPasswordPress} />
      </AuthShell>
    );
  };

  return pendingReset ? renderResetForm() : renderRequestForm();
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
