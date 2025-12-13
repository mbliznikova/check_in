import * as React from 'react';  
import { useState, useEffect } from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator, ScrollView, Dimensions } from 'react-native';

import { useApi } from "@/api/client";
import ClassName from './ClassName';
import ClassSelectionModal from './ClassSelectionModal';
import StudentList from './StudentList';

type StudentType = {
    firstName: string;
    lastName: string;
    id: number;
    classes?: Set<number>;
    occurrences?: Set<number>;
};

type ClassType = {
    id: number;
    name: string;
};

type ClassOccurrenceType = {
    id: number;
    classModel: number | null;
    fallbackClassName: string;
    schedule: string;
    plannedDate: string;
    actualDate: string;
    plannedStartTime: string;
    actualStartTime: string;
    plannedDuration: number;
    actualDuration: number;
    isCancelled: boolean;
    notes: string;
};

const screenWidth = Dimensions.get('window').width;


const School = () => {
    const { apiFetch } = useApi();

    const [classOccurrenceList, setClassOccurrenceList] = useState<ClassOccurrenceType[]>([]);

    const [students, setStudents] = useState<StudentType[]>([]);

    const [attendance, setAttendance] = useState<StudentType[]>([]);

    const [checkedInStudents, setCheckedInStudents] = useState(() => assignStudentsToOccurrences());

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [currentStudent, setCurrentStudent] = useState<StudentType | null>(null);

    const [loading, setLoading] = useState(true);

    const [studentsUpdated, setStudentsUpdated] = useState(false);

    const isValidArrayResponse = (responseData: any, key: string): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    }

    useEffect(() => {
        const fetchClassOccurrences = async () => {
            try {
                const response = await apiFetch("/today_class_occurrences/",
                    { method: "GET" }
                );

                if (response.ok) {
                    const responseData = await response.json();
                    if (
                        isValidArrayResponse(responseData, 'response')
                    ) {
                        console.log('Function fetchClassOccurrences. The response from backend is valid.' + JSON.stringify(responseData))

                        const dataClassOccurrencesList: ClassOccurrenceType[] = responseData.response;
                        const fetchedClassOccurrences = dataClassOccurrencesList.map(cls => ({
                            id: cls.id,
                            classModel: cls.classModel,
                            fallbackClassName: cls.fallbackClassName,
                            schedule: cls.schedule,
                            plannedDate: cls.plannedDate,
                            actualDate: cls.actualDate,
                            plannedStartTime: cls.plannedStartTime,
                            actualStartTime: cls.actualStartTime,
                            plannedDuration: cls.plannedDuration,
                            actualDuration: cls.actualDuration,
                            isCancelled: cls.isCancelled,
                            notes: cls.notes,
                        }));

                        setClassOccurrenceList(fetchedClassOccurrences);
                        console.log("Fetched class occurrences: ", fetchedClassOccurrences);
                    } else {
                        console.warn('Function fetchClassOccurrences. The response from backend is NOT valid! '  + JSON.stringify(responseData));
                    }
                } else {
                    console.log("Function fetchClassOccurrences. Response was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of classes: ", err)
            }
        }

        const fetchStudents = async () => {
            try {
                const response = await apiFetch("/students/",
                    { method: "GET" }
                );

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
                const response = await apiFetch("/attended_sudents/",
                    { method: "GET" }
                );

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
                                occurrences: new Set(att.occurrences),
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

        fetchClassOccurrences();
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
        setCheckedInStudents(assignStudentsToOccurrences());
        setStudentsUpdated(false);

    }, [studentsUpdated]);

    function assignStudentsToOccurrences() {
        // Add students who attends a certain class to the class map: [class_id, [student1, student2]]
        const studentOccuurenceMap = new Map<number, StudentType[]>();

        classOccurrenceList.forEach(cls => {
            studentOccuurenceMap.set(cls.id, [])
        })

        students.forEach(student => {
            Array.from(student.occurrences ?? []).forEach(occId => {
                if (studentOccuurenceMap.has(occId)) {
                    studentOccuurenceMap.get(occId)?.push(student);
                }
            });
        });

        return studentOccuurenceMap;
    }

    function ifOneListsContainsAnother(listOne: number[], listTwo: number[]): boolean {
        if (!Array.isArray(listOne) || !Array.isArray(listTwo)) {
            console.log('False: one or both arguments is not a list');
            return false;
        }

        return listOne.every((value) => listTwo.includes(value));
    }

    const submitCheckInRequest = async(studentId: number, occurrenceIds: number[]) => {
        // One student can check-in to multiple class occurrences
        const today = new Date();
        const todayDate = today.toISOString().slice(0, 10);

        const data = {
            checkInData: {
                studentId: Number(studentId),
                // classesList: classIds.map(Number),
                classOccurrencesList: occurrenceIds.map(Number),
                todayDate: todayDate,
            }
        };

        console.log('data is: ' + JSON.stringify(data));

        try {
            const response = await apiFetch("/check_in/", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            });

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
                ifOneListsContainsAnother(responseData.checkedIn, occurrenceIds) &&
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

    function checkIn(studentId: number, occurrenceIds: number[]) {
        setStudents(prevStudents => {
            const updatesStudents = prevStudents.map(student => {
                if (student.id === studentId) {
                    student.classes = new Set();
                    student.occurrences = new Set();
                    occurrenceIds.forEach(cls => {
                        student.occurrences?.add(cls)
                    })
                }
                return student;
            });

            return updatesStudents;
        });
        setCheckedInStudents(assignStudentsToOccurrences);
        submitCheckInRequest(studentId=studentId, occurrenceIds=occurrenceIds);
    }

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>

            <View style={{flex: 1}}>
                <FlatList
                    data={classOccurrenceList}
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
                                        name={`${cls.fallbackClassName} - ${cls.actualStartTime.slice(0, 5)}`}
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
                allClassOccurrencesList={classOccurrenceList}
                onModalClose={() => setIsModalVisible(false)}
                onConfirm={(selectedClassesIds: number[]) => {
                    checkIn(currentStudent?.id!, selectedClassesIds);
                    setIsModalVisible(false);
                }}
            />

            <View style={{flex: 1.5}}>
                <View style={styles.rowWrapper}>
                    <StudentList
                        studentList={students.filter((student) => (student.occurrences?.size ?? 0) === 0)}
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
