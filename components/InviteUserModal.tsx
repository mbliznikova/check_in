import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Share } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { modalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';
import ScreenTitle from './ScreenTitle';

const ROLES = ['kiosk', 'teacher', 'admin', 'owner'] as const;

type InviteUserModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onSendInvitation: (email: string, role: string) => void;
    isSuccess: boolean;
    inviteLink: string;
};

const InviteUserModal = ({
    isVisible = false,
    onModalClose,
    onSendInvitation,
    isSuccess,
    inviteLink,
}: InviteUserModalProps) => {
    const textStyle = useThemeTextStyle();

    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const canSubmit = email.trim() !== '' && selectedRole !== '';

    const handleClose = () => {
        setEmail('');
        setSelectedRole('');
        onModalClose();
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: inviteLink });
        } catch (err) {
            console.error('Error sharing invite link:', err);
        }
    };

    const renderForm = () => (
        <View style={styles.modalContainer}>
            <ScreenTitle titleText='Invite User' />
            <View style={[styles.itemRow]}>
                <Text style={[textStyle, styles.label]}>Email:</Text>
                <TextInput
                    style={[textStyle, commonStyles.inputField]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    autoCapitalize='none'
                />
            </View>
            <View style={styles.roleContainer}>
                <Text style={[textStyle, styles.label]}>Role:</Text>
                <View style={styles.roleRow}>
                    {ROLES.map((role) => (
                        <Pressable
                            key={role}
                            onPress={() => setSelectedRole(role)}
                            style={[
                                styles.roleButton,
                                selectedRole === role ? styles.roleButtonSelected : styles.roleButtonUnselected,
                            ]}
                        >
                            <Text style={[
                                styles.roleButtonText,
                                selectedRole === role ? styles.roleButtonTextSelected : textStyle,
                            ]}>
                                {role}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
            <View style={styles.buttonsRow}>
                <Pressable
                    onPress={() => {
                        onSendInvitation(email.trim(), selectedRole);
                    }}
                    style={[canSubmit ? styles.sendButton : styles.disabledButton]}
                    disabled={!canSubmit}
                >
                    <Text style={textStyle}>Send Invitation</Text>
                </Pressable>
                <Pressable onPress={handleClose} style={styles.cancelButton}>
                    <Text style={textStyle}>Cancel</Text>
                </Pressable>
            </View>
        </View>
    );

    const renderSuccess = () => (
        <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalView}>
                <View style={styles.successInfo}>
                    <Text style={[textStyle, styles.successTitle]}>Invitation sent!</Text>
                    <Text style={[textStyle, styles.linkLabel]}>Share this link with the invitee:</Text>
                    <Text selectable style={[textStyle, styles.inviteLink]}>{inviteLink}</Text>
                </View>
                <View style={styles.buttonsRow}>
                    <Pressable style={styles.shareButton} onPress={handleShare}>
                        <Text style={textStyle}>Share</Text>
                    </Pressable>
                    <Pressable style={modalStyles.modalConfirmButton} onPress={handleClose}>
                        <Text style={textStyle}>OK</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );

    return (
        <Modal visible={isVisible} transparent onRequestClose={handleClose}>
            {isSuccess ? renderSuccess() : renderForm()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    label: {
        width: 60,
        padding: 10,
    },
    roleContainer: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    roleRow: {
        flexDirection: 'row',
        gap: 8,
        paddingTop: 8,
    },
    roleButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    roleButtonSelected: {
        backgroundColor: 'blue',
        borderColor: 'blue',
    },
    roleButtonUnselected: {
        borderColor: 'grey',
    },
    roleButtonText: {
        fontSize: 13,
    },
    roleButtonTextSelected: {
        color: 'white',
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 20,
        paddingTop: 20,
        justifyContent: 'center',
    },
    sendButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'green',
    },
    disabledButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'gray',
        opacity: 0.5,
    },
    cancelButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'grey',
    },
    successInfo: {
        padding: 20,
        alignItems: 'center',
    },
    successTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 16,
    },
    linkLabel: {
        marginBottom: 8,
    },
    inviteLink: {
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 8,
        padding: 10,
        fontFamily: 'monospace',
        fontSize: 12,
        textAlign: 'center',
    },
    shareButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'blue',
    },
});

export default InviteUserModal;
