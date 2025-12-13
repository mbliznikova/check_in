import * as React from 'react';  
import {View, Text, StyleSheet, useColorScheme} from 'react-native';

type ClassNameProps = {
    id: number;
    name: string;
};

const ClassName = ({
        id,
        name = "Class name",
    }: ClassNameProps) => {
        const colorScheme = useColorScheme();
        return (
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor, styles.leftText]}>
                        Class
                    </Text>
                    <Text style={[colorScheme === 'dark' ? styles.lightColor : styles.darkColor, styles.rightText]}>
                        {name}
                    </Text>
                </View>
            </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
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

export default ClassName;
