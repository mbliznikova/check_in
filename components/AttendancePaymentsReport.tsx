import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, StyleSheet, useColorScheme, Text, FlatList} from 'react-native';

import ScreenTitle from './ScreenTitle';
import ClassName from './ClassName';
import Student from './Student';

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

const AttendancePaymentsReport = () => {
    const colorScheme = useColorScheme();

    const [attendances, setAttendances] = useState<AttendanceType[]>([]);

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    };

    useEffect(() => {
        const fetchAttendances = async () => {

            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            try {
                const response = await fetch(`http://127.0.0.1:8000/backend/attendances/?month=${currentMonth}&year=${currentYear}`);
                console.log(response);
                if (response.ok) {
                    const responseData = await response.json();
                    if (isValidArrayResponse(responseData, 'response')) {
                        console.log('AttendancePaymentsReport. Function fetchAttendances. The response from backend is valid.' + JSON.stringify(responseData))

                        const dataAttendanceList: AttendanceType[] = responseData.response;
                        const fetchedAttendances = dataAttendanceList.map(att => ({
                            date: att.date,
                            classes: att.classes
                        }));

                        setAttendances(fetchedAttendances);
                        console.log("AttendancePaymentsReport. Fetched attendances: ", fetchedAttendances);
                    }
                } else {
                    console.log("Function fetchAttendances. Response was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of attendances: ", err)
            }
        }

        fetchAttendances();
    },
    []);

    return (
        <View style={styles.container}>
            <View style={styles.bigFlex}>
            <ScreenTitle titleText='Attendance and Payments report'/>
            <View style={styles.headerRow}>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Student</Text>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Attendance</Text>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Balance</Text>
            </View>
            </View>
            <View style={styles.smallFlex}>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    bigFlex: {
        flex: 3,
    },
    smallFlex: {
        flex: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 10,
        // paddingBottom: 20,
    },
    columnHeadersText: {
        fontSize: 20, 
        fontWeight: 'bold',
    },
    regularRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studentName: {
        flex: 1,
        minWidth: 100,
    },
    attendance: {
        flex: 1,
        alignItems: 'center',
    },
    balance: {
        flex: 1,
        alignItems: 'flex-end',
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
})

export default AttendancePaymentsReport;