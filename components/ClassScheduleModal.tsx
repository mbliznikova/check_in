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
        console.log(`DATA IS ${schedule}`);
        return (
            <View style={styles.scheduleRowContainder}>
                {[...schedule].map(([day, times]) => (
                    <View
                        key={day}
                        style={styles.scheduleRow}>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold", padding: 10, paddingHorizontal: 20}]}>
                                {dayNames[day]}
                            </Text>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {padding: 10}]}>
                                {times.map(time => time.slice(0,5)).join(', ')}
                            </Text>
                    </View>
                ))}
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
         justifyContent: 'center'
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