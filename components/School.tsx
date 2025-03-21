import * as React from 'react';  
import { useState, useEffect } from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

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


const School = () => {
    const [classList, setClassList] = useState<ClassType[]>([]);

    const [students, setStudents] = useState<StudentType[]>([]);

    const [checkedInStudents, setCheckedInStudents] = useState(assignStudentsToClasses);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [currentStudent, setCurrentStudent] = useState<StudentType | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/classes/');
                if (response.ok) {
                    const data = await response.json();
                    const dataClassesList: ClassType[] = data.response;
                    const fetchedClasses = dataClassesList.map(cls => ({
                        id: cls.id,
                        name: cls.name
                    }));
                    setClassList(fetchedClasses);
                } else {
                    console.log("Response was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of classes: ", err)
            }
        }

        const fetchStudents = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/students/');
                if (response.ok) {
                    const data = await response.json();
                    const dataStudentsList: StudentType[] = data.response;
                    const fetchedStudents = dataStudentsList.map(std => ({
                        id: Number(std.id),
                        firstName: std.firstName,
                        lastName: std.lastName,
                        classes: new Set<number>(),
                    }));
                    setStudents(fetchedStudents);
                } else {
                    console.log("Request was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of students: ", err)
            }
        }

        fetchClasses();
        fetchStudents();
        setLoading(false);
    },
        []);


    function assignStudentsToClasses() {
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
                const errorMessage = `Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            }

            console.log('Check-in was sent successfully!');

            // Add the response parsing and check if it's expected
            const responseData = await response.json();
            console.log('Response data: ' + responseData);

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

            <FlatList
                data={classList}
                keyExtractor={cls => cls.id.toString()}
                renderItem={({ item: cls }) => (
                    <View>
                        <ClassName
                            id={cls.id}
                            name={cls.name}
                        />
                        <StudentList
                            studentList={checkedInStudents.get(cls.id) || []}
                            onStudentPress={(student => {
                                setCurrentStudent(student);
                                setIsModalVisible(true);
                        })}
                        />
                    </View>
                )}
            />

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

            <StudentList 
                studentList={students.filter((student) => (student.classes?.size ?? 0) === 0)}
                onStudentPress={(student) => {
                    setCurrentStudent(student);
                    setIsModalVisible(true);
                }}
            />
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
  });

export default School;