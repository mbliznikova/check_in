import type { ApiFetch } from "@/api/client";

type MembershipType = { schoolId: number; role: string; schoolName: string };

const isValidCurrentUserResponse = (responseData: any): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        Array.isArray(responseData.memberships) &&
        (
            responseData.memberships.length === 0 ||
            (
                typeof responseData.memberships[0].schoolId === "number" &&
                typeof responseData.memberships[0].role === "string" &&
                typeof responseData.memberships[0].schoolName === "string"
            )
        )
    );
}

export const fetchCurrentUser = async (apiFetch: ApiFetch) => {
    try {
        const response = await apiFetch("/me/", { method: "GET" });

        if (response.ok) {
            const responseData = await response.json();

            if (isValidCurrentUserResponse(responseData)) {
                const memberships = responseData.memberships as MembershipType[];
                return {
                    role: memberships.length > 0 ? memberships[0].role : null,
                    schoolId: memberships.length > 0 ? memberships[0].schoolId : null,
                    memberships,
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

export type ProvisionResult = 'ok' | 'email_conflict' | 'error';

export const provisionUser = async (apiFetch: ApiFetch): Promise<ProvisionResult> => {
    try {
        const response = await apiFetch("/me/provision/", { method: "POST" });

        if (response.ok) {
            return 'ok';
        }

        if (response.status === 409) {
            return 'email_conflict';
        }

        console.warn(
            "Function provisionUser. Request was unsuccessful: ",
            response.status, response.statusText
        );
        return 'error';

    } catch (err) {
        console.error("Error while provisioning the user: ", err);
        return 'error';
    }
};

export type DeleteAccountResult = 'ok' | 'error';

export const deleteAccount = async (apiFetch: ApiFetch): Promise<DeleteAccountResult> => {
    try {
        const response = await apiFetch("/me/delete/", { method: "DELETE" });

        if (response.ok || response.status === 502) {
            return 'ok';
        }

        console.warn(
            "Function deleteAccount. Request was unsuccessful: ",
            response.status, response.statusText
        );
        return 'error';

    } catch (err) {
        console.error("Error while deleting the account: ", err);
        return 'error';
    }
};
