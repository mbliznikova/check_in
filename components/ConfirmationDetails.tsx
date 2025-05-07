import * as React from 'react';
import { useState, useEffect } from 'react';
import {View, StyleSheet, Pressable, FlatList, Text, SafeAreaView, useColorScheme, ActivityIndicator} from 'react-native';

import Checkbox from './Checkbox';
import ClassName from './ClassName';
import CurrentDate from '@/components/CurrentDate';
import ScreenTitle from '@/components/ScreenTitle';

type ClassType = {
    id: number;
    name: string;
};

type AttendanceType = {
    date: string;
    classes: Map<number, AttendanceClassType>
};

type AttendanceClassType = {
    name: string;
    students: Map<number, AttendanceStudentType>
}

type AttendanceStudentType = {
    firstName: string;
    lastName: string;
    isShowedUp: boolean;
}

const ConfirmationDetails = ({
    date,
    classes,
}: AttendanceType) => {
    const colorScheme = useColorScheme();
    return (
        <SafeAreaView style={styles.appContainer}>
            <View style={[styles.contentContainer, styles.bigFlex]}>
            <ScreenTitle titleText={date}></ScreenTitle>
                <FlatList
                    data={Object.entries(classes)}
                    keyExtractor={([classId, _classInfo]) => classId.toString()}
                    renderItem={( {item} ) => {
                        const [classId, classInfo] = item;
                        return (
                            <View>
                                <ClassName
                                    id={Number(classId)}
                                    name={classInfo.name}
                                />
                                <View style={styles.spaceBetweenRow}>
                                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                                        Student
                                    </Text>
                                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor]}>
                                        Did actually show up?
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            </View>

            <View style={[styles.confirmButtonContainer, styles.smallFlex]}>
                    <Pressable
                        style={styles.confirmButton}
                        // disabled={!ifStudentsToConfirm}
                        onPress={() => {
                            // sendConfirmation();
                            // alert('Students have been confirmed');
                        }}
                    >
                        <Text>Confirm</Text>
                    </Pressable>
            </View>

            <View style={styles.separator} />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
    },
    bigFlex: {
        flex: 5,
    },
    smallFlex: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    separator: {
        height: 1,
        backgroundColor: 'gray',
        marginVertical: 10,
    },
    spaceBetweenRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    confirmButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    confirmButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'blue',
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


export default ConfirmationDetails;