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
        { id: '1', name: 'Longsword' },
        { id: '2', name: 'Private lesson' },
        { id: '3', name: 'Self-defence' },
        { id: '4', name: 'Fencing seminar' },
        { id: '5', name: 'Sword and buckler'},
        { id: '6', name: 'Rapier and dagger'}
    ];


    const [students, setStudents] = useState([
        // Add functionality to fetch students that checked in to today from backend and place them here
        { firstName: "John", lastName: "Smith", id: "1", classes: new Set(['1', '3'])},
        { firstName: "Jane", lastName: "Coleman", id: "2", classes: new Set(['2', '3'])},
        { firstName: "James", lastName: "Harrington", id: "3", classes: new Set(['3'])},
        { firstName: 'William', lastName: 'Kensington', id: '4', classes: new Set(['1']) },
        { firstName: 'Edward', lastName: 'Montgomery', id: '5', classes: new Set(['1']) },
        { firstName: 'Henry', lastName: 'Fairchild', id: '6', classes: new Set(['2', '1']) },
    ]);


    const [confirmedClasses, setConfirmedClasses] = useState(setConfirmation);

    function setConfirmation() {
        const confirmationMap = new Map<string, Map<string, boolean>>();

        students.forEach(student => {
            const classMap = new Map<string, boolean>();
            student.classes.forEach(clsId => classMap.set(clsId, true));
            confirmationMap.set(student.id, classMap)
        });

        return confirmationMap;
    };

    function toggleConfirmation(studentId: string, classId: string) {
        setConfirmedClasses(prevClasses => {
            const newConfirmedClasses = new Map(prevClasses);
            const newClassesMap = new Map(newConfirmedClasses.get(studentId));

            if (newClassesMap.has(classId)) {
                newClassesMap.delete(classId);
            } else {
                newClassesMap.set(classId, true);
            }

            newConfirmedClasses.set(studentId, newClassesMap);

            return newConfirmedClasses;
        });
    }

    // Because of case of 24-hours Cancellation policy we need a way to confirm if a student attended a class

    function toggleShowUpConfirmation(studentId: string, classId: string) {
        setConfirmedClasses(prevClasses => {
            const newConfirmedShowUp = new Map(prevClasses);
            const newShowUpMap = new Map(newConfirmedShowUp.get(studentId));

            newShowUpMap.set(classId, !newShowUpMap.get(classId))
            newConfirmedShowUp.set(studentId, newShowUpMap);

            return newConfirmedShowUp;
        });
    }

    const sendConfirmation = async () => {
        const data = {
            confirmationList: Array.from(confirmedClasses.entries()).map(([studentId, classesMap]) => ({
                [studentId]: Object.fromEntries(classesMap)
            }))
        };

        console.log('data is: ' + JSON.stringify(data));

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
                                <View style={styles.separator} />
                                <ClassName
                                    id={cls.id}
                                    name={cls.name}
                                />
                                <View style={styles.spaceBetweenRow}>
                                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                                        Student
                                    </Text>
                                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                                        Showed up
                                    </Text>
                                </View>
                                <FlatList
                                    data={studentsAtClass}
                                    renderItem={({ item: student }) => {
                                        const name = student.firstName + ' ' + student.lastName
                                        return (
                                        <View style={[styles.checkboxListItem, styles.spaceBetweenRow]}>
                                            <Checkbox
                                                label={name}
                                                checked={confirmedClasses.get(student.id)?.has(cls.id) ?? false}
                                                onChange={() => {toggleConfirmation(student.id, cls.id)}}
                                                labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                                            />
                                            <Checkbox
                                                label={''}
                                                checked={confirmedClasses.get(student.id)?.get(cls.id) ?? true}
                                                onChange={() => {toggleShowUpConfirmation(student.id, cls.id)}}
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
    spaceBetweenRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
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
    separator: {
        height: 1,
        backgroundColor: 'gray',
        marginVertical: 10,
      },
  });

export default CheckInConfirmation;