import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, StyleSheet, Pressable, FlatList, Text, SafeAreaView, useColorScheme, ActivityIndicator} from 'react-native';

import Checkbox from './Checkbox';
import ClassName from './ClassName';
import CurrentDate from '@/components/CurrentDate';
import ScreenTitle from '@/components/ScreenTitle';
import ConfirmationDetails from './ConfirmationDetails';

type ClassType = {
    id: number;
    name: string;
};

// {"date": "2025-04-03", 
//  "classes": 
//      {"1": 
//          {
//              "name": "Longsword", 
//              "students": 
//                  {"1":
//                      {"first_name": "John", 
//                      "last_name": "Smith", 
//                      "is_showed_up": true}}}, 
//      "4": 
//          {
//              "name": "Fencing seminar", 
//              "students": 
//                  {"1": {
//                      "first_name": "John", 
//                      "last_name": "Smith", 
//                      "is_showed_up": true}}}}}


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

const ConfirmationList = () => {
    const colorScheme = useColorScheme();

    const [attendances, setAttendances] = useState<AttendanceType[]>([]);

    const [loading, setLoading] = useState(true);

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    }

    useEffect(() => {
        const fetchAttendances = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/attendances/');
                if (response.ok) {
                    const responseData = await response.json();
                    if (isValidArrayResponse(responseData, 'response')) {
                        console.log('Function fetchAttendances. The response from backend is valid.' + JSON.stringify(responseData))

                        const dataAttendanceList: AttendanceType[] = responseData.response;
                        const fetchedAttendances = dataAttendanceList.map(att => ({
                            date: att.date,
                            classes: att.classes
                        }));

                        setAttendances(fetchedAttendances);
                        console.log("Fetched attendances: ", fetchedAttendances);
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
        <SafeAreaView style={styles.appContainer}>
                <FlatList
                    data={attendances}
                    keyExtractor={att => att.date.toString()}
                    renderItem={({ item: att }) => <ConfirmationDetails date={att.date} classes={att.classes}/>}
                />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
    },
})

export default ConfirmationList;