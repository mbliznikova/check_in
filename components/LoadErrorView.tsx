import { View, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import AuthPrimaryButton from './AuthPrimaryButton';

type Props = { message: string; onRetry: () => void };

export default function LoadErrorView({ message, onRetry }: Props) {
    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.message}>{message}</ThemedText>
            <View style={styles.buttonWrap}>
                <AuthPrimaryButton label="Retry" onPress={onRetry} />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
    message: { textAlign: 'center' },
    buttonWrap: { width: '100%', maxWidth: 380 },
});
