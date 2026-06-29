import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, TOGGLE_COLOR, TOGGLE_TEXT } from '@/constants/Colors';

import { useClassOccurrences } from '@/hooks/useClassOccurrences';
import { useClassData } from '@/hooks/useClassData';
import { ClassOccurrenceType } from '@/types/class';
import { mixpanel } from '@/utils/mixpanel';
import WeekCalendar from '@/components/WeekCalendar';
import OccurrenceFormModal from '@/components/OccurrenceFormModal';

function offsetDay(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

function getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export default function OccurrencesScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const C = Colors[colorScheme];

    const params = useLocalSearchParams<{ classId?: string; className?: string }>();
    const paramClassId = params.classId ? Number(params.classId) : null;
    const paramClassName = params.className ?? null;

    const occurrences = useClassOccurrences();
    const classData = useClassData();

    useEffect(() => {
        mixpanel.track(paramClassId !== null ? 'Class occurrences viewed by class' : 'Class occurrences viewed');
    }, []);

    useEffect(() => {
        setWeekStartDate(getMondayOfWeek(new Date()));
        setSelectedDay(new Date().toISOString().slice(0, 10));
        setDatesInitialized(true);
    }, []);

    const [datesInitialized, setDatesInitialized] = useState(false);
    const [weekStartDate, setWeekStartDate] = useState<Date>(new Date(0));
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<string>('1970-01-01');
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
        const filtered = new Map<number, ClassOccurrenceType>();
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

    const goToToday = () => {
        if (viewMode === 'day') {
            setSelectedDay(new Date().toISOString().slice(0, 10));
        } else {
            setWeekStartDate(getMondayOfWeek(new Date()));
        }
    };

    const prevDay = () => setSelectedDay(prev => offsetDay(prev, -1));
    const nextDay = () => setSelectedDay(prev => offsetDay(prev, +1));

    const switchViewMode = (mode: 'week' | 'day') => {
        if (mode === 'day') {
            setSelectedDay(new Date().toISOString().slice(0, 10));
        } else {
            // land week view on the week containing selectedDay
            setWeekStartDate(getMondayOfWeek(new Date(selectedDay + 'T00:00:00')));
        }
        setViewMode(mode);
    };

    const handleOccurrencePress = (occ: ClassOccurrenceType) => {
        setFormModal({ visible: true, mode: 'edit', occurrence: occ, initialDate: null });
    };

    const handleAddPress = (date: string) => {
        setFormModal({ visible: true, mode: 'create', occurrence: null, initialDate: date });
    };

    const closeModal = () => {
        setFormModal(prev => ({ ...prev, visible: false }));
    };

    if (!datesInitialized) return null;

    const selectedClassForCreate = filterClassId !== null
        ? classData.classes.find(c => c.id === filterClassId) ?? null
        : null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: C.border }]}>
                <Pressable
                    style={[styles.backButton, { borderColor: C.border }]}
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.navigate('/(tabs)/classManagement');
                        }
                    }}
                >
                    <Text style={[styles.backText, { color: C.text }]}>{'← Back'}</Text>
                </Pressable>
                <Text style={[styles.title, { color: C.text }]}>Occurrences</Text>
                <View style={styles.viewToggle}>
                    <Pressable
                        style={[styles.togglePill, viewMode === 'week' && styles.togglePillActive]}
                        onPress={() => switchViewMode('week')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive, { color: viewMode === 'week' ? TOGGLE_TEXT : C.text }]}>Week</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.togglePill, viewMode === 'day' && styles.togglePillActive]}
                        onPress={() => switchViewMode('day')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive, { color: viewMode === 'day' ? TOGGLE_TEXT : C.text }]}>Day</Text>
                    </Pressable>
                </View>
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
                onPrevWeek={prevWeek}
                onNextWeek={nextWeek}
                onToday={goToToday}
                viewMode={viewMode}
                selectedDay={selectedDay}
                onPrevDay={prevDay}
                onNextDay={nextDay}
            />

            {/* FAB: Add occurrence */}
            <Pressable
                style={styles.fab}
                onPress={() => handleAddPress(new Date().toISOString().slice(0, 10))}
            >
                <View style={styles.fabIconH} />
                <View style={styles.fabIconV} />
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        width: 70,
    },
    backText: {
        fontSize: 13,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    viewToggle: {
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: TOGGLE_COLOR,
        width: 90,
    },
    togglePill: {
        flex: 1,
        paddingVertical: 5,
        alignItems: 'center',
    },
    togglePillActive: {
        backgroundColor: TOGGLE_COLOR,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: TOGGLE_TEXT,
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
    fabIconH: {
        position: 'absolute',
        width: 22,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#fff',
    },
    fabIconV: {
        position: 'absolute',
        width: 2,
        height: 22,
        borderRadius: 1,
        backgroundColor: '#fff',
    },
});
