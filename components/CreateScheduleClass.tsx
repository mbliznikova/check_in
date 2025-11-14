import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, Modal, TextInput, ScrollView } from 'react-native';

import ScreenTitle from './ScreenTitle';
import Checkbox from './Checkbox';


type ClassCreationModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onCreateClass: (className: string, newClassDuration?: number, isRecurring?: boolean) => void;
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
    const colorScheme = useColorScheme();

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

    const dayNames = [
        "",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

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
                            console.log(`Selected ${dayNames[dayIndex]}`);
                            setSelectedDayId(dayIndex);
                            setSelectedDayName(dayNames[dayIndex]);
                            setIsAddDayOpen(false);
                            setIsAddTimeOpen(true);
                            if (dayNames[dayIndex] !== null && newClassDuration !== null) {
                                const slots = onRequestingTimeSlots(dayNames[dayIndex], newClassDuration);
                                setTimeSlots(await slots);
                            }
                        }}
                    >
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dayText]}>
                            {dayNames[dayIndex]}
                        </Text>
                    </Pressable>
                ))}
            </View>
        );
    };

    const getRemainedDays = (): number[] => {
        const remainedDays: number[] = [];
        for (let i = 1; i < dayNames.length; i++) {
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
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
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
                                                colorScheme === 'dark'? styles.lightColor : styles.darkColor,
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
                                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                                    value={time}
                                    onChangeText={(timeStr) => {setTime(timeStr)}}
                                />
                            </View>
                        </View>

                        <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                            <Pressable
                                style={styles.modalConfirmButton}
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
                                            alert('Such schedule is already taken');
                                            console.log(`There is already a class scheduled to ${selectedDayName}, ${time}`);
                                        }
                                    }
                                    setSelectedSlotIndex(-1);
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Schedule</Text>
                            </Pressable>
                            <Pressable
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setIsAddTimeOpen(false);
                                    setTime("");
                                    setSelectedSlotIndex(-1);
                                }}
                                >
                                    <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Cancel</Text>
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
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dayText]}>
                                    {dayNames[day]}
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
                                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.deleteTimeButton]}>
                                        x
                                        </Text>
                                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.timeText]}>
                                            {time.slice(0,5)}
                                        </Text>
                                    </Pressable>
                            </View>
                            ))}
                            <Pressable
                                onPress={async () => {
                                    setSelectedDayId(day); // TODO: something more reliable in case when the state var has not set yet?
                                    if (dayNames[day] !== null && newClassDuration !== null) {
                                        const slots = onRequestingTimeSlots(dayNames[day], newClassDuration);
                                        setTimeSlots(await slots);
                                    }
                                    setIsAddTimeOpen(true);
                                }}
                                style={styles.addTimeButton}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>+</Text>
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
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dayText]}>+ Add day</Text>
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

                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Class duration:
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

                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Price:
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
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
                                onClassUniquenessCheck(className) ? onCreateClass(className, newClassDuration, isRecurring) : alert('Class with such name already exists');
                            } else {
                                onClassUniquenessCheck(className) ? onCreateClass(className, undefined, isRecurring) : alert('Class with such name already exists');
                            }
                            setClassName("");
                        }}
                        style={className ? styles.createButton : styles.disabledButton}
                        disabled={!className}
                    >
                        <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Create</Text>
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

    const renderClassScheduleForm = () => {
        return (
            <View>
                <ScreenTitle titleText={isCreateSuccess ? `Schedule class ${className}` : ''}/>

                <View style={[styles.itemContainer, styles.itemRow, {justifyContent: 'center'}]}>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}
                        >
                            {isCreateSuccess ? `Class ${className} has been successfully created!` : ''}
                    </Text>
                </View>

                {renderSchedules(scheduleData)}

                <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer, (isAddDayOpen || isAddTimeOpen) && styles.hiddenButton]}>
                    <Pressable
                        style={styles.modalConfirmButton}
                        onPress={isAddDayOpen ? undefined : onModalClose}
                        disabled={isAddDayOpen}
                    >
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>OK</Text>
                    </Pressable>
                </View>

            </View>
        );
    };

    const renderCreateScheduleForm = () => {
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <ScreenTitle titleText={isCreateSuccess ? '' : 'Create new class'}/>
                    {isCreateSuccess? renderClassScheduleForm() : renderClassCreationForm()}
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
                            onPress={() => {
                                setIsAddTimeOpen(false);
                                setIsConfirmationOpen(false);
                                setSelectedSlotIndex(-1);
                            }}
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
            <View style={{flex: 1}}>
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
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: 'green',
    },
    disabledButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'grey',
        opacity: 0.5,
    },
    modalCancelButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: 'grey',
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
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
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
