import * as React from 'react';  
import { useEffect, useState } from 'react';
import {View, StyleSheet, Pressable, Text,TextInput, Modal, useColorScheme, Platform, ScrollView} from 'react-native';

import Checkbox from './Checkbox';

type ClassOccurrenceType = {
    id: number;
    classId: number | null;
    fallbackClassName: string;
    scheduleId: number | null;
    plannedDate: string;
    actualDate: string;
    plannedStartTime: string;
    actualStartTime: string;
    plannedDuration: string;
    actualDuration: number;
    isCancelled: boolean;
    notes: string;
};


type ClassOccurrenceModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onRequestingTimeIntervals: (dayName: string, classDurationToFit: number) => Promise<string[]>;
    onCreateOccurrence: (
        className: string,
        plannedDate: string,
        plannedTime: string,
        duration: number,
        classId?: number,
        scheduleId?: number,
        notes?: string) => void;
    onEditOccurrence: (
        occurrenceId: number,
        actualDate?: string,
        actualStartTime?: string,
        actualDuration?: number,
        isCancelled?: boolean,
        notes?: string) => void;
    onDeleteOccurrence: (occurrenceId: number, className: string, date: string, time: string) => void;
    onUniquenessCheck: (date: string, time: string) => boolean;
    occurrenceIdTimebyDate: Map<string, [number, string][]>;
    allOccurrenceDataById: Map<number, ClassOccurrenceType>;
    classId: number | null;
    className: string | null;
    classDuration: number | null;
    isCreateOccurrenceSuccess: boolean;
};

const ClassOccurrenceModal = ({
    isVisible = false,
    onModalClose,
    onRequestingTimeIntervals,
    onCreateOccurrence,
    onEditOccurrence,
    onDeleteOccurrence,
    onUniquenessCheck,
    occurrenceIdTimebyDate: occurrenceData = new Map(),
    allOccurrenceDataById = new Map(),
    classId,
    className,
    classDuration,
    isCreateOccurrenceSuccess = false,
}: ClassOccurrenceModalProps) => {

    const colorScheme = useColorScheme();

    //TODO: Consistency - create or add for occurrence, not both
    const [isAddOccurrenceOpen, setIsAddOccurrenceOpen] = useState(false);

    const [plannedClassDuration, setPlannedClassDuration] = useState<number>(classDuration ?? 60);
    const [notes, setNotes] = useState<string>('');

    const [dateToCreate, setDateToCreate] = useState<string>(() =>
        new Date().toISOString().slice(0, 10));
    const [timeToCreate, setTimeToCreate] = useState<string>('');

    const [originalOccurrence, setOriginalOccurrence] = useState<ClassOccurrenceType | null>(null);

    const [actualDateToEdit, setActualDateToEdit] = useState<string>(() =>
        new Date().toISOString().slice(0, 10));
    const [actualTimeToEdit, setActualTimeToEdit] = useState<string>('');
    const [actualDurationToEdit, setActualDurationToEdit] = useState<number>(0);
    const [isCancelledToEdit, setIsCancelledToEdit] = useState(false);
    const [notesToEdit, setNotesToEdit] = useState('');

    const [intervals, setIntervals] = useState<string[]>([]);
    const [isIntervalsOpen, setIsIntervalsOpen] = useState(false);

    const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<number | null>(null);

    const [isEditDeleteOpen, setIsEditDeleteOpen] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(isCreateOccurrenceSuccess);


    const callIntervals = async(date: string, duration: number) => {
        const timeIntervals = await onRequestingTimeIntervals(date, duration);
        setIntervals(timeIntervals);
    };

    useEffect(() => {
        callIntervals(dateToCreate, plannedClassDuration);
    }, [dateToCreate, plannedClassDuration]);

    useEffect(() => {
        callIntervals(actualDateToEdit, actualDurationToEdit);
    }, [actualDateToEdit, actualDurationToEdit]) // TODO: think about how to avoid calls to BE with duration=0?

    useEffect(() => {
        setIsIntervalsOpen(true);
    }, [intervals])

    useEffect(() => {
        setIsConfirmationOpen(isCreateOccurrenceSuccess)
    }, [isCreateOccurrenceSuccess]);

    const renderAvailableTimeIntervals = () => {
        return (
            <View>
                <View style={{padding: 20}}>
                    <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                        {`Set any time from available intervals (for duration ${plannedClassDuration} mins):`}
                    </Text>
                </View>
                <View style={{alignItems: 'center', padding: 20}}>
                    {intervals.map((interval) => (
                        <View key={interval} style={{padding: 5}}>
                            <Text style={{color: 'green'}}>
                                {`${interval[0]} - ${interval[1]}`}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderAddOccurrenceView = () => {
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <View style={{padding: 20}}>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                                Add new occurrence for class {className}
                            </Text>
                        </View>
                        <View style={[styles.itemContainer, styles.itemRow]}>
                            <Text
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                            >
                                Duration:
                            </Text>
                            <TextInput
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.shortInputFeld]}
                                value={plannedClassDuration.toString()}
                                onChangeText={(durationStr) => {setPlannedClassDuration(Number(durationStr))}}
                            />
                        </View>

                        <View style={[styles.itemContainer, styles.itemRow]}>
                            <Text
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                            >
                                Notes:
                            </Text>
                            <TextInput
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.longInputFeld]}
                                value={notes}
                                onChangeText={(noteStr) => {setNotes(noteStr)}}
                            />
                        </View>

                        <View>{renderAddDateView(dateToCreate, setDateToCreate)}</View>
                        <View>{isIntervalsOpen ? renderAvailableTimeIntervals() : null}</View>
                        <View style={[{borderColor: 'grey'}]}>{renderAddTimeView(timeToCreate, setTimeToCreate)}</View>

                        <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                            <Pressable
                                style={styles.modalConfirmButton}
                                onPress={() => {
                                    if (onUniquenessCheck(dateToCreate, timeToCreate)) {
                                        // TODO: revisit
                                        onCreateOccurrence(className ?? 'No name class', dateToCreate, timeToCreate, plannedClassDuration, classId ?? undefined, undefined, notes);
                                        setIsAddOccurrenceOpen(false);
                                    } else {
                                        alert('Such date and time have been already taken');
                                        console.log(`There is already an occurrence at ${dateToCreate} - ${timeToCreate}`);
                                    }
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Create</Text>
                            </Pressable>

                            <Pressable
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setIsAddOccurrenceOpen(false);
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderAddDateView = (dateVar: string, setDateVarFunction: (date: string) => void) => {
        if (Platform.OS === 'web') {
            return (
                <View style={{padding: 10}}>
                    {/* @ts-ignore using react-native-web for web date picker */}
                    <input
                        type="date"
                        value={dateVar}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const tmpDate = e.target.value;
                            setDateVarFunction(tmpDate);
                            console.log(`Picked date (web) is: ${tmpDate}`);
                        }}
                        style={{
                            padding: 8,
                            borderRadius: 8,
                            border: '1px solid grey',
                            fontSize: 16,
                        }}
                    />
                </View>
            );
        }

        return (
            <View>
                <Text>Under construction</Text>
            </View>
        );
    };

    const renderAddTimeView = (timeVar: string, setTimeVar: (time: string) => void) => {
        if (Platform.OS === 'web') {
            return (
                <View style={{padding: 10}}>
                    {/* @ts-ignore using react-native-web for web btime picker */}
                    <input
                        type="time"
                        value={timeVar}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const tmpTime = e.target.value;
                            setTimeVar(tmpTime);
                            console.log(`Picked time (web) is: ${tmpTime}`);
                        }}
                        style={{
                            padding: 8,
                            borderRadius: 8,
                            border: '1px solid grey',
                            fontSize: 16,
                        }}
                    />
                </View>
            );
        }

        return (
            <View>
                <Text>Under construction</Text>
            </View>
        );
    };

    const renderClassOccurrences = (occurrences: Map<string, [number, string][]>) => {
        return (
            <View>
                {[...occurrences].map(([date, times]) => (
                    <View
                        key={date}
                        style={styles.occurrenceRow}
                    >
                        <View style={styles.dateContainer}>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dateText]}>
                                {date}
                            </Text>
                        </View>
                        {times.map(([occurrenceId, time]) => (
                            <View
                                key={`${occurrenceId} - ${date} - ${time}`}
                            >
                                <Pressable
                                    style={styles.timeButton}
                                    onPress={() => {
                                        setSelectedOccurrenceId(occurrenceId);

                                        const currentOccurrence = allOccurrenceDataById.get(occurrenceId);
                                        if (!currentOccurrence) { // TODO: handle in UI to let user know?
                                            console.warn(`No occurrence with id ${occurrenceId}`);
                                            return;
                                        };

                                        setOriginalOccurrence(currentOccurrence);

                                        setActualDateToEdit(date);
                                        setActualTimeToEdit(time);
                                        setActualDurationToEdit(currentOccurrence.actualDuration);
                                        setIsCancelledToEdit(currentOccurrence.isCancelled);
                                        setNotesToEdit(currentOccurrence.notes);

                                        setIsEditDeleteOpen(true)
                                    }}
                                >
                                    <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.timeText]}>
                                        {time.slice(0,5)}
                                    </Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                ))}
                <View style={styles.occurrenceRow}>
                    <View style={{position: 'relative'}}>
                        <Pressable
                            style={styles.dateContainer}
                            onPress={() => {
                                setIsAddOccurrenceOpen(true);
                            }}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dateText]}>+ Add occurrence</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    const renderOccurences = () => {
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <View style={{padding: 10}}>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                                {`Occurrences for the class ${className}`}
                            </Text>
                        </View>

                        {renderClassOccurrences(occurrenceData)}

                        <View style={[
                                styles.modalButtonsContainer,
                                styles.modalSingleButtonContainer,
                                isAddOccurrenceOpen && styles.hiddenButton,
                                {alignSelf: 'center'}
                            ]}>
                            <Pressable
                                style={styles.modalConfirmButton}
                                onPress={isAddOccurrenceOpen ? undefined : onModalClose}
                                disabled={isAddOccurrenceOpen}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>OK</Text>
                            </Pressable>
                        </View>
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
                            Class occurrence was created successfully!
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                        <Pressable
                            style={styles.modalConfirmButton}
                            onPress={() => {
                                setIsConfirmationOpen(false);
                            }}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>OK</Text>
                        </Pressable>
                    </View>
                </View>
        );
    };

    const getUpdatedOccurrenceData = (): Partial<ClassOccurrenceType>  => {
        const updatedOccurrenceData: Partial<ClassOccurrenceType> = {};

        if (actualDateToEdit !== originalOccurrence?.actualDate) {
            updatedOccurrenceData.actualDate = actualDateToEdit;
        }

        if (actualTimeToEdit !== originalOccurrence?.actualStartTime) {
            updatedOccurrenceData.actualStartTime = actualTimeToEdit;
        }

        if (actualDurationToEdit !== originalOccurrence?.actualDuration) {
            updatedOccurrenceData.actualDuration = actualDurationToEdit;
        }

        if (isCancelledToEdit !== originalOccurrence?.isCancelled) {
            updatedOccurrenceData.isCancelled = isCancelledToEdit;
        }

        if (notesToEdit !== originalOccurrence?.notes) {
            updatedOccurrenceData.notes = notesToEdit;
        }

        return updatedOccurrenceData
    };

    const renderEditDeleteView = () => {
        if (!originalOccurrence || !selectedOccurrenceId) return null;

        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>

                        <View style={{alignItems: 'center', padding: 20}}>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                                Edit occurrence
                            </Text>
                        </View>

                        <View style={[styles.itemContainer, styles.itemRow]}>
                            <Text
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                            >
                                Change date:
                            </Text>
                            {renderAddDateView(actualDateToEdit, setActualDateToEdit)}
                        </View>

                        <View>{isIntervalsOpen ? renderAvailableTimeIntervals() : null}</View>

                        <View style={[styles.itemContainer, styles.itemRow]}>
                            <Text
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                            >
                                Change time:
                            </Text>
                            {renderAddTimeView(actualTimeToEdit, setActualTimeToEdit)}
                        </View>

                        <View style={[styles.itemContainer, styles.itemRow]}>
                            <Text
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                            >
                                Change duration:
                            </Text>
                            <TextInput
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.shortInputFeld]}
                                value={actualDurationToEdit.toString()}
                                onChangeText={(durationStr) => {setActualDurationToEdit(Number(durationStr))}}
                            />
                        </View>

                        <View style={[styles.itemContainer, styles.itemRow]}>
                            <Text
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                            >
                                Is cancelled?
                            </Text>
                            <Checkbox
                                label=''
                                checked={isCancelledToEdit}
                                onChange={() => {setIsCancelledToEdit(!isCancelledToEdit)}}
                                labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                            />
                        </View>

                        <View style={[styles.itemContainer, styles.itemRow]}>
                            <Text
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                            >
                                Notes:
                            </Text>
                            <TextInput
                                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.longInputFeld]}
                                value={notesToEdit}
                                onChangeText={(noteStr) => {setNotesToEdit(noteStr)}}
                            />
                        </View>

                        <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                            <Pressable
                                style={styles.modalConfirmButton}
                                onPress={() => {
                                    const updatedData = getUpdatedOccurrenceData();

                                    if (Object.keys(updatedData).length === 0) {
                                        alert('No changes detected in the occurrence');
                                    } else {
                                        const {
                                            actualDate,
                                            actualStartTime,
                                            actualDuration,
                                            isCancelled,
                                            notes,
                                        } = updatedData;

                                        if (onUniquenessCheck(actualDateToEdit, actualTimeToEdit)) {
                                            onEditOccurrence(selectedOccurrenceId, actualDate, actualStartTime, actualDuration, isCancelled, notes);
                                            setIsEditDeleteOpen(false);
                                        } else {
                                            alert('Such date and time have been already taken');
                                            console.log(`There is already an occurrence at ${actualDateToEdit} - ${actualTimeToEdit}`);
                                        }
                                    }
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Save</Text>
                            </Pressable>
                            <Pressable
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setIsEditDeleteOpen(false);
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Cancel</Text>
                            </Pressable>
                        </View>

                        <Pressable
                            style={styles.deleteButton}
                            onPress={() => {
                               onDeleteOccurrence(
                                    selectedOccurrenceId,
                                    className ?? 'No name class',
                                    originalOccurrence.actualDate,
                                    originalOccurrence.actualStartTime
                                );
                            }}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Delete occurrence</Text>
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
            <ScrollView contentContainerStyle={[styles.modalInfo, styles.modalContainer]}>
                {isAddOccurrenceOpen && renderAddOccurrenceView()}
                {!isAddOccurrenceOpen && !isEditDeleteOpen && renderOccurences()}
                {isEditDeleteOpen && renderEditDeleteView()}
                {isConfirmationOpen && (
                    <View style={styles.successOverlay}>
                        {renderSuccessConfirmation()}
                    </View>
                )}
            </ScrollView>
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
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },
    modalSingleButtonContainer: {
         justifyContent: 'center',
    },
    modalManyButtonsContainer: {
        justifyContent: 'space-between',
        paddingHorizontal: 30,
    },
    modalConfirmButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'green',
    },
    modalCancelButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'grey',
    },
    deleteButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'red',
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row'
    },
    occurrenceRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 5,
    },
    dateContainer: {
        width: 150,
        justifyContent: 'center',
        marginRight: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        paddingVertical: 3,
    },
    dateText: {
        fontWeight: "bold",
        padding: 10,
        paddingHorizontal: 20,
    },
    timeButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        justifyContent: 'center',
        minWidth: 70,
        marginHorizontal: 10,
    },
    deleteTimeButton: {
        textAlign: 'right',
        paddingRight: 5, color: 'red',
    },
    timeText: {
        padding: 10,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        borderWidth: 1,
        borderRadius: 10,
    },
    shortInputFeld: {
        height: 30,
        width: 50,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 15,
    },
    longInputFeld: {
        height: 30,
        width: 250,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 15,
    },
    hiddenButton: {
        opacity: 0,
        width: 0,
        overflow: 'hidden',
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
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
});

export default ClassOccurrenceModal;
