import * as React from 'react';
import {View, Text, StyleSheet, useColorScheme} from 'react-native';

const UNKNOWN_NAME = 'N/A';

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
    const colorScheme = useColorScheme();

    return (
        <View style={styles.container}>
            <Text style={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}>{firstName ?? UNKNOWN_NAME} {lastName ?? UNKNOWN_NAME}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 15,
    },
    darkColor: {
        color: 'black',
      },
    lightColor: {
        color: 'white',
      },
})

export default Student;