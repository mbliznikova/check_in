import * as React from 'react';
import {Pressable, View, Text, StyleSheet, FlatList, StyleProp, ViewStyle} from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { StudentType } from '@/types/student';
import { UNKNOWN_NAME } from '@/constants/ui';

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

        const textStyle = useThemeTextStyle();

        const renderItem = ({ item }: {item: StudentType}) => (
            <View style={style}>
                <Pressable
                    onPress={() => onStudentPress(item)}>
                    <Text style={[textStyle, styles.studentName]}>{item.firstName ?? UNKNOWN_NAME} {item.lastName ?? UNKNOWN_NAME}</Text>
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
});

export default StudentList;