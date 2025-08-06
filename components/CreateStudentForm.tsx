import * as React from 'react';
import { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, useColorScheme, Pressable, Modal, TextInput } from 'react-native';

import ScreenTitle from './ScreenTitle';

const CreateStudentForm = () => {
    const colorScheme = useColorScheme();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const createNewStudent = async () => {
        const data = {
            "firstName": firstName,
            "lastName": lastName,
        };

        console.log('data is: ' + JSON.stringify(data));

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/backend/students/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorMessage = `Function createNewStudent. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            } else {
                console.log('Student was created successfully!');

                const responseData = await response.json();

                if (
                    typeof responseData === 'object' &&
                    responseData !== null &&
                    'message' in responseData && responseData.message === 'Student was created successfully' &&
                    'studentId' in responseData &&
                    'firstName' in responseData && responseData.firstName === firstName &&
                    'lastName' in responseData && responseData.lastName === lastName
                ) {
                    console.log(`Function createNewStudent. The response from backend is valid. ${JSON.stringify(responseData)}`)
                } else {
                    console.warn(`Function createNewStudent. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
                setFirstName("");
                setLastName("");
            }
        } catch(error) {
            console.error(`Error while sending the data to the server at creating student: ${error}`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScreenTitle titleText='Create new student'/>
            <View style={[styles.itemContainer, styles.itemRow]}>
                <Text
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                >
                    First name:
                </Text>
                <TextInput
                style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                value={firstName}
                onChangeText={(newFirstName) => {setFirstName(newFirstName)}}
            />
            </View>
            <View style={[styles.itemContainer, styles.itemRow]}>
                <Text
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.itemContainer]}
                >
                    Last name:
                </Text>
                <TextInput
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                    value={lastName}
                    onChangeText={(newLastName) => {setLastName(newLastName)}}
                />
            </View>
            <View style={styles.itemContainer}>
                <Pressable
                onPress={() => {
                    createNewStudent();
                }}
                style={styles.createButton}
                >
                    <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Create</Text>
                </Pressable>
            </View>
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

export default CreateStudentForm;
