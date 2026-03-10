// Used in check-in flow: School.tsx, StudentList.tsx, Payments.tsx
export type StudentType = {
    id: number;
    firstName: string;
    lastName: string;
    classes?: Set<number>;
    occurrences?: Set<number>;
};

// Used in StudentManagement.tsx (full student data including liability/emergency info)
export type StudentManagementType = {
    id: number;
    firstName: string;
    lastName: string;
    isLiabilityFormSent: boolean;
    emergencyContacts: string;
};
