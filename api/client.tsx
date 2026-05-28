import { useAuth } from '@clerk/clerk-expo';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");

let currentSchoolId: number | null = null;

let resolveSchoolReady: (() => void) | null = null;
const schoolReady = new Promise<void>((resolve) => {
    resolveSchoolReady = resolve;
});

export function configureSchoolId(schoolId: number | null) {
    currentSchoolId = schoolId;

    if (schoolId !== null && resolveSchoolReady) {
        resolveSchoolReady();
        resolveSchoolReady = null;
    }
}

export type ApiFetch = (endpoint: string, options?: RequestInit, schoolIdOverride?: number) => Promise<Response>;

export function useApi() {
    const { getToken } = useAuth();

    async function apiFetch(
        endpoint: string,
        options: RequestInit = {},
        schoolIdOverride?: number) {
            const skipSchoolReady = endpoint === "/me/" || endpoint.startsWith("/invitations/");

            if (!skipSchoolReady) {
                await schoolReady;
            }

            const token = await getToken({ template: "backend" });

            const effectiveSchoolId = schoolIdOverride ?? currentSchoolId;

            if (effectiveSchoolId === null && !skipSchoolReady) {
                console.warn("apiFetch called without school id");
            }

            const headers: HeadersInit = {
                ...(options.headers || {}),
                "Content-Type": "application/json",
                "Accept": "application/json",
                Authorization: `Bearer ${token}`,
                ...(effectiveSchoolId !== null
                    ? {"X-School-ID": String(effectiveSchoolId)}
                    : {}),
            };

            const url = `${API_BASE_URL}${endpoint}`

            return fetch(url,{
                ...options,
                headers
        });
    }

    return { apiFetch };
}