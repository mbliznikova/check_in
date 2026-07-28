import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, TOGGLE_TEXT, INPUT_BORDER_COLOR } from '@/constants/Colors';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';

import ScreenTitle from './ScreenTitle';
import { DateInputField, TimeInputField } from './DateTimeInputFields';
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
    onCreateOccurrence: (
        className: string,
        plannedDate: string,
        plannedTime: string,
        duration: number,
        classId?: number,
        scheduleId?: number,
        notes?: string,
    ) => Promise<void>;
    onRequestingTimeIntervals: (date: string, classDurationToFit: number) => Promise<[string, string][]>;
    onOccurrenceUniquenessCheck: (date: string, time: string) => boolean;
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
    onCreateOccurrence,
    onRequestingTimeIntervals,
    onOccurrenceUniquenessCheck,
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

    const [occurrenceDate, setOccurrenceDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [occurrenceTime, setOccurrenceTime] = useState<string>("");
    const [isOccurrenceCreated, setIsOccurrenceCreated] = useState<boolean>(false);
    const [occurrenceIntervals, setOccurrenceIntervals] = useState<[string, string][]>([]);
    const [isOccurrenceIntervalsOpen, setIsOccurrenceIntervalsOpen] = useState<boolean>(false);


    useEffect(() => {
        setIsConfirmationOpen(isSheduleSuccess)
    }, [isSheduleSuccess]);

    useEffect(() => {
        if (isCreateSuccess && !isRecurring) {
            onRequestingTimeIntervals(occurrenceDate, newClassDuration).then(result => {
                setOccurrenceIntervals(result);
                setIsOccurrenceIntervalsOpen(true);
            });
        }
    }, [occurrenceDate, newClassDuration, isCreateSuccess, isRecurring]);

    const handleModalClose = () => {
        setClassName("");
        setNewClassDuration(defaultClassDuration);
        setClassPrice(0);
        setIsRecurring(false);
        setSelectedDayId(null);
        setSelectedDayName("");
        setTime("");
        setIsAddDayOpen(false);
        setIsAddTimeOpen(false);
        setIsConfirmationOpen(false);
        setTimeSlots([]);
        setSelectedSlotIndex(-1);
        setOccurrenceDate(new Date().toISOString().slice(0, 10));
        setOccurrenceTime("");
        setIsOccurrenceCreated(false);
        setOccurrenceIntervals([]);
        setIsOccurrenceIntervalsOpen(false);
        onModalClose();
    };

    const isOccurrenceTimeWithinIntervals = (t: string): boolean =>
        occurrenceIntervals.some(([start, end]) => t >= start && t <= end);

    const renderAddDayView = () => {
        const onDayPress = async (dayIndex: number) => {
            setSelectedDayId(dayIndex);
            setSelectedDayName(DAY_NAMES[dayIndex]);
            setIsAddDayOpen(false);
            setIsAddTimeOpen(true);
            if (DAY_NAMES[dayIndex] !== null && newClassDuration !== null) {
                const slots = onRequestingTimeSlots(DAY_NAMES[dayIndex], newClassDuration);
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
                        <Text style={[textStyle, styles.addDayListRowText]}>{DAY_NAMES[dayIndex]}</Text>
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
                <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                    <Pressable style={modalStyles.modalCancelButton} onPress={() => setIsAddDayOpen(false)}>
                        <Text style={[textStyle]}>Cancel</Text>
                    </Pressable>
                </View>
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

    const handleSchedulePress = async () => {
        console.log(`Class id ${createdClassId}, class name ${className}, day ${selectedDayName}, time ${time}`);
        setTime("");
        if (createdClassId === null || selectedDayId === null || time === null || !time) {
            console.warn('Missing data: cannot schedule.');
            return;
        }
        if (onScheduleUniquenessCheck(selectedDayId, time)) {
            onScheduleClass(createdClassId.toString(), className, selectedDayId, selectedDayName, time);
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
        setSelectedSlotIndex(-1);
    };

    const renderTimeSlots = () => (
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

    const renderTimeButtons = () => (
        <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
            <Pressable style={modalStyles.modalConfirmButton} onPress={handleSchedulePress}>
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
    );

    const renderAddTimeView = () => {
        return (
            <View style={[commonStyles.formContainer, styles.addTimeContainer]}>
                <View style={commonStyles.fieldGroup}>
                    <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Time</Text>
                    {renderTimeSlots()}
                    <TextInput
                        style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput, styles.timeInputBorderless]}
                        value={time}
                        onChangeText={(timeStr) => {setTime(timeStr)}}
                    />
                </View>
                {renderTimeButtons()}
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
                                        onPress={() => onScheduleDelete(scheduleId, day, time)}
                                    >
                                        <Text style={[textStyle, styles.timeText]}>{time.slice(0,5)}</Text>
                                        <Text style={[textStyle, styles.deleteTimeButton]}>x</Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    onPress={async () => {
                                        setSelectedDayId(day);
                                        setSelectedDayName(DAY_NAMES[day]);
                                        if (DAY_NAMES[day] !== null && newClassDuration !== null) {
                                            const slots = onRequestingTimeSlots(DAY_NAMES[day], newClassDuration);
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
                                        onPress={() => onScheduleDelete(scheduleId, day, time)}
                                    >
                                        <Text style={[textStyle, styles.timeText]}>{time.slice(0,5)}</Text>
                                        <Text style={[textStyle, styles.deleteTimeButton]}>x</Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    onPress={async () => {
                                        setSelectedDayId(day);
                                        setSelectedDayName(DAY_NAMES[day]);
                                        if (DAY_NAMES[day] !== null && newClassDuration !== null) {
                                            const slots = onRequestingTimeSlots(DAY_NAMES[day], newClassDuration);
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
                {isAddTimeOpen && selectedDayName !== "" && (
                    <View style={styles.selectedDayChipRow}>
                        <View style={[styles.dayChip, styles.dayChipSelected]}>
                            <Text style={[textStyle, styles.dayChipText]}>{selectedDayName}</Text>
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

    const renderClassCreationForm = () => {
        return (
            <View style={commonStyles.formContainer}>
                <View style={commonStyles.fieldGroup}>
                    <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>
                        Name
                    </Text>
                    <TextInput
                        style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput]}
                        value={className}
                        onChangeText={(createdClassName) => {setClassName(createdClassName)}}
                    />
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
                            value={(classPrice.toString())}
                            onChangeText={(classPriceAmount) => {
                                setClassPrice(Number(classPriceAmount))
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
                            style={[commonStyles.segmentedPill, !isRecurring && commonStyles.segmentedPillActive]}
                            onPress={() => setIsRecurring(false)}
                        >
                            <Text style={[commonStyles.segmentedPillText, { color: !isRecurring ? TOGGLE_TEXT : textStyle.color }]}>
                                One-off
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[commonStyles.segmentedPill, isRecurring && commonStyles.segmentedPillActive]}
                            onPress={() => setIsRecurring(true)}
                        >
                            <Text style={[commonStyles.segmentedPillText, { color: isRecurring ? TOGGLE_TEXT : textStyle.color }]}>
                                Weekly
                            </Text>
                        </Pressable>
                    </View>
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
                        }}
                        style={[modalStyles.modalConfirmButton, !className && { opacity: 0.5 }]}
                        disabled={!className}
                    >
                        <Text style={textStyle}>Create</Text>
                    </Pressable>
                    <Pressable
                        style={modalStyles.modalCancelButton}
                        onPress={handleModalClose}
                        >
                            <Text style={[textStyle]}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderClassScheduleForm = () => {
        return (
            <View style={styles.screenContainer}>
                <ScreenTitle titleText={isCreateSuccess ? `Schedule class ${className}` : ''}/>

                {renderSchedules(scheduleData)}

                <View style={[styles.scheduleActionsRow, (isAddDayOpen || isAddTimeOpen) && styles.hiddenButton]}>
                    <Pressable
                        style={modalStyles.modalConfirmButton}
                        onPress={(isAddDayOpen || isAddTimeOpen) ? undefined : handleModalClose}
                        disabled={isAddDayOpen || isAddTimeOpen}
                    >
                        <Text style={[textStyle]}>OK</Text>
                    </Pressable>
                    <Pressable
                        style={modalStyles.modalCancelButton}
                        onPress={(isAddDayOpen || isAddTimeOpen) ? undefined : handleModalClose}
                        disabled={isAddDayOpen || isAddTimeOpen}
                    >
                        <Text style={[textStyle]}>Cancel</Text>
                    </Pressable>
                </View>

            </View>
        );
    };

    const renderOccurrenceCreationForm = () => {
        if (isOccurrenceCreated) {
            return (
                <View style={styles.confirmationBlock}>
                    <Text style={[textStyle, styles.confirmationTitleText]}>
                        {`Schedule class ${className}`}
                    </Text>
                    <Text style={[textStyle, styles.confirmationSubtitleText, { color: Colors[colorScheme].textMuted }]}>
                        {`Occurrence scheduled for ${occurrenceDate} at ${occurrenceTime}`}
                    </Text>
                    <View style={styles.scheduleActionsRow}>
                        <Pressable style={modalStyles.modalConfirmButton} onPress={handleModalClose}>
                            <Text style={[textStyle]}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.screenContainer}>
                <ScreenTitle titleText={`Schedule class ${className}`}/>

                <View style={commonStyles.formContainer}>
                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Date</Text>
                        <DateInputField value={occurrenceDate} onChange={setOccurrenceDate} />
                    </View>

                    {isOccurrenceIntervalsOpen && (
                        <View style={commonStyles.fieldGroup}>
                            <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>
                                Pick start time within:
                            </Text>
                            {occurrenceIntervals.length === 0 ? (
                                <Text style={{ color: 'grey', fontStyle: 'italic' }}>
                                    {`No available time for ${newClassDuration} minutes`}
                                </Text>
                            ) : (
                                occurrenceIntervals.map(([start, end]) => (
                                    <Text key={`${start}-${end}`} style={{ color: 'green', paddingVertical: 2 }}>
                                        {`${start} – ${end}`}
                                    </Text>
                                ))
                            )}
                        </View>
                    )}

                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Time</Text>
                        <TimeInputField value={occurrenceTime} onChange={setOccurrenceTime} />
                        {Boolean(occurrenceTime) && isOccurrenceIntervalsOpen && occurrenceIntervals.length > 0 &&
                            !isOccurrenceTimeWithinIntervals(occurrenceTime) && (
                                <Text style={{ color: 'orange', fontSize: 12, marginTop: 8 }}>Outside available intervals</Text>
                        )}
                    </View>
                </View>

                <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                    <Pressable
                        style={[modalStyles.modalConfirmButton, !occurrenceTime && { opacity: 0.5 }]}
                        disabled={!occurrenceTime}
                        onPress={async () => {
                            if (!occurrenceTime) return;
                            if (onOccurrenceUniquenessCheck(occurrenceDate, occurrenceTime)) {
                                await onCreateOccurrence(
                                    className,
                                    occurrenceDate,
                                    occurrenceTime,
                                    newClassDuration,
                                    createdClassId ?? undefined,
                                    undefined,
                                    undefined,
                                );
                                setIsOccurrenceCreated(true);
                            } else {
                                Platform.OS === 'web'
                                    ? alert('That date and time are already taken')
                                    : Alert.alert('Conflict', 'That date and time are already taken');
                            }
                        }}
                    >
                        <Text style={textStyle}>Create</Text>
                    </Pressable>
                    <Pressable style={modalStyles.modalCancelButton} onPress={handleModalClose}>
                        <Text style={[textStyle]}>Cancel</Text>
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
                    {isCreateSuccess ? (isRecurring ? renderClassScheduleForm() : renderOccurrenceCreationForm()) : renderClassCreationForm()}
                </View>
            </View>
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, styles.confirmationText]}>
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
            onRequestClose={handleModalClose}
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
    screenContainer: {
        alignSelf: 'stretch',
    },
    modalInfo: {
        padding: 20,
    },
    confirmationText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    confirmationBlock: {
        alignItems: 'center',
    },
    confirmationTitleText: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    confirmationSubtitleText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 4,
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
    subtitleText: {
        fontSize: 14,
        marginBottom: 16,
    },
    scheduleActionsRow: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingTop: 20,
    },
    scheduleRowContainder: {
        padding: 10,
    },
    addTimeContainer: {
        marginTop: 20,
    },
    scheduledDaysLabel: {
        alignSelf: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 14,
    },
    scheduleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        rowGap: 8,
        columnGap: 10,
        padding: 5,
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
    // for that day — same border treatment as a selected time slot.
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
    addDayButtonText: {
        fontWeight: 'bold',
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
    timeText: {
        fontWeight: '600',
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
    // Manual time-entry field sits directly under a grid of already-bordered
    // slot pills — dropping its own border avoids stacking boxes on boxes.
    timeInputBorderless: {
        borderWidth: 0,
    },
    deleteTimeButton: {
        marginLeft: 6,
        fontSize: 12,
        color: 'red',
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
