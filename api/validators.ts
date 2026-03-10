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
