// Shared attendance types used by ConfirmationList, ConfirmationDetails, and Attendance
export type AttendanceStudentType = {
    firstName: string;
    lastName: string;
    isShowedUp: boolean;
};

export type AttendanceClassType = {
    name: string;
    time: string;
    class_id?: string;
    students: {
        [studentId: string]: AttendanceStudentType;
    };
};

export type AttendanceType = {
    date: string;
    occurrences: {
        [occurrenceId: string]: AttendanceClassType;
    };
};

export type StudentAttendanceDetailsType = {
    firstName: string;
    lastName: string;
    classesInfo: Map<number, Map<string, [number, number]>>;
};
