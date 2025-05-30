import * as React from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme, Modal} from 'react-native';

import ScreenTitle from './ScreenTitle';

type StudentAttendanceDetailsType = {
    firstName: string;
    lastName: string;
    classesInfo: Map<number, Map<string, [number, number]>>;
}

const StudentReport = ({
    firstName,
    lastName,
    classesInfo
}: StudentAttendanceDetailsType) => {
    const colorScheme = useColorScheme();
    const attendanceList: Map<string, [number, number]>[] = Array.from(classesInfo.values());

    return (
        <View style={styles.container}>
            <ScreenTitle titleText={firstName + ` ` + lastName} />
            <View style={styles.separator} />

            <ScreenTitle titleText='Attendance'></ScreenTitle>

            <FlatList
                data={attendanceList}
                keyExtractor={(item) => Array.from(item.keys())[0]}
                renderItem={({ item }) => {
                    const [classData] = [...item];
                    const [className, attendance]  = classData;

                    return (
                    <View style={styles.reportRow}>
                        <Text style={[styles.className, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                            {className}
                        </Text>
                        <Text style={[styles.record, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                            {attendance[0]} ({attendance[1]})
                        </Text>
                    </View>
                    )
                }}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        alignSelf: 'stretch',
    },
    reportRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    className: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    record: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
    separator: {
        height: 1,
        backgroundColor: 'gray',
        marginVertical: 10,
    },
});

export default StudentReport;