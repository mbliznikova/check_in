import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, StyleSheet, Pressable, FlatList, Text, SafeAreaView, useColorScheme, ActivityIndicator} from 'react-native';

import Checkbox from './Checkbox';
import ClassName from './ClassName';
import CurrentDate from '@/components/CurrentDate';
import ScreenTitle from '@/components/ScreenTitle';
import Student from './Student';

type ClassType = {
    id: number;
    name: string;
};

type AttendanceType = {
    id: number;
    firstName: string;
    lastName: string;
    classes: Set<number>;
};

const CheckInConfirmation = () => {
    const colorScheme = useColorScheme();

    const [students, setStudents] = useState<AttendanceType[]>([]);

    const [classList, setClassList] = useState<ClassType[]>([]);

    const [confirmedClasses, setConfirmedClasses] = useState(new Map<number, Map<number, boolean>>());

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/classes/');
                if (response.ok) {
                    const data = await response.json();
                    const dataClassesList: ClassType[] = data.response;
                    const fetchedClasses = dataClassesList.map(cls => ({
                        id: cls.id,
                        name: cls.name
                    }));

                    setClassList(fetchedClasses);
                } else {
                    console.log("Response was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of classes: ", err)
            }
        }

        const fetchAttendedStudents = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/attended_sudents/');
                if (response.ok) {
                    const responseData = await response.json();
                    // TODO: add checks?
                    const attendanceList: AttendanceType[] = responseData.confirmedAttendance;
                    if (Array.isArray(attendanceList) && attendanceList.length > 0) {
                        const fetchedAttendances = attendanceList.map(att => ({
                            id: att.id,
                            firstName: att.firstName,
                            lastName: att.lastName,
                            classes: new Set(att.classes),
                        }));

                        setStudents(fetchedAttendances);
                    } else {
                        console.warn("No attendance for today or responseData.confirmedAttendance is not a type of Array");
                    }
                } else {
                    console.log("Request was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of attended students: ", err);
            }
        }

        fetchClasses();
        fetchAttendedStudents();
        setLoading(false);
    },
    []);

    useEffect(() => {
        if (students.length === 0) return;

        setConfirmedClasses(setConfirmation());

    }, [students]);

    function setConfirmation() {
        const confirmationMap = new Map<number, Map<number, boolean>>();

        students.forEach(student => {
            const classMap = new Map<number, boolean>();
            student.classes.forEach(clsId => classMap.set(clsId, true));
            confirmationMap.set(student.id, classMap)
        });

        return confirmationMap;
    };

    function toggleConfirmation(studentId: number, classId: number) {
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

    function toggleShowUpConfirmation(studentId: number, classId: number) {
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
                    method: 'PUT',
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

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <SafeAreaView style={styles.appContainer}>
            <View style={[styles.contentContainer, styles.bigFlex]}>
                <CurrentDate/>
                <ScreenTitle titleText='Confirm check in'></ScreenTitle>

                <FlatList
                    data={classList}
                    keyExtractor={cls => cls.id.toString()}
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
                                        Did actually show up?
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