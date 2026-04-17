import React from 'react';
import { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';

import ScreenTitle from "./ScreenTitle";
import Checkbox from './Checkbox';

type EditStudentModalProps = {
    isVisible: boolean;
    oldFirstName: string;
    oldLastName: string;
    onModalClose: () => void;
    onEditStudent: (newFirstName: string, newLastName: string, isLiabilityChecked: boolean, contacts: string) => void;
    onUniquenessCheck: (firstName: string, lastName: string) => boolean;
    isLiabilityFormSent: boolean;
    emergencyContacts: string;
    isSuccess: boolean;
};

const EditStudentModal = ({
    isVisible = false,
    oldFirstName,
    oldLastName,
    onModalClose,
    onEditStudent,
    onUniquenessCheck,
    isLiabilityFormSent,
    emergencyContacts,
    isSuccess = false,
}: EditStudentModalProps) => {

    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();

    const [newFirstName, setNewFirstName] = useState(oldFirstName);
    const [newLastName, setNewLastName] = useState(oldLastName);

    const [isLiabilityFormChecked, setIsLiabilityFormChecked] = useState(isLiabilityFormSent);
    const [newEmergencyContact, setNewEmergencyContact] = useState(emergencyContacts);

    const ifNoChanges = (): boolean => {
        return (
            oldFirstName === newFirstName &&
            oldLastName === newLastName &&
            isLiabilityFormSent === isLiabilityFormChecked &&
            emergencyContacts === newEmergencyContact
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, {fontWeight: "bold"}]}>
                            Student was updated successfully!
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

    const renderEditForm = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <ScreenTitle titleText={`Edit student ${oldFirstName} ${oldLastName}`}/>
                <View style={modalStyles.modalView}>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text
                            style={[textStyle, styles.itemContainer]}
                        >
                            Edit first name:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField]}
                            value={newFirstName}
                            onChangeText={(newFirstName) => {
                                setNewFirstName(newFirstName)
                            }}
                        ></TextInput>
                    </View>

                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text
                            style={[textStyle, styles.itemContainer]}
                        >
                            Edit last name:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField]}
                            value={newLastName}
                            onChangeText={(newLastName) => {
                                setNewLastName(newLastName)
                            }}
                        ></TextInput>
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
                            style={[textStyle, commonStyles.inputField]}
                            value={newEmergencyContact}
                            onChangeText={(newContact) => {
                                setNewEmergencyContact(newContact)
                            }}
                        ></TextInput>
                    </View>

                    <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                            onPress={() => {
                                if (ifNoChanges()) {
                                    console.log('No changes made');
                                    return;
                                }
                                else if ((oldFirstName === newFirstName && oldLastName === newLastName) || onUniquenessCheck(newFirstName, newLastName)) {
                                    onEditStudent(newFirstName, newLastName, isLiabilityFormChecked, newEmergencyContact);
                                } else {
                                    Platform.OS === 'web'
                                        ? alert('There is already a student with the same name')
                                        : Alert.alert('Conflict', 'There is already a student with the same name')
                                    console.log(`There is already a student with name ${newFirstName} ${newLastName}`);
                                }
                                setNewFirstName("");
                                setNewLastName("");
                            }}
                            style={modalStyles.modalConfirmButton}
                        >
                            <Text style={textStyle}>Save</Text>
                        </Pressable>
                        <Pressable
                            style={modalStyles.modalCancelButton}
                            onPress={onModalClose}
                            >
                                <Text style={[textStyle]}>Cancel</Text>
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
            {isSuccess ? renderSuccessConfirmation() : renderEditForm()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalInfo: {
        padding: 20,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        gap: 16,
    },
    modalManyButtonsContainer: {
        justifyContent: 'center',
    },
    modalSingleButtonContainer: {
         justifyContent: 'center'
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row'
    },
    createButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
    },
});

export default EditStudentModal;
