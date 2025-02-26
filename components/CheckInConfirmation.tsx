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

    return (
        <SafeAreaView style={styles.appContainer}>
            <View style={styles.contentContainer}>
                <CurrentDate/>
                <ScreenTitle titleText='Confirm check in'></ScreenTitle>

                <FlatList
                    data={classList}
                    keyExtractor={cls => cls.id}
                    renderItem={({ item: cls }) => {
                        const studentsAtClass = students.filter(student => student.classes.has(cls.id));
                        console.log(studentsAtClass);
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

            <View style={styles.confirmButtonContainer}>
                    <Pressable style={styles.confirmButton} onPress={() => {
                            console.log('Button Pressed');
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