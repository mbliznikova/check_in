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

    return (
        <View>
            <Text>{date}</Text>
            <FlatList
                data={Object.entries(classes)}
                keyExtractor={([classId, _classInfo]) => classId.toString()}
                renderItem={( {item} ) => {
                    const [classId, classInfo] = item;
                    return (
                        <ClassName
                            id={Number(classId)}
                            name={classInfo.name}
                        />
                    );
                }}
            />
        </View>
    );
};

export default ConfirmationDetails;