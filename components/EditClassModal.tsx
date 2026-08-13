import { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, TOGGLE_TEXT } from '@/constants/Colors';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';

import ScreenTitle from "./ScreenTitle";
import React from 'react';

type EditClassModalProps = {
    isVisible: boolean;
    classId: number,
    oldClassName: string;
    oldClassDuration: number;
    oldClassRecurrence: boolean;
    oldClassPrice: number;
    priceId: number | null;
    onModalClose: () => void;
    onEditClass: (newClassName: string, newClassDuration: number, newClassRecurrence: boolean) => void;
    onEditPrice: (priceId: number, newAmount: number, classId: number) => void;
    onCreatePrice: (classId: number, newAmount: number, className: string) => void;
    onClassUniquenessCheck: (name: string) => boolean;
    isSuccess: boolean;
};

const EditClassModal = ({
    isVisible = false,
    classId,
    oldClassName,
    oldClassDuration,
    oldClassRecurrence,
    oldClassPrice,
    priceId,
    onModalClose,
    onEditClass,
    onEditPrice,
    onCreatePrice,
    onClassUniquenessCheck,
    isSuccess = false,
}: EditClassModalProps) => {

    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();
    const colorScheme = useColorScheme() ?? 'light';

    const [newClassName, setNewClassName] = useState(oldClassName);
    const [newClassDuration, setNewClassDuration] = useState(oldClassDuration);
    const [newClassRecurrence, setNewClassRecurrence] = useState(oldClassRecurrence);
    const [newClassPrice, setNewClassPrice] = useState(oldClassPrice);
    const [successMessage, setSuccessMessage] = useState('');

    const renderSuccessConfirmation = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, {fontWeight: "bold", textAlign: "center"}]}>
                            {successMessage}
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

    // TODO: should I delete occurences when making class recurrent?
    const renderConfirmationToRecurrent = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, {fontWeight: "bold"}]}>
                            Make this class recurrent?
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                        <Pressable
                            style={modalStyles.modalConfirmButton}
                            onPress={() => {}} // TODO: remove occurrences?
                        >
                            <Text style={[textStyle]}>OK</Text>
                        </Pressable>
                        <Pressable
                            style={modalStyles.modalConfirmButton}
                            onPress={onModalClose}
                        >
                            <Text style={[textStyle]}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    const renderConfirmationToNonRecurrent = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, {fontWeight: "bold"}]}>
                            Make this class non-recurrent? All schedules will be deleted.
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                        <Pressable
                            style={modalStyles.modalConfirmButton}
                            onPress={() => {}}
                        >
                                <Text style={[textStyle]}>OK</Text>
                        </Pressable>
                        <Pressable
                            style={modalStyles.modalConfirmButton}
                            onPress={onModalClose}
                        >
                                <Text style={[textStyle]}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    const renderEditForm = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                <ScreenTitle titleText={`Edit class ${oldClassName}`}/>
                    <View style={commonStyles.formContainer}>
                        <View style={commonStyles.fieldGroup}>
                            <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>
                                Name
                            </Text>
                            <TextInput
                                style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput]}
                                value={newClassName}
                                onChangeText={(updatedClassName) => {
                                    setNewClassName(updatedClassName)
                                }}
                            ></TextInput>
                        </View>

                        <View style={commonStyles.sideBySideRow}>
                            <View style={[commonStyles.fieldGroup, { flex: 1 }]}>
                                <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>
                                    Duration (min)
                                </Text>
                                <TextInput
                                    style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput]}
                                    value={newClassDuration?.toString()}
                                    onChangeText={(updatedClassDuration) => {
                                        setNewClassDuration(Number(updatedClassDuration)) // TODO: think about better handling and type conversion & validation. Number picker?
                                    }}
                                ></TextInput>
                            </View>

                            <View style={[commonStyles.fieldGroup, { flex: 1 }]}>
                                <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>
                                    Price
                                </Text>
                                <TextInput
                                    style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput]}
                                    value={newClassPrice?.toString()}
                                    onChangeText={(updatedClassPrice) => {
                                        setNewClassPrice(Number(updatedClassPrice)) // TODO: better handling and type conversion & validation. Number picker?
                                    }}
                                ></TextInput>
                            </View>
                        </View>

                        <View style={[commonStyles.separator, commonStyles.fullWidthInput]} />

                        <View style={commonStyles.fieldGroup}>
                            <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>
                                Repeats
                            </Text>
                            <View style={commonStyles.segmentedToggle}>
                                <Pressable
                                    style={[commonStyles.segmentedPill, !newClassRecurrence && commonStyles.segmentedPillActive]}
                                    onPress={() => setNewClassRecurrence(false)}
                                >
                                    <Text style={[commonStyles.segmentedPillText, { color: !newClassRecurrence ? TOGGLE_TEXT : textStyle.color }]}>
                                        One-off
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[commonStyles.segmentedPill, newClassRecurrence && commonStyles.segmentedPillActive]}
                                    onPress={() => setNewClassRecurrence(true)}
                                >
                                    <Text style={[commonStyles.segmentedPillText, { color: newClassRecurrence ? TOGGLE_TEXT : textStyle.color }]}>
                                        Weekly
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                            onPress={() => {
                                const nameChanged = newClassName !== oldClassName;
                                const durationChanged = newClassDuration !== oldClassDuration;
                                const recurrenceChanged = newClassRecurrence !== oldClassRecurrence;
                                const classChanged = nameChanged || durationChanged || recurrenceChanged;

                                const priceChanged = oldClassPrice !== newClassPrice;

                                if (!classChanged && !priceChanged) {
                                    console.log('No changes made');
                                    return;
                                }

                                const changes: string[] = [];

                                if (classChanged) {
                                    // classesSet always contains this class's OWN current name, so
                                    // running the uniqueness check against an unchanged name would
                                    // always (wrongly) report a collision. Only block when the name
                                    // actually changed to something that collides with another class.
                                    const isNameValid = !nameChanged || onClassUniquenessCheck(newClassName);
                                    if (isNameValid) {
                                        onEditClass(newClassName, newClassDuration, newClassRecurrence);
                                        if (nameChanged) changes.push(`name changed to "${newClassName}"`);
                                        if (durationChanged) changes.push(`duration changed to ${newClassDuration} min`);
                                        if (recurrenceChanged) changes.push(`repeats set to ${newClassRecurrence ? 'Weekly' : 'One-off'}`);
                                    } else if (Platform.OS === 'web') {
                                        alert('Class with such name already exists');
                                    } else {
                                        Alert.alert('Conflict', 'Class with such name already exists');
                                    }
                                }
                                if (priceChanged) {
                                    if (priceId !== null) {
                                        onEditPrice(priceId, newClassPrice, classId);
                                    } else {
                                        // No price record exists yet for this class (e.g. it was
                                        // created at the default price of 0 before that was fixed) —
                                        // create one instead of trying to PATCH a nonexistent record.
                                        onCreatePrice(classId, newClassPrice, newClassName);
                                    }
                                    changes.push(`price changed to ${newClassPrice}`);
                                }

                                if (changes.length > 0) {
                                    setSuccessMessage(`Class was updated successfully — ${changes.join(', ')}.`);
                                }
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
    createButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
    },
});

export default EditClassModal;
