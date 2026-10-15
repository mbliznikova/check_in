import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';

import ScreenTitle from './ScreenTitle';
import Checkbox from './Checkbox';

type StudentCreationModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onCreateStudent: (firstName: string, lastName: string, isLiabilityChecked: boolean, contacts: string) => Promise<'ok' | 'error'>;
    onUniquenessCheck: (firstName: string, lastName: string) => boolean;
    isCreateSuccess: boolean,
};

const CreateStudentModal = ({
    isVisible = false,
    onModalClose,
    onCreateStudent,
    onUniquenessCheck,
    isCreateSuccess
}: StudentCreationModalProps) => {
    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [isLiabilityFormChecked, setIsLiabilityFormChecked] = useState(false);
    const [emergencyContact, setEmergencyContact] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (isSubmitting) {
            return;
        }

        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();

        if (!onUniquenessCheck(trimmedFirstName, trimmedLastName)) {
            Platform.OS === 'web'
                ? alert('There is already a student with the same name')
                : Alert.alert('Conflict', 'There is already a student with the same name')
            console.log(`There is already a student with name ${trimmedFirstName} ${trimmedLastName}`);
            return;
        }

        setError("");
        setIsSubmitting(true);

        const result = await onCreateStudent(trimmedFirstName, trimmedLastName, isLiabilityFormChecked, emergencyContact);

        if (result === 'ok') {
            setFirstName("");
            setLastName("");
            setIsLiabilityFormChecked(false);
            setEmergencyContact("");
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
            setError("Something went wrong creating the student. Check your connection and try again.");
        }
    };

    const renderCreateForm = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                <ScreenTitle titleText='Add new student'/>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[textStyle, styles.itemContainer]}
                    >
                        First name:
                    </Text>
                    <TextInput
                    style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                    value={firstName}
                    onChangeText={(newFirstName) => {setFirstName(newFirstName)}}
                />
                </View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[textStyle, styles.itemContainer]}
                    >
                        Last name:
                    </Text>
                    <TextInput
                        style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                        value={lastName}
                        onChangeText={(newLastName) => {setLastName(newLastName)}}
                    />
                </View>

                    <View style={[styles.itemContainer, styles.itemRow, {paddingVertical: 10, justifyContent: 'space-between'}]}>
                        <Text
                            style={[textStyle, styles.itemContainer, {fontWeight: 'bold',}]}
                        >
                            Did submit liability form?
                        </Text>
                        <Checkbox
                            label=''
                            checked={isLiabilityFormChecked}
                            onChange={() => {setIsLiabilityFormChecked(!isLiabilityFormChecked)}}
                            labelStyle={textStyle}
                        />
                    </View>

                    <View style={[styles.itemContainer, styles.itemRow, {paddingVertical: 10, justifyContent: 'space-between'}]}>
                        <Text
                            style={[textStyle, styles.itemContainer, {fontWeight: 'bold',}]}
                        >
                            Emergency contact:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                            value={emergencyContact}
                            onChangeText={(newContact) => {
                                setEmergencyContact(newContact)
                            }}
                        ></TextInput>
                    </View>

                {error !== "" && <Text style={modalStyles.modalErrorText}>{error}</Text>}
                {isSubmitting ? (
                    <ActivityIndicator style={styles.loader} />
                ) : (
                    <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                            <Pressable
                            onPress={handleCreate}
                            style={[modalStyles.modalConfirmButton, (firstName === "" || lastName === "") && modalStyles.modalDisabled]}
                            disabled={firstName === "" || lastName === ""}
                            >
                                <Text style={textStyle}>Create</Text>
                            </Pressable>
                            <Pressable
                                onPress={onModalClose}
                                style={modalStyles.modalCancelButton}
                            >
                                <Text style={textStyle}>Cancel</Text>
                            </Pressable>
                    </View>
                )}
                </View>
            </View>
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, {fontWeight: "bold"}]}>
                            {`Student was added successfully!`}
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                        <Pressable
                            style={modalStyles.modalConfirmButton}
                            onPress={onModalClose}
                        >
                                <Text style={[textStyle]}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            {isCreateSuccess ? renderSuccessConfirmation() : renderCreateForm()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalInfo: {
        padding: 20,
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },
    modalManyButtonsContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        gap: 16,
    },
    modalSingleButtonContainer: {
        justifyContent: 'center'
    },
    loader: {
        marginVertical: 20,
    },
});

export default CreateStudentModal;
