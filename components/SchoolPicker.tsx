import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useUserRole } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export function SchoolPicker() {
    const { schoolId, memberships, switchSchool } = useUserRole();
    const [open, setOpen] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    if (memberships.length <= 1) {
        return <Text style={[styles.name, { color: colors.text }]}>{memberships[0]?.schoolName}</Text>;
    }

    const current = memberships.find(m => m.schoolId === schoolId);

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setOpen(o => !o)} style={styles.button}>
                <Text style={[styles.name, { color: colors.text }]}>{current?.schoolName ?? '—'}</Text>
                <Text style={[styles.chevron, { color: colors.text }]}>{open ? ' ▲' : ' ▼'}</Text>
            </Pressable>
            {open && (
                <View style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.icon }]}>
                    {memberships.map(m => (
                        <Pressable
                            key={m.schoolId}
                            onPress={() => { switchSchool(m.schoolId); setOpen(false); }}
                            style={styles.item}
                        >
                            <Text style={[styles.itemText, { color: m.schoolId === schoolId ? colors.tint : colors.text }, m.schoolId === schoolId && styles.activeText]}>
                                {m.schoolName}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
    },
    chevron: {
        fontSize: 11,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        borderRadius: 8,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        minWidth: 160,
    },
    item: {
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    itemText: {
        fontSize: 14,
    },
    activeText: {
        fontWeight: '600',
    },
});
