import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, Modal, TextInput } from 'react-native';

import ScreenTitle from './ScreenTitle';


type ClassCreationModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onCreateClass: (className: string) => void;
    onScheduleClass: (classToScheduleId: string, classToScheduleName: string, dayId: number, dayName: string, time: string) => void;
    onUniquenessCheck: (dayId: number, time: string) => Boolean;
    statusMessage: string;
    isSheduleSuccess: boolean;
};

const CreateScheduleClass = ({
    isVisible = false,
    onModalClose,
    onCreateClass,
    onScheduleClass,
    onUniquenessCheck,
    statusMessage,
    isSheduleSuccess = false,
}: ClassCreationModalProps) => {
    const colorScheme = useColorScheme();

    const [className, setClassName] = useState("");
    const [classId, setClassId] = useState("");

    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [selectedDayName, setSelectedDayName] = useState("");

    const [time, setTime] = useState("");

    const [isAddDayOpen, setIsAddDayOpen] = useState(false);

    const dayNumbers = new Map<string, number>([
        ["Monday", 1],
        ["Tuesday", 2],
        ["Wednesday", 3],
        ["Thursday", 4],
        ["Friday", 5],
        ["Saturday", 6],
        ["Sunday", 7],
      ]);


    // TODO: open time scheduling view only when day is selected. Otherwise keep hidden

    const renderAddDayView = () => {
        return (
            <View>
                {[...dayNumbers].map(([dayName, dayIndex]) => (
                    <Pressable
                        key={dayIndex}
                        style={styles.dayContainer}
                        onPress={() => {
                            console.log(`Selected ${dayName} (${dayIndex})`);
                            setSelectedDayId(dayIndex);
                            setSelectedDayName(dayName);
                            setIsAddDayOpen(false);
                        }}
                    >
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dayText]}>
                            {dayName}
                        </Text>
                    </Pressable>
                ))}
            </View>
        );
    };

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
                        Day:
                    </Text>
                    <View style={{position: 'relative'}}>
                        <Pressable
                            style={styles.dayContainer}
                            onPress={() => {
                                setIsAddDayOpen(!isAddDayOpen);
                            }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dayText]}>{selectedDayName ? selectedDayName : "+ Add day"}</Text>
                        </Pressable>
                        <View>
                            {isAddDayOpen ? <View style={styles.dropdown}>{renderAddDayView()}</View> : null}
                        </View>
                    </View>
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
                        style={styles.createButton}
                        onPress={() => {
                            console.log(`Class id is ${classId}, day is ${selectedDayName} (${selectedDayId}), time is ${time}`);
                            if (
                                classId === null ||
                                className === null ||
                                selectedDayId === null ||
                                selectedDayName === null ||
                                time === null
                            ){
                                console.warn('Missing data: cannot schedule');
                                return;
                            } else {
                                if (onUniquenessCheck(selectedDayId, time)) {
                                    onScheduleClass(classId, className, selectedDayId, selectedDayName, time)
                                } else {
                                    alert('Such schedule is already taken');
                                    console.log(`There is already a class scheduled to ${selectedDayId}(${selectedDayName}), ${time}`);
                                }
                            }
                        }
                    }
                    >
                        <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Schedule</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderCreateScheduleForm = () => {
        return (
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
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                            Class was created and scheduled successfully!
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

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            {isSheduleSuccess ? renderSuccessConfirmation() : renderCreateScheduleForm()}
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
    dayContainer: {
        width: 150,
        justifyContent: 'center',
        paddingRight: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
    },
    dayText: {
        fontWeight: "bold",
        padding: 10,
        paddingHorizontal: 20,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 10,
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
});

export default CreateScheduleClass;
