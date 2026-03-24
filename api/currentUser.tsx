import type { ApiFetch } from "@/api/client";

type MembershipType = { schoolId: number; role: string; schoolName: string };

const isValidCurrentUserResponse = (responseData: any): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        Array.isArray(responseData.memberships) &&
        responseData.memberships.length > 0 &&
        typeof responseData.memberships[0].schoolId === "number" &&
        typeof responseData.memberships[0].role === "string" &&
        typeof responseData.memberships[0].schoolName === "string"
    );
}

export const fetchCurrentUser = async (apiFetch: ApiFetch) => {
    try {
        const response = await apiFetch("/me/", { method: "GET" });

        if (response.ok) {
            const responseData = await response.json();

            if (isValidCurrentUserResponse(responseData)) {
                return {
                    role: responseData.memberships[0].role,
                    schoolId: responseData.memberships[0].schoolId,
                    memberships: responseData.memberships as MembershipType[],
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
