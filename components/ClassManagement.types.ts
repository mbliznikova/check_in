export type ClassType = {
    id: number;
    name: string;
    durationMinutes: number;
    isRecurring: boolean;
};

export type PriceItem = {
    className: string;
    amount: number;
    priceId: number;
};

export type PriceMap = Map<number, PriceItem>;

export type ScheduleType = {
    id: number;
    classTime: string;
    classModel: number;
    day: number;
};

export type ClassOccurrenceType = {
    id: number;
    classId: number | null;
    fallbackClassName: string;
    scheduleId: number | null;
    plannedDate: string;
    actualDate: string;
    plannedStartTime: string;
    actualStartTime: string;
    plannedDuration: string;
    actualDuration: number;
    isCancelled: boolean;
    notes: string;
};

export type SelectedClassState = {
    id: number | null;
    name: string;
    duration: number;
    isRecurring: boolean;
    price: number;
    priceId: number | null;
};
