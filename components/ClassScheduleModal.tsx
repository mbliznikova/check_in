import { Modal, View, Text, TextInput, StyleSheet, useColorScheme, Pressable, ScrollView } from "react-native";

import ScreenTitle from "./ScreenTitle";
import { useEffect, useRef, useState } from "react";

type ClassScheduleModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onRequestingTimeSlots: (dayName: string, classDurationToFit: number) => Promise<string[]>;
    onScheduleDelete: (scheduleId: number, day: number, time: string) => void;
    onScheduleClass: (classToScheduleId: string, classToScheduleName: string, dayId: number, dayName: string, time: string) => void;
    onUniquenessCheck: (dayId: number, time: string) => boolean;
    scheduleData: Map<number, [number, string][]>;
    classId: number | null;
    className: string | null;
    classDuration: number | null;
    isSheduleSuccess: boolean;
};

const ClassScheduleModal = ({
    isVisible = false,
    onModalClose,
    onRequestingTimeSlots,
    onScheduleDelete,
    onScheduleClass,
    onUniquenessCheck,
    scheduleData = new Map(),
    classId,
    className,
    classDuration,
    isSheduleSuccess = false,
}: ClassScheduleModalProps) => {

    const colorScheme = useColorScheme();

    const [isAddDayOpen, setIsAddDayOpen] = useState(false);
    const [isAddTimeOpen, setIsAddTimeOpen] = useState(false);

    const [dayToSchedule, setDayToSchedule] = useState<number | null>(null);
    const [timeToSchedule, setTimeToSchedule] = useState("");

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(isSheduleSuccess);

    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1);

    const initialClassId = useRef(classId);
    const initialClassName = useRef(className);

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

    const getRemainedDays = (): number[] => {
        const remainedDays: number[] = [];
        for (let i = 1; i < dayNames.length; i++) {
            if (!scheduleData.has(i)){
                remainedDays.push(i);
            }
        }

        return remainedDays;
    };

    const renderAddDayView = () => {
        return (
            <View>
                {getRemainedDays().map((dayIndex) => (
                    <Pressable
                        key={dayIndex}
                        style={styles.dayContainer}
                        onPress={() => {
                            console.log(`Selected ${dayNames[dayIndex]}`);
                            setIsAddDayOpen(false);
                            setIsAddTimeOpen(true);
                            setDayToSchedule(dayIndex);
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

    const renderAddTimeView = () => {
        return (
            <View style={{padding: 20, alignItems: 'center', position: 'relative'}}>
                <ScrollView style={{maxHeight: 200}}>
                    <View>
                        <Text
                            style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                        >
                            {`Select or enter time for ${dayToSchedule ? dayNames[dayToSchedule] : ""}:`}
                        </Text>
                        <View style={[styles.itemContainer]}>

                            <View style={styles.timeSlotsContainer}>
                                {timeSlots.map((sl, index) => (
                                    <Pressable
                                        key={sl}
                                        onPress={() => {
                                            setSelectedSlotIndex(index);
                                            setTimeToSchedule(sl);
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
                                    value={timeToSchedule}
                                    onChangeText={(timeStr) => {setTimeToSchedule(timeStr)}}
                                />
                            </View>
                        </View>

                        <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                            <Pressable
                                style={styles.modalConfirmButton}
                                onPress={() => {
                                    console.log(
                                        `Class id ${initialClassId.current}, class name ${initialClassName.current}, day ${dayNames[dayToSchedule!]}, time ${timeToSchedule}`);
                                        setTimeToSchedule("");
                                        if (
                                            initialClassId.current === null ||
                                            initialClassName.current === null ||
                                            dayToSchedule === null ||
                                            timeToSchedule === null ||
                                            !timeToSchedule
                                    ){
                                        console.warn('Missing data: cannot schedule.');
                                        return;
                                    } else {
                                        if (onUniquenessCheck(dayToSchedule, timeToSchedule)) {
                                                onScheduleClass(initialClassId.current?.toString(), initialClassName.current, dayToSchedule, dayNames[dayToSchedule], timeToSchedule);
                                                setIsAddTimeOpen(false);
                                        } else {
                                            alert('Such schedule is already taken');
                                            console.log(`There is already a class scheduled to ${dayToSchedule}(${dayNames[dayToSchedule]}), ${timeToSchedule}`);
                                        }
                                    }
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Schedule</Text>
                            </Pressable>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() => {setIsAddTimeOpen(false)}}
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
                                    setDayToSchedule(day); // TODO: something more reliable in case when the state var has not set yet?
                                    if (dayNames[day] !== null && classDuration !== null) {
                                        const slots = onRequestingTimeSlots(dayNames[day], classDuration);
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

    const renderSchedule = () => {
        return(
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                            {`Schedule for the class ${className}`}
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
            </View>
        );
    };

    const renderSuccessConfirmation = () => {
        return (
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                            Class was scheduled successfully!
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
                {renderSchedule()}
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
    dayContainer: {
        width: 150,
        justifyContent: 'center',
        marginRight: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        paddingVertical: 3,
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        width: '30%',
    },
    modalSingleButtonContainer: {
         justifyContent: 'center',
    },
    modalManyButtonsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
    },
    timeButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        justifyContent: 'center',
        minWidth: 70,
        marginHorizontal: 10,
    },
    timeText: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    addTimeButton: {
        padding: 10,
        paddingLeft: 20,
        fontSize: 20,
    },
    dayText: {
        fontWeight: "bold",
        padding: 10,
        paddingHorizontal: 20,
    },
    modalConfirmButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'green',
    },
    scheduleRowContainder: {
        padding: 10,
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 5,
    },
    deleteTimeButton: {
        textAlign: 'right',
        paddingRight: 5, color: 'red',
    },
    inputFeld: {
        height: 30,
        width: 200,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 15,
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row'
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        borderWidth: 1,
        borderRadius: 10,
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
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'grey',
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

export default ClassScheduleModal;
