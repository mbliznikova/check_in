import { Modal, View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, Platform, ViewStyle, PlatformIOSStatic } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, INPUT_BORDER_COLOR } from '@/constants/Colors';
import { useModalStyles } from '@/constants/modalStyles';
import ScreenTitle from './ScreenTitle';

import { useEffect, useRef, useState } from "react";
import { DAY_NAMES } from '@/constants/scheduling';
import { commonStyles } from '@/constants/commonStyles';

const isIpad = Platform.OS === 'ios' && (Platform as PlatformIOSStatic).isPad;

const percentageStyles = {
    modalViewWeb: { alignItems: 'center', justifyContent: 'center' } as ViewStyle,
    modalViewPad: {} as ViewStyle,
    modalViewPhone: { width: '95%' } as ViewStyle,
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
    const modalStyles = useModalStyles();

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
        const onDayPress = async (dayIndex: number) => {
            console.log(`Selected ${DAY_NAMES[dayIndex]}`);
            setIsAddDayOpen(false);
            setIsAddTimeOpen(true);
            setDayToSchedule(dayIndex);
            setTimeToSchedule("");
            setSelectedSlotIndex(-1);
            if (DAY_NAMES[dayIndex] !== null && classDuration !== null) {
                const slots = onRequestingTimeSlots(DAY_NAMES[dayIndex], classDuration);
                setTimeSlots(await slots);
            }
        };

        const dayList = (
            <View style={styles.addDayListPanel}>
                {getRemainedDays().map((dayIndex, idx) => (
                    <Pressable
                        key={dayIndex}
                        style={[styles.addDayListRow, idx > 0 && styles.addDayListRowDivider]}
                        onPress={() => onDayPress(dayIndex)}
                    >
                        <Text style={[textStyle, styles.addDayListRowText]}>
                            {DAY_NAMES[dayIndex]}
                        </Text>
                    </Pressable>
                ))}
            </View>
        );

        if (Platform.OS === 'web') {
            return dayList;
        }

        return (
            <View>
                {dayList}
                <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                    <Pressable
                        style={modalStyles.modalCancelButton}
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
                style={modalStyles.modalConfirmButton}
                onPress={onSchedule}
            >
                <Text style={[textStyle]}>Schedule</Text>
            </Pressable>
            <Pressable
                style={modalStyles.modalCancelButton}
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
        return (
            <View style={[commonStyles.formContainer, styles.addTimeContainer]}>
                <View style={[commonStyles.fieldGroup, styles.timeFieldGroup]}>
                    <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Time</Text>
                    {renderTimeSlots()}
                    <TextInput
                        style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput]}
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
            <View style={[commonStyles.formContainer, styles.scheduleRowContainder]}>
                <Text style={[commonStyles.fieldLabel, styles.scheduledDaysLabel, { color: Colors[colorScheme].textMuted }]}>
                    Scheduled days
                </Text>
                {[...schedule].map(([day, times]) => (
                    <View key={day} style={styles.scheduleRow}>
                        <View style={styles.dayChip}>
                            <Text style={[textStyle, styles.dayChipText]}>
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
                                        <Text style={[textStyle, styles.timeText]}>{time.slice(0,5)}</Text>
                                        <Text style={[textStyle, styles.deleteTimeButton]}>x</Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    onPress={async () => {
                                        setDayToSchedule(day);
                                        setTimeToSchedule("");
                                        setSelectedSlotIndex(-1);
                                        if (DAY_NAMES[day] !== null && classDuration !== null) {
                                            const slots = onRequestingTimeSlots(DAY_NAMES[day], classDuration);
                                            setTimeSlots(await slots);
                                        }
                                        setIsAddTimeOpen(true);
                                    }}
                                    style={styles.addTimeButton}
                                >
                                    <Text style={[textStyle, styles.addTimeButtonText]}>+</Text>
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
                                        <Text style={[textStyle, styles.timeText]}>{time.slice(0,5)}</Text>
                                        <Text style={[textStyle, styles.deleteTimeButton]}>x</Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    onPress={async () => {
                                        setDayToSchedule(day);
                                        setTimeToSchedule("");
                                        setSelectedSlotIndex(-1);
                                        if (DAY_NAMES[day] !== null && classDuration !== null) {
                                            const slots = onRequestingTimeSlots(DAY_NAMES[day], classDuration);
                                            setTimeSlots(await slots);
                                        }
                                        setIsAddTimeOpen(true);
                                    }}
                                    style={styles.addTimeButton}
                                >
                                    <Text style={[textStyle, styles.addTimeButtonText]}>+</Text>
                                </Pressable>
                            </ScrollView>
                        )}
                    </View>
                ))}
                {isAddTimeOpen && dayToSchedule !== null && !schedule.has(dayToSchedule) && (
                    <View style={styles.selectedDayChipRow}>
                        <View style={[styles.dayChip, styles.dayChipSelected]}>
                            <Text style={[textStyle, styles.dayChipText]}>{DAY_NAMES[dayToSchedule]}</Text>
                        </View>
                    </View>
                )}
                <View style={styles.addDayRow}>
                    <Pressable
                        style={[styles.addDayButton, isAddDayOpen && styles.addDayButtonActive]}
                        onPress={() => {
                            setIsAddDayOpen(!isAddDayOpen);
                            setIsAddTimeOpen(false);
                        }}
                    >
                        <Text style={[textStyle, styles.addDayButtonText, isAddDayOpen && styles.addDayButtonTextActive]}>+ Add day</Text>
                    </Pressable>
                </View>
                {isAddDayOpen && renderAddDayView()}
                {isAddTimeOpen && renderAddTimeView()}
            </View>
        );
    };


    const renderDeleteChoice = () => {
        if (!pendingDelete) return null;

        const { scheduleId, day, time } = pendingDelete;

        return (
            <View style={modalStyles.modalView}>
                <View style={styles.modalInfo}>
                    <Text style={[textStyle, styles.confirmationText]}>
                        Do you want to delete this schedule?
                    </Text>
                </View>
                <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                    <Pressable
                        style={modalStyles.modalDeleteButton}
                        onPress={() => {
                            onScheduleDelete(scheduleId, day, time);
                            setPendingDelete(null);
                        }}
                    >
                        <Text style={[textStyle]}>Delete</Text>
                    </Pressable>
                    <Pressable
                        style={modalStyles.modalCancelButton}
                        onPress={() => setPendingDelete(null)}
                    >
                        <Text style={[textStyle]}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderScheduleContent = () => (
        <View style={styles.screenContainer}>
            <ScreenTitle titleText={`Schedule for the class ${className}`} />

            {renderSchedules(scheduleData)}

            {!(isAddDayOpen || isAddTimeOpen) && (
                <View style={styles.scheduleActionsRow}>
                    <Pressable style={modalStyles.modalConfirmButton} onPress={onModalClose}>
                        <Text style={[textStyle]}>OK</Text>
                    </Pressable>
                    <Pressable style={modalStyles.modalCancelButton} onPress={onModalClose}>
                        <Text style={[textStyle]}>Cancel</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );

    const renderSchedule = () => {
        return(
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.modalView, Platform.OS === 'web'
                    ? percentageStyles.modalViewWeb
                    : (isIpad ? percentageStyles.modalViewPad : percentageStyles.modalViewPhone)]}>
                    {renderScheduleContent()}
                </View>
            </View>
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={modalStyles.modalView}>
                <View style={styles.modalInfo}>
                    <Text style={[textStyle, styles.confirmationText]}>
                        Class was scheduled successfully!
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
        );
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            <View style={{flex: 1, height: '100%', backgroundColor: (Platform.OS === 'ios' && !isIpad) ? Colors[colorScheme].background : undefined}}>
                {renderSchedule()}
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
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        alignSelf: 'stretch',
    },
    modalInfo: {
        padding: 20,
        alignSelf: 'stretch',
    },
    scheduledDaysLabel: {
        alignSelf: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 14,
    },
    // Compact chip used in the "Scheduled days" summary row — fixed width so it
    // never collapses under flexWrap and lines up across rows of different days.
    dayChip: {
        width: 120,
        flexShrink: 0,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: INPUT_BORDER_COLOR,
    },
    dayChipText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Highlighted variant shown above "+ Add day" while a time is being added
    // for a brand-new day — same border treatment as a selected time slot.
    dayChipSelected: {
        borderWidth: 3,
    },
    selectedDayChipRow: {
        alignSelf: 'stretch',
        alignItems: 'flex-start',
        marginTop: 12,
    },
    addDayRow: {
        marginTop: 12,
        alignSelf: 'stretch',
    },
    addDayButton: {
        alignSelf: 'stretch',
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: INPUT_BORDER_COLOR,
        paddingVertical: 14,
    },
    addDayButtonActive: {
        borderColor: 'green',
    },
    addDayButtonTextActive: {
        color: 'green',
    },
    // Single bordered panel for the "+ Add day" picker — one contained list,
    // not separate floating pills, so it never spills past the card's edge.
    addDayListPanel: {
        alignSelf: 'stretch',
        marginTop: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: INPUT_BORDER_COLOR,
        overflow: 'hidden',
    },
    addDayListRow: {
        alignSelf: 'stretch',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    addDayListRowDivider: {
        borderTopWidth: 1,
        borderTopColor: INPUT_BORDER_COLOR,
    },
    addDayListRowText: {
        fontSize: 15,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 12,
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
    scheduleActionsRow: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingTop: 20,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        minWidth: 70,
        flexShrink: 0,
        paddingHorizontal: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: INPUT_BORDER_COLOR,
    },
    timeText: {
        fontWeight: '600',
    },
    addTimeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: INPUT_BORDER_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    addTimeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 18,
    },
    addDayButtonText: {
        fontWeight: 'bold',
    },
    scheduleRowContainder: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    addTimeContainer: {
        marginTop: 10,
    },
    timeFieldGroup: {
        marginBottom: 8,
    },
    scheduleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        rowGap: 8,
        columnGap: 10,
        paddingVertical: 5,
    },
    timesRowWeb: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        rowGap: 8,
        columnGap: 10,
    },
    timesScrollNative: {
        flex: 1,
    },
    timesRowNative: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
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
        marginLeft: 6,
        fontSize: 12,
        color: 'red',
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row'
    },
    timeSlotsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginVertical: 6,
    },
timeSlot: {
        borderRadius: 15,
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
        borderColor: INPUT_BORDER_COLOR,
    },
    confirmationText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
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
