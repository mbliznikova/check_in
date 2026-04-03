import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { useClassOccurrences } from '@/hooks/useClassOccurrences';
import { useClassData } from '@/hooks/useClassData';
import { ClassOccurrenceType } from '@/types/class';
import WeekCalendar from '@/components/WeekCalendar';
import OccurrenceFormModal from '@/components/OccurrenceFormModal';

function getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export default function OccurrencesScreen() {
    const params = useLocalSearchParams<{ classId?: string; className?: string }>();
    const paramClassId = params.classId ? Number(params.classId) : null;
    const paramClassName = params.className ?? null;

    const occurrences = useClassOccurrences();
    const classData = useClassData();

    const [weekStartDate, setWeekStartDate] = useState<Date>(() => getMondayOfWeek(new Date()));
    const [filterClassId, setFilterClassId] = useState<number | null>(paramClassId);
    const [filterClassName, setFilterClassName] = useState<string | null>(paramClassName);

    // When a class filter is active, fetch its occurrences via the server-side filter
    useEffect(() => {
        if (filterClassId !== null) {
            occurrences.fetchClassOccurrences(filterClassId);
        }
    }, [filterClassId]);

    // Build the map passed to the calendar: filtered by class (using server result) or all
    const visibleOccurrences = useMemo(() => {
        if (filterClassId === null) return occurrences.allOccurrencesMap;
        // Collect IDs returned by the server-side class filter, look them up in allOccurrencesMap
        const filtered = new Map<number, import('@/types/class').ClassOccurrenceType>();
        occurrences.currentClassOccurrenceMap.forEach(entries => {
            entries.forEach(([id]) => {
                const occ = occurrences.allOccurrencesMap.get(id);
                if (occ) filtered.set(id, occ);
            });
        });
        return filtered;
    }, [filterClassId, occurrences.allOccurrencesMap, occurrences.currentClassOccurrenceMap]);

    const [formModal, setFormModal] = useState<{
        visible: boolean;
        mode: 'create' | 'edit';
        occurrence: ClassOccurrenceType | null;
        initialDate: string | null;
    }>({ visible: false, mode: 'create', occurrence: null, initialDate: null });

    const prevWeek = () => {
        setWeekStartDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() - 7);
            return d;
        });
    };

    const nextWeek = () => {
        setWeekStartDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + 7);
            return d;
        });
    };

    const goToToday = () => setWeekStartDate(getMondayOfWeek(new Date()));

    const handleOccurrencePress = (occ: ClassOccurrenceType) => {
        setFormModal({ visible: true, mode: 'edit', occurrence: occ, initialDate: null });
    };

    const handleAddPress = (date: string) => {
        setFormModal({ visible: true, mode: 'create', occurrence: null, initialDate: date });
    };

    const closeModal = () => {
        setFormModal(prev => ({ ...prev, visible: false }));
    };

    const selectedClassForCreate = filterClassId !== null
        ? classData.classes.find(c => c.id === filterClassId) ?? null
        : null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.navigate('/(tabs)/classManagement');
                        }
                    }}
                >
                    <Text style={styles.backText}>{'← Back'}</Text>
                </Pressable>
                <Text style={styles.title}>Occurrences</Text>
                <View style={{ width: 70 }} />
            </View>

            {/* Class filter pill */}
            {filterClassName !== null && (
                <View style={styles.filterRow}>
                    <View style={styles.filterPill}>
                        <Text style={styles.filterText}>Showing: {filterClassName}</Text>
                        <Pressable onPress={() => { setFilterClassId(null); setFilterClassName(null); }} style={styles.clearButton}>
                            <Text style={styles.clearText}>✕</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Week Calendar */}
            <WeekCalendar
                occurrences={visibleOccurrences}
                weekStartDate={weekStartDate}
                onOccurrencePress={handleOccurrencePress}
                onAddPress={handleAddPress}
                onPrevWeek={prevWeek}
                onNextWeek={nextWeek}
                onToday={goToToday}
            />

            {/* FAB: Add occurrence */}
            <Pressable
                style={styles.fab}
                onPress={() => handleAddPress(new Date().toISOString().slice(0, 10))}
            >
                <Text style={styles.fabText}>+</Text>
            </Pressable>

            {/* Create / Edit modal */}
            {formModal.visible && (
                <OccurrenceFormModal
                    mode={formModal.mode}
                    isVisible={formModal.visible}
                    onClose={closeModal}
                    classId={filterClassId}
                    className={filterClassName}
                    classDuration={selectedClassForCreate?.durationMinutes ?? null}
                    initialDate={formModal.initialDate ?? undefined}
                    availableClasses={filterClassId === null ? classData.classes : undefined}
                    onCreateOccurrence={occurrences.createClassOccurrence}
                    occurrence={formModal.occurrence}
                    onEditOccurrence={occurrences.editClassOccurrence}
                    onDeleteOccurrence={occurrences.deleteClassOccurrence}
                    onRequestingTimeIntervals={occurrences.fetchAvailableTimeIntervalsOccurrence}
                    onUniquenessCheck={occurrences.checkIfOccurrenceUnique}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#555',
        width: 70,
    },
    backText: {
        color: '#fff',
        fontSize: 13,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a73e8',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        gap: 8,
    },
    filterText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    clearButton: {
        paddingHorizontal: 4,
    },
    clearText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#1a73e8',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    fabText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '200',
        lineHeight: 34,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
});
