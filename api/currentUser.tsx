import { useApi } from "@/api/client";

const isValidCurrentUserResponse = (responseData: any): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'role' in responseData
    );
}

export const fetchCurrentUser = async (apiFetch: any) => {
    try {
        const response = await apiFetch("/me/", { method: "GET" });

        if (response.ok) {
            const responseData = await response.json();
            if (isValidCurrentUserResponse(responseData)) {
                const userRole: string = responseData.role;
                return userRole;
            }

            console.warn(
                'Function fetchCurrentUser. The response from backend is NOT valid! ' +
                JSON.stringify(responseData)
            );
            return null;
        }

        console.warn(
            "Function fetchCurrentUser. Request was unsuccessful: ",
            response.status, response.statusText
        );
        return null;

    } catch(err) {
        console.error("Error while fetching the current user: ", err);
        return null;
    }
};
