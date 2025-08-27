import { Modal, View, Text, TextInput, StyleSheet, useColorScheme, Pressable } from "react-native";

import ScreenTitle from "./ScreenTitle";
import { useState } from "react";

type ClassScheduleModalModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onScheduleDelete: (scheduleId: number, day: number) => void;
    scheduleData: Map<number, [number, string][]>;
    classId: number | null;
};

const ClassScheduleModal = ({
    isVisible = false,
    onModalClose,
    onScheduleDelete,
    scheduleData = new Map(),
    classId,
}: ClassScheduleModalModalProps) => {

    const colorScheme = useColorScheme();

    const [isAddDayOpen, setIsAddDayOpen] = useState(false);
    const [isAddTimeOpen, setIsAddTimeOpen] = useState(false);

    const [dayToSchedule, setDayToSchedule] = useState<number | null>(null);
    const [timeToSchedule, setTimeToSchedule] = useState<string | null>(null);
    const [timeInput, setTimeInput] = useState<string>("");

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
            <View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Time ("10:00"):
                    </Text>

                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={timeInput}
                        onChangeText={(timeStr) => {setTimeInput(timeStr)}}
                    />
                </View>

                <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                    <Pressable
                        style={styles.modalConfirmButton}
                        onPress={() => {
                            console.log(`Class id is ${classId}, day is ${dayToSchedule} (${dayNames[dayToSchedule!]}), time is ${timeInput}`);
                        }}
                    >
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Schedule</Text>
                    </Pressable>
                </View>
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
                                    style={{paddingHorizontal: 10}}
                                    key={scheduleId}>
                                    <Pressable
                                        style={styles.timeButton}
                                        onPress={() => {
                                            onScheduleDelete(scheduleId, day);
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
                                onPress={() => {}}
                                style={styles.addTimeButton}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>+</Text>
                            </Pressable>
                    </View>
                ))}
                <View style={{position: 'relative'}}>
                    <Pressable
                        style={styles.dayContainer}
                        onPress={() => {
                            setIsAddDayOpen(!isAddDayOpen);
                        }}
                    >
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dayText]}>+ Add day</Text>
                    </Pressable>
                    <View>
                        {isAddDayOpen ? <View style={styles.dropdown}>{renderAddDayView()}</View> : null}
                        {isAddTimeOpen ? renderAddTimeView() : null}
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
                            Schedule for the class
                        </Text>
                    </View>

                    {renderSchedules(scheduleData)}

                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer, isAddDayOpen && styles.hiddenButton]}>
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

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            {renderSchedule()}
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
        paddingRight: 10,
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
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        width: '30%',
    },
    modalSingleButtonContainer: {
         justifyContent: 'center',
    },
    timeButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        justifyContent: 'center',
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
    addDayButton: {
        width: 100,
        padding: 10,
        marginLeft: 25,
        marginTop: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
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
        justifyContent: 'space-between',
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
        borderColor: 'grey',
        borderRadius: 10,
    },
    hiddenButton: {
        opacity: 0,
        width: 0,
        overflow: 'hidden',
    },
});

export default ClassScheduleModal;
