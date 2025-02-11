import * as React from 'react';  
import { useState } from 'react';
import {View, Text, StyleSheet, useColorScheme} from 'react-native';

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
        { firstName: "James", lastName: "Harrington", id: "1", classes: new Set('101')},
        { firstName: "William", lastName: "Kensington", id: "2", classes: new Set('102')},
        { firstName: "Edward", lastName: "Montgomery", id: "3", classes: new Set('103')},
        { firstName: 'Henry', lastName: 'Fairchild', id: '4', classes: new Set<string>() },
        { firstName: 'Arthur', lastName: 'Whitmore', id: '5', classes: new Set<string>() },
        { firstName: 'Charles', lastName: 'Waverly', id: '6', classes: new Set<string>() },
    ]);

    const [checkedInStudents, setCheckedInStudents] = useState<Map<string, StudentType[]>>(
        new Map(classList.map(cls => [cls.id, []]))
    );

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

            <StudentList 
                studentList={students.filter((student) => student.classes.size === 0)}
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