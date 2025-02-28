import * as React from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme} from 'react-native';

import ScreenTitle from './ScreenTitle';

type StudentReportType = {
    firstName: string;
    lastName: string;
    id: string;
    attendance?: Map<string, number>;
    balance?: Map<string, number>;
};

type StudentProp = {
    student?: StudentReportType;
};

const StudentReport = ({
    student = {
        firstName: "James",
        lastName: "Harrington",
        id: "1",
        attendance: new Map<string, number>([['101', 5], ['102', 1], ['103', 2]]),
        balance: new Map<string, number>([['101', 255], ['102', 10], ['103', 0]]),
    }
}: StudentProp) => {
    const colorScheme = useColorScheme();

    const classList = [
        { id: '101', name: 'Longsword' },
        { id: '102', name: 'Private Lessons' },
        { id: '103', name: 'Self-defence' },
    ];


    return (
        <View>
            <ScreenTitle titleText='Attendance and payment report for'/>
            <ScreenTitle titleText={student.firstName + ` ` + student.lastName} />

            <View style={styles.separator} />
                <ScreenTitle titleText='Attendance'></ScreenTitle>
            <View style={styles.separator} />

            <FlatList
                data={student.attendance ? Array.from(student.attendance.entries()) : []}
                keyExtractor={([classId]) => classId}
                renderItem={({item: [classId, attendance]}) => {
                    const className = classList.find((cls) => cls.id === classId)?.name || 'Unknown class';
                    return (
                    <View style={styles.reportRow}>
                        <Text style={[styles.className, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                            {className}
                        </Text>
                        <Text style={[styles.record, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                            {attendance}
                        </Text>
                    </View>
                    )
                }}
            />

            <ScreenTitle titleText='Payment'></ScreenTitle>
            <View style={styles.separator} />

            <FlatList
                data={student.balance ? Array.from(student.balance.entries()) : []}
                keyExtractor={([classId]) => classId}
                renderItem={({item: [classId, balance]}) => {
                    const className = classList.find((cls) => cls.id === classId)?.name || 'Unknown class';
                    return (
                        <View style={styles.reportRow}>
                            <Text style={[styles.className, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                                {className}
                            </Text>
                            <Text style={[styles.record, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                                {`$ ` + balance}
                            </Text>
                        </View>
                    );
                }}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
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