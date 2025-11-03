import * as React from 'react';  
import { useEffect, useState } from 'react';
import {View, StyleSheet, Pressable, Text,TextInput, Modal, useColorScheme, Platform, ScrollView} from 'react-native';


type ClassOccurrenceModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onRequestingTimeIntervals: (dayName: string, classDurationToFit: number) => Promise<string[]>;
    onCreateOccurrence: (className: string, plannedDate: string, plannedTime: string, duration: number, classId?: number, scheduleId?: number, notes?: string) => void;
    onDeleteOccurrence: (occurrenceId: number, className: string, date: string, time: string) => void;
    onUniquenessCheck: (date: string, time: string) => boolean;
    occurrenceData: Map<string, [number, string][]>;
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
    onDeleteOccurrence,
    onUniquenessCheck,
    occurrenceData = new Map(),
    classId,
    className,
    classDuration,
    isCreateOccurrenceSuccess = false,
}: ClassOccurrenceModalProps) => {

    const colorScheme = useColorScheme();

    //TODO: Consistency - create or add for occurrence, not both
    const [isAddOccurrenceOpen, setIsAddOccurrenceOpen] = useState(false);

    const [duration, setDuration] = useState<number>(classDuration ?? 60);
    const [notes, setNotes] = useState<string>('');

    const [selectedDate, setSelectedDate] = useState<string>(() =>
        new Date().toISOString().slice(0, 10));
    const [selectedTime, setSelectedTime] = useState<string>('');

    const [intervals, setIntervals] = useState<string[]>([]);
    const [isIntervalsOpen, setIsIntervalsOpen] = useState(false);

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(isCreateOccurrenceSuccess);

    useEffect(() => {
        const callIntervals = async() => {
            const timeIntervals = await onRequestingTimeIntervals(selectedDate, duration);
            setIntervals(timeIntervals);
        };

        callIntervals();

    }, [selectedDate]);

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
                        {`Set any time from available intervals (for duration ${duration} mins):`}
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
                                value={duration.toString()}
                                onChangeText={(durationStr) => {setDuration(Number(durationStr))}}
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

                        <View>{renderAddDateView()}</View>
                        <View>{isIntervalsOpen ? renderAvailableTimeIntervals() : null}</View>
                        <View style={[{borderColor: 'grey'}]}>{renderAddTimeView()}</View>

                        <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                            <Pressable
                                style={styles.modalConfirmButton}
                                onPress={() => {
                                    if (onUniquenessCheck(selectedDate, selectedTime)) {
                                        onCreateOccurrence(className ?? 'No name class', selectedDate, selectedTime, duration, classId ?? undefined, undefined, notes);
                                        setIsAddOccurrenceOpen(false);
                                    } else {
                                        alert('Such date and time have been already taken');
                                        console.log(`There is already an occurrence at ${selectedDate} - ${selectedTime}`);
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

    const renderAddDateView = () => {
        if (Platform.OS === 'web') {
            return (
                <View style={{padding: 10}}>
                    {/* @ts-ignore using react-native-web for web date picker */}
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const date = e.target.value;
                            setSelectedDate(date);
                            console.log(`Picked date (web) is: ${date}`);
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

    const renderAddTimeView = () => {
        if (Platform.OS === 'web') {
            return (
                <View style={{padding: 10}}>
                    {/* @ts-ignore using react-native-web for web btime picker */}
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const time = e.target.value;
                            setSelectedTime(time);
                            console.log(`Picked time (web) is: ${time}`);
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
                                key={occurrenceId}
                            >
                                <Pressable
                                    style={styles.timeButton}
                                    onPress={() => {
                                        // TODO: have a functionality to edit the occurrence - cancel class and keep it, rescchedule, etc
                                        onDeleteOccurrence(occurrenceId, className ?? "No name class", date, time);
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

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            <ScrollView contentContainerStyle={[styles.modalInfo, styles.modalContainer]}>
                {isAddOccurrenceOpen ? (renderAddOccurrenceView()) : renderOccurences()}
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
        paddingHorizontal: 10,
        paddingBottom: 10,
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
