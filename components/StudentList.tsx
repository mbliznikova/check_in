import * as React from 'react';  
import {Pressable, View, Text, StyleSheet, FlatList, useColorScheme, StyleProp, ViewStyle} from 'react-native';


type StudentType = {
    firstName: string;
    lastName: string;
    id: number;
    classes?: Set<number>;
};

type StudentListProps = {
    studentList?: StudentType[];
    onStudentPress?: (studentObj: StudentType) => void;
    header?: React.ReactElement;
    style: StyleProp<ViewStyle>;
};

const StudentList = ({
        studentList = [],
        onStudentPress = () => {},
        header = <Text></Text>,
        style,
    }: StudentListProps) => {

        const colorScheme = useColorScheme();

        const renderItem = ({ item }: {item: StudentType}) => (
            <View style={style}>
                <Pressable
                    onPress={() => onStudentPress(item)}>
                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor, styles.studentName]}>{item.firstName} {item.lastName}</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed ? styles.primaryButtonPressed : styles.primaryButtonUnpressed
                    ]}
                    onPress={() => onStudentPress(item)}>
                    <Text style={styles.primaryButtonText}>
                        {item.classes?.size !== 0 ? '+ Add class' : 'Check in'}
                    </Text>
                </Pressable>
            </View>
        )
        return (
            <View style={styles.container}>
                <FlatList
                    ListHeaderComponent={header}
                    stickyHeaderIndices={[0]}
                    data={studentList}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    studentName: {
        flex: 1,
        minWidth: 100,
        textDecorationLine: 'underline',
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
});

export default StudentList;