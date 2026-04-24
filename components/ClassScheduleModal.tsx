import { Modal, View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, Platform, ViewStyle, PlatformIOSStatic } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

import { useEffect, useRef, useState } from "react";
import { DAY_NAMES } from '@/constants/scheduling';
import { commonStyles } from '@/constants/commonStyles';

const isIpad = Platform.OS === 'ios' && (Platform as PlatformIOSStatic).isPad;

const percentageStyles = {
    modalViewWeb: { maxWidth: 360, height: '40%', alignItems: 'center', justifyContent: 'center' } as ViewStyle,
    modalViewPad: { maxHeight: '85%' } as ViewStyle,
    modalViewPhone: { width: '95%', maxHeight: '85%' } as ViewStyle,
    dropdown: { position: 'absolute', top: '100%', borderWidth: 1, borderRadius: 10 } as ViewStyle,
};

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

    const textStyle = useThemeTextStyle();
    const colorScheme = useColorScheme() ?? 'light';

    const [isAddDayOpen, setIsAddDayOpen] = useState(false);
    const [isAddTimeOpen, setIsAddTimeOpen] = useState(false);

    const [dayToSchedule, setDayToSchedule] = useState<number | null>(null);
    const [timeToSchedule, setTimeToSchedule] = useState("");

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(isSheduleSuccess);

    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1);

    const initialClassId = useRef(classId);
    const initialClassName = useRef(className);


    const [pendingDelete, setPendingDelete] = useState<{
        scheduleId: number;
        day: number;
        time: string;
    } | null>(null);

    useEffect(() => {
        setIsConfirmationOpen(isSheduleSuccess)
    }, [isSheduleSuccess]);

    const getRemainedDays = (): number[] => {
        const remainedDays: number[] = [];
        for (let i = 1; i < DAY_NAMES.length; i++) {
            if (!scheduleData.has(i)){
                remainedDays.push(i);
            }
        }

        return remainedDays;
    };

    const renderAddDayView = () => {
        if (Platform.OS === 'web') {
            return (
                <View>
                    {getRemainedDays().map((dayIndex) => (
                        <Pressable
                            key={dayIndex}
                            style={styles.dayContainer}
                            onPress={async () => {
                                console.log(`Selected ${DAY_NAMES[dayIndex]}`);
                                setIsAddDayOpen(false);
                                setIsAddTimeOpen(true);
                                setDayToSchedule(dayIndex);
                                if (DAY_NAMES[dayIndex] !== null && classDuration !== null) {
                                    const slots = onRequestingTimeSlots(DAY_NAMES[dayIndex], classDuration);
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
        }

        return (
            <View style={styles.pickerContainer}>
                {getRemainedDays().map((dayIndex) => (
                    <Pressable
                        key={dayIndex}
                        style={styles.pickerItem}
                        onPress={async () => {
                            console.log(`Selected ${DAY_NAMES[dayIndex]}`);
                            setIsAddDayOpen(false);
                            setIsAddTimeOpen(true);
                            setDayToSchedule(dayIndex);
                            if (DAY_NAMES[dayIndex] !== null && classDuration !== null) {
                                const slots = onRequestingTimeSlots(DAY_NAMES[dayIndex], classDuration);
                                setTimeSlots(await slots);
                            }
                        }}
                    >
                        <Text style={[textStyle, styles.dayText]}>
                            {DAY_NAMES[dayIndex]}
                        </Text>
                    </Pressable>
                ))}
                <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                    <Pressable
                        style={styles.cancelButton}
                        onPress={() => setIsAddDayOpen(false)}
                    >
                        <Text style={[textStyle]}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderTimeSlots = () => (
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
                            textStyle,
                            styles.timeSlot,
                            selectedSlotIndex === index
                                ? [styles.selectedTimeSlotBorders, {borderColor: Colors[colorScheme].text}]
                                : styles.notSelectedTimeSlotBorders
                        ]}
                    >
                        {sl}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    const renderTimeButtons = (onSchedule: () => void) => (
        <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
            <Pressable
                style={styles.modalConfirmButton}
                onPress={onSchedule}
            >
                <Text style={[textStyle]}>Schedule</Text>
            </Pressable>
            <Pressable
                style={styles.cancelButton}
                onPress={() => {setIsAddTimeOpen(false)}}
            >
                <Text style={[textStyle]}>Cancel</Text>
            </Pressable>
        </View>
    );

    const handleSchedulePress = async () => {
        console.log(
            `Class id ${initialClassId.current}, class name ${initialClassName.current}, day ${DAY_NAMES[dayToSchedule!]}, time ${timeToSchedule}`);
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
                onScheduleClass(initialClassId.current?.toString(), initialClassName.current, dayToSchedule, DAY_NAMES[dayToSchedule], timeToSchedule);
                setIsAddTimeOpen(false);
                if (DAY_NAMES[dayToSchedule] !== null && classDuration !== null){
                    const slots = onRequestingTimeSlots(DAY_NAMES[dayToSchedule], classDuration);
                    setTimeSlots(await slots);
                }
            } else {
                Platform.OS === 'web'
                    ? alert('Such schedule is already taken')
                    : Alert.alert('Conflict', 'Such schedule is already taken');
                console.log(`There is already a class scheduled to ${dayToSchedule}(${DAY_NAMES[dayToSchedule]}), ${timeToSchedule}`);
            }
        }
    };

    const renderAddTimeView = () => {
        const label = `Select or enter time for ${dayToSchedule ? DAY_NAMES[dayToSchedule] : ""}:`;

        if (Platform.OS === 'web') {
            return (
                <View style={{padding: 20, alignItems: 'center', position: 'relative'}}>
                    <ScrollView style={{maxHeight: 200}}>
                        <View>
                            <Text style={[textStyle, styles.itemContainer]}>{label}</Text>
                            <View style={[styles.itemContainer]}>
                                {renderTimeSlots()}
                                <View style={{paddingTop: 20}}>
                                    <TextInput
                                        style={[textStyle, commonStyles.inputField]}
                                        value={timeToSchedule}
                                        onChangeText={(timeStr) => {setTimeToSchedule(timeStr)}}
                                    />
                                </View>
                            </View>
                            {renderTimeButtons(handleSchedulePress)}
                        </View>
                    </ScrollView>
                </View>
            );
        }

        return (
            <View style={{paddingHorizontal: 10, paddingVertical: 10}}>
                <Text style={[textStyle, {paddingBottom: 10, paddingLeft: 5}]}>{label}</Text>
                {renderTimeSlots()}
                <View style={{paddingTop: 10, marginLeft: 5}}>
                    <TextInput
                        style={[textStyle, commonStyles.inputField, {width: '100%'}]}
                        value={timeToSchedule}
                        onChangeText={(timeStr) => {setTimeToSchedule(timeStr)}}
                    />
                </View>
                {renderTimeButtons(handleSchedulePress)}
            </View>
        );
    };

    // TODO: think about handling of time when seconds part is missing (rather BE refactor and no need of slice()??)
    const renderSchedules = (schedule: Map<number, [number, string][]>) => {
        const isWeb = Platform.OS === 'web';
        return (
            <View style={styles.scheduleRowContainder}>
                {[...schedule].map(([day, times]) => (
                    <View key={day} style={styles.scheduleRow}>
                        <View style={[styles.dayContainer, isWeb ? styles.dayContainerWeb : styles.dayContainerNative]}>
                            <Text style={[textStyle, styles.dayText, isWeb && styles.dayTextWeb]}>
                                {DAY_NAMES[day]}
                            </Text>
                        </View>
                        {isWeb ? (
                            <View style={styles.timesRowWeb}>
                                {times.map(([scheduleId, time]) => (
                                    <Pressable
                                        key={scheduleId}
                                        style={styles.timeButton}
                                        onPress={() => setPendingDelete({scheduleId, day, time})}
                                    >
                                        <Text style={[textStyle, styles.deleteTimeButton]}>x</Text>
                                        <Text style={[textStyle, styles.timeText]}>{time.slice(0,5)}</Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    onPress={async () => {
                                        setDayToSchedule(day);
                                        if (DAY_NAMES[day] !== null && classDuration !== null) {
                                            const slots = onRequestingTimeSlots(DAY_NAMES[day], classDuration);
                                            setTimeSlots(await slots);
                                        }
                                        setIsAddTimeOpen(true);
                                    }}
                                    style={styles.addTimeButton}
                                >
                                    <Text style={[textStyle]}>+</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.timesScrollNative}
                                contentContainerStyle={styles.timesRowNative}
                            >
                                {times.map(([scheduleId, time]) => (
                                    <Pressable
                                        key={scheduleId}
                                        style={styles.timeButton}
                                        onPress={() => setPendingDelete({scheduleId, day, time})}
                                    >
                                        <Text style={[textStyle, styles.deleteTimeButton]}>x</Text>
                                        <Text style={[textStyle, styles.timeText]}>{time.slice(0,5)}</Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    onPress={async () => {
                                        setDayToSchedule(day);
                                        if (DAY_NAMES[day] !== null && classDuration !== null) {
                                            const slots = onRequestingTimeSlots(DAY_NAMES[day], classDuration);
                                            setTimeSlots(await slots);
                                        }
                                        setIsAddTimeOpen(true);
                                    }}
                                    style={styles.addTimeButton}
                                >
                                    <Text style={[textStyle]}>+</Text>
                                </Pressable>
                            </ScrollView>
                        )}
                    </View>
                ))}
                <View style={styles.scheduleRow}>
                    <View style={isWeb ? {position: 'relative'} : undefined}>
                        <Pressable
                            style={[styles.dayContainer, isWeb ? styles.dayContainerWeb : styles.dayContainerNative]}
                            onPress={() => setIsAddDayOpen(!isAddDayOpen)}
                        >
                            <Text style={[textStyle, styles.dayText, isWeb && styles.dayTextWeb]}>+ Add day</Text>
                        </Pressable>
                        {isWeb && isAddDayOpen && <View style={percentageStyles.dropdown}>{renderAddDayView()}</View>}
                        {isWeb && isAddTimeOpen && <View style={[percentageStyles.dropdown, {borderColor: 'grey'}]}>{renderAddTimeView()}</View>}
                    </View>
                </View>
            </View>
        );
    };


    const renderDeleteChoice = () => {
        if (!pendingDelete) return null;

        const { scheduleId, day, time } = pendingDelete;

        return (
            <View style={[styles.modalView, { backgroundColor: Colors[colorScheme].background }]}>
                <View style={styles.modalInfo}>
                    <Text style={[textStyle, {fontWeight: "bold"}]}>
                        Do you want to delete this schedule?
                    </Text>
                </View>
                <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer, { width: '50%' }]}>
                    <Pressable
                        style={styles.modalConfirmButton}
                        onPress={() => {
                            onScheduleDelete(scheduleId, day, time);
                            setPendingDelete(null);
                        }}
                    >
                        <Text style={[textStyle]}>Delete</Text>
                    </Pressable>
                    <Pressable
                        style={styles.cancelButton}
                        onPress={() => {
                            setPendingDelete(null);
                        }}
                    >
                        <Text style={[textStyle]}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderScheduleContent = () => (
        <View>
            <View style={styles.modalInfo}>
                <Text style={[textStyle, {fontWeight: "bold"}]}>
                    {`Schedule for the class ${className}`}
                </Text>
            </View>

            {renderSchedules(scheduleData)}

            {Platform.OS !== 'web' && isAddDayOpen && renderAddDayView()}
            {Platform.OS !== 'web' && isAddTimeOpen && renderAddTimeView()}

            <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer, (isAddDayOpen || isAddTimeOpen) && styles.hiddenButton]}>
                <Pressable
                    style={styles.modalConfirmButton}
                    onPress={isAddDayOpen ? undefined : onModalClose}
                    disabled={isAddDayOpen}
                >
                    <Text style={[textStyle]}>OK</Text>
                </Pressable>
            </View>
        </View>
    );

    const renderSchedule = () => {
        return(
            <View style={styles.modalContainer}>
                <View style={[styles.modalView, Platform.OS === 'web'
                    ? percentageStyles.modalViewWeb :
                    (isIpad ? percentageStyles.modalViewPad : percentageStyles.modalViewPhone), { backgroundColor: Colors[colorScheme].background }]}>

                    {Platform.OS === 'web'
                        ? renderScheduleContent()
                        : <ScrollView contentContainerStyle={styles.modalScrollContent}>{renderScheduleContent()}</ScrollView>
                    }
                </View>
            </View>
        );
    };

    const renderSuccessConfirmation = () => {
        return (
                <View style={[styles.modalView, { backgroundColor: Colors[colorScheme].background }]}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, {fontWeight: "bold"}]}>
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
                                <Text style={[textStyle]}>OK</Text>
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
            <View style={{flex: 1, backgroundColor: (Platform.OS === 'ios' && !isIpad) ? Colors[colorScheme].background : undefined}}>
                {isConfirmationOpen && (
                    <View style={styles.confirmationOverlay}>
                        {renderSuccessConfirmation()}
                    </View>
                )}

                {pendingDelete && (
                    <View style={styles.confirmationOverlay}>
                        {renderDeleteChoice()}
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
        width: '85%',
        backgroundColor: 'black', //TODO: make it adjustable
        borderRadius: 20,
        padding: 20,
    },
    modalScrollContent: {
        alignItems: 'stretch',
    },
    modalInfo: {
        padding: 20,
    },
    dayContainer: {
        justifyContent: 'center',
        marginRight: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        paddingVertical: 3,
    },
    dayContainerWeb: {
        width: 150,
    },
    dayContainerNative: {
        width: 120,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        gap: 16,
    },
    modalSingleButtonContainer: {
         justifyContent: 'center',
    },
    modalManyButtonsContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
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
    },
    dayTextWeb: {
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
        alignItems: 'flex-start',
        padding: 5,
    },
    timesRowWeb: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timesScrollNative: {
        flex: 1,
    },
    timesRowNative: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickerContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    pickerItem: {
        alignSelf: 'flex-start' as const,
        minWidth: 120,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        marginVertical: 4,
    },
    deleteTimeButton: {
        textAlign: 'right',
        paddingRight: 5, color: 'red',
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row'
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
    confirmationOverlay: {
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
