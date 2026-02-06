import { useApi } from "@/api/client";

const isValidCurrentUserResponse = (responseData: any): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        Array.isArray(responseData.memberships) &&
        responseData.memberships.length > 0 &&
        // TODO: handle case when there are more than 1 membership
        typeof responseData.memberships[0].schoolId === "number" &&
        typeof responseData.memberships[0].role === "string"
    );
}

export const fetchCurrentUser = async (apiFetch: any) => {
    try {
        const response = await apiFetch("/me/", { method: "GET" });

        if (response.ok) {
            const responseData = await response.json();

            if (isValidCurrentUserResponse(responseData)) {
                return {
                    role: responseData.memberships[0].role,
                    schoolId: responseData.memberships[0].schoolId,
                }
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
