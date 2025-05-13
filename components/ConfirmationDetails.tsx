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
                statusMap.set('IsShowedUp', studentData.isShowedUp);

                studentsMap.set(studentIdNumber, statusMap);
            }

            confirmationMap.set(classIdNumber, studentsMap);
        }
        setConfirmation(confirmationMap);
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
                                                    checked={true}
                                                    onChange={()=>{}}
                                                    labelStyle={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                                                />
                                                <Checkbox
                                                    label=''
                                                    checked={studentInfo.isShowedUp??true}
                                                    onChange={()=>{}}
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
                        // disabled={!ifStudentsToConfirm}
                        onPress={() => {
                            // sendConfirmation();
                            // alert('Students have been confirmed');
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