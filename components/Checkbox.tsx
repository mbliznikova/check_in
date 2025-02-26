import * as React from 'react';  
import {View, StyleSheet, Pressable, Text, useColorScheme, StyleProp, TextStyle} from 'react-native';

type CheckboxProps = {
    label: string;
    checked: boolean;
    onChange: () => void;
    labelStyle?: StyleProp<TextStyle>;
}

const Checkbox = ({
    label,
    checked=false,
    onChange,
    labelStyle,
}: CheckboxProps) => {
    const colorScheme = useColorScheme();
    return (
        <Pressable
            style={styles.checkboxContainer}
            onPress={onChange}>
            <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
                {checked && <Text style={styles.checkMark}>x</Text>}
            </View>
            <Text style={[styles.defaultLabel, labelStyle? labelStyle : null, ]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        // borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: 'white',
    },
    label: {},
    checkedCheckbox: {
        backgroundColor: 'white',
    },
    defaultLabel: {},
    checkMark: {
        // color: 'white',
        fontWeight: 'bold',
    },
});

export default Checkbox;
