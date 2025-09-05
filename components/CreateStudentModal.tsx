import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, Modal, TextInput } from 'react-native';

import ScreenTitle from './ScreenTitle';

type StudentCreationModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onCreateStudent: (firstName: string, lastName: string) => void;
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
    const colorScheme = useColorScheme();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const renderCreateForm = () => {
        return (
            <View style={styles.container}>
                <ScreenTitle titleText='Add new student'/>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        First name:
                    </Text>
                    <TextInput
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                    value={firstName}
                    onChangeText={(newFirstName) => {setFirstName(newFirstName)}}
                />
                </View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Last name:
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={lastName}
                        onChangeText={(newLastName) => {setLastName(newLastName)}}
                    />
                </View>
                <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                        onPress={() => {
                            if (onUniquenessCheck(firstName, lastName)) {
                                onCreateStudent(firstName, lastName);
                            } else {
                                alert('There is already a student with the same name')
                                console.log(`There is already a student with name ${firstName} ${lastName}`);
                            }
                            setFirstName("");
                            setLastName("");
                        }}
                        style={[(firstName === "" || lastName === "") ? styles.disabledButton : styles.createButton]}
                        disabled={firstName === "" || lastName === ""}
                        >
                            <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Create</Text>
                        </Pressable>
                        <Pressable
                            onPress={onModalClose}
                            style={[styles.modalCancelButton]}
                        >
                            <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Cancel</Text>
                        </Pressable>
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
            {renderCreateForm()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row'
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
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
    disabledButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        opacity: 0.5,
    },
    modalCancelButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        backgroundColor: 'grey',
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
});

export default CreateStudentModal;
