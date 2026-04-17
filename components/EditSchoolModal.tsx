import React from 'react';
import { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';

import ScreenTitle from "./ScreenTitle";

type EditSchoolModalProps = {
    isVisible: boolean;
    oldName: string;
    oldPhone: string;
    oldAddress: string;
    onModalClose: () => void;
    onEditSchool: (name: string, phone: string, address: string) => void;
    isSuccess: boolean;
};

const EditSchoolModal = ({
    isVisible = false,
    oldName,
    oldPhone,
    oldAddress,
    onModalClose,
    onEditSchool,
    isSuccess = false,
}: EditSchoolModalProps) => {

    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();

    const [newName, setNewName] = useState(oldName);
    const [newPhone, setNewPhone] = useState(oldPhone);
    const [newAddress, setNewAddress] = useState(oldAddress);

    const ifNoChanges = (): boolean => {
        return (
            oldName === newName &&
            oldPhone === newPhone &&
            oldAddress === newAddress
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, { fontWeight: "bold" }]}>
                            School was updated successfully!
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
                <ScreenTitle titleText={`Edit school ${oldName}`}/>
                <View style={[modalStyles.modalView, { paddingTop: 16 }]}>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text style={[textStyle, styles.itemContainer]}>
                            Edit name:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField]}
                            value={newName}
                            onChangeText={(val) => { setNewName(val); }}
                        />
                    </View>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text style={[textStyle, styles.itemContainer]}>
                            Edit phone:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField]}
                            value={newPhone}
                            onChangeText={(val) => { setNewPhone(val); }}
                        />
                    </View>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text style={[textStyle, styles.itemContainer]}>
                            Edit address:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField]}
                            value={newAddress}
                            onChangeText={(val) => { setNewAddress(val); }}
                        />
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                            onPress={() => {
                                if (ifNoChanges()) {
                                    console.log('No changes made');
                                    return;
                                }
                                onEditSchool(newName, newPhone, newAddress);
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
        justifyContent: 'center',
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row',
    },
});

export default EditSchoolModal;
