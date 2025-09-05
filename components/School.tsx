import * as React from 'react';  
import { useState, useEffect } from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator, ScrollView, Dimensions } from 'react-native';

import ClassName from './ClassName';
import ClassSelectionModal from './ClassSelectionModal';
import StudentList from './StudentList';

type StudentType = {
    firstName: string;
    lastName: string;
    id: number;
    classes?: Set<number>;
};

type ClassType = {
    id: number;
    name: string;
};

const screenWidth = Dimensions.get('window').width;


const School = () => {
    const [classList, setClassList] = useState<ClassType[]>([]);

    const [students, setStudents] = useState<StudentType[]>([]);

    const [attendance, setAttendance] = useState<StudentType[]>([]);

    const [checkedInStudents, setCheckedInStudents] = useState(() => assignStudentsToClasses());

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [currentStudent, setCurrentStudent] = useState<StudentType | null>(null);

    const [loading, setLoading] = useState(true);

    const [studentsUpdated, setStudentsUpdated] = useState(false);

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
                const response = await fetch('http://127.0.0.1:8000/backend/today_classes_list/');
                if (response.ok) {
                    const responseData = await response.json();
                    if (
                        isValidArrayResponse(responseData, 'response')
                    ) {
                        console.log('Function fetchClasses. The response from backend is valid.' + JSON.stringify(responseData))

                        const dataClassesList: ClassType[] = responseData.response;
                        const fetchedClasses = dataClassesList.map(cls => ({
                            id: cls.id,
                            name: cls.name
                        }));

                        setClassList(fetchedClasses);
                        console.log("Fetched classes: ", fetchedClasses);
                    } else {
                        console.warn('Function fetchClasses. The response from backend is NOT valid! '  + JSON.stringify(responseData));
                    }
                } else {
                    console.log("Function fetchClasses. Response was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of classes: ", err)
            }
        }

        const fetchStudents = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/students/');
                if (response.ok) {
                    const responseData = await response.json();
                    if (
                        isValidArrayResponse(responseData, 'response')
                    ) {
                        console.log('Function fetchStudents. The response from backend is valid.' + JSON.stringify(responseData))

                        const dataStudentsList: StudentType[] = responseData.response;
                        const fetchedStudents = dataStudentsList.map(std => ({
                            id: Number(std.id),
                            firstName: std.firstName,
                            lastName: std.lastName,
                            classes: new Set<number>(),
                        }));

                        setStudents(fetchedStudents);
                        console.log("Fetched students: ", fetchedStudents);

                    } else {
                        console.warn('Function fetchStudents. The response from backend is NOT valid! '  + JSON.stringify(responseData));
                    }
                } else {
                    console.log("Function fetchStudents. Request was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of students: ", err)
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

                        const attendanceList: StudentType[] = responseData.confirmedAttendance;

                        if (attendanceList.length > 0) {
                            const fetchedAttendances = attendanceList.map(att => ({
                                id:  Number(att.id),
                                firstName: att.firstName,
                                lastName: att.lastName,
                                classes: new Set(att.classes),
                            }));

                            setAttendance(fetchedAttendances);
                            console.log("Fetched attendance: ", fetchedAttendances);

                        } else {
                            console.warn("No attendance for today or responseData.confirmedAttendance is not a type of Array");
                        }
                    } else {
                        console.warn('Function fetchAttendedStudents. The response from backend is NOT valid! '  + JSON.stringify(responseData));
                    }

                } else {
                    console.log("Function fetchAttendedStudents. Request was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of attended students: ", err);
            }
        }

        fetchClasses();
        fetchStudents();
        fetchAttendedStudents();
        setLoading(false);
    }, []);

    useEffect(() => {
        if (attendance.length === 0) return;

        const attendanceMap = new Map(attendance.map(att => [att.id, att]));

        setStudents(prevStudents => {
            const updatedStudents = prevStudents.map(student =>
                attendanceMap.has(student.id) ? attendanceMap.get(student.id)! : student
            );
            setStudentsUpdated(true);
            return updatedStudents;
        });

    }, [attendance]);

    useEffect(() => {
        if (!studentsUpdated) return;
        setCheckedInStudents(assignStudentsToClasses());
        setStudentsUpdated(false);

    }, [studentsUpdated]);


    function assignStudentsToClasses() {
        // Add students who attends a certain class to the class map: [class_id, [student1, student2]]
        const studentClassMap = new Map<number, StudentType[]>();

        classList.forEach(cls => {
            studentClassMap.set(cls.id, []);
        })

        students.forEach(student => {
            Array.from(student.classes ?? []).forEach(clsId => {
                if (studentClassMap.has(clsId)) {
                    studentClassMap.get(clsId)?.push(student);
                }
            });
        });

        return studentClassMap;
    }

    function ifOneListsContainsAnother(listOne: number[], listTwo: number[]): Boolean {
        if (!Array.isArray(listOne) || !Array.isArray(listTwo)) {
            console.log('False: one or both arguments is not a list');
            return false;
        }

        return listOne.every((value) => listTwo.includes(value));
    }

    const submitCheckInRequest = async(studentId: number, classIds: number[]) => {
        // One student can check-in to multiple classes
        const today = new Date();
        const todayDate = today.toISOString().slice(0, 10);

        const data = {
            checkInData: {
                studentId: Number(studentId),
                classesList: classIds.map(Number),
                todayDate: todayDate,
            }
        };

        console.log('data is: ' + JSON.stringify(data));

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/backend/check_in/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorMessage = `Function submitCheckInRequest. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            }

            console.log('Check-in was sent successfully!');

            const responseData = await response.json();
            if (
                typeof responseData === 'object' &&
                responseData !== null &&
                'message' in responseData &&
                'studentId' in responseData && responseData.studentId === Number(studentId) &&
                'attendanceDate' in responseData && responseData.attendanceDate === todayDate &&
                'checkedIn' in responseData &&
                'checkedOut' in responseData &&
                Array.isArray(responseData.checkedIn) &&
                ifOneListsContainsAnother(responseData.checkedIn, classIds) &&
                Array.isArray(responseData.checkedOut)
            ) {
                console.log('Function submitCheckInRequest. The response from backend is valid. ' + JSON.stringify(responseData));
            } else {
                console.warn('Function submitCheckInRequest. The response from backend is NOT valid! '  + JSON.stringify(responseData));
            }

        } catch (err) {
            console.error("Error while sending the data to the server at student check-in: ", err);
        }
    }

    function checkIn(studentId: number, classIds: number[]) {
        setStudents(prevStudents => {
            const updatesStudents = prevStudents.map(student => {
                if (student.id === studentId) {
                    student.classes = new Set();
                    classIds.forEach(cls => {
                        student.classes?.add(cls)
                    })
                }
                return student;
            });

            return updatesStudents;
        });
        setCheckedInStudents(assignStudentsToClasses);
        submitCheckInRequest(studentId=studentId, classIds=classIds);
    }

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>

            <View style={{flex: 1}}>
                <FlatList
                    data={classList}
                    keyExtractor={cls => cls.id.toString()}
                    renderItem={({ item: cls }) => (
                        <View>
                            <StudentList
                                studentList={checkedInStudents.get(cls.id) || []}
                                onStudentPress={(student => {
                                    setCurrentStudent(student);
                                    setIsModalVisible(true);
                                })}
                                header={
                                    <ClassName
                                        id={cls.id}
                                        name={cls.name}
                                    />
                                }
                                style={styles.students}
                            />
                        </View>
                    )}
                />
            </View>

            <View style={styles.separator} />

            <ClassSelectionModal
                isVisible={isModalVisible}
                student={currentStudent}
                allClassesList={classList}
                onModalClose={() => setIsModalVisible(false)}
                onConfirm={(selectedClassesIds: number[]) => {
                    checkIn(currentStudent?.id!, selectedClassesIds);
                    setIsModalVisible(false);
                }}
            />

            <View style={{flex: 1.5}}>
                <View style={styles.rowWrapper}>
                    <StudentList
                        studentList={students.filter((student) => (student.classes?.size ?? 0) === 0)}
                        onStudentPress={(student) => {
                            setCurrentStudent(student);
                            setIsModalVisible(true);
                        }}
                        style={styles.students}
                    />
                </View>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    separator: {
        height: 1,
        backgroundColor: 'gray',
        marginVertical: 10,
    },
    students: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    rowWrapper: {
        width: screenWidth * 0.5,
        alignSelf: 'center',
    },
  });

export default School;
