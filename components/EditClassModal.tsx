import { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, useColorScheme, Pressable } from "react-native";

import ScreenTitle from "./ScreenTitle";

type EditClassModalProps = {
    isVisible: boolean;
    oldClassName: string;
    onModalClose: () => void;
    onEditClass: (newClassName: string) => void;
};

const EditClassModal = ({
    isVisible = false,
    oldClassName,
    onModalClose,
    onEditClass,
}: EditClassModalProps) => {

    const colorScheme = useColorScheme();

    const [newClassName, setNewClassName] = useState(oldClassName);

    const renderEditForm = () => {
        return (
            <View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Upodate class name:
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={newClassName}
                        onChangeText={(updatedClassName) => {
                            setNewClassName(updatedClassName)
                        }}
                    ></TextInput>
                </View>

                <View style={styles.modalButtonsContainer}>
                    <Pressable
                        onPress={() => onEditClass(newClassName)}
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
        );
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <ScreenTitle titleText={`Update class ${oldClassName}`}/>

                    {renderEditForm()}

                </View>
            </View>
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
        justifyContent: 'space-between',
        padding: 20,
        alignItems: 'center',
        width: '30%',
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
