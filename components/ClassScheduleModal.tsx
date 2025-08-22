import { Modal, View, Text, TextInput, StyleSheet, useColorScheme, Pressable } from "react-native";

import ScreenTitle from "./ScreenTitle";

type ClassScheduleModalModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    scheduleData: Map<number, string[]>;
};

const ClassScheduleModal = ({
    isVisible = false,
    onModalClose,
    scheduleData = new Map(),
}: ClassScheduleModalModalProps) => {

    const colorScheme = useColorScheme();

    const dayNames = [
        "",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ]

    // TODO: think about handling of time when seconds part is missing (rather BE refactor and no need of slice()??)
    const renderSchedules = (schedule: Map<number, string[]>) => {
        return (
            <View style={styles.scheduleRowContainder}>
                {[...schedule].map(([day, times]) => (
                    <View
                        key={day}
                        style={styles.scheduleRow}>
                            <View style={styles.dayContainer}>
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold", padding: 10, paddingHorizontal: 20}]}>
                                    {dayNames[day]}
                                </Text>
                            </View>
                            <Pressable
                                style={styles.timeButton}
                                onPress={() => {}}
                                >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {textAlign: 'right', paddingRight: 5, color: 'red'}]}>
                                    x
                                </Text>
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {paddingHorizontal: 10, paddingBottom: 10}]}>
                                    {times.map(time => time.slice(0,5)).join(', ')}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {}}
                                style={styles.addTimeButton}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>+</Text>
                            </Pressable>
                    </View>
                ))}
                    <Pressable
                        style={styles.addDayButton}
                        onPress={() => {}}
                    >
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>+ Add day</Text>
                    </Pressable>
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

                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                        <Pressable
                            style={styles.modalConfirmButton}
                            onPress={onModalClose}
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
});

export default ClassScheduleModal;