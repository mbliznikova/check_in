import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text, TextInput, Modal, Platform, ScrollView, Alert } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, DESTRUCTIVE_COLOR } from '@/constants/Colors';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';
import Checkbox from './Checkbox';
import ScreenTitle from './ScreenTitle';
import { DateInputField, TimeInputField } from './DateTimeInputFields';
import { ClassOccurrenceType, ClassType } from '@/types/class';

type OccurrenceFormModalProps = {
    mode: 'create' | 'edit';
    isVisible: boolean;
    onClose: () => void;
    // Create mode
    classId?: number | null;
    className?: string | null;
    classDuration?: number | null;
    initialDate?: string;
    availableClasses?: ClassType[];
    onCreateOccurrence: (
        className: string,
        plannedDate: string,
        plannedTime: string,
        duration: number,
        classId?: number,
        scheduleId?: number,
        notes?: string,
    ) => void;
    // Edit mode
    occurrence?: ClassOccurrenceType | null;
    onEditOccurrence: (
        occurrenceId: number,
        actualDate?: string,
        actualStartTime?: string,
        actualDuration?: number,
        isCancelled?: boolean,
        notes?: string,
    ) => void;
    onDeleteOccurrence: (occurrenceId: number, className: string, date: string, time: string) => void;
    // Shared
    onRequestingTimeIntervals: (date: string, duration: number) => Promise<[string, string][]>;
    onUniquenessCheck: (date: string, time: string) => boolean;
};

const OccurrenceFormModal = ({
    mode,
    isVisible,
    onClose,
    classId,
    className,
    classDuration,
    initialDate,
    availableClasses,
    onCreateOccurrence,
    occurrence,
    onEditOccurrence,
    onDeleteOccurrence,
    onRequestingTimeIntervals,
    onUniquenessCheck,
}: OccurrenceFormModalProps) => {
    const textStyle = useThemeTextStyle();
    const colorScheme = useColorScheme() ?? 'light';
    const modalStyles = useModalStyles();
    // Create state
    const [createDate, setCreateDate] = useState<string>(
        initialDate ?? new Date().toISOString().slice(0, 10)
    );
    const [createTime, setCreateTime] = useState<string>('');
    const [createDuration, setCreateDuration] = useState<number>(classDuration ?? 60);
    const [createNotes, setCreateNotes] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

    // Edit state
    const [editDate, setEditDate] = useState<string>(occurrence?.actualDate ?? '');
    const [editTime, setEditTime] = useState<string>(occurrence?.actualStartTime.slice(0, 5) ?? '');
    const [editDuration, setEditDuration] = useState<number>(occurrence?.actualDuration ?? 0);
    const [editIsCancelled, setEditIsCancelled] = useState<boolean>(occurrence?.isCancelled ?? false);
    const [editNotes, setEditNotes] = useState<string>(occurrence?.notes ?? '');

    // Shared state
    const [intervals, setIntervals] = useState<[string, string][]>([]);
    const [isIntervalsOpen, setIsIntervalsOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    // Sync edit state when occurrence changes
    useEffect(() => {
        if (mode === 'edit' && occurrence) {
            setEditDate(occurrence.actualDate);
            setEditTime(occurrence.actualStartTime.slice(0, 5));
            setEditDuration(occurrence.actualDuration);
            setEditIsCancelled(occurrence.isCancelled);
            setEditNotes(occurrence.notes);
        }
    }, [occurrence, mode]);

    // Sync create state when initialDate or classDuration changes
    useEffect(() => {
        if (mode === 'create') {
            if (initialDate) setCreateDate(initialDate);
            setCreateDuration(classDuration ?? 60);
        }
    }, [initialDate, classDuration, mode]);

    // Fetch intervals when date/duration change
    useEffect(() => {
        if (mode === 'create') {
            const duration = selectedClass?.durationMinutes ?? createDuration;
            onRequestingTimeIntervals(createDate, duration).then(result => {
                setIntervals(result);
                setIsIntervalsOpen(true);
            });
        }
    }, [createDate, createDuration, selectedClass, mode]);

    useEffect(() => {
        if (mode === 'edit' && editDate && editDuration > 0) {
            onRequestingTimeIntervals(editDate, editDuration).then(result => {
                setIntervals(result);
                setIsIntervalsOpen(true);
            });
        }
    }, [editDate, editDuration, mode]);

    const isTimeWithinIntervals = (time: string): boolean => {
        return intervals.some(([start, end]) => time >= start && time <= end);
    };

    const renderAvailableIntervals = (durationLabel: number) => {
        if (!isIntervalsOpen) return null;
        return (
            <View style={commonStyles.fieldGroup}>
                <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>
                    Pick start time within:
                </Text>
                {intervals.length === 0
                    ? <Text style={{ color: 'grey', fontStyle: 'italic' }}>No available time for {durationLabel} minutes</Text>
                    : intervals.map(([start, end]) => (
                        <Text key={`${start}-${end}`} style={{ color: 'green', paddingVertical: 2 }}>
                            {`${start} – ${end}`}
                        </Text>
                    ))
                }
            </View>
        );
    };

    const renderTimeWarning = (time: string) => {
        if (!time || !isIntervalsOpen || intervals.length === 0 || isTimeWithinIntervals(time)) return null;
        return (
            <Text style={{ color: 'orange', fontSize: 12, marginTop: 8 }}>Outside available intervals</Text>
        );
    };

    const renderClassPicker = () => {
        if (!availableClasses || availableClasses.length === 0) return null;
        return (
            <View style={commonStyles.fieldGroup}>
                <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>
                    Select class
                </Text>
                <ScrollView style={{ maxHeight: 150 }}>
                    {availableClasses.map(cls => (
                        <Pressable
                            key={cls.id}
                            style={[
                                styles.classPickerItem,
                                selectedClass?.id === cls.id && styles.classPickerItemSelected,
                            ]}
                            onPress={() => {
                                setSelectedClass(cls);
                                setCreateDuration(cls.durationMinutes);
                            }}
                        >
                            <Text style={textStyle}>{cls.name}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderCreateForm = () => {
        const effectiveClassId = classId ?? selectedClass?.id;
        const effectiveClassName = className ?? selectedClass?.name ?? '';
        const effectiveDuration = selectedClass?.durationMinutes ?? createDuration;

        return (
            <ScrollView>
                <ScreenTitle titleText={effectiveClassName ? `Add occurrence for ${effectiveClassName}` : 'Add new occurrence'} centered={false} />

                <View style={commonStyles.formContainer}>
                    {!classId && renderClassPicker()}

                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Date</Text>
                        <DateInputField value={createDate} onChange={setCreateDate} />
                    </View>

                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Duration (mins)</Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField, { width: 100 }]}
                            value={effectiveDuration.toString()}
                            onChangeText={v => setCreateDuration(Number(v))}
                            keyboardType="numeric"
                        />
                    </View>

                    {renderAvailableIntervals(effectiveDuration)}

                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Time</Text>
                        <TimeInputField value={createTime} onChange={setCreateTime} />
                        {renderTimeWarning(createTime)}
                    </View>

                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Notes</Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput]}
                            value={createNotes}
                            onChangeText={setCreateNotes}
                        />
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <Pressable
                        style={modalStyles.modalConfirmButton}
                        onPress={() => {
                            if (!effectiveClassName) {
                                Platform.OS === 'web'
                                    ? alert('Please select a class')
                                    : Alert.alert('Required', 'Please select a class');
                                return;
                            }
                            if (!createTime) {
                                Platform.OS === 'web'
                                    ? alert('Please enter a time')
                                    : Alert.alert('Required', 'Please enter a time');
                                return;
                            }
                            if (onUniquenessCheck(createDate, createTime)) {
                                onCreateOccurrence(
                                    effectiveClassName,
                                    createDate,
                                    createTime,
                                    effectiveDuration,
                                    effectiveClassId ?? undefined,
                                    undefined,
                                    createNotes || undefined,
                                );
                                onClose();
                            } else {
                                Platform.OS === 'web'
                                    ? alert('That date and time are already taken')
                                    : Alert.alert('Conflict', 'That date and time are already taken');
                            }
                        }}
                    >
                        <Text style={textStyle}>Create</Text>
                    </Pressable>
                    <Pressable style={modalStyles.modalCancelButton} onPress={onClose}>
                        <Text style={textStyle}>Cancel</Text>
                    </Pressable>
                </View>
            </ScrollView>
        );
    };

    const renderEditForm = () => {
        if (!occurrence) return null;
        const displayName = occurrence.fallbackClassName;

        const getChanges = (): Partial<{
            actualDate: string;
            actualStartTime: string;
            actualDuration: number;
            isCancelled: boolean;
            notes: string;
        }> => {
            const changes: ReturnType<typeof getChanges> = {};
            if (editDate !== occurrence.actualDate) changes.actualDate = editDate;
            if (editTime !== occurrence.actualStartTime.slice(0, 5)) changes.actualStartTime = editTime;
            if (editDuration !== occurrence.actualDuration) changes.actualDuration = editDuration;
            if (editIsCancelled !== occurrence.isCancelled) changes.isCancelled = editIsCancelled;
            if (editNotes !== occurrence.notes) changes.notes = editNotes;
            return changes;
        };

        return (
            <ScrollView>
                <ScreenTitle titleText={`Edit occurrence — ${displayName}`} centered={false} />

                <View style={commonStyles.formContainer}>
                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Date</Text>
                        <DateInputField value={editDate} onChange={setEditDate} />
                    </View>

                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Duration (mins)</Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField, { width: 100 }]}
                            value={editDuration.toString()}
                            onChangeText={v => setEditDuration(Number(v))}
                            keyboardType="numeric"
                        />
                    </View>

                    {renderAvailableIntervals(editDuration)}

                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Time</Text>
                        <TimeInputField value={editTime} onChange={setEditTime} />
                        {renderTimeWarning(editTime)}
                    </View>

                    <View style={[commonStyles.fieldGroup, commonStyles.sideBySideRow]}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Cancelled?</Text>
                        <Checkbox
                            label=""
                            checked={editIsCancelled}
                            onChange={() => setEditIsCancelled(prev => !prev)}
                            labelStyle={textStyle}
                        />
                    </View>

                    <View style={commonStyles.fieldGroup}>
                        <Text style={[commonStyles.fieldLabel, { color: Colors[colorScheme].textMuted }]}>Notes</Text>
                        <TextInput
                            style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput]}
                            value={editNotes}
                            onChangeText={setEditNotes}
                        />
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <Pressable
                        style={modalStyles.modalConfirmButton}
                        onPress={() => {
                            const changes = getChanges();
                            if (Object.keys(changes).length === 0) {
                                Platform.OS === 'web'
                                    ? alert('No changes detected')
                                    : Alert.alert('Info', 'No changes detected');
                                return;
                            }
                            const newDate = changes.actualDate ?? occurrence.actualDate;
                            const newTime = changes.actualStartTime ?? occurrence.actualStartTime.slice(0, 5);
                            const dateOrTimeChanged = 'actualDate' in changes || 'actualStartTime' in changes;
                            if (dateOrTimeChanged && !onUniquenessCheck(newDate, newTime)) {
                                Platform.OS === 'web'
                                    ? alert('That date and time are already taken')
                                    : Alert.alert('Conflict', 'That date and time are already taken');
                                return;
                            }
                            onEditOccurrence(
                                occurrence.id,
                                changes.actualDate,
                                changes.actualStartTime,
                                changes.actualDuration,
                                changes.isCancelled,
                                changes.notes,
                            );
                            onClose();
                        }}
                    >
                        <Text style={textStyle}>Save</Text>
                    </Pressable>
                    <Pressable style={modalStyles.modalCancelButton} onPress={onClose}>
                        <Text style={textStyle}>Cancel</Text>
                    </Pressable>
                </View>

                <Pressable
                    style={[styles.deleteButton, { alignSelf: 'center', marginTop: 10 }]}
                    onPress={() => setIsDeleteConfirmOpen(true)}
                >
                    <Text style={textStyle}>Delete occurrence</Text>
                </Pressable>
            </ScrollView>
        );
    };

    const renderDeleteConfirm = () => {
        if (!occurrence) return null;
        return (
            <View style={styles.overlay}>
                <View style={[styles.modalView, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}>
                    <Text style={[textStyle, styles.deleteConfirmText]}>
                        Delete this occurrence?
                    </Text>
                    <View style={styles.buttonRow}>
                        <Pressable
                            style={styles.deleteButton}
                            onPress={() => {
                                onDeleteOccurrence(
                                    occurrence.id,
                                    occurrence.fallbackClassName,
                                    occurrence.actualDate,
                                    occurrence.actualStartTime.slice(0, 5),
                                );
                                setIsDeleteConfirmOpen(false);
                                onClose();
                            }}
                        >
                            <Text style={textStyle}>Delete</Text>
                        </Pressable>
                        <Pressable style={modalStyles.modalCancelButton} onPress={() => setIsDeleteConfirmOpen(false)}>
                            <Text style={textStyle}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={[styles.modalView, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}>
                    {mode === 'create' ? renderCreateForm() : renderEditForm()}
                    {isDeleteConfirmOpen && renderDeleteConfirm()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '85%',
        maxWidth: 360,
        maxHeight: '80%',
        backgroundColor: 'black',
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 15,
    },
    deleteButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 15,
        backgroundColor: DESTRUCTIVE_COLOR,
    },
    deleteConfirmText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        zIndex: 10,
    },
    classPickerItem: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'grey',
        marginBottom: 4,
    },
    classPickerItemSelected: {
        borderColor: 'green',
        backgroundColor: 'rgba(0,128,0,0.2)',
    },
});

export default OccurrenceFormModal;
