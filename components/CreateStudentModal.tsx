import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Alert, Platform } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';

import ScreenTitle from './ScreenTitle';
import Checkbox from './Checkbox';

type StudentCreationModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onCreateStudent: (firstName: string, lastName: string, isLiabilityChecked: boolean, contacts: string) => void;
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

                <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                        onPress={() => {
                            if (onUniquenessCheck(firstName, lastName)) {
                                onCreateStudent(firstName, lastName, isLiabilityFormChecked, emergencyContact);
                            } else {
                                Platform.OS === 'web'
                                    ? alert('There is already a student with the same name')
                                    : Alert.alert('Conflict', 'There is already a student with the same name')
                                console.log(`There is already a student with name ${firstName} ${lastName}`);
                            }
                            setFirstName("");
                            setLastName("");
                            setIsLiabilityFormChecked(false);
                            setEmergencyContact("");
                        }}
                        style={[(firstName === "" || lastName === "") ? styles.disabledButton : styles.createButton]}
                        disabled={firstName === "" || lastName === ""}
                        >
                            <Text style={textStyle}>Create</Text>
                        </Pressable>
                        <Pressable
                            onPress={onModalClose}
                            style={[styles.modalCancelButton]}
                        >
                            <Text style={textStyle}>Cancel</Text>
                        </Pressable>
                </View>
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
                            style={styles.modalConfirmButton}
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
    createButton: {
        alignItems: 'center',
        minWidth: 90,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'green',
    },
    disabledButton: {
        alignItems: 'center',
        minWidth: 90,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'gray',
        opacity: 0.5,
    },
    modalCancelButton: {
        alignItems: 'center',
        minWidth: 90,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'grey',
    },
   modalConfirmButton: {
       alignItems: 'center',
       paddingVertical: 5,
       paddingHorizontal: 10,
       marginVertical: 10,
       borderRadius: 15,
       backgroundColor: 'green',
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
});

export default CreateStudentModal;
