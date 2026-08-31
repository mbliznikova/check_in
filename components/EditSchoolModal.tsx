import React from 'react';
import { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';
import { DESTRUCTIVE_COLOR } from '@/constants/Colors';

import ScreenTitle from "./ScreenTitle";
import TimezonePicker from './TimezonePicker';

type EditSchoolModalProps = {
    isVisible: boolean;
    oldName: string;
    oldPhone: string;
    oldAddress: string;
    oldTimezone: string;
    onModalClose: () => void;
    onEditSchool: (name: string, phone: string, address: string, timezone: string) => void;
    isSuccess: boolean;
    errorMessage?: string | null;
};

const EditSchoolModal = ({
    isVisible = false,
    oldName,
    oldPhone,
    oldAddress,
    oldTimezone,
    onModalClose,
    onEditSchool,
    isSuccess = false,
    errorMessage = null,
}: EditSchoolModalProps) => {

    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();

    const [newName, setNewName] = useState(oldName);
    const [newPhone, setNewPhone] = useState(oldPhone);
    const [newAddress, setNewAddress] = useState(oldAddress);
    const [newTimezone, setNewTimezone] = useState(oldTimezone);
    const [isTimezonePickerVisible, setIsTimezonePickerVisible] = useState(false);

    const ifNoChanges = (): boolean => {
        return (
            oldName === newName &&
            oldPhone === newPhone &&
            oldAddress === newAddress &&
            oldTimezone === newTimezone
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
                <View style={[modalStyles.modalView, { paddingTop: 16 }]}>
                <ScreenTitle titleText={`Edit school ${oldName}`}/>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text style={[textStyle, styles.itemContainer]}>
                            Edit name:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                            value={newName}
                            onChangeText={(val) => { setNewName(val); }}
                        />
                    </View>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text style={[textStyle, styles.itemContainer]}>
                            Edit phone:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                            value={newPhone}
                            onChangeText={(val) => { setNewPhone(val); }}
                        />
                    </View>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text style={[textStyle, styles.itemContainer]}>
                            Edit address:
                        </Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                            value={newAddress}
                            onChangeText={(val) => { setNewAddress(val); }}
                        />
                    </View>
                    <View style={[styles.itemContainer, styles.itemRow]}>
                        <Text style={[textStyle, styles.itemContainer]}>
                            Edit timezone:
                        </Text>
                        <Pressable
                            style={[commonStyles.inputField, { flex: 1 }]}
                            onPress={() => { setIsTimezonePickerVisible(true); }}
                        >
                            <Text style={textStyle}>
                                {newTimezone || 'Select...'}
                            </Text>
                        </Pressable>
                    </View>
                    {errorMessage && (
                        <Text style={[styles.errorText, { color: DESTRUCTIVE_COLOR }]}>
                            {errorMessage}
                        </Text>
                    )}
                    <TimezonePicker
                        isVisible={isTimezonePickerVisible}
                        currentValue={newTimezone}
                        onSelect={(tz) => {
                            setNewTimezone(tz);
                            setIsTimezonePickerVisible(false);
                        }}
                        onClose={() => { setIsTimezonePickerVisible(false); }}
                    />
                    <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                            onPress={() => {
                                if (ifNoChanges()) {
                                    console.log('No changes made');
                                    return;
                                }
                                onEditSchool(newName, newPhone, newAddress, newTimezone);
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
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: {
        alignSelf: 'stretch',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
});

export default EditSchoolModal;
