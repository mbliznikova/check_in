import * as React from 'react';  
import { useState } from 'react';
import {View, Modal, StyleSheet, Pressable, Button, Text} from 'react-native';

import ClassName from '@/components/ClassName';
import Student from './Student';
import StudentList from './StudentList';

type StudentType = {
    firstName: string;
    lastName: string;
    id: string;
    classes?: Set<string>;
};

const School = () => {

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

    function checkIn(studentId: string, classId: string) {
        setStudents(prevStudents => {
            const updatesStudents = prevStudents.map(student => {
                if (student.id === studentId) {
                    student.classes.add(classId)
                }
                return student;
            });

            return updatesStudents;
        });
        setIsModalVisible(true);
        
        setCheckedInStudents(assignStudentsToClasses);
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
                onRequestClose={() =>  setIsModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Check in student</Text>
                        <View style={styles.modalList}>
                            {classList.map((cls) => (
                                <Text key={cls.id} style={styles.modalList}>{cls.name}</Text>
                            ))}
                        </View>
                        <Pressable style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
                            <Text>Confirm</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
                            <Text>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <StudentList 
                studentList={students.filter((student) => student.classes.size === 0)}
                onStudentPress={(studentId) => checkIn(studentId, '101')}
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