import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

type ClassNameProps = {
    id: number;
    name: string;
};

const ClassName = ({
        id,
        name = "Class name",
    }: ClassNameProps) => {
        const textStyle = useThemeTextStyle();
        return (
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={[textStyle, styles.leftText]}>
                        Class
                    </Text>
                    <Text style={[textStyle, styles.rightText]}>
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
})

export default ClassName;
