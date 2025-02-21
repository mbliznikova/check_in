import * as React from 'react';  
import { useState } from 'react';
import {View, StyleSheet, Pressable, FlatList, Text} from 'react-native';

import ClassName from './ClassName';
import ClassSelectionModal from './ClassSelectionModal';
import StudentList from './StudentList';

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
                    student.classes = new Set();
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

    return (
        <View style={styles.container}>

            <FlatList
                data={classList}
                keyExtractor={cls => cls.id}
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
                onConfirm={(selectedClassesIds: string[]) => {
                    checkIn(currentStudent?.id!, selectedClassesIds);
                    setIsModalVisible(false);
                }}
            />

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
  });

export default School;