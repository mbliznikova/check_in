import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, StyleSheet, Pressable, FlatList, Text, SafeAreaView, useColorScheme, ActivityIndicator} from 'react-native';

import Checkbox from './Checkbox';
import ClassName from './ClassName';
import CurrentDate from '@/components/CurrentDate';
import ScreenTitle from '@/components/ScreenTitle';

type ClassType = {
    id: number;
    name: string;
};

type StudentAttendanceType = {
    id: number;
    firstName: string;
    lastName: string;
    classes: Set<number>;
};

const CheckInConfirmation = () => {
    const colorScheme = useColorScheme();

    const [students, setStudents] = useState<StudentAttendanceType[]>([]);

    const [classList, setClassList] = useState<ClassType[]>([]);

    const [confirmedClasses, setConfirmedClasses] =  useState(new Map<number, Set<number>>());

    const [showUpStatus, setShowUpStatus] = useState(new Map<number, Map<number, boolean>>());

    const [loading, setLoading] = useState(true);

    const [ifStudentsToConfirm, setIfStudentsToConfirm] = useState(false);

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    }

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/classes/');
                if (response.ok) {
                    const responseData = await response.json();
                    if (isValidArrayResponse(responseData, 'response')) {
                        console.log('Function fetchClasses. The response from backend is valid.' + JSON.stringify(responseData))

                        const dataClassesList: ClassType[] = responseData.response;
                        const fetchedClasses = dataClassesList.map(cls => ({
                            id: cls.id,
                            name: cls.name
                        }));

                        setClassList(fetchedClasses);
                        console.log("Fetched classes: ", fetchedClasses);
                    }
                } else {
                    console.log("Function fetchClasses. Response was unsuccessful: ", response.status, response.statusText)
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
                    if (
                        isValidArrayResponse(responseData, 'confirmedAttendance')
                    ) {
                        console.log('Function fetchAttendedStudents. The response from backend is valid.' + JSON.stringify(responseData))

                        const attendanceList: StudentAttendanceType[] = responseData.confirmedAttendance;
                        if (Array.isArray(attendanceList) && attendanceList.length > 0) {
                            const fetchedAttendances = attendanceList.map(att => ({
                                id: att.id,
                                firstName: att.firstName,
                                lastName: att.lastName,
                                classes: new Set(att.classes),
                            }));

                            setStudents(fetchedAttendances);
                            console.log("Fetched attendance: ", fetchedAttendances);

                        } else {
                            console.warn("No attendance for today or responseData.confirmedAttendance is not a type of Array");
                        }
                    }
                } else {
                    console.log("Function fetchAttendedStudents. Request was unsuccessful: ", response.status, response.statusText)
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

        setIfStudentsToConfirm(true);
        setConfirmedClasses(setConfirmation());

    }, [students]);

    function setConfirmation() {
        const confirmationMap = new Map<number, Set<number>>();

        students.forEach(student => {
            const classSet = new Set<number>();
            student.classes.forEach(clsId => classSet.add(clsId));
            confirmationMap.set(student.id, classSet)
        });

        return confirmationMap;
    };

    function toggleConfirmation(studentId: number, classId: number) {
        setConfirmedClasses(prevClasses => {
            const newConfirmedClasses = new Map(prevClasses);
            const newClassesMap = new Set(newConfirmedClasses.get(studentId) || []);

            if (newClassesMap.has(classId)) {
                newClassesMap.delete(classId);
            } else {
                newClassesMap.add(classId);
            }

            newConfirmedClasses.set(studentId, newClassesMap);

            return newConfirmedClasses;
        });
    }

    // Because of case of 24-hours Cancellation policy we need a way to confirm if a student attended a class

    function toggleShowUpConfirmation(studentId: number, classId: number) {
        setShowUpStatus(prevShowUp => {
            const newConfirmedShowUp = new Map(prevShowUp);
            const newShowUpMap = new Map(newConfirmedShowUp.get(studentId) || []);

            const currentValue = newShowUpMap.get(classId) ?? true;
            newShowUpMap.set(classId, !currentValue);
            newConfirmedShowUp.set(studentId, newShowUpMap);

            return newConfirmedShowUp;
        });
    }

    const sendConfirmation = async () => {
        const data = {
            confirmationList: Array.from(confirmedClasses.entries()).map(([studentId, classesSet]) => ({
                [studentId]: Object.fromEntries(
                    Array.from(classesSet).map(classId => [
                        classId,
                        showUpStatus.get(studentId)?.get(classId) ?? true
                    ])
                )
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
            if (
                typeof responseData === 'object' &&
                responseData !== null &&
                'message' in responseData &&
                responseData.message === 'Attendance confirmed successfully'
            ) {
                console.log('Function sendConfirmation. The response from backend is valid. ' + JSON.stringify(responseData));
            } else {
                console.warn('Function sendConfirmation. The response from backend is NOT valid! '  + JSON.stringify(responseData));
            }

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
                                                checked={showUpStatus.get(student.id)?.get(cls.id) ?? true}
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
                        disabled={!ifStudentsToConfirm}
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