import { useAuth } from '@clerk/clerk-expo';

const API_BASE_URL = "http://192.168.1.230:8000/backend";

export function useApi() {
    const { getToken } = useAuth();

    async function apiFetch(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<Response> {
        const token = await getToken({ template: "backend" });

        const headers: HeadersInit = {
            ...(options.headers || {}),
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        const url = `${API_BASE_URL}${endpoint}`

        return fetch(url,{
            ...options,
            headers
        });
    }

    return { apiFetch };
}