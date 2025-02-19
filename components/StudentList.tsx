import * as React from 'react';  
import {Pressable, View, Text, StyleSheet, FlatList, Alert, Button} from 'react-native';
import Student from './Student';


type StudentType = {
    firstName: string;
    lastName: string;
    id: string;
    classes?: Set<string>;
};

type StudentListProps = {
    studentList?: StudentType[];
    onStudentPress?: (studentObj: StudentType) => void;
};

const StudentList = ({
        studentList = defaultStudentList,
        onStudentPress = () => {}
    }: StudentListProps) => {

        const renderItem = ({ item }: {item: StudentType}) => (
            <View style={styles.inLine}>
                <Student firstName={item.firstName} lastName={item.lastName} id={item.id}/>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        // item.classes?.size === 0 ? styles.primaryButtonUnpressed : styles.secondaryButtonUnpressed
                        item.classes?.size === 0
                        ? (pressed ? styles.primaryButtonPressed : styles.primaryButtonUnpressed)
                        : (pressed? styles.secondaryButtonPressed : styles.secondaryButtonUnpressed)
                    ]}
                    onPress={() => onStudentPress(item)}>
                    <Text style={item.classes?.size === 0 ? styles.primaryButtonText : styles.secondaryButtonText}>
                        {item.classes?.size !== 0 ? '+ Add class' : 'Check in'}
                    </Text>
                </Pressable>
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
        { firstName: 'Henry', lastName: 'Fairchild', id: '4' },
        { firstName: 'Arthur', lastName: 'Whitmore', id: '5' },
        { firstName: 'Charles', lastName: 'Waverly', id: '6' },
        { firstName: 'Richard', lastName: 'Ainsworth', id: '7' },
        { firstName: 'Frederick', lastName: 'Huntington', id: '8' },
        { firstName: 'Thomas', lastName: 'Pennington', id: '9' },
        { firstName: 'George', lastName: 'Wyndham', id: '10' },
        { firstName: 'Oliver', lastName: 'Redwood', id: '11' },
        { firstName: 'Robert', lastName: 'Ashford', id: '12' },
        { firstName: 'Philip', lastName: 'Stratford', id: '13' },
        { firstName: 'Nathaniel', lastName: 'Sinclair', id: '14' },
        { firstName: 'Theodore', lastName: 'Langley', id: '15' },
        { firstName: 'Sebastian', lastName: 'Hawthorne', id: '16' }
      ]

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemContainer: {
        // paddingVertical: 5,
    },
    inLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    primaryButtonText: {
        color: 'white',
    },
    secondaryButtonText: {
        color: 'blue',
    },
    primaryButtonUnpressed: {
        backgroundColor: 'blue',
        borderRadius: 8,
    },
    secondaryButtonUnpressed: {
        backgroundColor: 'transparent',
    },
    primaryButtonPressed: {
        // backgroundColor: '#004080',
        backgroundColor: '#c2c0c0',
        borderRadius: 8,
    },
    secondaryButtonPressed: {
        backgroundColor: '#c2c0c0',
        borderRadius: 8,
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        elevation: 3,
      },
});

export default StudentList;