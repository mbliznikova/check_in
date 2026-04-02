import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import { useApi } from '@/api/client';
import { useUserRole } from '@/context/UserContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

export default function InviteAcceptScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isSignedIn } = useAuth();
    const { apiFetch } = useApi();
    const { reloadUser } = useUserRole();
    const router = useRouter();
    const textStyle = useThemeTextStyle();

    const backgroundColor = useThemeColor({}, 'background');

    const [loading, setLoading] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [schoolName, setSchoolName] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');

    const handleAccept = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiFetch(`/invitations/${id}/accept/`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                setSchoolName(data.schoolName ?? '');
                setRole(data.role ?? '');
                setAccepted(true);
                reloadUser();
            } else {
                const data = await response.json().catch(() => ({}));
                console.error(`Error accepting invitation: ${response.status}`, data);
                setError(data.message ?? 'Failed to accept invitation. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error('Error accepting invitation:', err);
        } finally {
            setLoading(false);
        }
    };

    const returnTo = encodeURIComponent(`/invite/${id}`);

    const renderNotSignedIn = () => (
        <View style={styles.content}>
            <Text style={[textStyle, styles.title]}>You're invited!</Text>
            <Text style={[textStyle, styles.message]}>
                Sign in or create an account to accept this invitation.
            </Text>
            <View style={styles.buttonsRow}>
                <Pressable
                    style={styles.primaryButton}
                    onPress={() => router.push(`/(auth)/sign-in?returnTo=${returnTo}`)}
                >
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                </Pressable>
                <Pressable
                    style={styles.secondaryButton}
                    onPress={() => router.push(`/(auth)/sign-up?returnTo=${returnTo}`)}
                >
                    <Text style={textStyle}>Sign Up</Text>
                </Pressable>
            </View>
        </View>
    );

    const renderAccepted = () => (
        <View style={styles.content}>
            <Text style={[textStyle, styles.title]}>Welcome!</Text>
            <Text style={[textStyle, styles.message]}>
                {`You've joined${schoolName ? ` ${schoolName}` : ''} as ${role}.`}
            </Text>
            <Pressable
                style={styles.primaryButton}
                onPress={() => router.replace('/check-in')}
            >
                <Text style={styles.primaryButtonText}>Go to App</Text>
            </Pressable>
        </View>
    );

    const renderAcceptForm = () => (
        <View style={styles.content}>
            <Text style={[textStyle, styles.title]}>You're invited!</Text>
            <Text style={[textStyle, styles.message]}>
                You have a pending invitation to join a school.
            </Text>
            {error !== '' && (
                <Text style={styles.errorText}>{error}</Text>
            )}
            <Pressable
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={handleAccept}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color='white' />
                    : <Text style={styles.primaryButtonText}>Accept Invitation</Text>
                }
            </Pressable>
        </View>
    );

    const renderContent = () => {
        if (!isSignedIn) return renderNotSignedIn();
        if (accepted) return renderAccepted();
        return renderAcceptForm();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            {renderContent()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 32,
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
    },
    hint: {
        fontSize: 13,
        textAlign: 'center',
        opacity: 0.6,
        marginTop: 8,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    primaryButton: {
        backgroundColor: 'blue',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: 'grey',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    disabledButton: {
        opacity: 0.5,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
});
