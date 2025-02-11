import * as React from 'react';  
import {View, Text, StyleSheet, useColorScheme} from 'react-native';

type StudentType = {
    firstName: string;
    lastName: string;
    id: string;
    classes?: Set<string>;
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
            <Text style={colorScheme === 'dark' ? styles.lightColor : styles.darkColor}>{firstName} {lastName}</Text>
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