import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { modalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';

import ScreenTitle from './ScreenTitle';

type CreateSchoolModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onCreateSchool: (name: string, phone: string, address: string) => void;
    isCreateSuccess: boolean;
};

const CreateSchoolModal = ({
    isVisible = false,
    onModalClose,
    onCreateSchool,
    isCreateSuccess,
}: CreateSchoolModalProps) => {
    const textStyle = useThemeTextStyle();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const renderCreateForm = () => {
        return (
            <View style={styles.modalContainer}>
                <ScreenTitle titleText='Add new school'/>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text style={[textStyle, styles.itemContainer]}>
                        Name:
                    </Text>
                    <TextInput
                        style={[textStyle, commonStyles.inputField]}
                        value={name}
                        onChangeText={(newName) => { setName(newName); }}
                    />
                </View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text style={[textStyle, styles.itemContainer]}>
                        Phone:
                    </Text>
                    <TextInput
                        style={[textStyle, commonStyles.inputField]}
                        value={phone}
                        onChangeText={(newPhone) => { setPhone(newPhone); }}
                    />
                </View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text style={[textStyle, styles.itemContainer]}>
                        Address:
                    </Text>
                    <TextInput
                        style={[textStyle, commonStyles.inputField]}
                        value={address}
                        onChangeText={(newAddress) => { setAddress(newAddress); }}
                    />
                </View>
                <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                    <Pressable
                        onPress={() => {
                            onCreateSchool(name, phone, address);
                            setName("");
                            setPhone("");
                            setAddress("");
                        }}
                        style={[name === "" ? styles.disabledButton : styles.createButton]}
                        disabled={name === ""}
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
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, { fontWeight: "bold" }]}>
                            School was created successfully!
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    modalInfo: {
        padding: 20,
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row',
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
        justifyContent: 'center',
    },
});

export default CreateSchoolModal;
