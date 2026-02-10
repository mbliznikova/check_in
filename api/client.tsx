import { useAuth } from '@clerk/clerk-expo';

const API_BASE_URL = "http://192.168.1.230:8000/backend";

let currentSchoolId: number | null = null;

let resolveSchoolReady: (() => void) | null = null;
const schoolReady = new Promise<void>((resolve) => {
    resolveSchoolReady = resolve;
});

export function setHeaderSchoolId(schoolId: number | null) {
    currentSchoolId = schoolId;

    if (schoolId !== null && resolveSchoolReady) {
        resolveSchoolReady();
        resolveSchoolReady = null;
    }
}

export function useApi() {
    const { getToken } = useAuth();

    async function apiFetch(
        endpoint: string,
        options: RequestInit = {}) {
            if (endpoint !== "/me/") {
                await schoolReady;
            }

            const token = await getToken({ template: "backend" });

            if (currentSchoolId == null) {
                console.warn("apiFetch called without school id");
            }

            const headers: HeadersInit = {
                ...(options.headers || {}),
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(currentSchoolId != null
                    ? {"X-School-ID": String(currentSchoolId)}
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