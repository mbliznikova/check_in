import { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useClerk } from '@clerk/clerk-expo';
import { useApi } from '@/api/client';
import { deleteAccount } from '@/api/currentUser';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { DESTRUCTIVE_COLOR } from '@/constants/Colors';
import { mixpanel } from '@/utils/mixpanel';
import AuthTextField from './AuthTextField';

type ManageAccountModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
};

const CONFIRM_WORD = 'DELETE';

const ManageAccountModal = ({ isVisible, onModalClose }: ManageAccountModalProps) => {
    const { apiFetch } = useApi();
    const { signOut } = useClerk();
    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();

    const [step, setStep] = useState<'menu' | 'confirm'>('menu');
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setStep('menu');
        setConfirmText('');
        setError('');
        setIsDeleting(false);
        onModalClose();
    };

    const handleCancelConfirm = () => {
        setStep('menu');
        setConfirmText('');
        setError('');
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');

        const result = await deleteAccount(apiFetch);

        if (result === 'ok') {
            mixpanel.track('Account deleted');
            await signOut();
        } else {
            setError("Something went wrong deleting your account. Check your connection and try again.");
            setIsDeleting(false);
        }
    };

    const renderMenu = () => (
        <>
            <Text style={[textStyle, modalStyles.modalTitle]}>Manage account</Text>
            <View style={modalStyles.modalInfo}>
                <Pressable onPress={() => { mixpanel.track('Account delete link clicked'); setStep('confirm'); }}>
                    <Text style={[modalStyles.modalActionLink, styles.deleteLink, styles.centeredText]}>Delete account</Text>
                </Pressable>
            </View>
            <View style={modalStyles.modalButtonsRow}>
                <Pressable style={modalStyles.modalCancelButton} onPress={handleClose}>
                    <Text style={textStyle}>Close</Text>
                </Pressable>
            </View>
        </>
    );

    const renderConfirm = () => (
        <>
            <Text style={[textStyle, modalStyles.modalTitle]}>Delete account</Text>
            <View style={modalStyles.modalInfo}>
                <Text style={[textStyle, styles.justifiedText]}>
                    This permanently deletes your account. If you are the sole owner of
                    a school, that school and ALL its data — schedules, sessions,
                    students, attendance, payments — will be permanently deleted too.
                    This cannot be undone.
                </Text>
            </View>
            <AuthTextField
                label={`Type ${CONFIRM_WORD} to confirm`}
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="characters"
                editable={!isDeleting}
                labelStyle={styles.confirmLabel}
            />
            {error !== '' && <Text style={modalStyles.modalErrorText}>{error}</Text>}
            {isDeleting ? (
                <ActivityIndicator style={styles.loader} />
            ) : (
                <View style={modalStyles.modalButtonsRow}>
                    <Pressable
                        style={[
                            modalStyles.modalDeleteButton,
                            confirmText !== CONFIRM_WORD && modalStyles.modalDisabled,
                        ]}
                        disabled={confirmText !== CONFIRM_WORD}
                        onPress={handleDelete}
                    >
                        <Text style={textStyle}>Delete account</Text>
                    </Pressable>
                    <Pressable style={modalStyles.modalCancelButton} onPress={handleCancelConfirm}>
                        <Text style={textStyle}>Cancel</Text>
                    </Pressable>
                </View>
            )}
        </>
    );

    return (
        <Modal visible={isVisible} transparent onRequestClose={handleClose}>
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    {step === 'menu' ? renderMenu() : renderConfirm()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    deleteLink: {
        color: DESTRUCTIVE_COLOR,
    },
    loader: {
        marginVertical: 20,
    },
    centeredText: {
        textAlign: 'center',
    },
    justifiedText: {
        textAlign: 'justify',
    },
    confirmLabel: {
        textAlign: 'center',
        marginBottom: 12,
    },
});

export default ManageAccountModal;
