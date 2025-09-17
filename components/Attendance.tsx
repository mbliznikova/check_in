import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, SafeAreaView, StyleSheet, useColorScheme, Text, FlatList, Pressable, Modal, TextInput} from 'react-native';

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
    balance: number;
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

type PaymentType = {
    id: number;
    studentId: number;
    classId: number;
    studentName: string;
    className: string;
    amount: number;
    paymentDate: string;
};

const Attendance = () => {
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

    const [payments, setPayments] = useState<PaymentType[]>([]);

    const [balance, setBalance] = useState<Map<number, Map<number, number>>>(new Map());

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

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    };

    const fetchAttendances = async () => {
        try {
            const params = new URLSearchParams();
            params.append('month', selectedMonth.toString());
            params.append('year', selectedYear.toString());
            const response = await fetch(`http://127.0.0.1:8000/backend/attendances/?${params}`);
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

    useEffect(() => {
        const fetchPayments = async () => {
            // Assume for now that the query returns the payment data only for the current month
           try {
               const response = await fetch('http://127.0.0.1:8000/backend/payments/');
               if (response.ok) {
                   const responseData = await response.json();
                   if (isValidArrayResponse(responseData, "response")) {
                       console.log("Function fetchPayments at Attendance.tsx. The response from backend is valid." + JSON.stringify(responseData))

                       const paymentList: PaymentType[] = responseData.response;

                       setPayments(paymentList);
                   }
               } else {
                   console.log("Function fetchPayments at Attendance.tsx. Request was unsuccessful: ", response.status, response.statusText)
               }
           } catch (err) {
               console.error("Error while fetching the list of payments: ", err);
           }
       }

        fetchAttendances();
        fetchPayments();
    },
    []);

    useEffect(() => {
        getBalance();
    }, [payments]);

    useEffect(() => {
        const ready = attendances.length > 0 && balance.size > 0;
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
        <View style={[styles.headerContainer, colorScheme === 'dark'? styles.darkBackground : styles.lightBackground]}>
            <ScreenTitle titleText={`Attendance report (${monthName} ${todayYear})`}/>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                {renderSelector()}
            </View>
            <View style={styles.headerRow}>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Student</Text>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Attendance (24 hrs policy if applicable)</Text>
            </View>
        </View>
    );

    const renderSelector = () => {
        return (
            <View style={styles.selector}>
                <View style={{paddingRight: 20}}>
                    <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.selectorText]}>Select month and year to display:</Text>
                </View>
                <TextInput
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                    value={monthInput}
                    onChangeText={(newMonth) => {readMonth(newMonth)}}
                />
                <View style={{width: 10}}></View>
                <TextInput
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                    value={yearInput}
                    onChangeText={(newYear) => {readYear(newYear)}}
                />
                <View style={{width: 10}}></View>
                <Pressable
                    onPress = {() => {
                        submitMonthYearSelection();
                    }}
                    style={[styles.paymentButton, styles.selectorButtonColor]}
                >
                    <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Show</Text>
                </Pressable>
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
                                        const studentBalance = studentInfo.balance;

                                        return (
                                            <View style={styles.spaceBetweenRow}>
                                                <View style={styles.studentNameColumn}>
                                                    <Pressable
                                                        onPress={() => {
                                                            const currentStudent = setCurrentStudent(studentId, studentInfo.firstName, studentInfo.lastName);
                                                            setStudent(currentStudent);
                                                            setIsModalVisible(true);
                                                        }}
                                                    >
                                                        <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor, styles.studentName]}>{studentName}</Text>
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
                                                <View>
                                                    <Text style={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}>{studentAttendance[0]} ({studentAttendance[1]})</Text>
                                                </View>
                                            </View>
                                        );
                                    }}
                                />
                                <View style = {{alignItems: 'flex-end'}}>
                                    <View style={[styles.container]}>
                                        <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor, {fontSize: 20, fontWeight: 'bold'}]}>
                                        {`Students attended: ${classInfo.students.size}`}
                                        </Text>
                                    </View>
                                </View>
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
        width: '50%',
        height: '40%',
        backgroundColor: 'black',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
    selector: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectorText: {
        paddingHorizontal: 10,
        fontWeight: 'bold',
    },
    selectorButtonColor: {
        borderColor: 'grey',
    },
    inputFeld: {
        height: 30,
        width: 100,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 15,
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
