import * as React from 'react';
import { useState } from 'react';
import {View, StyleSheet, Pressable, FlatList, Text, SafeAreaView, useColorScheme} from 'react-native';

import Checkbox from './Checkbox';
import ClassName from './ClassName';
import CurrentDate from '@/components/CurrentDate';
import ScreenTitle from '@/components/ScreenTitle';
import Student from './Student';

const CheckInConfirmation = () => {
    const colorScheme = useColorScheme();
    // have a list of the classes for today
        // for each class that requires a confirmation have a list of students checked in to today
        // for each student have a checkbox so a teacher can check/uncheck
        // have a "Confirm button

    // Add functionality to fetch today's classes that require a confirmation from backend and place them here
    const classList = [
        { id: '101', name: 'Longsword' },
        { id: '102', name: 'Private Lessons' },
        { id: '103', name: 'Self-defence' }
    ];

    const [students, setStudents] = useState([
        // Add functionality to fetch students that checked in to today from backend and place them here
        { firstName: "James", lastName: "Harrington", id: "1", classes: new Set(['101', '103'])},
        { firstName: "William", lastName: "Kensington", id: "2", classes: new Set(['102', '103'])},
        { firstName: "Edward", lastName: "Montgomery", id: "3", classes: new Set(['103'])},
        { firstName: 'Henry', lastName: 'Fairchild', id: '4', classes: new Set(['101']) },
        { firstName: 'Arthur', lastName: 'Whitmore', id: '5', classes: new Set(['101']) },
        { firstName: 'Charles', lastName: 'Waverly', id: '6', classes: new Set(['102', '101']) },
    ]);

    const [confirmedClasses, setConfirmedClasses] = useState(setConfirmation);

    function setConfirmation() {
        const confirmationMap = new Map<string, Set<string>>();

        students.forEach(student => {
            confirmationMap.set(student.id, student.classes)
        });

        return confirmationMap;
    };

    function toggleConfirmation(studentId: string, classId: string) {
        setConfirmedClasses(prevClasses => {
            const newConfirmedClasses = new Map(prevClasses);
            const newClassesSet = new Set(newConfirmedClasses.get(studentId));

            if (newClassesSet.has(classId)) {
                newClassesSet.delete(classId);
            } else {
                newClassesSet.add(classId);
            }

            newConfirmedClasses.set(studentId, newClassesSet);

            return newConfirmedClasses;
        });
    }

    const sendConfirmation = async () => {
        const data = {
            confirmationList: Array.from(confirmedClasses.entries()).map(([studentId, classesSet]) => ({
                [studentId]: Array.from(classesSet)
            }))
        };

        console.log('data is: ' + data)

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/backend/confirm/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorMessage = `Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            }

            console.log('Confirmation was sent successfully!');

            const responseData = await response.json();
            console.log('Response data: ' + responseData);

        } catch (err) {
            console.error("Error while sending the data to the server: ", err);
        }
    }

    return (
        <SafeAreaView style={styles.appContainer}>
            <View style={[styles.contentContainer, styles.bigFlex]}>
                <CurrentDate/>
                <ScreenTitle titleText='Confirm check in'></ScreenTitle>

                <FlatList
                    data={classList}
                    keyExtractor={cls => cls.id}
                    renderItem={({ item: cls }) => {
                        const studentsAtClass = students.filter(student => student.classes.has(cls.id));
                        return (
                            <View>
                                <ClassName
                                    id={cls.id}
                                    name={cls.name}
                                />
                                <FlatList
                                    data={studentsAtClass}
                                    renderItem={({ item: student }) => {
                                        const name = student.firstName + ' ' + student.lastName
                                        return (
                                        <View style={styles.checkboxListItem}>
                                            <Checkbox
                                                label={name}
                                                checked={confirmedClasses.get(student.id)?.has(cls.id) ?? false}
                                                onChange={() => {toggleConfirmation(student.id, cls.id)}}
                                                labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                                            />
                                            {/* <Student firstName={student.firstName} lastName={student.lastName} id={student.id}/> */}
                                        </View>
                                        )
                                    }}
                                />
                            </View>
                            );
                    }}
                />
            </View>

            <View style={[styles.confirmButtonContainer, styles.smallFlex]}>
                    <Pressable
                        style={styles.confirmButton}
                        onPress={() => {
                            sendConfirmation();
                            alert('Students have been confirmed');
                        }}
                    >
                        <Text>Confirm</Text>
                    </Pressable>
            </View>

      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    appContainer: {
      flex: 1,
    },
    bigFlex: {
        flex: 5,
    },
    smallFlex: {
        flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 16, 
    },
    checkboxListItem: {
        paddingVertical: 10,
        color: 'white',
    },
    confirmButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    confirmButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'blue',
      },
    darkColor: {
        color: 'black',
      },
    lightColor: {
        color: 'white',
      },
  });

export default CheckInConfirmation;