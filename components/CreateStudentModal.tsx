import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

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

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [isLiabilityFormChecked, setIsLiabilityFormChecked] = useState(false);
    const [emergencyContact, setEmergencyContact] = useState("");

    const renderCreateForm = () => {
        return (
            <View style={styles.modalContainer}>
                <ScreenTitle titleText='Add new student'/>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[textStyle, styles.itemContainer]}
                    >
                        First name:
                    </Text>
                    <TextInput
                    style={[textStyle, styles.inputFeld]}
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
                        style={[textStyle, styles.inputFeld]}
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
                            style={[textStyle, styles.inputFeld]}
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
                                alert('There is already a student with the same name')
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
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    modalView: {
        width: '50%',
        height: '40%',
        backgroundColor: 'black', //TODO: make it adjustable
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalInfo: {
        padding: 20,
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row'
    },
    inputFeld: {
        height: 30,
        width: 200,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 15,
    },
    createButton: {
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
    modalCancelButton: {
        alignItems: 'center',
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
        width: '30%',
    },
    modalManyButtonsContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        gap: 60,
    },
    modalSingleButtonContainer: {
        justifyContent: 'center'
    },
});

export default CreateStudentModal;
