import { useState, useEffect } from "react";
import { useApi } from "@/api/client";
import { isValidArrayResponse } from "@/api/validators";
import { ScheduleType } from "@/types/class";

const isValidScheduleResponse = (responseData: any, classId: number, className: string, dayName: string): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Schedule was created successfully' &&
        'scheduleId' in responseData &&
        'classId' in responseData && responseData.classId === classId &&
        'className' in responseData && responseData.className === className &&
        'day' in responseData && responseData.day === dayName &&
        'time' in responseData
    );
};

const isValidDeleteScheduleResponse = (responseData: any, scheduleId: number): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === `Schedule ${scheduleId} was deleted successfully` &&
        'scheduleId' in responseData && responseData.scheduleId === scheduleId
    );
};

const isValidAvailableTimeSlotsResponse = (responseData: any): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Available time slots' &&
        'availableSlots' in responseData && Array.isArray(responseData.availableSlots)
    );
};

export function useClassSchedules() {
    const { apiFetch } = useApi();

    const [allSchedulesList, setAllSchedulesList] = useState<ScheduleType[]>([]);
    const [schedulesSet, setSchedulesSet] = useState<Set<string>>(new Set());
    const [currentClassScheduleMap, setCurrentClassScheduleMap] = useState<Map<number, [number, string][]>>(new Map());
    const [scheduleModal, setScheduleModal] = useState({ isVisible: false, isSuccess: false });

    useEffect(() => {
        fetchSchedules();
    }, []);

    useEffect(() => {
        const scheduleSet: Set<string> = new Set();
        allSchedulesList.forEach((schedule) => {
            scheduleSet.add(`${schedule.day}-${schedule.classTime.slice(0, 5)}`);
        });
        setSchedulesSet(scheduleSet);
    }, [allSchedulesList]);

    const fetchSchedules = async () => {
        try {
            const response = await apiFetch("/schedules/", { method: "GET" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchSchedules. The response from backend is valid.`);
                    setAllSchedulesList(responseData.response);
                } else {
                    console.warn(`Function fetchSchedules. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function fetchSchedules. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while fetching schedule data from the server for a class: ${error}`);
        }
    };

    const fetchClassSchedules = async (classId: number) => {
        try {
            const response = await apiFetch(`/schedules/?class_id=${classId}`, { method: "GET" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchClassSchedules. The response from backend is valid.`);
                    const schedules = responseData.response;
                    const scheduleMap: Map<number, [number, string][]> = new Map();
                    schedules.forEach((element: ScheduleType) => {
                        if (scheduleMap.has(element.day)) {
                            scheduleMap.get(element.day)?.push([element.id, element.classTime]);
                        } else {
                            scheduleMap.set(element.day, [[element.id, element.classTime]]);
                        }
                    });
                    setCurrentClassScheduleMap(scheduleMap);
                } else {
                    console.warn(`Function fetchClassSchedules. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function fetchClassSchedules. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while fetching schedule data from the server for a class: ${error}`);
        }
    };

    const addScheduleToState = (scheduleId: number, day: number, time: string) => {
        console.log(`Adding schedule with id ${scheduleId} for: day ${day}, time ${time}`);
        setCurrentClassScheduleMap(prev => {
            const updated = new Map(prev);
            const daySchedule = updated.get(day);
            if (!daySchedule) {
                updated.set(day, [[scheduleId, time]]);
            } else {
                updated.get(day)?.push([scheduleId, time]);
            }
            console.log(`Schedule data with added schedule: ${updated}`);
            return updated;
        });
    };

    const removeScheduleFromState = (targetScheduleId: number, day: number) => {
        const currentSchedule = currentClassScheduleMap.get(day);
        console.log(`Current Schedule data is: ${currentSchedule}`);
        if (!currentSchedule) {
            console.log(`No such day with number ${day} in currentClassScheduleMap`);
            return;
        }
        const updatedSchedule = currentSchedule.filter(([id]) => id !== targetScheduleId);
        console.log(`updatedSchedule is ${updatedSchedule}`);
        const updatedMap = new Map(currentClassScheduleMap);
        if (updatedSchedule.length === 0) {
            console.log(`No schedules for day ${day}`);
            updatedMap.delete(day);
        } else {
            updatedMap.set(day, updatedSchedule);
        }
        console.log(`Schedule data without deleted schedule: ${updatedSchedule}`);
        setCurrentClassScheduleMap(updatedMap);
    };

    const addScheduleToUniqueness = (day: number, time: string) => {
        setSchedulesSet(prev => {
            const newSet = new Set(prev);
            newSet.add(`${day}-${time.slice(0, 5)}`);
            console.log(`Added ${day}-${time.slice(0, 5)} to schedule uniqueness`);
            return newSet;
        });
    };

    const removeScheduleFromUniqueness = (day: number, time: string) => {
        setSchedulesSet(prev => {
            const newSet = new Set(prev);
            newSet.delete(`${day}-${time.slice(0, 5)}`);
            console.log(`Removed ${day}-${time.slice(0, 5)} from schedule uniqueness`);
            return newSet;
        });
    };

    const scheduleClass = async (classToScheduleId: string, classToScheduleName: string, dayId: number, dayName: string, time: string) => {
        const data = { classId: classToScheduleId, day: dayName, classTime: time };
        try {
            const response = await apiFetch("/schedules/", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw Error(`Function scheduleClass. Request was unsuccessful: ${response.status}, ${response.statusText}`);
            }
            console.log('Class was scheduled successfully!');
            const responseData = await response.json();
            if (isValidScheduleResponse(responseData, Number(classToScheduleId), classToScheduleName, dayName)) {
                console.log(`Function scheduleClass. The response from backend is valid.`);
            } else {
                console.log(`Function scheduleClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
            }
            const scheduleId = responseData.scheduleId;
            setScheduleModal(prev => ({ ...prev, isSuccess: true }));
            addScheduleToState(scheduleId, dayId, time);
            addScheduleToUniqueness(dayId, time);
        } catch (error) {
            console.error(`Error while sending the data to the server when scheduling class: ${error}`);
        }
    };

    const deleteClassSchedule = async (scheduleId: number, day: number, time: string) => {
        try {
            const response = await apiFetch(`/schedules/${scheduleId}/delete/`, { method: "DELETE" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidDeleteScheduleResponse(responseData, scheduleId)) {
                    console.log(`Function deleteClassSchedule. The response from backend is valid.`);
                    removeScheduleFromState(scheduleId, day);
                    removeScheduleFromUniqueness(day, time);
                } else {
                    console.warn(`Function deleteClassSchedule. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function deleteClassSchedule. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while deleting the schedule: ${error}`);
        }
    };

    const fetchAvailableTimeSlots = async (dayName: string, classDurationToFit: number): Promise<string[]> => {
        let slots: string[] = [];
        try {
            const response = await apiFetch(`/available_time_slots/?day=${dayName}&duration=${classDurationToFit}`, { method: "GET" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidAvailableTimeSlotsResponse(responseData)) {
                    console.log(`Function fetchAvailableTimeSlots. The response from backend is valid.`);
                    slots = responseData.availableSlots ?? [];
                } else {
                    console.warn(`Function fetchAvailableTimeSlots. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function fetchAvailableTimeSlots. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while fetching available time slots: ${error}`);
        }
        return slots;
    };

    const checkIfScheduleUnique = (dayId: number, time: string): boolean => {
        return !schedulesSet.has(`${dayId}-${time}`);
    };

    const openScheduleModal = () => setScheduleModal(prev => ({ ...prev, isVisible: true }));
    const closeScheduleModal = () => {
        setScheduleModal({ isVisible: false, isSuccess: false });
        setCurrentClassScheduleMap(new Map());
    };
    // Resets schedule context (map + success flag) without touching visibility.
    // Used when CreateScheduleClass closes — the schedule modal was never open in that flow.
    const clearScheduleContext = () => {
        setScheduleModal(prev => ({ ...prev, isSuccess: false }));
        setCurrentClassScheduleMap(new Map());
    };

    return {
        // Read-only state
        currentClassScheduleMap,
        isScheduleModalVisible: scheduleModal.isVisible,
        isScheduleSuccess: scheduleModal.isSuccess,
        // Actions
        openScheduleModal,
        closeScheduleModal,
        clearScheduleContext,
        fetchClassSchedules,
        scheduleClass,
        deleteClassSchedule,
        fetchAvailableTimeSlots,
        checkIfScheduleUnique,
    };
}
