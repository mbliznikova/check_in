import * as React from 'react';
import { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, useColorScheme, Pressable, Modal, TextInput } from 'react-native';

import ScreenTitle from './ScreenTitle';

const CreateScheduleClass = () => {
    const colorScheme = useColorScheme();

    const [className, setClassName] = useState("");
    const [classId, setClassId] = useState("");

    const [day, setDay] = useState("");
    const [time, setTime] = useState("");

    const [classStatus, setClassStatus] = useState("");

    const createClass = async () => {
        // TODO: sanitize input
        const data = {
            "name": className
        };

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/backend/classes/',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorMessage = `Function createClass. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            } else {
                console.log('Class was created successfully!');

                const responseData = await response.json();

                if (
                    typeof responseData === 'object' &&
                    responseData !== null &&
                    'message' in responseData && responseData.message === 'Class was created successfully' &&
                    'id' in responseData &&
                    'name' in responseData && responseData.name === className
                ) {
                    console.log(`Function createClass. The response from backend is valid. ${JSON.stringify(responseData)}`)
                    setClassStatus(`Class ${className} has been created with id ${responseData.id}`);
                } else {
                    console.log(`Function createClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`)
                }
                setClassName("");
            }
        } catch(error) {
            console.error(`Error while sending the data to the server at student check-in: ${error}`);
        }
    }

    const renderClassCreationForm = () => {
        return (
            <View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Class name:
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={className}
                        onChangeText={(createdClassName) => {setClassName(createdClassName)}}
                    />
                </View>
                <View style={styles.itemContainer}>
                    <Pressable
                        onPress={() => {createClass()}}
                        style={styles.createButton}
                    >
                        <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Create</Text>
                    </Pressable>
                </View>
                <Text
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                >
                    {classStatus}
                </Text>
            </View>
        );
    };

    const renderClassScheduleForm = () => {
        return (
            <View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Class:
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={classId}
                        onChangeText={(newClassId) => {setClassId(newClassId)}}
                    />
                </View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Day ("Monday"):
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={day}
                        onChangeText={(dayName) => {setDay(dayName)}}
                    />
                </View>
                <View style={[styles.itemContainer, styles.itemRow]}>
                    <Text
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                    >
                        Time ("10:00"):
                    </Text>
                    <TextInput
                        style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                        value={time}
                        onChangeText={(timeStr) => {setTime(timeStr)}}
                    />
                </View>
                <View style={styles.itemContainer}>
                    <Pressable
                        onPress={() => {}}
                        style={styles.createButton}
                    >
                        <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Schedule</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScreenTitle titleText='Create new class'/>
            {renderClassCreationForm()}

            <View style={{paddingVertical: 30}}></View>

            <ScreenTitle titleText='Schedule new class'/>
            {renderClassScheduleForm()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    itemContainer: {
        padding: 10,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row'
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
    inputFeld: {
        height: 30,
        width: 200,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 15,
    },
    createButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
    },
});

export default CreateScheduleClass;
