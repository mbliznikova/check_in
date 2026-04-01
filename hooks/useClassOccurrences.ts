import { useState, useEffect } from "react";
import { useApi } from "@/api/client";
import { isValidArrayResponse } from "@/api/validators";
import { ClassOccurrenceType } from "@/types/class";

const isValidCreateOccurrenceResponse = (
    responseData: any,
    className: string,
    plannedDate: string,
    plannedStartTime: string,
    plannedDuration: number = 60,
    classId?: number,
    notes?: string,
): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Class occurrence was created successfully' &&
        'occurrenceId' in responseData &&
        'fallbackClassName' in responseData && responseData.fallbackClassName === className &&
        'plannedDate' in responseData && responseData.plannedDate === plannedDate &&
        'plannedStartTime' in responseData && responseData.plannedStartTime.slice(0, 5) === plannedStartTime &&
        'plannedDuration' in responseData && responseData.plannedDuration === plannedDuration &&
        (classId === undefined || ('classId' in responseData && responseData.classId === classId)) &&
        ((responseData.notes || '') === (notes || ''))
    );
};

const isValidDeleteOccurrenceResponse = (responseData: any, occurrenceId: number, className: string, date: string, time: string): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === `Occurrence for ${className} at ${date} ${time} was deleted successfully` &&
        'occurrenceId' in responseData && responseData.occurrenceId === occurrenceId
    );
};

const isValidEditOccurrenceResponse = (
    responseData: any,
    occurrenceId: number,
    actualDate?: string,
    actualStartTime?: string,
    actualDuration?: number,
    isCancelled?: boolean,
    notes?: string,
): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Class Occurrence was updated successfully' &&
        'id' in responseData && responseData.id === occurrenceId &&
        (actualDate === undefined || ('actualDate' in responseData && responseData.actualDate === actualDate)) &&
        (actualStartTime === undefined || ('actualStartTime' in responseData && responseData.actualStartTime.slice(0, 5) === actualStartTime)) &&
        (actualDuration === undefined || ('actualDuration' in responseData && responseData.actualDuration === actualDuration)) &&
        (isCancelled === undefined || ('isCancelled' in responseData && responseData.isCancelled === isCancelled)) &&
        (notes === undefined || ('notes' in responseData && responseData.notes === notes))
    );
};

const isValidAvailableTimeIntervalsResponse = (responseData: any): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Available time intervals for class occurrence' &&
        'availableIntervals' in responseData && Array.isArray(responseData.availableIntervals)
    );
};

export function useClassOccurrences() {
    const { apiFetch } = useApi();

    const [allOccurrencesMap, setAllOccurrencesMap] = useState<Map<number, ClassOccurrenceType>>(new Map());
    const [occurrencesSet, setOccurrencesSet] = useState<Set<string>>(new Set());
    const [currentClassOccurrenceMap, setCurrentClassOccurrenceMap] = useState<Map<string, [number, string][]>>(new Map());
    const [occurrenceModal, setOccurrenceModal] = useState({ isVisible: false, isCreateSuccess: false, isEditSuccess: false });

    useEffect(() => {
        fetchAllClassOccurrences();
    }, []);

    useEffect(() => {
        const occurrencesSetTemp: Set<string> = new Set();
        allOccurrencesMap.forEach((occurrence) => {
            occurrencesSetTemp.add(`${occurrence.actualDate}-${occurrence.actualStartTime.slice(0, 5)}`);
        });
        setOccurrencesSet(occurrencesSetTemp);
    }, [allOccurrencesMap]);

    const fetchAllClassOccurrences = async () => {
        try {
            const response = await apiFetch("/class_occurrences/", { method: "GET" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchAllClassOccurrences. The response from backend is valid.`);
                    const classOccurrences: ClassOccurrenceType[] = responseData.response;
                    const occurrencesMap = new Map<number, ClassOccurrenceType>();
                    classOccurrences.forEach((occ) => { occurrencesMap.set(occ.id, occ); });
                    setAllOccurrencesMap(occurrencesMap);
                }
            } else {
                console.warn(`Function fetchAllClassOccurrences. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while fetching all class occurrences data from the server: ${error}`);
        }
    };

    const fetchClassOccurrences = async (classId: number) => {
        try {
            const response = await apiFetch(`/class_occurrences/?class_id=${classId}`, { method: "GET" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchClassOccurrences. The response from backend is valid.`);
                    const occurrences = responseData.response;
                    const occurrencesMap: Map<string, [number, string][]> = new Map();
                    occurrences.forEach((element: ClassOccurrenceType) => {
                        if (occurrencesMap.has(element.actualDate)) {
                            occurrencesMap.get(element.actualDate)?.push([element.id, element.actualStartTime]);
                        } else {
                            occurrencesMap.set(element.actualDate, [[element.id, element.actualStartTime]]);
                        }
                    });
                    setCurrentClassOccurrenceMap(occurrencesMap);
                } else {
                    console.warn(`Function fetchClassOccurrences. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function fetchClassOccurrences. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while fetching occurrence data from the server for a class: ${error}`);
        }
    };

    const addOccurrenceToUniqueness = (date: string, time: string) => {
        setOccurrencesSet(prev => {
            const newSet = new Set(prev);
            newSet.add(`${date}-${time.slice(0, 5)}`);
            console.log(`Added ${date}-${time.slice(0, 5)} to occurrence uniqueness`);
            return newSet;
        });
    };

    const removeOccurrenceFromUniqueness = (date: string, time: string) => {
        setOccurrencesSet(prev => {
            const newSet = new Set(prev);
            newSet.delete(`${date}-${time.slice(0, 5)}`);
            console.log(`Removed ${date}-${time.slice(0, 5)} from occurrence uniqueness`);
            return newSet;
        });
    };

    const addOccurrenceToState = (
        occurrenceId: number,
        className: string,
        plannedDate: string,
        plannedTime: string,
        duration: number = 60,
        classId?: number,
        scheduleId?: number,
        notes?: string,
    ) => {
        console.log(`Adding class occurrence with id ${occurrenceId} for: date ${plannedDate}, time ${plannedTime}`);

        setCurrentClassOccurrenceMap(prev => {
            const updated = new Map(prev);
            const dayOccurrences = updated.get(plannedDate);
            if (!dayOccurrences) {
                updated.set(plannedDate, [[occurrenceId, plannedTime]]);
            } else {
                updated.get(plannedDate)?.push([occurrenceId, plannedTime]);
            }
            console.log(`Occurrence data with added occurrence: ${updated}`);
            return updated;
        });

        console.log(`Adding occurrence ${occurrenceId} to allOccurrencesMap`);
        const newOccurrence: ClassOccurrenceType = {
            id: occurrenceId,
            classId: classId ?? null,
            fallbackClassName: className,
            scheduleId: scheduleId ?? null,
            plannedDate,
            plannedStartTime: plannedTime,
            actualDate: plannedDate,
            actualStartTime: plannedTime,
            plannedDuration: duration.toString(),
            actualDuration: duration,
            isCancelled: false,
            notes: notes ?? '',
        };
        setAllOccurrencesMap(prev => {
            const tmpMap = new Map(prev);
            tmpMap.set(occurrenceId, newOccurrence);
            return tmpMap;
        });
    };

    const removeOccurrenceFromState = (targetOccurrenceId: number, plannedDate: string) => {
        console.log(`Removing class occurrence with id ${targetOccurrenceId} from date ${plannedDate}`);
        setCurrentClassOccurrenceMap(prev => {
            const currentOccurrences = prev.get(plannedDate);
            console.log(`Current Occurrence data is: ${currentOccurrences}`);
            if (!currentOccurrences) {
                console.log(`No such date ${plannedDate} in currentClassOccurrenceMap`);
                return prev;
            }
            const updatedOccurrences = currentOccurrences.filter(([id]) => id !== targetOccurrenceId);
            console.log(`Updated occurrences are ${updatedOccurrences}`);
            const updatedMap = new Map(prev);
            if (updatedOccurrences.length === 0) {
                console.log(`No class occurrences for ${plannedDate}`);
                updatedMap.delete(plannedDate);
            } else {
                updatedMap.set(plannedDate, updatedOccurrences);
            }
            return updatedMap;
        });
    };

    const createClassOccurrence = async (
        className: string,
        plannedDate: string,
        plannedTime: string,
        duration: number = 60,
        classId?: number,
        scheduleId?: number,
        notes?: string,
    ) => {
        const data = {
            fallbackClassName: className,
            plannedDate,
            plannedStartTime: plannedTime,
            plannedDuration: duration,
            classModel: classId,
            schedule: scheduleId,
            notes,
        };
        try {
            const response = await apiFetch("/class_occurrences/", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw Error(`Function createClassOccurrence. Request was unsuccessful: ${response.status}, ${response.statusText}`);
            }
            console.log('Class occurrence was created successfully!');
            const responseData = await response.json();
            if (isValidCreateOccurrenceResponse(responseData, className, plannedDate, plannedTime, duration, classId, notes)) {
                console.log(`Function createClassOccurrence. The response from backend is valid.`);
            } else {
                console.log(`Function createClassOccurrence. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
            }
            const occurrenceId = responseData.occurrenceId;
            setOccurrenceModal(prev => ({ ...prev, isCreateSuccess: true }));
            addOccurrenceToState(occurrenceId, className, plannedDate, plannedTime, duration, classId, scheduleId, notes);
            addOccurrenceToUniqueness(plannedDate, plannedTime);
        } catch (error) {
            console.error(`Error while sending the data to the server when creating class occurrence: ${error}`);
        }
    };

    const deleteClassOccurrence = async (occurrenceId: number, className: string, date: string, time: string) => {
        try {
            const response = await apiFetch(`/class_occurrences/${occurrenceId}/delete/`, { method: "DELETE" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidDeleteOccurrenceResponse(responseData, occurrenceId, className, date, time)) {
                    console.log(`Function deleteClassOccurrence. The response from backend is valid.`);
                    removeOccurrenceFromState(occurrenceId, date);
                    removeOccurrenceFromUniqueness(date, time);
                } else {
                    console.warn(`Function deleteClassOccurrence. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function deleteClassOccurrence. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while deleting the class occurrence: ${error}`);
        }
    };

    const fetchAvailableTimeIntervalsOccurrence = async (date: string, classDurationToFit: number): Promise<string[]> => {
        let intervals: string[] = [];
        try {
            const response = await apiFetch(`/available_occurrence_time/?date=${date}&duration=${classDurationToFit}`, { method: "GET" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidAvailableTimeIntervalsResponse(responseData)) {
                    console.log(`Function fetchAvailableTimeIntervalsOccurrence. The response from backend is valid.`);
                    intervals = responseData.availableIntervals ?? [];
                } else {
                    console.warn(`Function fetchAvailableTimeIntervalsOccurrence. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function fetchAvailableTimeIntervalsOccurrence. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while fetching available time intervals for class occurrence: ${error}`);
        }
        return intervals;
    };

    const editClassOccurrence = async (
        occurrenceId: number,
        actualDate?: string,
        actualStartTime?: string,
        actualDuration?: number,
        isCancelled?: boolean,
        notes?: string,
    ) => {
        const data: Record<string, unknown> = {};
        if (actualDate !== undefined) data.actualDate = actualDate;
        if (actualStartTime !== undefined) data.actualStartTime = actualStartTime;
        if (actualDuration !== undefined) data.actualDuration = actualDuration;
        if (isCancelled !== undefined) data.isCancelled = isCancelled;
        if (notes !== undefined) data.notes = notes;

        if (Object.keys(data).length === 0) {
            console.warn("Function editClassOccurrence. Nothing to edit provided");
            return;
        }

        try {
            const response = await apiFetch(`/class_occurrences/${occurrenceId}/edit/`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidEditOccurrenceResponse(responseData, occurrenceId, actualDate, actualStartTime, actualDuration, isCancelled, notes)) {
                    console.log(`Function editClassOccurrence. The response from backend is valid.`);

                    // Read old state from closure before any setState calls
                    const targetOccurrence = allOccurrencesMap.get(occurrenceId);
                    if (!targetOccurrence) {
                        console.warn(`No occurrence with id ${occurrenceId} was found`);
                        return;
                    }

                    const oldActualDate = targetOccurrence.actualDate;
                    const oldActualStartTime = targetOccurrence.actualStartTime;
                    const newActualDate = actualDate ?? oldActualDate;
                    const newActualStartTime = actualStartTime ?? oldActualStartTime;

                    // Update allOccurrencesMap
                    const updates: Partial<ClassOccurrenceType> = {};
                    if (actualDate !== undefined) updates.actualDate = actualDate;
                    if (actualStartTime !== undefined) updates.actualStartTime = actualStartTime;
                    if (actualDuration !== undefined) updates.actualDuration = actualDuration;
                    if (isCancelled !== undefined) updates.isCancelled = isCancelled;
                    if (notes !== undefined) updates.notes = notes;
                    const updatedOccurrence = { ...targetOccurrence, ...updates };

                    setAllOccurrencesMap(prev => {
                        const tmpMap = new Map(prev);
                        tmpMap.set(occurrenceId, updatedOccurrence);
                        return tmpMap;
                    });

                    // Update currentClassOccurrenceMap if date or time changed
                    if (actualDate || actualStartTime) {
                        if (!(oldActualDate === newActualDate && oldActualStartTime === newActualStartTime)) {
                            console.log(`Editing class occurrence with id ${occurrenceId}, at date ${newActualDate} and time ${newActualStartTime}`);
                            setCurrentClassOccurrenceMap(prev => {
                                const oldDateArray = prev.get(oldActualDate);
                                if (!oldDateArray) {
                                    console.log(`No data in currentClassOccurrenceMap for date ${oldActualDate}`);
                                    return prev;
                                }
                                const tmpMap = new Map(prev);
                                const filteredOldDateArray = oldDateArray.filter(([id, t]) => !(id === occurrenceId && t === oldActualStartTime));
                                if (oldActualDate === newActualDate) filteredOldDateArray.push([occurrenceId, newActualStartTime]);
                                tmpMap.set(oldActualDate, filteredOldDateArray);
                                if (filteredOldDateArray.length === 0) {
                                    tmpMap.delete(oldActualDate);
                                }
                                if (oldActualDate !== newActualDate) {
                                    const newDateArray = tmpMap.get(newActualDate) ?? [];
                                    if (oldActualStartTime !== newActualStartTime) {
                                        if (!newDateArray.some(([id, time]) => id === occurrenceId && time === newActualStartTime)) {
                                            newDateArray.push([occurrenceId, newActualStartTime]);
                                        }
                                    } else {
                                        if (!newDateArray.some(([id, time]) => id === occurrenceId && time === oldActualStartTime)) {
                                            newDateArray.push([occurrenceId, oldActualStartTime]);
                                        }
                                    }
                                    tmpMap.set(newActualDate, newDateArray);
                                }
                                return tmpMap;
                            });
                        }
                    }

                    // Update uniqueness sets if date or time changed
                    if (oldActualDate !== actualDate || oldActualStartTime !== actualStartTime) {
                        removeOccurrenceFromUniqueness(oldActualDate, oldActualStartTime);
                        addOccurrenceToUniqueness(newActualDate, newActualStartTime);
                    }

                    setOccurrenceModal(prev => ({ ...prev, isEditSuccess: true }));
                } else {
                    console.warn(`Function editClassOccurrence. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function editClassOccurrence. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while editing a class occurrence: ${error}`);
        }
    };

    const checkIfOccurrenceUnique = (date: string, time: string): boolean => {
        return !occurrencesSet.has(`${date}-${time}`);
    };

    const openOccurrenceModal = () => setOccurrenceModal(prev => ({ ...prev, isVisible: true }));
    const closeOccurrenceModal = () => {
        setOccurrenceModal({ isVisible: false, isCreateSuccess: false, isEditSuccess: false });
        setCurrentClassOccurrenceMap(new Map());
    };

    return {
        // Read-only state
        allOccurrencesMap,
        currentClassOccurrenceMap,
        isOccurrenceModalVisible: occurrenceModal.isVisible,
        isCreateOccurrenceSuccess: occurrenceModal.isCreateSuccess,
        // Actions
        openOccurrenceModal,
        closeOccurrenceModal,
        fetchClassOccurrences,
        createClassOccurrence,
        editClassOccurrence,
        deleteClassOccurrence,
        fetchAvailableTimeIntervalsOccurrence,
        checkIfOccurrenceUnique,
    };
}
