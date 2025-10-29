import * as React from 'react';  
import { useEffect, useState } from 'react';
import {View, StyleSheet, Pressable, Button, Text, Modal, useColorScheme, Platform} from 'react-native';


type ClassOccurrenceModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onRequestingTimeSlots: (dayName: string, classDurationToFit: number) => Promise<string[]>;
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
    onRequestingTimeSlots,
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

    const [isAddOccurrenceOpen, setIsAddOccurrenceOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string>(() =>
        new Date().toISOString().slice(0, 10));

    const renderAddDateView = () => {
        if (Platform.OS === 'web') {
            return (
                <View>
                    {/* @ts-ignore using react-native-web for web date picker */}
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const date = e.target.value;
                            setSelectedDate(date);
                            console.log(`Picked date (web) is: ${date}`);
                            setIsAddOccurrenceOpen(false);
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
                <View></View>
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
                                setIsAddOccurrenceOpen(!isAddOccurrenceOpen);
                            }}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.dateText]}>+ Add occurrence</Text>
                        </Pressable>
                        {isAddOccurrenceOpen ? <View style={styles.dropdown}>{renderAddDateView()}</View> : null}
                        {isAddOccurrenceOpen ? <View style={[styles.dropdown, {borderColor: 'grey'}]}>{renderAddTimeView()}</View> : null}
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

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            {renderOccurences()}
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
        width: '30%',
    },
    modalSingleButtonContainer: {
         justifyContent: 'center',
    },
    modalConfirmButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'green',
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
    hiddenButton: {
        opacity: 0,
        width: 0,
        overflow: 'hidden',
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
});

export default ClassOccurrenceModal;
