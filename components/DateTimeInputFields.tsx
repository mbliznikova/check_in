import * as React from 'react';
import { useState } from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

type DateTimeFieldProps = {
    value: string;
    onChange: (value: string) => void;
};

export const DateInputField = ({ value, onChange }: DateTimeFieldProps) => {
    const textStyle = useThemeTextStyle();
    const [showDatePicker, setShowDatePicker] = useState(false);

    if (Platform.OS === 'web') {
        return (
            <View>
                {/* @ts-ignore react-native-web date input */}
                <input
                    type="date"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    style={{ padding: 8, borderRadius: 8, border: '1px solid grey', fontSize: 16 }}
                />
            </View>
        );
    }
    const dateObj = new Date(value + 'T00:00:00');
    if (Platform.OS === 'ios') {
        return (
            <DateTimePicker
                style={styles.compactPicker}
                value={dateObj}
                mode="date"
                display="compact"
                onChange={(_, selected) => {
                    if (selected) onChange(selected.toISOString().slice(0, 10));
                }}
            />
        );
    }
    return (
        <View>
            <Pressable style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                <Text style={textStyle}>{value || 'Select date'}</Text>
            </Pressable>
            {showDatePicker && (
                <DateTimePicker
                    value={dateObj}
                    mode="date"
                    display="default"
                    onChange={(_, selected) => {
                        setShowDatePicker(false);
                        if (selected) onChange(selected.toISOString().slice(0, 10));
                    }}
                />
            )}
        </View>
    );
};

export const TimeInputField = ({ value, onChange }: DateTimeFieldProps) => {
    const textStyle = useThemeTextStyle();
    const [showTimePicker, setShowTimePicker] = useState(false);

    if (Platform.OS === 'web') {
        return (
            <View>
                {/* @ts-ignore react-native-web time input */}
                <input
                    type="time"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    style={{ padding: 8, borderRadius: 8, border: '1px solid grey', fontSize: 16 }}
                />
            </View>
        );
    }
    const [hours, minutes] = value ? value.split(':').map(Number) : [12, 0];
    const timeObj = new Date();
    timeObj.setHours(hours, minutes, 0, 0);
    if (Platform.OS === 'ios') {
        return (
            <DateTimePicker
                style={styles.compactPicker}
                value={timeObj}
                mode="time"
                display="compact"
                onChange={(_, selected) => {
                    if (selected) {
                        const h = String(selected.getHours()).padStart(2, '0');
                        const m = String(selected.getMinutes()).padStart(2, '0');
                        onChange(`${h}:${m}`);
                    }
                }}
            />
        );
    }
    return (
        <View>
            <Pressable style={styles.pickerButton} onPress={() => setShowTimePicker(prev => !prev)}>
                <Text style={textStyle}>{value || 'Select time'}</Text>
            </Pressable>
            {showTimePicker && (
                <DateTimePicker
                    value={timeObj}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(_, selected) => {
                        setShowTimePicker(false);
                        if (selected) {
                            const h = String(selected.getHours()).padStart(2, '0');
                            const m = String(selected.getMinutes()).padStart(2, '0');
                            onChange(`${h}:${m}`);
                        }
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    pickerButton: {
        minWidth: 110,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 8,
        borderRadius: 10,
    },
    compactPicker: {
        height: 34,
        width: 160,
    },
});
