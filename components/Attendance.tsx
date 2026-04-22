import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, SafeAreaView, StyleSheet, useColorScheme, Text, FlatList, Pressable, Modal, TextInput, ActivityIndicator, ScrollView, useWindowDimensions} from 'react-native';

import { useApi } from "@/api/client";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';
import { isValidArrayResponse } from '@/api/validators';
import ClassName from './ClassName';
import ScreenTitle from './ScreenTitle';
import StudentReport from './StudentReport';
import { AttendanceType, StudentAttendanceDetailsType } from '@/types/attendance';
import { PaymentType } from '@/types/payment';

type StudentAttendanceCountType = {
    firstName: string;
    lastName: string;
    count: [number, number];
    balance: number;
}

type ClassAttendanceCountType = {
    name: string;
    students: Map<number, StudentAttendanceCountType>;
}

const Attendance = () => {
    const { apiFetch } = useApi();

    const colorScheme = useColorScheme();
    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();
    const { height: screenHeight } = useWindowDimensions();

    const [attendances, setAttendances] = useState<AttendanceType[]>([]);

    const [report, setReport] = useState<Map<number, ClassAttendanceCountType>>(new Map());

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [student, setStudent] = useState<StudentAttendanceDetailsType>({
        firstName: "",
        lastName: "",
        classesInfo:
            new Map<number, Map<string, [number, number]>>(),
    });

    const [payments, setPayments] = useState<PaymentType[]>([]);

    const [balance, setBalance] = useState<Map<number, Map<number, number>>>(new Map());

    const [loading, setLoading] = useState(true);

    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const monthNumber = today.getMonth() + 1;
    const todayYear = today.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(monthNumber);

    const [selectedYear, setSelectedYear] = useState(todayYear);

    const [monthInput, setMonthInput] = useState(selectedMonth.toString());

    const [yearInput, setYearInput] = useState(selectedYear.toString());

    const readMonth = (monthString: string) => {
        const monthConverted = Number(monthString);
        if (!Number.isNaN(monthConverted) && 1 <= monthConverted && monthConverted <= 12) {
            setSelectedMonth(monthConverted);
        } else {
            console.warn('The month number from ' + monthString + ' is incorrect: ' + monthConverted);
        }
        setMonthInput(monthString);
    };

    const readYear = (yearString: string) => {
        const yearConverted = Number(yearString);
        // TODO: think about year range?
        if (!Number.isNaN(yearConverted)) {
            setSelectedYear(yearConverted);
        } else {
            console.warn('The year number from ' + yearString + ' is incorrect: ' + yearConverted);
        }
        setYearInput(yearString);
    };

    const fetchAttendances = async () => {
        try {
            const params = new URLSearchParams();
            params.append('month', selectedMonth.toString());
            params.append('year', selectedYear.toString());

            const response = await apiFetch(`/attendances/?${params}`,
                { method: "GET" }
            );

            if (response.ok) {
                const responseData = await response.json();
                if (isValidArrayResponse(responseData, 'response')) {
                    console.log('AttendancePaymentsReport. Function fetchAttendances. The response from backend is valid.')

                    const dataAttendanceList: AttendanceType[] = responseData.response;
                    const fetchedAttendances = dataAttendanceList.map(att => ({
                        date: att.date,
                        occurrences: att.occurrences
                    }));

                    setAttendances(fetchedAttendances);
                }
            } else {
                console.log("Function fetchAttendances. Response was unsuccessful: ", response.status, response.statusText)
            }
        } catch (err) {
            console.error("Error while fetching the list of attendances: ", err)
        }
    }

    useEffect(() => {
        const fetchPayments = async () => {
            // Assume for now that the query returns the payment data only for the current month
           try {
            const response = await apiFetch("/payments/",
                { method: "GET" }
                );

                if (response.ok) {
                    const responseData = await response.json();
                    if (isValidArrayResponse(responseData, "response")) {
                        console.log("Function fetchPayments at Attendance.tsx. The response from backend is valid.")

                        const paymentList: PaymentType[] = responseData.response;

                        setPayments(paymentList);
                    }
                } else {
                console.log("Function fetchPayments at Attendance.tsx. Request was unsuccessful: ", response.status, response.statusText)
                }
           } catch (err) {
               console.error('Error while fetching the list of payments: ', err);
           }
       }

        fetchAttendances();
        fetchPayments();
        setLoading(false);
    },
    []);

    useEffect(() => {
        getBalance();
    }, [payments]);

    useEffect(() => {
        const ready = attendances.length;
        if (ready) {
            countAttendences(attendances);
        } else {
            setReport(new Map());
            setStudent({
                firstName: "",
                lastName: "",
                classesInfo:new Map()
            });
        }
    },
    [attendances, balance]);

    const getBalance = () => {
        const balanceResult: Map<number, Map<number, number>> = new Map();

        payments.forEach(payment => {
            const studentId = payment.studentId;
            const classId = payment.classId;
            const amount = payment.amount;

            if (balanceResult.has(studentId)) {
                const balanceDetails = balanceResult.get(studentId);
                if (balanceDetails?.has(classId)) {
                    const classBalance = balanceDetails.get(classId) ?? 0.0;
                    balanceDetails.set(classId, classBalance + amount);
                } else {
                    balanceDetails?.set(classId, amount)
                }
                balanceResult.set(studentId, balanceDetails ?? new Map());
            } else {
                const balanceDetails = new Map();
                balanceDetails.set(classId, amount);
                balanceResult.set(studentId, balanceDetails);
            }
        })

        setBalance(balanceResult);
    };

    const countAttendences = (attendanceList: AttendanceType[]) => {
        const reportMap: Map<number, ClassAttendanceCountType> = new Map();
        attendanceList.forEach(att => {
            const occurrences = att.occurrences;

            // have _ instead of unused occurrenceId
            Object.entries(occurrences).forEach(([_, occurrenceInfo]) => {
                const classIdNum = Number(occurrenceInfo.classId)

                if (!reportMap.has(classIdNum)) {
                    reportMap.set(classIdNum, {
                        name: occurrenceInfo.name,
                        students: new Map<number, StudentAttendanceCountType>(),
                    });
                }

                const reportClassId = reportMap.get(classIdNum);

                Object.entries(occurrenceInfo.students).forEach(([studentId, studentInfo]) => {
                    const studentIdNum = Number(studentId);

                    if (!reportClassId?.students.has(studentIdNum)) {
                        const studentClassesBalance = balance.get(studentIdNum);
                        const classBalance = studentClassesBalance?.get(classIdNum);

                        reportClassId?.students.set(studentIdNum, {
                            firstName: studentInfo.firstName,
                            lastName: studentInfo.lastName,
                            count: [0, 0],
                            balance: classBalance ?? 0.0,
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

    const submitMonthYearSelection = async() => {
        console.log('Function submitMonthYearSelection: requesting Attendance data for ' + selectedMonth + ' of ' + selectedYear);
        fetchAttendances();
    };

    const renderHeader = () => (
        <View style={[
            styles.headerContainer,
            colorScheme === 'dark' ? styles.darkBackground : styles.lightBackground,
        ]}>
            <ScreenTitle titleText={`Attendance report (${monthName} ${todayYear})`}/>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                {renderSelector()}
            </View>
            <View style={styles.headerRow}>
                <Text style={[styles.columnHeadersText, textStyle, { flex: 1 }]}>Student</Text>
                <Text style={[styles.columnHeadersText, textStyle, { flex: 1, textAlign: 'right' }]}>Attendance (24 hrs policy if applicable)</Text>
            </View>
        </View>
    );

    const renderSelector = () => {
        return (
            <View style={styles.selector}>
                <Text style={[textStyle, styles.selectorText]}>Select month and year to display:</Text>
                <View style={styles.selectorInputRow}>
                    <TextInput
                        style={[textStyle, commonStyles.inputField, { width: 100 }]}
                        value={monthInput}
                        onChangeText={(newMonth) => {readMonth(newMonth)}}
                    />
                    <View style={{width: 10}}></View>
                    <TextInput
                        style={[textStyle, commonStyles.inputField, { width: 100 }]}
                        value={yearInput}
                        onChangeText={(newYear) => {readYear(newYear)}}
                    />
                    <View style={{width: 10}}></View>
                    <Pressable
                        onPress={() => { submitMonthYearSelection(); }}
                        style={[styles.paymentButton, styles.selectorButtonColor]}
                    >
                        <Text style={textStyle}>Show</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    // TODO: refactor teh components: extract functions to separate places. DRY.
    return (
         <SafeAreaView style={styles.container}>

            <View style={[styles.container]}>
                <FlatList
                    ListHeaderComponent={renderHeader}
                    stickyHeaderIndices={[0]}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    data={Array.from(report.entries())}
                    keyExtractor={([classId]) => classId.toString()}
                    ListEmptyComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
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
                                            <View style={commonStyles.spaceBetweenRow}>
                                                <View style={styles.studentNameColumn}>
                                                    <Pressable
                                                        onPress={() => {
                                                            const { firstName, lastName } = studentInfo;
                                                            setStudent(setCurrentStudent(studentId, firstName, lastName));
                                                            setIsModalVisible(true);
                                                        }}
                                                    >
                                                        <Text style={[textStyle, styles.studentName]}>{studentName}</Text>
                                                    </Pressable>
                                                    <Modal
                                                        visible={isModalVisible}
                                                        transparent={true}
                                                        // animationType='fade'
                                                        onRequestClose={() => {
                                                            setIsModalVisible(false)
                                                        }}
                                                    >
                                                        <View style={modalStyles.modalContainer}>
                                                            <View style={modalStyles.modalView}>
                                                                <ScrollView style={{ maxHeight: screenHeight * 0.55, alignSelf: 'stretch' }}>
                                                                    <StudentReport
                                                                        firstName={student.firstName}
                                                                        lastName={student.lastName}
                                                                        classesInfo={student.classesInfo}
                                                                    />
                                                                </ScrollView>
                                                                <Pressable
                                                                    style={modalStyles.modalCancelButton}
                                                                    onPress={() => setIsModalVisible(false)}
                                                                >
                                                                    <Text style={styles.modalText}>Cancel</Text>
                                                                </Pressable>
                                                            </View>
                                                        </View>
                                                    </Modal>
                                                </View>
                                                <View>
                                                    <Text style={textStyle}>{studentAttendance[0]} ({studentAttendance[1]})</Text>
                                                </View>
                                            </View>
                                        );
                                    }}
                                />
                                <View style = {{alignItems: 'flex-end'}}>
                                    <View style={[styles.container]}>
                                        <Text style={[textStyle, {fontSize: 20, fontWeight: 'bold'}]}>
                                        {`Students attended: ${classInfo.students.size}`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={commonStyles.separator} />
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
        fontSize: 14,
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
        textDecorationLine: 'underline',
    },
    studentNameColumn: {
        // flex: 1,
        minWidth: 100,
        textDecorationLine: 'underline',
    },
    balanceColumn: {
        flex: 1,
        alignItems: 'flex-end',
    },
    selector: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    selectorInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    selectorText: {
        paddingHorizontal: 10,
        fontWeight: 'bold',
    },
    selectorButtonColor: {
        borderColor: 'grey',
    },
    paymentButton: {
        paddingVertical: 7,
        paddingHorizontal: 5,
        marginVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
})

export default Attendance;
