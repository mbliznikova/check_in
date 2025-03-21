import * as React from 'react';  
import {View, StyleSheet, useColorScheme, Text, FlatList} from 'react-native';

import ScreenTitle from './ScreenTitle';
import ClassName from './ClassName';
import Student from './Student';

const AttendancePaymentsReport = () => {
    const colorScheme = useColorScheme();

    // Add functionality to fetch classes from backend and place them here
    const classList = [
        { id: '101', name: 'Longsword' },
        { id: '102', name: 'Private Lessons' },
        { id: '103', name: 'Self-defence' }
    ];

    // Add functionality (DB query) to retrieve a students [with attendance to classes and/or payments for classes from the specified time range]
    const students = [
        { firstName: "James", lastName: "Harrington", id: "1", attendance: new Map<string, number>([['101', 5], ['102', 1], ['103', 2]]), balance: new Map<string, number>([['101', 255], ['102', 10], ['103', 0]])},
        { firstName: "William", lastName: "Kensington", id: "2", attendance: new Map<string, number>([['101', 1], ['102', 1]]), balance: new Map<string, number>([['101', 255], ['102', 0]])},
        { firstName: "Edward", lastName: "Montgomery", id: "3", attendance: new Map<string, number>([['101', 4], ['103', 1]]), balance: new Map<string, number>([['101', 255], ['103', 20]])},
        { firstName: 'Henry', lastName: 'Fairchild', id: '4', attendance: new Map<string, number>([['101', 5], ['103', 2]]), balance: new Map<string, number>([['101', 255], ['103', 0]])},
        { firstName: 'Arthur', lastName: 'Whitmore', id: '5', attendance: new Map<string, number>([['101', 3], ['102', 1], ['103', 1]]), balance: new Map<string, number>([['101', 255], ['102', 40], ['103', 10]])},
        { firstName: 'Charles', lastName: 'Waverly', id: '6', attendance: new Map<string, number>([['102', 3], ['103', 3]]), balance: new Map<string, number>([['102', 10], ['103', 30]])},
        { firstName: 'Nathaniel', lastName: 'Sinclair', id: '14', attendance: new Map<string, number>([]), balance: new Map<string, number>([])},
        { firstName: 'Theodore', lastName: 'Langley', id: '15', attendance: new Map<string, number>([]), balance: new Map<string, number>([['102', 30], ['103', 10]])},
        { firstName: 'Sebastian', lastName: 'Hawthorne', id: '16', attendance: new Map<string, number>([]), balance: new Map<string, number>([])},
    ];

    return (
        <View style={styles.container}>
            <View style={styles.bigFlex}>
            <ScreenTitle titleText='Attendance and Payments report'/>
            <View style={styles.headerRow}>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Student</Text>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Attendance</Text>
                <Text style={[styles.columnHeadersText, colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>Balance</Text>
            </View>

            <FlatList
                data={classList}
                keyExtractor={cls => cls.id}
                renderItem={({item: cls}) => (
                    <View>
                        <View style={styles.separator} />
                        <ClassName id={cls.id} name={cls.name}/>
                        <FlatList
                            data={students.filter((student) => (student.attendance.has(cls.id)))}
                            keyExtractor={student => student.id}
                            renderItem={({item: student}) => {
                                const balanceStr = '$ ' + student.balance.get(cls.id)
                                return (
                                    <View style={styles.regularRow}>
                                        <View style={styles.studentName}>
                                            <Student id={student.id} firstName={student.firstName} lastName={student.lastName}/>
                                        </View>
                                        <View style={styles.attendance}>
                                            <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>{student.attendance.get(cls.id)}</Text>
                                        </View>
                                        <View style={styles.balance}>
                                            <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>{balanceStr}</Text>
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    </View>
                )}
            />
            </View>

            <View style={styles.smallFlex}>
            <View style={styles.separator} />

            <ScreenTitle titleText='Students with balance and no attendance'/>
            <FlatList 
                data={students.filter((student) => student.attendance.size === 0)}
                keyExtractor={student => student.id}
                renderItem={({item: student}) => {
                    const balanceEntries = Array.from(student.balance.entries())

                    return(
                        <View style={[styles.regularRow, {paddingVertical: 10}]}>
                            <Student
                                id={student.id}
                                firstName={student.firstName}
                                lastName={student.lastName}
                            />

                            <View>
                                {balanceEntries.map(([classId], index) => {
                                    const className = classList.find((cls) => cls.id === classId)?.name || 'Unknown class';
                                    return (
                                        <Text
                                            style={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                                            key={`${student.id} - class - ${index}`}
                                        >
                                            {className}
                                        </Text>
                                    )
                                })}
                            </View>

                            <View>
                                {balanceEntries.map(([, balance], index) => (
                                    <Text
                                        style={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}
                                        key={`${student.id} - balance - ${index}`}
                                    >
                                        {balance}
                                    </Text>
                                ))}
                            </View>

                        </View>
                    )
                }}
            />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    bigFlex: {
        flex: 3,
    },
    smallFlex: {
        flex: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 10,
        // paddingBottom: 20,
    },
    columnHeadersText: {
        fontSize: 20, 
        fontWeight: 'bold',
    },
    regularRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studentName: {
        flex: 1,
        minWidth: 100,
    },
    attendance: {
        flex: 1,
        alignItems: 'center',
    },
    balance: {
        flex: 1,
        alignItems: 'flex-end',
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
})

export default AttendancePaymentsReport;