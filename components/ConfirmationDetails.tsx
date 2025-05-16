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

type AttendanceStudentType = {
    firstName: string;
    lastName: string;
    isShowedUp: boolean;
}

type AttendanceClassType = {
    name: string;
    students: {
        [studentId: string]: AttendanceStudentType;
    }
}

type AttendanceType = {
    date: string;
    classes: {
        [classId: string]: AttendanceClassType;
    }
}

type ConfirmationMap =
    Map<number,
        Map<number,
            Map<string,
                boolean
            >
        >
    >;

const ConfirmationDetails = ({
    date,
    classes,
}: AttendanceType) => {
    const colorScheme = useColorScheme();

    const [confirmation, setConfirmation] = useState<ConfirmationMap>(new Map());

    useEffect(() => {
        populateConfirmation();
    }, [classes]);

    const populateConfirmation = () => {
        const confirmationMap: ConfirmationMap = new Map();
        for (const [classId, classData] of Object.entries(classes)) {
            const classIdNumber = Number(classId);
            const studentsMap: Map<number, Map<string, boolean>> = new Map();

            for (const [studentId, studentData] of Object.entries(classData.students)) {
                const studentIdNumber = Number(studentId);
                const statusMap: Map<string, boolean> = new Map();
                statusMap.set('isCheckedIn', true);
                statusMap.set('isShowedUp', studentData.isShowedUp);

                studentsMap.set(studentIdNumber, statusMap);
            }

            confirmationMap.set(classIdNumber, studentsMap);
        }
        setConfirmation(confirmationMap);
    };

    const toggleCheckIn = (classId: number, studentId: number) => {
        setConfirmation(prevConfirmation => {
            const newConfirmation = new Map(prevConfirmation);
            const prevValue = newConfirmation.get(classId)?.get(studentId)?.get('isCheckedIn');
            newConfirmation.get(classId)?.get(studentId)?.set('isCheckedIn', !prevValue);

            return newConfirmation;
        });
    };

    const toggleShowUp = (classId: number, studentId: number) => {
        setConfirmation(prevConfirmation => {
            const newConfirmation = new Map(prevConfirmation);
            const prevValue = newConfirmation.get(classId)?.get(studentId)?.get('isShowedUp');
            newConfirmation.get(classId)?.get(studentId)?.set('isShowedUp', !prevValue);

            return newConfirmation;
        });
    };

    const getConfirmationList = () => {
        const confirmationMap: Map<number, Map<number, boolean>> = new Map();

        for (const [classId, classData] of confirmation) {
            for (const [studentId, studentData] of classData) {
                if (studentData.get('isCheckedIn') === true) {
                    if (confirmationMap.has(studentId)) {
                        confirmationMap.get(studentId)?.set(classId, studentData.get('isShowedUp') ?? true)
                    } else {
                        const statusMap: Map<number, boolean> = new Map();
                        statusMap.set(classId, studentData.get('isShowedUp') ?? true);
                        confirmationMap.set(studentId, statusMap);
                    }
                }
            }
        }

        const confirmationList = Array.from(confirmationMap.entries()).map(([studentId, studentData]) => ({
            [studentId]: Object.fromEntries(studentData)
        }));
        console.log(confirmationList)
        return confirmationList;
    };

    const sendConfirmation = async () => {
        const data = {
            'confirmationList': getConfirmationList(),
            'date': date
        };

        console.log('Data is ' + JSON.stringify(data));

        try {
           const response = await fetch(
            'http://127.0.0.1:8000/backend/confirm/', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }
           );

           if (!response.ok) {
               const errorMessage = `sendConfirmation function. Request was unsuccessful: ${response.status}, ${response.statusText}`;
               throw Error(errorMessage);
           };

           console.log('sendConfirmation function. Confirmation was sent successfully!');

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
            console.error("sendConfirmation function: Error while sending the data to the server: ", err);
        };
    };

    return (
        <SafeAreaView style={styles.appContainer}>
            <View style={[styles.contentContainer, styles.bigFlex]}>
            <ScreenTitle titleText={date}></ScreenTitle>
                <FlatList
                    data={Object.entries(classes)}
                    keyExtractor={([classId, _classInfo]) => classId.toString()}
                    renderItem={( {item} ) => {
                        const [classId, classInfo] = item;
                        return (
                            <View>
                                <ClassName
                                    id={Number(classId)}
                                    name={classInfo.name}
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
                                    data={Object.entries(classInfo.students)}
                                    keyExtractor={([studentId, _studentInfo]) => studentId.toString()}
                                    renderItem={({ item }) => {
                                        const [studentId, studentInfo] = item;
                                        const studentName = studentInfo.firstName + ' ' + studentInfo.lastName;
                                        return (
                                            <View style={[styles.checkboxListItem, styles.spaceBetweenRow]}>
                                                <Checkbox
                                                    label={studentName}
                                                    checked={confirmation.get(Number(classId))?.get(Number(studentId))?.get('isCheckedIn') ?? true}
                                                    onChange={()=>{toggleCheckIn(Number(classId), Number(studentId))}}
                                                    labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                                                />
                                                <Checkbox
                                                    label=''
                                                    checked={confirmation.get(Number(classId))?.get(Number(studentId))?.get('isShowedUp') ?? true}
                                                    onChange={()=>{toggleShowUp(Number(classId), Number(studentId))}}
                                                    labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                                                />
                                            </View>
                                        );
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

            <View style={styles.separator} />

        </SafeAreaView>
    );
};

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
    separator: {
        height: 1,
        backgroundColor: 'gray',
        marginVertical: 10,
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
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    leftText: {
        fontWeight: '600',
    },
    rightText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
})


export default ConfirmationDetails;