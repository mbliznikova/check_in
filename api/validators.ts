// Shared validation functions for API responses

export function isValidArrayResponse(responseData: any, key: string): boolean {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        key in responseData &&
        Array.isArray(responseData[key])
    );
}

export function isValidObjectResponse(responseData: any, key: string): boolean {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        key in responseData
    );
}

export function isSuccessMessageResponse(responseData: any, expectedMessage: string): boolean {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData &&
        responseData.message === expectedMessage
    );
}

export function isValidEditResponse(responseData: any, message: string, id: number, name: string): boolean {
    return (
        isSuccessMessageResponse(responseData, message) &&
        hasId(responseData, id) &&
        hasName(responseData, name)
    );
}

export function isValidDeleteResponse(responseData: any, message: string, id: number): boolean {
    return (
        isSuccessMessageResponse(responseData, message) &&
        hasId(responseData, id)
    );
}

function hasId(responseData: any, id: number): boolean {
    return typeof responseData === 'object' && responseData !== null && 'id' in responseData && responseData.id === id;
}

function hasName(responseData: any, name: string): boolean {
    return typeof responseData === 'object' && responseData !== null && 'name' in responseData && responseData.name === name;
}

export function isValidCreateSchoolResponse(responseData: any, name: string): boolean {
    return (
        isSuccessMessageResponse(responseData, 'School was created successfully') &&
        'id' in responseData &&
        hasName(responseData, name)
    );
}

export function isValidDeleteSchoolResponse(responseData: any, schoolId: number, schoolName: string): boolean {
    return (
        isSuccessMessageResponse(responseData, `School ${schoolName} was deleted successfully`) &&
        'schoolId' in responseData && responseData.schoolId === schoolId
    );
}

export function isValidMembersResponse(data: any): boolean {
    return typeof data === 'object' && data !== null && Array.isArray(data.members);
}

export function isValidChangeRoleResponse(data: any, memberId: number, newRole: string): boolean {
    return (
        typeof data === 'object' && data !== null &&
        'membershipId' in data && data.membershipId === memberId &&
        'role' in data && data.role === newRole
    );
}

export function isValidDeleteMemberResponse(data: any, memberId: number): boolean {
    return (
        typeof data === 'object' && data !== null &&
        'membershipId' in data && data.membershipId === memberId
    );
}
