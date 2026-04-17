import * as React from 'react';
import { useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ClassOccurrenceType } from '@/types/class';

const HOUR_HEIGHT = 64; // px per hour
const TIME_COL_WIDTH = 50; // px for time labels
const START_HOUR = 7; // 7am
const END_HOUR = 22; // 10pm
const TOTAL_HOURS = END_HOUR - START_HOUR;
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CLASS_COLORS = [
    '#1a73e8', '#0f9d58', '#f4b400', '#db4437', '#ab47bc',
    '#00acc1', '#ff7043', '#43a047', '#7986cb', '#e91e63',
];

function getClassColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
    }
    return CLASS_COLORS[hash % CLASS_COLORS.length];
}

function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function getWeekDates(weekStartDate: Date): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + i);
        return d;
    });
}

function toDateStr(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function formatMonthDay(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatWeekRange(weekStartDate: Date): string {
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStartDate.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

type LayoutItem = {
    occ: ClassOccurrenceType;
    col: number;
    totalCols: number;
};

function computeLayout(occs: ClassOccurrenceType[]): LayoutItem[] {
    if (occs.length === 0) return [];

    const sorted = [...occs].sort((a, b) =>
        a.actualStartTime.localeCompare(b.actualStartTime)
    );

    // Assign each occurrence to a column (greedy, leftmost available)
    const colEnds: number[] = []; // colEnds[i] = end time (in minutes) of last item placed in column i
    const colAssignments: number[] = [];

    for (const occ of sorted) {
        const start = timeToMinutes(occ.actualStartTime);
        let assigned = -1;
        for (let c = 0; c < colEnds.length; c++) {
            if (colEnds[c] <= start) {
                assigned = c;
                break;
            }
        }
        if (assigned === -1) {
            assigned = colEnds.length;
            colEnds.push(0);
        }
        colEnds[assigned] = start + occ.actualDuration;
        colAssignments.push(assigned);
    }

    // Compute totalCols for each occurrence based on max overlapping column
    return sorted.map((occ, i) => {
        const start = timeToMinutes(occ.actualStartTime);
        const end = start + occ.actualDuration;
        let maxCol = colAssignments[i];
        for (let j = 0; j < sorted.length; j++) {
            const s = timeToMinutes(sorted[j].actualStartTime);
            const e = s + sorted[j].actualDuration;
            if (s < end && start < e) {
                maxCol = Math.max(maxCol, colAssignments[j]);
            }
        }
        return { occ, col: colAssignments[i], totalCols: maxCol + 1 };
    });
}

type WeekCalendarProps = {
    occurrences: Map<number, ClassOccurrenceType>;
    weekStartDate: Date;
    onOccurrencePress: (occurrence: ClassOccurrenceType) => void;
    onAddPress: (date: string) => void;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
};

const WeekCalendar = ({
    occurrences,
    weekStartDate,
    onOccurrencePress,
    onAddPress,
    onPrevWeek,
    onNextWeek,
    onToday,
}: WeekCalendarProps) => {
    const { width: screenWidth } = useWindowDimensions();
    const DAY_COL_WIDTH = Math.floor((screenWidth - TIME_COL_WIDTH) / 7);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const scrollRef = useRef<ScrollView>(null);
    const todayStr = new Date().toISOString().slice(0, 10);
    const weekDates = getWeekDates(weekStartDate);

    // Scroll to ~8am on mount / week change
    useEffect(() => {
        const scrollTo = (8 - START_HOUR) * HOUR_HEIGHT;
        scrollRef.current?.scrollTo({ y: scrollTo, animated: false });
    }, [weekStartDate]);

    // Group occurrences by date
    const occsByDate = new Map<string, ClassOccurrenceType[]>();
    occurrences.forEach(occ => {
        const existing = occsByDate.get(occ.actualDate) ?? [];
        existing.push(occ);
        occsByDate.set(occ.actualDate, existing);
    });

    const renderOccurrenceBlock = (item: LayoutItem, dayWidth: number) => {
        const { occ, col, totalCols } = item;
        const startMins = timeToMinutes(occ.actualStartTime);
        const top = (startMins - START_HOUR * 60) * (HOUR_HEIGHT / 60);
        const height = Math.max(occ.actualDuration * (HOUR_HEIGHT / 60), 22);
        const blockWidth = (dayWidth / totalCols) - 4;
        const left = col * (dayWidth / totalCols) + 2;
        const color = getClassColor(occ.fallbackClassName);

        return (
            <Pressable
                key={occ.id}
                style={[
                    styles.occBlock,
                    {
                        top,
                        left,
                        width: blockWidth,
                        height,
                        backgroundColor: color,
                        opacity: occ.isCancelled ? 0.45 : 1,
                        borderColor: occ.isCancelled ? 'red' : color,
                        borderWidth: occ.isCancelled ? 2 : 0,
                    },
                ]}
                onPress={() => onOccurrencePress(occ)}
            >
                <Text style={styles.occName} numberOfLines={1}>
                    {occ.fallbackClassName}
                </Text>
                {height >= 28 && (
                    <Text style={styles.occTime}>
                        {occ.actualStartTime.slice(0, 5)}
                        {occ.isCancelled ? ' ✕' : ''}
                    </Text>
                )}
            </Pressable>
        );
    };

    const renderDayColumn = (date: Date) => {
        const dateStr = toDateStr(date);
        const isToday = dateStr === todayStr;
        const dayOccs = occsByDate.get(dateStr) ?? [];
        const layout = computeLayout(dayOccs);

        return (
            <View key={dateStr} style={{ width: DAY_COL_WIDTH }}>
                {/* Grid lines background */}
                <View style={[styles.dayCol, { width: DAY_COL_WIDTH, borderLeftColor: themeColors.border }, isToday && styles.todayCol]}>
                    {HOURS.map(h => (
                        <View
                            key={h}
                            style={[styles.hourLine, { top: (h - START_HOUR) * HOUR_HEIGHT, backgroundColor: themeColors.border }]}
                        />
                    ))}
                    {/* Occurrence blocks */}
                    {layout.map(item => renderOccurrenceBlock(item, DAY_COL_WIDTH))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Navigation header */}
            <View style={styles.navRow}>
                <View style={styles.navSide}>
                    <Pressable style={[styles.navButton, { borderColor: themeColors.border }]} onPress={onPrevWeek}>
                        <Text style={[styles.navText, { color: themeColors.text }]}>{'← Previous'}</Text>
                    </Pressable>
                </View>
                <View style={styles.navCenter}>
                    <Text style={[styles.weekLabel, { color: themeColors.text }]}>{formatWeekRange(weekStartDate)}</Text>
                </View>
                <View style={[styles.navSide, styles.navSideRight]}>
                    <Pressable style={styles.todayButton} onPress={onToday}>
                        <Text style={styles.navText}>This week</Text>
                    </Pressable>
                    <Pressable style={[styles.navButton, { borderColor: themeColors.border }]} onPress={onNextWeek}>
                        <Text style={[styles.navText, { color: themeColors.text }]}>{'Next →'}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Day name headers */}
            <View style={[styles.dayHeaderRow, { borderBottomColor: themeColors.border }]}>
                <View style={{ width: TIME_COL_WIDTH }} />
                {weekDates.map((date, i) => {
                    const isToday = toDateStr(date) === todayStr;
                    return (
                        <Pressable
                            key={i}
                            style={[styles.dayHeader, isToday && styles.todayHeader, { width: DAY_COL_WIDTH }]}
                            onPress={() => onAddPress(toDateStr(date))}
                        >
                            <Text style={[styles.dayName, { color: themeColors.textMuted }, isToday && styles.todayText]}>
                                {DAY_NAMES[i]}
                            </Text>
                            <Text style={[styles.dayDate, { color: themeColors.textMuted }, isToday && styles.todayText]}>
                                {formatMonthDay(date)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Scrollable time grid */}
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={true}>
                <View style={{ flexDirection: 'row' }}>
                    {/* Time labels */}
                    <View style={{ width: TIME_COL_WIDTH, height: GRID_HEIGHT }}>
                        {HOURS.map(h => (
                            <View
                                key={h}
                                style={[styles.timeLabel, { top: (h - START_HOUR) * HOUR_HEIGHT - 8 }]}
                            >
                                <Text style={[styles.timeLabelText, { color: themeColors.textMuted }]}>
                                    {h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Day columns */}
                    <View style={{ flexDirection: 'row', height: GRID_HEIGHT }}>
                        {weekDates.map(date => renderDayColumn(date))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    navSide: {
        flex: 1,
        alignItems: 'flex-start',
    },
    navSideRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    navCenter: {
        flex: 1,
        alignItems: 'center',
    },
    navButton: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    todayButton: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#1a73e8',
    },
    navText: {
        fontSize: 13,
    },
    weekLabel: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    dayHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingBottom: 4,
    },
    dayHeader: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    todayHeader: {
        backgroundColor: 'rgba(26,115,232,0.15)',
        borderRadius: 6,
    },
    dayName: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    dayDate: {
        fontSize: 13,
    },
    todayText: {
        color: '#1a73e8',
    },
    dayCol: {
        height: GRID_HEIGHT,
        position: 'relative',
        borderLeftWidth: 1,
    },
    todayCol: {
        backgroundColor: 'rgba(26,115,232,0.05)',
    },
    hourLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
    },
    timeLabel: {
        position: 'absolute',
        left: 2,
        width: TIME_COL_WIDTH - 4,
    },
    timeLabelText: {
        fontSize: 11,
        textAlign: 'right',
        paddingRight: 6,
    },
    occBlock: {
        position: 'absolute',
        borderRadius: 4,
        paddingHorizontal: 3,
        paddingTop: 2,
        overflow: 'hidden',
    },
    occName: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    occTime: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 10,
    },
});

export default WeekCalendar;
