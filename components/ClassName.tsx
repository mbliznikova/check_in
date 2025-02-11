import * as React from 'react';  
import {View, Text, StyleSheet, useColorScheme} from 'react-native';
import StudentList from './StudentList';

type StudentType = {
    firstName: string;
    lastName: string;
    id: string;
    classes?: Set<string>;
};

type ClassNameProps = {
    id: string;
    name: string;
    students?: StudentType[];
};

const ClassName = ({
        id,
        name = "Class name",
        students = []
    }: ClassNameProps) => {
        const colorScheme = useColorScheme();
        console.log('STUDENT LISTS', students)
        return (
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor, styles.leftText]}>
                        Class
                    </Text>
                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor, styles.rightText]}>
                        {name}
                    </Text>
                </View>
                <StudentList studentList={students}></StudentList>
            </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    leftText: {
        fontWeight: '600',
    },
    rightText: {
        fontSize: 20, 
        fontWeight: 'bold',
    },
    darkColor: {
        color: 'black',
      },
    lightColor: {
        color: 'white',
      },
})

export default ClassName;
