import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useApi } from '@/api/client';
import { fetchCurrentUser } from '@/api/currentUser';
import { setHeaderSchoolId } from '@/api/client';

type MembershipType = { schoolId: number; role: string; schoolName: string };

type UserContextType = {
    role: string | null;
    schoolId: number | null;
    memberships: MembershipType[];
    isLoading: boolean;
    error: string | null;
    switchSchool: (schoolId: number) => void;
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({children}: {children: ReactNode}) {
    const [role, setRole] = useState<string | null>(null);
    const [schoolId, setSchoolId] = useState<number | null>(null);
    const [memberships, setMemberships] = useState<MembershipType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const {isSignedIn} = useAuth();
    const {apiFetch} = useApi();

    const switchSchool = (id: number) => {
        const membership = memberships.find(m => m.schoolId === id);
        if (!membership) {
            console.warn(`switchSchool: no membership found for schoolId ${id}`);
            return;
        }
        setHeaderSchoolId(id);
        setSchoolId(id);
        setRole(membership.role);
    };

    useEffect(() => {
        if (!isSignedIn) {
            setRole(null);
            setSchoolId(null);
            setMemberships([]);
            setHeaderSchoolId(null);
            setIsLoading(false);
            return;
        }

        const loadUserInfo = async () => {
            const userInfo = await fetchCurrentUser(apiFetch);

            if (userInfo) {
                setRole(userInfo.role);
                setSchoolId(userInfo.schoolId);
                setMemberships(userInfo.memberships);
                setHeaderSchoolId(userInfo.schoolId);
            } else {
                setError('Failed to load user info');
            }
            setIsLoading(false);
        };

        loadUserInfo();
    },
        [isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <UserContext.Provider value={{role, schoolId, memberships, isLoading, error, switchSchool}}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserRole = () => {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error("useUserRole must be used inside UserProvider");
    }
    return ctx;
};
