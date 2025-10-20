import { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, useColorScheme, Pressable } from "react-native";

import Checkbox from './Checkbox';
import ScreenTitle from "./ScreenTitle";
import React from 'react';

type EditClassModalProps = {
    isVisible: boolean;
    oldClassName: string;
    oldClassDuration: number | null;
    onModalClose: () => void;
    onEditClass: (newClassName: string, newClassDuration: number) => void;
    onClassUniquenessCheck: (name: string) => boolean;
    isSuccess: boolean;
};

const EditClassModal = ({
    isVisible = false,
    oldClassName,
    oldClassDuration,
    onModalClose,
    onEditClass,
    onClassUniquenessCheck,
    isSuccess = false,
}: EditClassModalProps) => {

    const colorScheme = useColorScheme();

    const [newClassName, setNewClassName] = useState(oldClassName);
    const [newClassDuration, setNewClassDuration] = useState(oldClassDuration);
    const [isRecurring, setIsRecurring] = useState(false);

    const ifNoChanges = (): boolean => {
        return (
            oldClassName === newClassName &&
            oldClassDuration === newClassDuration
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                            Class name was updated successfully to {newClassName}
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
                <ScreenTitle titleText={`Edit class ${oldClassName}`}/>
                <View style={styles.modalView}>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                        >
                            Edit class name:
                        </Text>
                        <TextInput
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                            value={newClassName}
                            onChangeText={(updatedClassName) => {
                                setNewClassName(updatedClassName)
                            }}
                        ></TextInput>
                    </View>

                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                        >
                            Edit class duration:
                        </Text>
                        <TextInput
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                            value={newClassDuration?.toString()}
                            onChangeText={(updatedClassDuration) => {
                                setNewClassDuration(Number(updatedClassDuration)) // TODO: think about better handling and type conversion & validation. Number picker?
                            }}
                        ></TextInput>
                    </View>

                    <View style={[styles.itemContainer, styles.itemRow, {paddingVertical: 10, justifyContent: 'space-between', alignSelf: 'center'}]}>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer, ]}
                            >
                                Is recurring?
                        </Text>
                        <Checkbox
                            label=''
                            checked={isRecurring}
                            onChange={() => {setIsRecurring(!isRecurring)}}
                            labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                        />
                    </View>

                    <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                            onPress={() => {
                                if (ifNoChanges()) {
                                    console.log('No changes made');
                                    return;
                                } else if (newClassDuration !== null && (newClassName!== oldClassName || newClassDuration !== oldClassDuration)) {
                                    onClassUniquenessCheck(newClassName) ? onEditClass(newClassName, newClassDuration) : alert('Class with such name already exists');
                                }
                                setNewClassName("");
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

export default EditClassModal;
