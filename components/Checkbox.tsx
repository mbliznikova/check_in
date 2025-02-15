import * as React from 'react';  
import { useState } from 'react';
import {View, StyleSheet, Pressable, Button, Text} from 'react-native';

type CheckboxProps = {
    label: string;
    checked: boolean;
    onChange: () => void;
}

const Checkbox = ({
    label, checked=false, onChange
}: CheckboxProps) => {
    return (
        <Pressable
            style={styles.checkboxContainer}
            onPress={onChange}>
            <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
                {checked && <Text style={styles.checkMark}>x</Text>}
            </View>
            <Text>{label}</Text>
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
    },
    label: {},
    checkedCheckbox: {
        backgroundColor: 'white',
    },
    checkMark: {
        // color: 'white',
        fontWeight: 'bold',
    },
});

export default Checkbox;
