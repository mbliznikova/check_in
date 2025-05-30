import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, SafeAreaView, StyleSheet, useColorScheme, Text, FlatList, Pressable, Modal} from 'react-native';

import ClassName from './ClassName';
import ScreenTitle from './ScreenTitle';
import StudentReport from './StudentReport';

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

type StudentAttendanceCountType = {
    firstName: string;
    lastName: string;
    count: [number, number];
}

type ClassAttendanceCountType = {
    name: string;
    students: Map<number, StudentAttendanceCountType>;
}

type StudentAttendanceDetailsType = {
    firstName: string;
    lastName: string;
    classesInfo: Map<number, Map<string, [number, number]>>;
}

const AttendancePaymentsReport = () => {
    const colorScheme = useColorScheme();

    const [attendances, setAttendances] = useState<AttendanceType[]>([]);

    const [report, setReport] = useState<Map<number, ClassAttendanceCountType>>(new Map());

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [student, setStudent] = useState<StudentAttendanceDetailsType>({
        firstName: "",
        lastName: "",
        classesInfo:
            new Map<number, Map<string, [number, number]>>(),
    });

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

    useEffect(() => {
        countAttendences(attendances);
    },
    [attendances]);

    const countAttendences = (attendanceList: AttendanceType[]) => {
        const reportMap: Map<number, ClassAttendanceCountType> = new Map();
        attendanceList.forEach(att => {
            const classes = att.classes;

            Object.entries(classes).forEach(([classId, classInfo]) => {
                const classIdNum = Number(classId);

                if (!reportMap.has(classIdNum)) {
                    reportMap.set(classIdNum, {
                        name: classInfo.name,
                        students: new Map<number, StudentAttendanceCountType>(),
                    });
                }

                const reportClassId = reportMap.get(classIdNum);

                Object.entries(classInfo.students).forEach(([studentId, studentInfo]) => {
                    const studentIdNum = Number(studentId);

                    if (!reportClassId?.students.has(studentIdNum)) {
                        reportClassId?.students.set(studentIdNum, {
                            firstName: studentInfo.firstName,
                            lastName: studentInfo.lastName,
                            count: [0, 0],
                        });
                    }
                    const student = reportClassId?.students.get(studentIdNum)!;
                    if (studentInfo.isShowedUp) {
                        student.count[0] += 1;
                    } else {
                        student.count[1] += 1;
                    }
                });
            });
        });
        setReport(reportMap);
    };

    const setCurrentStudent = (studentId: number, firstName: string, lastName: string) => {
        const classMap: Map<number, Map<string, [number, number]>> = new Map();

        report.forEach((value, key) => {
            if (value.students.has(studentId)) {
                const classAttendance: Map<string, [number, number]> = new Map();

                classAttendance.set(value.name, value.students.get(studentId)?.count ?? [0, 0])
                classMap.set(key, classAttendance);
            }
        });

        return {
            firstName: firstName,
            lastName: lastName,
            classesInfo: classMap
        }
    };

    const renderHeader = () => (
        <View style={[styles.headerContainer, colorScheme === 'dark'? styles.darkBackground : styles.lightBackground]}>
            <ScreenTitle titleText='Attendance and Payments report' />
            <View style={styles.headerRow}>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Student</Text>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Attendance (24 hrs policy if applicable)</Text>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Balance</Text>
            </View>
        </View>
    );

    return (
         <SafeAreaView style={styles.container}>
            <View style={[styles.container]}>
                <FlatList
                    ListHeaderComponent={renderHeader}
                    stickyHeaderIndices={[0]}
                    data={Array.from(report.entries())}
                    keyExtractor={([classId]) => classId.toString()}
                    renderItem={({ item: [classId, classInfo] }) => {
                        return (
                            <View>
                                <ClassName
                                    id={Number(classId)}
                                    name={classInfo.name}
                                />
                                <FlatList
                                    data={Array.from(classInfo.students.entries())}
                                    keyExtractor={([studentId]) => studentId.toString()}
                                    renderItem={({ item: [studentId, studentInfo] }) => {
                                        const studentName = studentInfo.firstName + ' ' + studentInfo.lastName;
                                        const studentAttendance = studentInfo.count;

                                        return (
                                            <View style={styles.spaceBetweenRow}>
                                                <View style={styles.studentName}>
                                                    <Pressable
                                                        onPress={() => {
                                                            const currentStudent = setCurrentStudent(studentId, studentInfo.firstName, studentInfo.lastName);
                                                            setStudent(currentStudent);
                                                            setIsModalVisible(true);
                                                        }}
                                                    >
                                                        <Text style={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}>{studentName}</Text>
                                                    </Pressable>
                                                    <Modal
                                                        visible={isModalVisible}
                                                        transparent={true}
                                                        // animationType='fade'
                                                        onRequestClose={() => {
                                                            setIsModalVisible(false)
                                                        }}
                                                    >
                                                        <View style={styles.modalContainer}>
                                                            <View style={styles.modalView}>
                                                                <StudentReport
                                                                    firstName={student.firstName}
                                                                    lastName={student.lastName}
                                                                    classesInfo={
                                                                        student.classesInfo
                                                                    }
                                                                />
                                                                <Pressable style={styles.modalCancelButton} onPress={() => {
                                                                    setIsModalVisible(false);
                                                                }}>
                                                                    <Text style={styles.modalText}>Cancel</Text>
                                                                </Pressable>
                                                            </View>
                                                        </View>
                                                    </Modal>
                                                </View>
                                                <View style={styles.attendance}>
                                                    <Text style={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}>{studentAttendance[0]} ({studentAttendance[1]})</Text>
                                                </View>
                                                <View style={styles.balance}>
                                                    <Text style={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}>$0</Text>
                                                </View>
                                            </View>
                                        );
                                    }}
                                />
                                <View style={styles.separator} />
                            </View>
                        );
                    }}
                />
            </View>
            {/* <View style={styles.smallFlex} /> */}
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'black',
        padding: 35,
        borderRadius: 20,
        alignItems: 'center',
    },
    modalCancelButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'grey',
    },
    modalText: {
        color: 'black',
    },
    bigFlex: {
        flex: 3,
    },
    smallFlex: {
        flex: 2,
    },
    headerContainer: {
        paddingBottom: 10,
    },
    darkBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    lightBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    spaceBetweenRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 30,
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