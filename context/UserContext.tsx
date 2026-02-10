import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useApi } from '@/api/client';
import { fetchCurrentUser } from '@/api/currentUser';
import { setHeaderSchoolId } from '@/api/client';

type UserContextType = {
    role: string | null;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({children}: {children: ReactNode}) {
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const {isSignedIn} = useAuth();
    const {apiFetch} = useApi();

    useEffect(() => {
        if (!isSignedIn) {
            setRole(null);
            setHeaderSchoolId(null);
            setIsLoading(false);
            return;
        }

        const loadUserInfo = async () => {
            const userInfo = await fetchCurrentUser(apiFetch);

            if (userInfo){
                setRole(userInfo.role);
                setHeaderSchoolId(userInfo.schoolId)
            }
            setIsLoading(false);
        };

        loadUserInfo();
    },
        [isSignedIn, apiFetch]);

    return (
        <UserContext.Provider value={{role, isLoading}}>
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
