import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, LayoutChangeEvent, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, TOGGLE_COLOR } from '@/constants/Colors';
import { ClassOccurrenceType } from '@/types/class';

const HOUR_HEIGHT = 64; // px per hour
const START_HOUR = 7; // 7am
const END_HOUR = 22; // 10pm
const TOTAL_HOURS = END_HOUR - START_HOUR;
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

// Below this width, the compact mobile chrome (short labels, smaller gutter/pill, collapsed nav) kicks in.
// Read from actual rendered width, not Platform.OS, so a narrow web browser gets the same treatment as a phone.
export const MOBILE_BREAKPOINT = 430;
const TIME_GUTTER_WIDE = 64;
const TIME_GUTTER_MOBILE = 38;
const TODAY_PILL_SIZE_WIDE = 28;
const TODAY_PILL_SIZE_MOBILE = 24;

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

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

function addMinutes(time: string, minutes: number): string {
    const total = timeToMinutes(time) + minutes;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

function formatDayLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function parseDateStr(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
}

function formatHourLabel(h: number, compact: boolean): string {
    const period = h < 12 ? (compact ? 'a' : 'am') : (compact ? 'p' : 'pm');
    const hour12 = h < 12 ? h : h === 12 ? 12 : h - 12;
    return `${hour12}${period}`;
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
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    viewMode?: 'week' | 'day';
    selectedDay?: string;
    onPrevDay?: () => void;
    onNextDay?: () => void;
    schoolTimezone?: string | null;
    filterClassName: string | null;
    onClearFilter: () => void;
};

const WeekCalendar = ({
    occurrences,
    weekStartDate,
    onOccurrencePress,
    onPrevWeek,
    onNextWeek,
    onToday,
    viewMode = 'week',
    selectedDay,
    onPrevDay,
    onNextDay,
    schoolTimezone,
    filterClassName,
    onClearFilter,
}: WeekCalendarProps) => {
    const { width: screenWidth } = useWindowDimensions();
    const isMobile = screenWidth <= MOBILE_BREAKPOINT;
    const timeGutter = isMobile ? TIME_GUTTER_MOBILE : TIME_GUTTER_WIDE;
    const todayPillSize = isMobile ? TODAY_PILL_SIZE_MOBILE : TODAY_PILL_SIZE_WIDE;
    const dayNames = isMobile ? DAY_NAMES_SHORT : DAY_NAMES;
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const scrollRef = useRef<ScrollView>(null);
    const todayStr = new Date().toISOString().slice(0, 10);
    const weekDates = getWeekDates(weekStartDate);

    // Real rendered width of a (flex:1) day column, measured post-layout so occurrence-block
    // positioning matches whatever width flexbox actually resolved — no window-width math to
    // keep in sync with the header. Seeded with a rough estimate to avoid a first-frame flash.
    const [dayColWidth, setDayColWidth] = useState(() => {
        const cols = viewMode === 'day' ? 1 : 7;
        return Math.max(Math.floor((screenWidth - timeGutter) / cols), 0);
    });
    const handleDayColLayout = (e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        setDayColWidth(prev => (Math.abs(prev - width) > 0.5 ? width : prev));
    };

    // Scroll to ~8am on mount / week or day change
    useEffect(() => {
        const scrollTo = (8 - START_HOUR) * HOUR_HEIGHT;
        scrollRef.current?.scrollTo({ y: scrollTo, animated: false });
    }, [weekStartDate, selectedDay]);

    // Group occurrences by date
    const occsByDate = new Map<string, ClassOccurrenceType[]>();
    occurrences.forEach(occ => {
        const existing = occsByDate.get(occ.actualDate) ?? [];
        existing.push(occ);
        occsByDate.set(occ.actualDate, existing);
    });

    const renderOccurrenceBlock = (item: LayoutItem) => {
        const { occ, col, totalCols } = item;
        const startMins = timeToMinutes(occ.actualStartTime);
        const top = (startMins - START_HOUR * 60) * (HOUR_HEIGHT / 60);
        const height = Math.max(occ.actualDuration * (HOUR_HEIGHT / 60), 22);
        const blockWidth = (dayColWidth / totalCols) - 4;
        const left = col * (dayColWidth / totalCols) + 2;
        const color = getClassColor(occ.fallbackClassName);
        const endTime = addMinutes(occ.actualStartTime, occ.actualDuration);
        const showEndTime = blockWidth >= 75;

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
                        {showEndTime ? ` - ${endTime}` : ''}
                        {(showEndTime || height < 44) && occ.isCancelled ? ' ✕' : ''}
                    </Text>
                )}
                {!showEndTime && height >= 44 && (
                    <Text style={styles.occTime}>
                        {endTime}{occ.isCancelled ? ' ✕' : ''}
                    </Text>
                )}
            </Pressable>
        );
    };

    const renderDayColumn = (date: Date) => {
        const dateStr = toDateStr(date);
        const dayOccs = occsByDate.get(dateStr) ?? [];
        const layout = computeLayout(dayOccs);

        return (
            <View
                key={dateStr}
                style={[styles.dayCol, { borderLeftColor: themeColors.border }]}
                onLayout={handleDayColLayout}
            >
                {HOURS.map(h => (
                    <View
                        key={h}
                        style={[styles.hourLine, { top: (h - START_HOUR) * HOUR_HEIGHT, backgroundColor: themeColors.border }]}
                    />
                ))}
                {layout.map(item => renderOccurrenceBlock(item))}
            </View>
        );
    };

    const dayViewDate = selectedDay ? parseDateStr(selectedDay) : new Date();
    const dayViewDateStr = selectedDay ?? todayStr;

    const renderDayHeaderRow = () => (
        <View style={[styles.dayHeaderRow, { borderTopColor: themeColors.border, borderBottomColor: themeColors.border, backgroundColor: themeColors.background }]}>
            <View style={{ width: timeGutter }} />
            {weekDates.map((date, i) => {
                const isToday = toDateStr(date) === todayStr;
                return (
                    <View
                        key={i}
                        style={[styles.dayHeader, { borderLeftColor: themeColors.border }]}
                    >
                        <Text style={[styles.dayName, { color: themeColors.textMuted }]}>
                            {dayNames[i]}
                        </Text>
                        <View style={[
                            styles.todayPill,
                            isToday && {
                                width: todayPillSize,
                                height: todayPillSize,
                                borderRadius: todayPillSize / 2,
                                backgroundColor: TOGGLE_COLOR,
                            },
                        ]}>
                            <Text style={[styles.dayDate, { color: isToday ? '#fff' : themeColors.textMuted }]}>
                                {formatMonthDay(date)}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );

    const filterControl = filterClassName !== null ? (
        <Pressable style={styles.filterPill} onPress={onClearFilter}>
            <Text style={styles.filterPillText} numberOfLines={1}>{filterClassName}</Text>
            <Text style={styles.filterPillClear}>✕</Text>
        </Pressable>
    ) : (
        <View style={styles.filterPill}>
            <Text style={styles.filterPillText}>All classes ▾</Text>
        </View>
    );

    const rangeAndTz = (
        <>
            <Text style={[styles.rangeText, { color: themeColors.text }]}>
                {viewMode === 'day' ? formatDayLabel(dayViewDateStr) : formatWeekRange(weekStartDate)}
            </Text>
            {schoolTimezone && (
                <Text style={[styles.tzText, { color: themeColors.textMuted }]}> · {schoolTimezone}</Text>
            )}
        </>
    );

    return (
        <View style={styles.container}>
            {isMobile ? (
                <>
                    {/* Compact mobile nav: arrows flank a centered range/day label with tz as a sub-line */}
                    <View style={styles.mobileNavRow}>
                        <Pressable
                            style={[styles.navButton, { borderColor: themeColors.border }]}
                            onPress={viewMode === 'day' ? onPrevDay : onPrevWeek}
                        >
                            <Text style={[styles.navText, { color: themeColors.text }]}>{'←'}</Text>
                        </Pressable>
                        <View style={styles.mobileNavCenter}>
                            <Text style={[styles.rangeText, { color: themeColors.text }]}>
                                {viewMode === 'day' ? formatDayLabel(dayViewDateStr) : formatWeekRange(weekStartDate)}
                            </Text>
                            {schoolTimezone && (
                                <Text style={[styles.tzSubline, { color: themeColors.textMuted }]}>{schoolTimezone}</Text>
                            )}
                        </View>
                        <Pressable
                            style={[styles.navButton, { borderColor: themeColors.border }]}
                            onPress={viewMode === 'day' ? onNextDay : onNextWeek}
                        >
                            <Text style={[styles.navText, { color: themeColors.text }]}>{'→'}</Text>
                        </Pressable>
                    </View>
                    <View style={styles.mobileFilterRow}>
                        {filterControl}
                    </View>
                </>
            ) : (
                <View style={styles.chromeRow}>
                    <Pressable
                        style={[styles.navButton, { borderColor: themeColors.border }]}
                        onPress={viewMode === 'day' ? onPrevDay : onPrevWeek}
                    >
                        <Text style={[styles.navText, { color: themeColors.text }]}>{'←'}</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.navButton, { borderColor: themeColors.border }]}
                        onPress={viewMode === 'day' ? onNextDay : onNextWeek}
                    >
                        <Text style={[styles.navText, { color: themeColors.text }]}>{'→'}</Text>
                    </Pressable>
                    <Pressable style={styles.todayButton} onPress={onToday}>
                        <Text style={styles.navText}>{viewMode === 'day' ? 'Today' : 'This week'}</Text>
                    </Pressable>
                    <View style={styles.chromeRangeGroup}>
                        {rangeAndTz}
                    </View>
                    <View style={styles.chromeSpacer} />
                    {filterControl}
                </View>
            )}

            {/* Day name header — week mode only, structurally identical (fixed gutter + flex:1 cells)
                to the grid body row below so their column edges are guaranteed to match.
                On web it's merged into the ScrollView as a sticky first child, since that's what
                fixes the header/body misalignment there (both then resolve against the exact same
                scroll-content width, sidestepping any scrollbar-reserved width on the outer row).
                On native there's no scrollbar to misalign against, and RN's stickyHeaderIndices
                wrapper doesn't stretch a flex:1 row to the scroll width — it collapses each column
                into a stacked block — so native keeps the header as a plain sibling above the
                ScrollView instead, which is already effectively "sticky" since it never scrolls. */}
            {viewMode === 'week' && Platform.OS !== 'web' && renderDayHeaderRow()}
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={true}
                stickyHeaderIndices={viewMode === 'week' && Platform.OS === 'web' ? [0] : undefined}
            >
                {viewMode === 'week' && Platform.OS === 'web' && renderDayHeaderRow()}

                <View style={styles.gridRow}>
                    {/* Time labels */}
                    <View style={{ width: timeGutter, height: GRID_HEIGHT }}>
                        {HOURS.map(h => (
                            <View
                                key={h}
                                style={[
                                    styles.timeLabel,
                                    {
                                        // Every label but the first straddles its gridline (centered via a -8
                                        // upward shift); the first sits flush at the top so the grid can start
                                        // immediately below the header with no gap, without clipping the label.
                                        top: h === START_HOUR ? 0 : (h - START_HOUR) * HOUR_HEIGHT - 8,
                                        width: timeGutter - 4,
                                    },
                                ]}
                            >
                                <Text style={[styles.timeLabelText, { color: themeColors.textMuted }]}>
                                    {formatHourLabel(h, isMobile)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Day columns */}
                    <View style={styles.dayColsRow}>
                        {viewMode === 'day'
                            ? renderDayColumn(dayViewDate)
                            : weekDates.map(date => renderDayColumn(date))
                        }
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
    chromeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 8,
    },
    chromeRangeGroup: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginLeft: 8,
    },
    chromeSpacer: {
        flex: 1,
    },
    mobileNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        paddingHorizontal: 12,
    },
    mobileNavCenter: {
        flex: 1,
        alignItems: 'center',
    },
    mobileFilterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 12,
        paddingBottom: 6,
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
        backgroundColor: TOGGLE_COLOR,
    },
    navText: {
        fontSize: 13,
    },
    rangeText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    tzText: {
        fontSize: 12,
    },
    tzSubline: {
        fontSize: 11,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: TOGGLE_COLOR,
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        gap: 8,
        maxWidth: 220,
    },
    filterPillText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    filterPillClear: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    dayHeaderRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingTop: 10,
        paddingBottom: 8,
    },
    dayHeader: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
        borderLeftWidth: 1,
    },
    dayName: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    todayPill: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    dayDate: {
        fontSize: 13,
        fontWeight: '600',
    },
    gridRow: {
        flexDirection: 'row',
    },
    dayColsRow: {
        flex: 1,
        flexDirection: 'row',
        height: GRID_HEIGHT,
    },
    dayCol: {
        flex: 1,
        height: GRID_HEIGHT,
        position: 'relative',
        borderLeftWidth: 1,
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
