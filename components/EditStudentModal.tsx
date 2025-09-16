import React from 'react';
import { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, useColorScheme, Pressable } from "react-native";

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
    emergencyContacts='',
    isSuccess = false,
}: EditStudentModalProps) => {

    const colorScheme = useColorScheme();

    const [newFirstName, setNewFirstName] = useState(oldFirstName);
    const [newLastName, setNewLastName] = useState(oldLastName);

    const [isLiabilityFormChecked, setIsLiabilityFormChecked] = useState(isLiabilityFormSent);
    const [newEemergencyContact, setNewEemergencyContact] = useState(emergencyContacts);

    const ifNoChanges = (): boolean => {
        return (
            oldFirstName === newFirstName &&
            oldLastName === newLastName &&
            isLiabilityFormSent === isLiabilityFormChecked &&
            emergencyContacts === newEemergencyContact
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                            Student was updated successfully!
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                        <Pressable
                            style={styles.modalConfirmButton}
                            onPress={onModalClose}
                        >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    const renderEditForm = () => {
        return (
            <View style={styles.modalContainer}>
                <ScreenTitle titleText={`Edit student ${oldFirstName} ${oldLastName}`}/>
                <View style={styles.modalView}>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                        >
                            Edit first name:
                        </Text>
                        <TextInput
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                            value={newFirstName}
                            onChangeText={(newFirstName) => {
                                setNewFirstName(newFirstName)
                            }}
                        ></TextInput>
                    </View>

                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                        >
                            Edit last name:
                        </Text>
                        <TextInput
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                            value={newLastName}
                            onChangeText={(newLastName) => {
                                setNewLastName(newLastName)
                            }}
                        ></TextInput>
                    </View>

                    <View style={[styles.itemContainer, styles.itemRow, {paddingVertical: 10, justifyContent: 'space-between'}]}>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer, {fontWeight: 'bold',}]}
                        >
                            Did submit liability form?
                        </Text>
                        <Checkbox
                            label=''
                            checked={isLiabilityFormChecked}
                            onChange={() => {setIsLiabilityFormChecked(!isLiabilityFormChecked)}}
                            labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                        />
                    </View>

                    <View style={[styles.itemContainer, styles.itemRow, {paddingVertical: 10, justifyContent: 'space-between'}]}>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer, {fontWeight: 'bold',}]}
                        >
                            Emergency contact:
                        </Text>
                        <TextInput
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                            value={newEemergencyContact}
                            onChangeText={(newContact) => {
                                setNewEemergencyContact(newContact)
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
                                    onEditStudent(newFirstName, newLastName, isLiabilityFormChecked, newEemergencyContact);
                                } else {
                                    alert('There is already a student with the same name')
                                    console.log(`There is already a student with name ${newFirstName} ${newLastName}`);
                                }
                                setNewFirstName("");
                                setNewLastName("");
                            }}
                            style={styles.modalConfirmButton}
                        >
                            <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Save</Text>
                        </Pressable>
                        <Pressable
                            style={styles.modalCancelButton}
                            onPress={onModalClose}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Cancel</Text>
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        width: '30%',
    },
    modalManyButtonsContainer: {
        justifyContent: 'space-between',
    },
    modalSingleButtonContainer: {
         justifyContent: 'center'
    },
    modalConfirmButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'green',
    },
    modalCancelButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'grey',
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
        borderColor: 'grey',
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
});

export default EditStudentModal;
