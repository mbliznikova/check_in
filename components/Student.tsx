import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { UNKNOWN_NAME } from '@/constants/ui';

type StudentType = {
    firstName: string;
    lastName: string;
    id: number;
    classes?: Set<number>;
};

const Student = ({
    firstName='John',
    lastName='Smith',
    id,
    classes,
}: StudentType) => {
    const textStyle = useThemeTextStyle();

    return (
        <View style={styles.container}>
            <Text style={textStyle}>{firstName ?? UNKNOWN_NAME} {lastName ?? UNKNOWN_NAME}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 15,
    },
})

export default Student;
