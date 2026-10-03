import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useApi, configureSchoolId, resetSchoolReady, rejectSchoolReady } from '@/api/client';
import { fetchCurrentUser, provisionUser } from '@/api/currentUser';

type MembershipType = { schoolId: number; role: string; schoolName: string };

type UserContextType = {
    role: string | null;
    schoolId: number | null;
    memberships: MembershipType[];
    isLoading: boolean;
    error: string | null;
    switchSchool: (schoolId: number) => void;
    reloadUser: () => void;
    retrySetup: () => void;
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
        configureSchoolId(id);
        setSchoolId(id);
        setRole(membership.role);
    };

    // The everyday read: GET /me/. Used for in-app refreshes (switch school)
    // where the user is already known to exist.
    const loadUserInfo = async () => {
        resetSchoolReady();
        const userInfo = await fetchCurrentUser(apiFetch);

        if (userInfo) {
            setRole(userInfo.role);
            setSchoolId(userInfo.schoolId);
            setMemberships(userInfo.memberships);
            configureSchoolId(userInfo.schoolId);
        } else {
            setError('Failed to load user info');
            rejectSchoolReady('fetchCurrentUser failed');
        }
        setIsLoading(false);
    };

    // The chokepoint: ensure the backend user exists (POST /me/provision/),
    // then do the everyday read. Runs on sign-in, on relaunch with a
    // persisted session, and as the Retry action after a failure here —
    // never on a routine in-app refresh.
    const initUserSession = async () => {
        setIsLoading(true);
        setError(null);

        const provisionResult = await provisionUser(apiFetch);

        if (provisionResult === 'email_conflict') {
            setError("An account already exists with this email, but it isn't verified yet. Verify your email, then tap Retry.");
            rejectSchoolReady('email conflict');
            setIsLoading(false);
            return;
        }

        if (provisionResult === 'error') {
            setError("We couldn't set up your account. Check your connection and try again.");
            rejectSchoolReady('provisioning failed');
            setIsLoading(false);
            return;
        }

        await loadUserInfo();
    };

    const reloadUser = () => {
        setIsLoading(true);
        setError(null);
        loadUserInfo();
    };

    useEffect(() => {
        if (isSignedIn === undefined) return;

        if (!isSignedIn) {
            setRole(null);
            setSchoolId(null);
            setMemberships([]);
            setError(null);
            configureSchoolId(null);
            setIsLoading(false);
            return;
        }

        initUserSession();
    },
        [isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <UserContext.Provider value={{role, schoolId, memberships, isLoading, error, switchSchool, reloadUser, retrySetup: initUserSession}}>
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
