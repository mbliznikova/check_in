import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

import ScreenTitle from './ScreenTitle';
import { UNKNOWN_NAME } from '@/constants/ui';
import { StudentAttendanceDetailsType } from '@/types/attendance';
import { commonStyles } from '@/constants/commonStyles';

const StudentReport = ({
    firstName,
    lastName,
    classesInfo
}: StudentAttendanceDetailsType) => {
    const textStyle = useThemeTextStyle();
    const attendanceList: Map<string, [number, number]>[] = Array.from(classesInfo.values());

    return (
        <View style={styles.container}>
            <ScreenTitle titleText={(firstName ?? UNKNOWN_NAME) + ` ` + (lastName ?? UNKNOWN_NAME)} />
            <View style={commonStyles.separator} />

            <ScreenTitle titleText='Attendance' />

            {attendanceList.map((item) => {
                const [classData] = [...item];
                const [className, attendance] = classData;
                return (
                    <View key={className} style={styles.reportRow}>
                        <Text style={[styles.className, textStyle]}>
                            {className}
                        </Text>
                        <Text style={[styles.record, textStyle]}>
                            {attendance[0]} ({attendance[1]})
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
});

export default StudentReport;