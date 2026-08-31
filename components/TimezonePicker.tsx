import * as React from 'react';
import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, FlatList } from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { commonStyles } from '@/constants/commonStyles';
import { DESTRUCTIVE_COLOR } from '@/constants/Colors';

import ScreenTitle from './ScreenTitle';

type TimezonePickerProps = {
    isVisible: boolean;
    currentValue: string;
    onSelect: (timezone: string) => void;
    onClose: () => void;
};

const getAllTimezones = (): { zones: string[]; error: string | null } => {
    try {
        const zones = Intl.supportedValuesOf('timeZone');
        if (!zones || zones.length === 0) {
            return { zones: [], error: 'Timezone list unavailable.' };
        }
        return { zones, error: null };
    } catch (err) {
        console.error('Error while reading supported timezones: ', err);
        return { zones: [], error: 'Timezone list unavailable.' };
    }
};

const TimezonePicker = ({
    isVisible,
    currentValue,
    onSelect,
    onClose,
}: TimezonePickerProps) => {
    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();

    const [query, setQuery] = useState('');
    const { zones: allZones, error: loadError } = useMemo(getAllTimezones, []);

    const filteredZones = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q === '') {
            return allZones;
        }
        return allZones.filter((zone) => zone.toLowerCase().includes(q));
    }, [allZones, query]);

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.modalView, styles.pickerView]}>
                    <ScreenTitle titleText="Select timezone" />
                    <TextInput
                        style={[textStyle, commonStyles.inputField, commonStyles.fullWidthInput]}
                        placeholder="Search timezones..."
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {loadError && (
                        <Text style={[styles.errorText, { color: DESTRUCTIVE_COLOR }]}>
                            {loadError}
                        </Text>
                    )}
                    <FlatList
                        style={styles.list}
                        data={filteredZones}
                        keyExtractor={(zone) => zone}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.zoneRow}
                                onPress={() => onSelect(item)}
                            >
                                <Text style={[textStyle, item === currentValue && styles.zoneSelected]}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                        ListEmptyComponent={
                            <Text style={[textStyle, commonStyles.emptyMessage]}>
                                No matches
                            </Text>
                        }
                    />
                    <Pressable
                        style={modalStyles.modalCancelButton}
                        onPress={onClose}
                    >
                        <Text style={textStyle}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    pickerView: {
        width: '90%',
        maxWidth: 420,
        maxHeight: '80%',
    },
    list: {
        alignSelf: 'stretch',
        maxHeight: 320,
    },
    zoneRow: {
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    zoneSelected: {
        fontWeight: 'bold',
    },
    errorText: {
        paddingTop: 10,
        textAlign: 'center',
    },
});

export default TimezonePicker;
