import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useApi } from '@/api/client';
import { isValidMembersResponse, isValidChangeRoleResponse, isValidDeleteMemberResponse } from '@/api/validators';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useModalStyles } from '@/constants/modalStyles';
import { StaffMemberType } from '@/types/school';

const ROLES = ['kiosk', 'teacher', 'admin', 'owner'] as const;


type StaffModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    schoolId: number;
    schoolName: string;
    onInvitePress: () => void;
};

const StaffModal = ({ isVisible, onModalClose, schoolId, schoolName, onInvitePress }: StaffModalProps) => {
    const { apiFetch } = useApi();
    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();
    const cardBackground = useThemeColor({}, 'background');

    const [members, setMembers] = useState<StaffMemberType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
    const [pendingRemoveMemberId, setPendingRemoveMemberId] = useState<number | null>(null);
    const [savingMemberId, setSavingMemberId] = useState<number | null>(null);

    useEffect(() => {
        if (isVisible) {
            fetchMembers();
        }
    }, [isVisible]);

    const fetchMembers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiFetch(`/memberships/`, {}, schoolId);
            if (response.ok) {
                const data = await response.json();
                if (isValidMembersResponse(data)) {
                    console.log('Function fetchMembers. The response from backend is valid.');
                    setMembers(data.members);
                } else {
                    console.warn(`Function fetchMembers. The response from backend is NOT valid! ${JSON.stringify(data)}`);
                    setMembers([]);
                }
            } else {
                setError(`Failed to load staff (${response.status})`);
            }
        } catch (err) {
            setError('Something went wrong loading staff.');
            console.error('Error fetching staff:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async (memberId: number, newRole: string) => {
        setSavingMemberId(memberId);
        try {
            const response = await apiFetch(`/memberships/${memberId}/edit/`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole }),
            }, schoolId);
            if (response.ok) {
                const data = await response.json();
                if (isValidChangeRoleResponse(data, memberId, newRole)) {
                    console.log('Function handleChangeRole. The response from backend is valid.');
                } else {
                    console.warn(`Function handleChangeRole. The response from backend is NOT valid! ${JSON.stringify(data)}`);
                }
                setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
                setEditingMemberId(null);
            } else {
                console.warn(`Failed to change role: ${response.status}`);
            }
        } catch (err) {
            console.error('Error changing role:', err);
        } finally {
            setSavingMemberId(null);
        }
    };

    const handleRemove = async (memberId: number) => {
        setSavingMemberId(memberId);
        try {
            const response = await apiFetch(`/memberships/${memberId}/delete/`, {
                method: 'DELETE',
            }, schoolId);
            if (response.ok) {
                const data = await response.json();
                if (isValidDeleteMemberResponse(data, memberId)) {
                    console.log('Function handleRemove. The response from backend is valid.');
                } else {
                    console.warn(`Function handleRemove. The response from backend is NOT valid! ${JSON.stringify(data)}`);
                }
                setMembers(prev => prev.filter(m => m.id !== memberId));
                setPendingRemoveMemberId(null);
            } else {
                console.warn(`Failed to remove member: ${response.status}`);
            }
        } catch (err) {
            console.error('Error removing member:', err);
        } finally {
            setSavingMemberId(null);
        }
    };

    const handleClose = () => {
        setMembers([]);
        setError('');
        setEditingMemberId(null);
        setPendingRemoveMemberId(null);
        onModalClose();
    };

    const renderMemberRow = (member: StaffMemberType) => {
        const isEditing = editingMemberId === member.id;
        const isConfirmingRemove = pendingRemoveMemberId === member.id;
        const isSaving = savingMemberId === member.id;

        return (
            <View key={member.id} style={styles.memberRow}>
                <View style={styles.memberInfo}>
                    <Text style={[textStyle, styles.memberName]}>{member.firstName} {member.lastName}</Text>
                    <Text style={[textStyle, styles.memberEmail]}>{member.email}</Text>
                </View>
                {isSaving ? (
                    <ActivityIndicator style={styles.rowSpinner} />
                ) : isEditing ? (
                    <View style={styles.rolePickerRow}>
                        {ROLES.map(role => (
                            <Pressable
                                key={role}
                                onPress={() => handleChangeRole(member.id, role)}
                                style={[
                                    styles.roleButton,
                                    member.role === role ? styles.roleButtonSelected : styles.roleButtonUnselected,
                                ]}
                            >
                                <Text style={[
                                    styles.roleButtonText,
                                    member.role === role ? styles.roleButtonTextSelected : textStyle,
                                ]}>
                                    {role}
                                </Text>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => setEditingMemberId(null)}>
                            <Text style={[textStyle, styles.cancelText]}>✕</Text>
                        </Pressable>
                    </View>
                ) : isConfirmingRemove ? (
                    <View style={styles.confirmRow}>
                        <Text style={[textStyle, styles.confirmText]}>Remove?</Text>
                        <Pressable onPress={() => handleRemove(member.id)}>
                            <Text style={styles.confirmYes}>Yes</Text>
                        </Pressable>
                        <Pressable onPress={() => setPendingRemoveMemberId(null)}>
                            <Text style={[textStyle, styles.cancelText]}>No</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.actionsRow}>
                        <Text style={[textStyle, styles.roleLabel]}>{member.role}</Text>
                        <Pressable onPress={() => {
                            setPendingRemoveMemberId(null);
                            setEditingMemberId(member.id);
                        }}>
                            <Text style={[textStyle, styles.actionLink]}>Change Role</Text>
                        </Pressable>
                        <Pressable onPress={() => {
                            setEditingMemberId(null);
                            setPendingRemoveMemberId(member.id);
                        }}>
                            <Text style={[textStyle, styles.actionLink]}>Remove</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal visible={isVisible} transparent onRequestClose={handleClose}>
            <View style={modalStyles.modalContainer}>
                <View style={[styles.card, { backgroundColor: cardBackground }]}>
                    <Text style={[textStyle, styles.title]}>{schoolName} — Staff</Text>
                    {loading && <ActivityIndicator style={styles.loader} />}
                    {error !== '' && <Text style={styles.errorText}>{error}</Text>}
                    <ScrollView style={styles.list}>
                        {members.map(renderMemberRow)}
                    </ScrollView>
                    <View style={styles.footer}>
                        <Pressable style={styles.inviteButton} onPress={onInvitePress}>
                            <Text style={styles.inviteButtonText}>+ Invite New Member</Text>
                        </Pressable>
                        <Pressable style={styles.closeButton} onPress={handleClose}>
                            <Text style={textStyle}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '85%',
        maxHeight: '75%',
        borderRadius: 20,
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    loader: {
        marginVertical: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
    },
    list: {
        flex: 1,
        marginTop: 10,
    },
    memberRow: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'grey',
        gap: 8,
    },
    memberInfo: {
        gap: 4,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '600',
    },
    memberEmail: {
        fontSize: 13,
        opacity: 0.7,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    roleLabel: {
        fontSize: 13,
        opacity: 0.8,
        minWidth: 60,
    },
    actionLink: {
        textDecorationLine: 'underline',
        fontSize: 13,
    },
    rolePickerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
    },
    roleButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
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
        fontSize: 12,
    },
    roleButtonTextSelected: {
        color: 'white',
    },
    cancelText: {
        fontSize: 16,
        paddingHorizontal: 4,
    },
    confirmRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    confirmText: {
        fontSize: 13,
    },
    confirmYes: {
        color: 'red',
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    rowSpinner: {
        alignSelf: 'flex-start',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'grey',
    },
    inviteButton: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    inviteButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    closeButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
    },
});

export default StaffModal;
