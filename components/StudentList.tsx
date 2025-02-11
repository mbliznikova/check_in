import * as React from 'react';  
import {View, Text, StyleSheet, FlatList} from 'react-native';
import Student from './Student';


type StudentType = {
    firstName: string;
    lastName: string;
    id: string;
    classes?: Set<string>;
};

type StudentListProps = {
    studentList?: StudentType[];
};

const StudentList = ({
        studentList = defaultStudentList}
    : StudentListProps) => {
        const renderItem = ({ item }: {item: StudentType}) => (
            <View style={styles.itemContainer}>
                <Student firstName={item.firstName} lastName={item.lastName} id={item.id}></Student>
            </View>
        )
        return (
            <View style={styles.container}>
                <FlatList
                data={studentList}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        )
}

const defaultStudentList: StudentType[] = [
        { firstName: 'James', lastName: 'Harrington', id: '1'},
        { firstName: 'William', lastName: 'Kensington', id: '2'},
        { firstName: 'Edward', lastName: 'Montgomery', id: '3'},
        // { firstName: 'Henry', lastName: 'Fairchild', id: '4' },
        // { firstName: 'Arthur', lastName: 'Whitmore', id: '5' },
        // { firstName: 'Charles', lastName: 'Waverly', id: '6' },
        // { firstName: 'Richard', lastName: 'Ainsworth', id: '7' },
        // { firstName: 'Frederick', lastName: 'Huntington', id: '8' },
        // { firstName: 'Thomas', lastName: 'Pennington', id: '9' },
        // { firstName: 'George', lastName: 'Wyndham', id: '10' },
        // { firstName: 'Oliver', lastName: 'Redwood', id: '11' },
        // { firstName: 'Robert', lastName: 'Ashford', id: '12' },
        // { firstName: 'Philip', lastName: 'Stratford', id: '13' },
        // { firstName: 'Nathaniel', lastName: 'Sinclair', id: '14' },
        // { firstName: 'Theodore', lastName: 'Langley', id: '15' },
        // { firstName: 'Sebastian', lastName: 'Hawthorne', id: '16' }
      ]

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemContainer: {
        // paddingVertical: 5,
    },
});

export default StudentList;