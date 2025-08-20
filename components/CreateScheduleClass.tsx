import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, Modal, TextInput } from 'react-native';

import ScreenTitle from './ScreenTitle';


type ClassCreationModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onCreateClass: (className: string) => void;
    onScheduleClass: (classToScheduleId: string, classToScheduleName: string, day: string, time: string) => void;
    statusMessage: string;
};

const CreateScheduleClass = ({
    isVisible = false,
    onModalClose,
    onCreateClass,
    onScheduleClass,
    statusMessage,
}: ClassCreationModalProps) => {
    const colorScheme = useColorScheme();

    const [className, setClassName] = useState("");
    const [classId, setClassId] = useState("");

    const [day, setDay] = useState("");
    const [time, setTime] = useState("");

    const renderClassCreationForm = () => {
        return (
            <View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Class name:
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={className}
                        onChangeText={(createdClassName) => {setClassName(createdClassName)}}
                    />
                </View>
                <View style={styles.itemContainer}>
                    <Pressable
                        onPress={() => {onCreateClass(className)}}
                        style={styles.createButton}
                    >
                        <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Create</Text>
                    </Pressable>
                </View>
                <Text
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                >
                    {statusMessage}
                </Text>
            </View>
        );
    };

    const renderClassScheduleForm = () => {
        return (
            <View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Class:
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={classId}
                        onChangeText={(newClassId) => {setClassId(newClassId)}}
                    />
                </View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Day ("Monday"):
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={day}
                        onChangeText={(dayName) => {setDay(dayName)}}
                    />
                </View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Time ("10:00"):
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={time}
                        onChangeText={(timeStr) => {setTime(timeStr)}}
                    />
                </View>
                <View style={styles.itemContainer}>
                    <Pressable
                    // TODO: show confirmation and close on success of class schedule
                        onPress={() => {onScheduleClass(classId, className, day, time)}}
                        style={styles.createButton}
                    >
                        <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Schedule</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    // TODO: add a schedule confirmation
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <ScreenTitle titleText='Create new class'/>

                    {renderClassCreationForm()}

                    <View style={{paddingVertical: 30}}></View>

                    <ScreenTitle titleText='Schedule new class'/>

                    {renderClassScheduleForm()}

                    <Pressable
                        style={styles.modalCancelButton}
                        onPress={onModalClose}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Cancel</Text>
                    </Pressable>
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
    modalCancelButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'grey',
    },
});

export default CreateScheduleClass;
