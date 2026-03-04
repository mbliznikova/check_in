// Shared payment type used by Payments.tsx and Attendance.tsx
export type PaymentType = {
    id: number;
    studentId: number;
    classId: number;
    studentName: string;
    className: string;
    amount: number;
    paymentDate: string;
};
