import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';

import ScreenTitle from './ScreenTitle';
import Checkbox from './Checkbox';
import { DAY_NAMES } from '@/constants/scheduling';


type ClassCreationModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onCreateClass: (className: string, price: number, newClassDuration?: number, isRecurring?: boolean) => void;
    onClassUniquenessCheck: (name: string) => boolean;
    onRequestingTimeSlots: (dayName: string, classDurationToFit: number) => Promise<string[]>;
    onScheduleClass: (classToScheduleId: string, classToScheduleName: string, dayId: number, dayName: string, time: string) => void;
    onScheduleUniquenessCheck: (dayId: number, time: string) => boolean;
    onScheduleDelete: (scheduleId: number, day: number, time: string) => void;
    defaultClassDuration: number;
    isCreateSuccess: boolean;
    isError: boolean;
    createdClassId: number | null;
    scheduleData: Map<number, [number, string][]>;
    isSheduleSuccess: boolean;
};

const CreateScheduleClass = ({
    isVisible = false,
    onModalClose,
    onCreateClass,
    onClassUniquenessCheck,
    onRequestingTimeSlots,
    onScheduleClass,
    onScheduleUniquenessCheck,
    onScheduleDelete,
    defaultClassDuration,
    isCreateSuccess,
    isError,
    createdClassId,
    scheduleData = new Map(),
    isSheduleSuccess = false,
}: ClassCreationModalProps) => {
    const textStyle = useThemeTextStyle();
    const colorScheme = useColorScheme() ?? 'light';
    const modalStyles = useModalStyles();

    const [className, setClassName] = useState("");
    const [newClassDuration, setNewClassDuration] = useState(defaultClassDuration);
    const [isRecurring, setIsRecurring] = useState(false);
    const [classPrice, setClassPrice] = useState(0);

    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [selectedDayName, setSelectedDayName] = useState("");

    const [time, setTime] = useState("");

    const [isAddDayOpen, setIsAddDayOpen] = useState(false);
    const [isAddTimeOpen, setIsAddTimeOpen] = useState(false);

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(isSheduleSuccess);

    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1);


    useEffect(() => {
        setIsConfirmationOpen(isSheduleSuccess)
    }, [isSheduleSuccess]);

    const renderAddDayView = () => {
        return (
            <View>
                {getRemainedDays().map((dayIndex) => (
                    <Pressable
                        key={dayIndex}
                        style={styles.dayContainer}
                        onPress={async () => {
                            console.log(`Selected ${DAY_NAMES[dayIndex]}`);
                            setSelectedDayId(dayIndex);
                            setSelectedDayName(DAY_NAMES[dayIndex]);
                            setIsAddDayOpen(false);
                            setIsAddTimeOpen(true);
                            if (DAY_NAMES[dayIndex] !== null && newClassDuration !== null) {
                                const slots = onRequestingTimeSlots(DAY_NAMES[dayIndex], newClassDuration);
                                setTimeSlots(await slots);
                            }
                        }}
                    >
                        <Text style={[textStyle, styles.dayText]}>
                            {DAY_NAMES[dayIndex]}
                        </Text>
                    </Pressable>
                ))}
            </View>
        );
    };

    const getRemainedDays = (): number[] => {
        const remainedDays: number[] = [];
        for (let i = 1; i < DAY_NAMES.length; i++) {
            if (!scheduleData.has(i)){
                remainedDays.push(i);
            }
        }

        return remainedDays;
    };

    const renderAddTimeView = () => {
        return (
            <View style={{padding: 20, alignItems: 'center', position: 'relative'}}>
                <ScrollView style={{maxHeight: 200}}>
                    <View>
                        <Text
                            style={[textStyle, styles.itemContainer]}
                        >
                            {`Select or enter time for ${selectedDayId ? selectedDayName : ""}:`}
                        </Text>
                        <View style={[styles.itemContainer]}>

                            <View style={styles.timeSlotsContainer}>
                                {timeSlots.map((sl, index) => (
                                    <Pressable
                                        key={sl}
                                        onPress={() => {
                                            setSelectedSlotIndex(index);
                                            setTime(sl);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                textStyle,
                                                styles.timeSlot,
                                                selectedSlotIndex === index ? styles.selectedTimeSlotBorders : styles.notSelectedTimeSlotBorders
                                            ]}
                                        >
                                            {sl}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View style={{paddingTop: 20}}>
                                <TextInput
                                    style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                                    value={time}
                                    onChangeText={(timeStr) => {setTime(timeStr)}}
                                />
                            </View>
                        </View>

                        <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                            <Pressable
                                style={modalStyles.modalConfirmButton}
                                onPress={async () => {
                                    console.log(
                                        `Class id ${createdClassId}, class name ${className}, day ${selectedDayName}, time ${time}`);
                                        setTime("");
                                        if (
                                            createdClassId === null ||
                                            selectedDayId === null ||
                                            time === null ||
                                            !time
                                    ){
                                        console.warn('Missing data: cannot schedule.');
                                        return;
                                    } else {
                                        if (onScheduleUniquenessCheck(selectedDayId, time)) {
                                                onScheduleClass(createdClassId?.toString(), className, selectedDayId, selectedDayName, time);
                                                setIsAddTimeOpen(false);
                                                setTime("");
                                                const slots = onRequestingTimeSlots(selectedDayName, newClassDuration);
                                                setTimeSlots(await slots);
                                        } else {
                                            Platform.OS === 'web'
                                                ? alert('Such schedule is already taken')
                                                : Alert.alert('Conflict', 'Such schedule is already taken');
                                            console.log(`There is already a class scheduled to ${selectedDayName}, ${time}`);
                                        }
                                    }
                                    setSelectedSlotIndex(-1);
                                }}
                            >
                                <Text style={[textStyle]}>Schedule</Text>
                            </Pressable>
                            <Pressable
                                style={modalStyles.modalCancelButton}
                                onPress={() => {
                                    setIsAddTimeOpen(false);
                                    setTime("");
                                    setSelectedSlotIndex(-1);
                                }}
                                >
                                    <Text style={[textStyle]}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    };

    // TODO: think about handling of time when seconds part is missing (rather BE refactor and no need of slice()??)
    const renderSchedules = (schedule: Map<number, [number, string][]>) => {
        return (
            <View style={styles.scheduleRowContainder}>
                {[...schedule].map(([day, times]) => (
                    <View
                        key={day}
                        style={styles.scheduleRow}>
                            <View style={styles.dayContainer}>
                                <Text style={[textStyle, styles.dayText]}>
                                    {DAY_NAMES[day]}
                                </Text>
                            </View>
                            {times.map(([scheduleId, time]) => (
                                <View
                                    key={scheduleId}>
                                    <Pressable
                                        style={styles.timeButton}
                                        onPress={() => {
                                            onScheduleDelete(scheduleId, day, time);
                                        }}
                                    >
                                        <Text style={[textStyle, styles.deleteTimeButton]}>
                                        x
                                        </Text>
                                        <Text style={[textStyle, styles.timeText]}>
                                            {time.slice(0,5)}
                                        </Text>
                                    </Pressable>
                            </View>
                            ))}
                            <Pressable
                                onPress={async () => {
                                    setSelectedDayId(day); // TODO: something more reliable in case when the state var has not set yet?
                                    if (DAY_NAMES[day] !== null && newClassDuration !== null) {
                                        const slots = onRequestingTimeSlots(DAY_NAMES[day], newClassDuration);
                                        setTimeSlots(await slots);
                                    }
                                    setIsAddTimeOpen(true);
                                }}
                                style={styles.addTimeButton}
                            >
                                <Text style={[textStyle]}>+</Text>
                            </Pressable>
                    </View>
                ))}
                <View style={styles.scheduleRow}>
                    <View style={{position: 'relative'}}>
                        <Pressable
                            style={styles.dayContainer}
                            onPress={() => {
                                setIsAddDayOpen(!isAddDayOpen);
                            }}
                        >
                            <Text style={[textStyle, styles.dayText]}>+ Add day</Text>
                        </Pressable>
                        {isAddDayOpen ? <View style={styles.dropdown}>{renderAddDayView()}</View> : null}
                        {isAddTimeOpen ? <View style={[styles.dropdown, {borderColor: 'grey'}]}>{renderAddTimeView()}</View> : null}
                    </View>
                </View>
            </View>
        );
    };

    const renderClassCreationForm = () => {
        return (
            <View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[textStyle, styles.itemContainer]}
                    >
                        Class name:
                    </Text>
                    <TextInput
                        style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                        value={className}
                        onChangeText={(createdClassName) => {setClassName(createdClassName)}}
                    />
                </View>

                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[textStyle, styles.itemContainer]}
                    >
                        Class duration:
                    </Text>
                    <TextInput
                        style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                        value={newClassDuration?.toString()}
                        onChangeText={(updatedClassDuration) => {
                            setNewClassDuration(Number(updatedClassDuration)) // TODO: think about better handling and type conversion & validation. Number picker?
                        }}
                    ></TextInput>
                </View>

                <View style={[styles.itemContainer, styles.itemRow, {paddingVertical: 10, justifyContent: 'space-between', alignSelf: 'center'}]}>
                    <Text
                        style={[textStyle, styles.itemContainer, ]}
                        >
                            Is recurring?
                    </Text>
                    <Checkbox
                        label=''
                        checked={isRecurring}
                        onChange={() => {setIsRecurring(!isRecurring)}}
                        labelStyle={textStyle}
                    />
                </View>

                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[textStyle, styles.itemContainer]}
                    >
                        Price:
                    </Text>
                    <TextInput
                        style={[textStyle, commonStyles.inputField, { flex: 1 }]}
                        value={(classPrice.toString())}
                        onChangeText={(classPriceAmount) => {
                            setClassPrice(Number(classPriceAmount))
                        }}
                    ></TextInput>
                </View>

                <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                    <Pressable
                        onPress={() => {
                            if (newClassDuration !== defaultClassDuration) {
                                console.log(`isRecurring is ${isRecurring}`)
                                if (onClassUniquenessCheck(className)) {
                                    onCreateClass(className, classPrice, newClassDuration, isRecurring);
                                } else if (Platform.OS === 'web') {
                                    alert('Class with such name already exists');
                                } else {
                                    Alert.alert('Conflict', 'Class with such name already exists');
                                }
                            } else {
                                if (onClassUniquenessCheck(className)) {
                                    onCreateClass(className, classPrice, undefined, isRecurring);
                                } else if (Platform.OS === 'web') {
                                    alert('Class with such name already exists');
                                } else {
                                    Alert.alert('Conflict', 'Class with such name already exists');
                                }
                            }
                            setClassName("");
                        }}
                        style={[modalStyles.modalConfirmButton, !className && { opacity: 0.5 }]}
                        disabled={!className}
                    >
                        <Text style={textStyle}>Create</Text>
                    </Pressable>
                    <Pressable
                        style={modalStyles.modalCancelButton}
                        onPress={onModalClose}
                        >
                            <Text style={[textStyle]}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderClassScheduleForm = () => {
        return (
            <View>
                <ScreenTitle titleText={isCreateSuccess ? `Schedule class ${className}` : ''}/>

                <View style={[styles.itemContainer, styles.itemRow, {justifyContent: 'center'}]}>
                        <Text
                            style={[textStyle]}
                        >
                            {isCreateSuccess ? `Class ${className} has been successfully created!` : ''}
                    </Text>
                </View>

                {renderSchedules(scheduleData)}

                <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer, (isAddDayOpen || isAddTimeOpen) && styles.hiddenButton]}>
                    <Pressable
                        style={modalStyles.modalConfirmButton}
                        onPress={isAddDayOpen ? undefined : onModalClose}
                        disabled={isAddDayOpen}
                    >
                        <Text style={[textStyle]}>OK</Text>
                    </Pressable>
                </View>

            </View>
        );
    };

    const renderCreateScheduleForm = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <ScreenTitle titleText={isCreateSuccess ? '' : 'Create new class'}/>
                    {isCreateSuccess? renderClassScheduleForm() : renderClassCreationForm()}
                </View>
            </View>
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, {fontWeight: "bold"}]}>
                            Class was created and scheduled successfully!
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                        <Pressable
                            style={modalStyles.modalConfirmButton}
                            onPress={() => {
                                setIsAddTimeOpen(false);
                                setIsConfirmationOpen(false);
                                setSelectedSlotIndex(-1);
                            }}
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
            <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
                {isConfirmationOpen && (
                    <View style={styles.successOverlay}>
                        {renderSuccessConfirmation()}
                    </View>
                )}
                {renderCreateScheduleForm()}
            </View>
        </Modal>

    );
};

const styles = StyleSheet.create({
    modalInfo: {
        padding: 20,
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
    scheduleRowContainder: {
        padding: 10,
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 5,
    },
    dayContainer: {
        width: 150,
        justifyContent: 'center',
        paddingRight: 10,
        paddingVertical: 3,
        borderRadius: 10,
        marginRight: 10,
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
        borderRadius: 10,
    },
    timeButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        justifyContent: 'center',
        minWidth: 70,
        marginHorizontal: 10,
    },
    addTimeButton: {
        padding: 10,
        paddingLeft: 20,
        fontSize: 20,
    },
    timeText: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        width: '30%',
        justifyContent: 'center',
    },
    modalManyButtonsContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        gap: 16,
    },
    modalSingleButtonContainer: {
         justifyContent: 'center'
    },
    hiddenButtonContainer: {
        opacity: 0,
        width: 0,
        overflow: 'hidden',
    },
    hiddenButton: {
        opacity: 0,
        width: 0,
        overflow: 'hidden',
    },
    timeSlotsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginVertical: 10,
    },
    timeSlot: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        margin: 5,
        minWidth: 60,
        textAlign: "center",
    },
    selectedTimeSlotBorders: {
        borderWidth: 3,
        borderColor: "white",
    },
    notSelectedTimeSlotBorders: {
        borderWidth: 1,
        borderColor: "grey",
    },
    deleteTimeButton: {
        textAlign: 'right',
        paddingRight: 5, color: 'red',
    },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10,
    },
});

export default CreateScheduleClass;
