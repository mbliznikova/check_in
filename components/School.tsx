import * as React from 'react';  
import { useState } from 'react';
import {View, Modal, StyleSheet, Pressable, Button, Text} from 'react-native';

import ClassName from '@/components/ClassName';
import StudentList from './StudentList';
import Checkbox from './Checkbox';

type StudentType = {
    firstName: string;
    lastName: string;
    id: string;
    classes?: Set<string>;
};

const School = () => {

    // Add functionality to fetch classes from backend and place them here
    const classList = [
        { id: '101', name: 'Longsword' },
        { id: '102', name: 'Private Lessons' },
        { id: '103', name: 'Self-defence' }
    ];

   const [students, setStudents] = useState([
        // Add functionality to fetch students from backend and place them here
        { firstName: "James", lastName: "Harrington", id: "1", classes: new Set(['101'])},
        { firstName: "William", lastName: "Kensington", id: "2", classes: new Set(['102'])},
        { firstName: "Edward", lastName: "Montgomery", id: "3", classes: new Set(['103'])},
        { firstName: 'Henry', lastName: 'Fairchild', id: '4', classes: new Set<string>() },
        { firstName: 'Arthur', lastName: 'Whitmore', id: '5', classes: new Set<string>() },
        { firstName: 'Charles', lastName: 'Waverly', id: '6', classes: new Set<string>() },
    ]);

    const [checkedInStudents, setCheckedInStudents] = useState(assignStudentsToClasses);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [selectedClasses, setSelectedClasses] = useState(() => { // For list of classes in Modal
        return new Map(classList.map(cls => [cls.id, false]));
    });

    const [currentStudent, setCurrentStudent] = useState<StudentType | null>(null);

    function assignStudentsToClasses() {
        const studentClassMap = new Map<string, StudentType[]>();

        classList.forEach(cls => {
            studentClassMap.set(cls.id, []);
        })

        students.forEach(student => {
            Array.from(student.classes).forEach(clsId => {
                if (studentClassMap.has(clsId)) {
                    studentClassMap.get(clsId)?.push(student);
                }
            });
        });

        return studentClassMap;
    }

    function checkIn(studentId: string, classIds: string[]) {
        setStudents(prevStudents => {
            const updatesStudents = prevStudents.map(student => {
                if (student.id === studentId) {
                    classIds.forEach(cls => {
                        student.classes.add(cls)
                    })
                }
                return student;
            });

            return updatesStudents;
        });
        setCheckedInStudents(assignStudentsToClasses);
    }

    function getSelectedClassesIds() {
        const classesIds: string[] = [];
        const selectedClassesIds = selectedClasses.forEach((value, key) => {
            if (value === true) {
                classesIds.push(key);
            }
        })
        return classesIds;
    }

    function unselectAllClasses() {
        setSelectedClasses(new Map(classList.map(cls => [cls.id, false])));
    }

    function toggleClass(classId: string) {
        setSelectedClasses(prevSelectedClasses => {
            return new Map(prevSelectedClasses).set(classId, !prevSelectedClasses.get(classId));
        })
    }


    return (
        <View style={styles.container}>
            {classList.map((cls) => (
                <ClassName
                    key={cls.id}
                    id={cls.id}
                    name={cls.name}
                    students={checkedInStudents.get(cls.id) || []}
                />
            )
            )}
            <View style={styles.separator} />

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType='fade'
                onRequestClose={() => {
                    setIsModalVisible(false);
                    checkIn(currentStudent?.id!, getSelectedClassesIds());
                    unselectAllClasses();}
                    }>
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Check in {currentStudent?.firstName} {currentStudent?.lastName}</Text>
                        <View style={styles.modalList}>
                            {classList.map((cls) => (
                                <Checkbox
                                    key={cls.id}
                                    label={cls.name}
                                    checked={selectedClasses.get(cls.id)!}
                                    onChange={() => {toggleClass(cls.id)}}>
                                </Checkbox>
                            ))}
                        </View>
                        <Pressable style={styles.modalButton} onPress={() => {
                            setIsModalVisible(false);
                            checkIn(currentStudent?.id!, getSelectedClassesIds());
                            unselectAllClasses();
                            }}>
                            <Text>Confirm</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={() => {
                            setIsModalVisible(false);
                            unselectAllClasses();
                            }}>
                            <Text>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <StudentList 
                studentList={students.filter((student) => student.classes.size === 0)}
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
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        padding: 35,
        borderRadius: 20,
        alignItems: 'center',
      },
      modalTitle: {
        fontSize: 20, 
        fontWeight: 'bold',
        padding: 10
      },
      modalList: {
        paddingVertical: 15,
      },
      modalListItem: {
        paddingVertical: 10,
      },
      modalButton: {
        // width: '100%',
        // flex: 1,
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 8,
        backgroundColor: 'blue',
      },
  });

export default School;