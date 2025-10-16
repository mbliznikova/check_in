import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, StyleSheet, Pressable, FlatList, Text, SafeAreaView, useColorScheme, ActivityIndicator} from 'react-native';

import Checkbox from './Checkbox';
import ClassName from './ClassName';
import ScreenTitle from '@/components/ScreenTitle';

type AttendanceStudentType = {
    firstName: string;
    lastName: string;
    isShowedUp: boolean;
}

type AttendanceClassType = {
    name: string;
    time: string;
    students: {
        [studentId: string]: AttendanceStudentType;
    }
}

type AttendanceType = {
    date: string;
    occurrences: {
        [occurrenceId: string]: AttendanceClassType;
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
    occurrences,
}: AttendanceType) => {
    const colorScheme = useColorScheme();

    const [confirmation, setConfirmation] = useState<ConfirmationMap>(new Map());

    useEffect(() => {
        populateConfirmation();
    }, [occurrences]);

    const populateConfirmation = () => {
        const confirmationMap: ConfirmationMap = new Map();
        for (const [occurrenceId, occurrenceData] of Object.entries(occurrences)) {
            const occurrenceIdNumber = Number(occurrenceId);
            const studentsMap: Map<number, Map<string, boolean>> = new Map();

            for (const [studentId, studentData] of Object.entries(occurrenceData.students)) {
                const studentIdNumber = Number(studentId);
                const statusMap: Map<string, boolean> = new Map();
                statusMap.set('isCheckedIn', true);
                statusMap.set('isShowedUp', studentData.isShowedUp);

                studentsMap.set(studentIdNumber, statusMap);
            }

            confirmationMap.set(occurrenceIdNumber, studentsMap);
        }
        setConfirmation(confirmationMap);
    };

    const toggleCheckIn = (occurrenceId: number, studentId: number) => {
        setConfirmation(prevConfirmation => {
            const newConfirmation = new Map(prevConfirmation);
            const prevValue = newConfirmation.get(occurrenceId)?.get(studentId)?.get('isCheckedIn');
            newConfirmation.get(occurrenceId)?.get(studentId)?.set('isCheckedIn', !prevValue);

            return newConfirmation;
        });
    };

    const toggleShowUp = (occurrenceId: number, studentId: number) => {
        setConfirmation(prevConfirmation => {
            const newConfirmation = new Map(prevConfirmation);
            const prevValue = newConfirmation.get(occurrenceId)?.get(studentId)?.get('isShowedUp');
            newConfirmation.get(occurrenceId)?.get(studentId)?.set('isShowedUp', !prevValue);

            return newConfirmation;
        });
    };

    const getConfirmationList = () => {
        const confirmationMap: Map<number, Map<number, boolean>> = new Map();

        for (const [occurrenceId, occurrenceData] of confirmation) {
            for (const [studentId, studentData] of occurrenceData) {
                if (studentData.get('isCheckedIn') === true) {
                    if (confirmationMap.has(studentId)) {
                        confirmationMap.get(studentId)?.set(occurrenceId, studentData.get('isShowedUp') ?? true)
                    } else {
                        const statusMap: Map<number, boolean> = new Map();
                        statusMap.set(occurrenceId, studentData.get('isShowedUp') ?? true);
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

    const sendConfirmation = async () => { // TODO: move to parent component?
        const data = {
            'confirmationList': getConfirmationList(),
            'date': date // TODO: have as a param?
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
           if ( // TODO: have validation function
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
                    data={Object.entries(occurrences)}
                    keyExtractor={([occurrenceId, _occurrenceInfo]) => occurrenceId.toString()}
                    renderItem={( {item} ) => {
                        const [occurrenceId, occurrenceInfo] = item;
                        return (
                            <View>
                                <ClassName
                                    id={Number(occurrenceId)}
                                    name={`${occurrenceInfo.name} - ${occurrenceInfo.time.slice(0, 5)}`}
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
                                    data={Object.entries(occurrenceInfo.students)}
                                    keyExtractor={([studentId, _studentInfo]) => studentId.toString()}
                                    renderItem={({ item }) => {
                                        const [studentId, studentInfo] = item;
                                        const studentName = studentInfo.firstName + ' ' + studentInfo.lastName;
                                        return (
                                            <View style={[styles.checkboxListItem, styles.spaceBetweenRow]}>
                                                <Checkbox
                                                    label={studentName}
                                                    checked={confirmation.get(Number(occurrenceId))?.get(Number(studentId))?.get('isCheckedIn') ?? true}
                                                    onChange={()=>{toggleCheckIn(Number(occurrenceId), Number(studentId))}}
                                                    labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                                                />
                                                <Checkbox
                                                    label=''
                                                    checked={confirmation.get(Number(occurrenceId))?.get(Number(studentId))?.get('isShowedUp') ?? true}
                                                    onChange={()=>{toggleShowUp(Number(occurrenceId), Number(studentId))}}
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
        paddingHorizontal: 30,
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