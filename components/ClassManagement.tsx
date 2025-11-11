import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet, FlatList, Text, useColorScheme, Pressable } from "react-native";

import ScreenTitle from "./ScreenTitle";
import CreateScheduleClass from "./CreateScheduleClass";
import DeleteClassModal from "./DeleteClassModal";
import EditClassModal from "./EditClassModal";
import ClassScheduleModal from "./ClassScheduleModal";
import ClassOccurrenceModal from "./ClassOccurrencesModal";
import ClassName from "./ClassName";


type ClassType = {
    id: number;
    name: string;
    durationMinutes: number;
    isRecurring: boolean;
};

type ScheduleType = {
    id: number,
    classTime: string,
    classModel: number,
    day: number,
};

type ClassOccurrenceType = {
    id: number;
    classId: number | null;
    fallbackClassName: string;
    scheduleId: number | null;
    plannedDate: string;
    actualDate: string;
    plannedStartTime: string;
    actualStartTime: string;
    plannedDuration: string;
    actualDuration: number;
    isCancelled: boolean;
    notes: string;
};

const ClassManagement = () => {
    const colorScheme = useColorScheme();

    const [classes, setClasses] = useState<ClassType[]>([]);

    const [classesSet, setClassesSet] = useState<Set<string>>(new Set());

    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
    const [selectedClassDuration, setSelectedClassDuration] = useState<number | null>(null);
    const [selectedClassRecurrence, setSelectedClassRecurrence] = useState<boolean>(true);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
    const [isOccurrencesModalVisible, setIsOccurrencesModalVisible] = useState(false);

    const [isCreateSuccessful, setIsCreateSuccessful] = useState(false);
    const [isDeleteSuccessful, setIsDeleteSuccessful] = useState(false);
    const [isEditSuccessful, setIsEditSuccessful] = useState(false);
    const [isScheduleSuccessful, setIsScheduleSuccessful] = useState(false);
    const [isCreateOccurrenceSuccessful, setIsCreateOccurrenceSuccessful] = useState(false);
    const [isEditOccurrenceSuccessful, setIsEditOccurrenceSuccessful] = useState(false);

    const [isCreateClassError, setIsCreateClassError] = useState(false);

    const [currentClassScheduleMap, setCurrentClassScheduleMap] = useState<Map<number, [number, string][]>>(new Map()); // dayId: [scheduleID, time]
    const [currentClassOccurrenceMap, setCurrentClassOccurrenceMap] = useState<Map<string, [number, string][]>>(new Map()); // date: [occurrenceID, time]

    const [createdClassId, setCreatedClassId] = useState<number | null>(null);

    const [allSchedulesList, setAllSchedulesList] = useState<ScheduleType[]>([]);
    const [schedulesSet, setSchedulesSet] = useState<Set<string>>(new Set());

    const [allOccurrencesMap, setAllOccurrencesMap] = useState<Map<number, ClassOccurrenceType>>(new Map());
    const [occurrencesSet, setOccurrencesSet] = useState<Set<string>>(new Set());

    const isValidArrayResponse = (responseData: any, key: string): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    };

    const isValidCreateResponse = (responseData: any, className: string, classDuration: number, isRecurring: boolean): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === 'Class was created successfully' &&
            'id' in responseData &&
            'name' in responseData && responseData.name === className &&
            'durationMinutes' in responseData && responseData.durationMinutes === classDuration &&
            'isRecurring' in responseData && responseData.isRecurring === isRecurring
        );
    };

    // TODO: handle the created class name - comes from the modal
    const isValidScheduleResponse = (responseData: any, classId: number, className: string, dayName: string): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === 'Schedule was created successfully' &&
            'scheduleId' in responseData &&
            'classId' in responseData && responseData.classId === classId &&
            'className' in responseData && responseData.className === className &&
            'day'  in responseData && responseData.day === dayName &&
            'time' in responseData // TODO: handle the time from response better
        );
    };

    const isValidCreateOccurrenceResponse = (
        responseData: any,
        className: string,
        plannedDate: string,
        plannedStartTime: string,
        plannedDuration: number = 60,
        classId?: number,
        notes?: string,
    ) => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === 'Class occurrence was created successfully' &&
            'occurrenceId' in responseData &&
            'fallbackClassName' in responseData && responseData.fallbackClassName === className &&
            'plannedDate' in responseData && responseData.plannedDate === plannedDate &&
            'plannedStartTime' in responseData && responseData.plannedStartTime.slice(0,5) === plannedStartTime && // TODO: handle in BE?
            'plannedDuration' in responseData && responseData.plannedDuration === plannedDuration &&
            (classId === undefined || ('classId' in responseData && responseData.classId === classId)) &&
            ((responseData.notes || '') === (notes || ''))
        );
    };

    const isValidDeleteClassResponse = (responseData: any, classId: number, className: string): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Class ${classId} - ${className} was delete successfully` &&
            'classId' in responseData && responseData.classId === classId &&
            'className' in responseData && responseData.className === className
        );
    };

    const isValidDeleteScheduleResponse = (responseData: any, scheduleId: number): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Schedule ${scheduleId} was delete successfully` &&
            'scheduleId' in responseData && responseData.scheduleId === scheduleId
        );
    };

    const isValidDeleteOccurrenceResponse = (responseData: any, occurrenceId: number, className: string, date: string, time: string): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Occurrence for ${className} at ${date} ${time} was delete successfully` &&
            'occurrenceId' in responseData && responseData.occurrenceId === occurrenceId
        );
    };

    const isValidEditResponse = (responseData: any, classId: number, className: string, classDuration: number): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Class was updated successfully` && // TODO: update the message here and in BE
            'classId' in responseData && responseData.classId === classId &&
            'className' in responseData && responseData.className === className &&
            'durationMinutes' in responseData && responseData.durationMinutes === classDuration
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

    const isValidAvailableTimeIntervalsResponse = (responseData: any): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === 'Available time intervals for class occurrence' &&
            'availableIntervals' in responseData && Array.isArray(responseData.availableIntervals)
        );
    };

    const isValidEditOccurrenceResponse = (
        responseData: any,
        occurrenceId: number,
        actualDate?: string,
        actualStartTime?: string,
        actualDuration?: number,
        isCancelled?: boolean,
        notes?: string) => {
            return (
                typeof responseData === 'object' &&
                responseData !== null &&
                'message' in responseData && responseData.message === 'Class Occurrence was updated successfully' &&
                'id' in responseData && responseData.id === occurrenceId &&
                (actualDate === undefined || ('actualDate' in responseData && responseData.actualDate === actualDate)) && 
                (actualStartTime === undefined || ('actualStartTime' in responseData && responseData.actualStartTime.slice(0,5) === actualStartTime)) &&
                (actualDuration === undefined || ('actualDuration' in responseData && responseData.actualDuration === actualDuration)) &&
                (isCancelled === undefined || ('isCancelled' in responseData && responseData.isCancelled === isCancelled)) &&
                (notes === undefined || ('notes' in responseData && responseData.notes === notes))
            );
        };

    const removeClass = (targetClassId: number) => {
        const updatedClasses = classes.filter(cls => cls.id != targetClassId);
        setClasses(updatedClasses);
    };

    const updateClassName = (targetClassId: number, newName: string, newDuration: number, newRecurrence: boolean) => {
        setClasses(
            prevClasses => prevClasses.map(
                cls => cls.id === targetClassId ? {...cls, name: newName, durationMinutes: newDuration, isRecurring: newRecurrence} : cls
            )
        );
    };

    const removeScheduleFromState = (targetScheduleId: number, day: number) => {
        // TODO: handle case when no schedules left
        const currentSchedule = currentClassScheduleMap.get(day);
        console.log(`Current Schedule data is: ${currentSchedule}`);
        if (!currentSchedule) {
            console.log(`No such day with number ${day} in ${currentClassScheduleMap}`);
            return;
        }
        const udpatedSchedule = currentSchedule.filter(([id]) => id !== targetScheduleId);

        console.log(`udpatedSchedule is ${udpatedSchedule}`);

        const updatedMap = new Map(currentClassScheduleMap);

        if(udpatedSchedule.length === 0) {
            console.log(`No schedules for day ${day}`);
            updatedMap.delete(day);
        } else {
            updatedMap.set(day, udpatedSchedule);
        }

        console.log(`Schedule data without deleted schedule: ${udpatedSchedule}`);
        setCurrentClassScheduleMap(updatedMap);
    }

    const addScheduleToState = (scheduleId: number, day: number, time: string) => {
        console.log(`Adding schedule with id ${scheduleId} for: day ${day}, time ${time}`);

        const daySchedule = currentClassScheduleMap.get(day);
        console.log(`Current Schedule data is: ${daySchedule}`);

        const udpatedSchedule = new Map(currentClassScheduleMap);

        if (!daySchedule) {
            udpatedSchedule.set(day, [[scheduleId, time]]);
        } else {
            udpatedSchedule.get(day)?.push([scheduleId, time]);
        };

        console.log(`Schedule data with added schedule: ${udpatedSchedule}`);

        setCurrentClassScheduleMap(udpatedSchedule);
    };

    const addClassToUniqueness = (name: string) => {
        const newClassSet = new Set(classesSet);
        newClassSet.add(name);
        console.log(`Added ${name} to class uniqueness`);
    };

    // rename to addOccurrenceToState to keep consistency
    const addClassOccurrenceToState = (occurrenceId: number, plannedDate: string, plannedTime: string) => {
        console.log(`Adding class occurrence with id ${occurrenceId} for: date ${plannedDate}, time ${plannedTime}`);

        const dayOccurrences = currentClassOccurrenceMap.get(plannedDate);
        console.log(`Current occurrence data for ${plannedDate} is: ${dayOccurrences}`);

        const updatedOccurences = new Map(currentClassOccurrenceMap);

        if (!dayOccurrences) {
            updatedOccurences.set(plannedDate, [[occurrenceId, plannedTime]]);
        } else {
            updatedOccurences.get(plannedDate)?.push([occurrenceId, plannedTime]);
        };

        console.log(`Occurrence data with added occurrence: ${updatedOccurences}`);

        setCurrentClassOccurrenceMap(updatedOccurences);
    };

    const editCurrentClassOccurrenceMap = (
        occurrenceId: number,
        oldDate: string,
        oldStartTime: string,
        newDate: string,
        newStartTime: string,
    ) => {

        if (oldDate === newDate && oldStartTime === newStartTime) {
            console.log(`No date and time to edit: no changes for class occurrence ${occurrenceId}`);
            return;
        }

        console.log(`Editing class occurrence with id ${occurrenceId}, at date ${newDate} and time ${newStartTime}`);

        const oldDateArray = currentClassOccurrenceMap.get(oldDate);
        if (!oldDateArray) {
            console.log(`No data in currentClassOccurrenceMap for date ${oldDate}`);
            return null;
        }

        const tmpMap = new Map(currentClassOccurrenceMap);

        const filteredOldDateArray = oldDateArray.filter(([id, t]) => !(id === occurrenceId && t === oldStartTime));
        if (oldDate === newDate) filteredOldDateArray.push([occurrenceId, newStartTime]); // Assuming that oldStartTime !== newStartTime here
        tmpMap.set(oldDate, filteredOldDateArray);

        if (filteredOldDateArray.length === 0) {
            tmpMap.delete(oldDate);
        }

        if (oldDate !== newDate) {
            const newDateArray = tmpMap.get(newDate) ?? [];

            if (oldStartTime !== newStartTime) { // different time for another date
                if (!newDateArray.some(([id, time]) => id === occurrenceId && time === newStartTime)) { // avoid duplications
                    newDateArray.push([occurrenceId, newStartTime]);
                }
            } else { // same time for another date
                if (!newDateArray.some(([id, time]) => id === occurrenceId && time === oldStartTime)) {
                    newDateArray.push([occurrenceId, oldStartTime]);
                }
            }

            tmpMap.set(newDate, newDateArray)
        }

        setCurrentClassOccurrenceMap(tmpMap);
    };

    const editOccurrenceInState = (
        occurrenceId: number,
        actualDate?: string,
        actualStartTime?: string,
        actualDuration?: number,
        isCancelled?: boolean,
        notes?: string,
    ) => {
        console.log(`Editing class occurrence with id ${occurrenceId} in state`);

        const targetOccurrence = allOccurrencesMap.get(occurrenceId);

        if (!targetOccurrence) {
            console.warn(`No occurrence with id ${occurrenceId} was found`);
            return;
        }

        const oldActualDate = targetOccurrence.actualDate;
        const oldActualStartTime = targetOccurrence.actualStartTime;

        // TODO: revisit when decide what use app-wise: planned or actual (this) date and time
        const oldPlannedDate = targetOccurrence.plannedDate;
        const oldPlannedStartTime = targetOccurrence.plannedStartTime;

        const updates: Partial<ClassOccurrenceType> = {};
        if (actualDate !== undefined) updates.actualDate = actualDate;
        if (actualStartTime !== undefined) updates.actualStartTime = actualStartTime;
        if (actualDuration !== undefined) updates.actualDuration = actualDuration;
        if (isCancelled !== undefined) updates.isCancelled = isCancelled;
        if (notes !== undefined) updates.notes = notes;
        const updatedOccurrenceData = {...targetOccurrence, ...updates}

        const tmpMap = new Map(allOccurrencesMap);
        tmpMap.set(occurrenceId, updatedOccurrenceData);
        setAllOccurrencesMap(tmpMap);

        // currentClassOccurrenceMap is date: [occurrenceID, time]

        // if (oldActualDate !== actualDate || oldActualStartTime !== actualStartTime) {
        //     removeOccurrenceFromUniqueness(oldActualDate, oldActualStartTime);
        // }
    };

    const removeOccurrenceFromState = (targetOccurrenceId: number, plannedDate: string) => {
        console.log(`Removing class occurrence with id ${targetOccurrenceId} from date ${plannedDate}`);

        const currentOccurrences = currentClassOccurrenceMap.get(plannedDate);
        console.log(`Current Occurrence data is: ${currentOccurrences}`);
        if (!currentOccurrences) {
            console.log(`No such date ${plannedDate} in ${currentClassOccurrenceMap}`);
            return;
        }

        const udpatedOccurrences = currentOccurrences.filter(([id]) => id !== targetOccurrenceId);

        console.log(`Updated occurrences are ${udpatedOccurrences}`);

        const updatedMap = new Map(currentClassOccurrenceMap);

        if (udpatedOccurrences.length === 0) {
            console.log(`No class occurrences for ${plannedDate}`);
            updatedMap.delete(plannedDate);
        } else {
            updatedMap.set(plannedDate, udpatedOccurrences)
        }

        setCurrentClassOccurrenceMap(updatedMap);
    };

    const removeClassFromUniqueness = (name: string) => { // TODO: WHY NOT USED?
        const newClassSet = new Set(classesSet);
        newClassSet.delete(name);
        console.log(`Removed ${name} from class uniqueness`);
    };

    const addScheduleToUniqueness = (day: number, time: string) => {
        const newSchedulesSet = new Set(schedulesSet);
        newSchedulesSet.add(`${day}-${time.slice(0, 5)}`);
        console.log(`Added ${day}-${time.slice(0, 5)} to schedule uniqueness`);

        setSchedulesSet(newSchedulesSet);
    };

    const removeScheduleFromUniqueness = (day: number, time: string) => {
        const newSchedulesSet = new Set(schedulesSet);
        newSchedulesSet.delete(`${day}-${time.slice(0, 5)}`);
        console.log(`Removed ${day}-${time.slice(0, 5)} from schedule uniqueness`);

        setSchedulesSet(newSchedulesSet);
    };

    const addOccurrenceToUniqueness = (date: string, time: string) => {
        const newOccurrencesSet = new Set(occurrencesSet);
        newOccurrencesSet.add(`${date}-${time.slice(0, 5)}`)
        console.log(`Added ${date}-${time.slice(0, 5)} to occurrence uniqueness`);

        setOccurrencesSet(newOccurrencesSet);
    };

    const removeOccurrenceFromUniqueness = (date: string, time: string) => {
        const newOccurrencesSet = new Set(occurrencesSet);
        newOccurrencesSet.delete(`${date}-${time.slice(0, 5)}`)
        console.log(`Removed ${date}-${time.slice(0, 5)} from occurrence uniqueness`);

        setOccurrencesSet(newOccurrencesSet);
    };

    const checkIfClassUnique = (name: string): boolean => {
        return !classesSet.has(name);
    };

    const checkIfScheduleUnique = (dayId: number, time: string): boolean => {
        const scheduleToCheck = `${dayId}-${time}`;

        return !schedulesSet.has(scheduleToCheck);
    };

    const checkIfOccurrenceUnique = (date: string, time: string) => {
        const occurrenceToCheck = `${date}-${time}`;

        return !occurrencesSet.has(occurrenceToCheck);
    };

    const getChangesFromClassEdit = (newName: string, newDuration: number, newRecurrence: boolean) => {
        const dataToUpdate: Record<string, string | number | boolean> = {};

        const currentClassState = {
            'name': selectedClassName,
            'durationMinutes': selectedClassDuration,
            'isRecurring': selectedClassRecurrence,
        };

        const newClassState = {
            'name': newName,
            'durationMinutes': newDuration,
            'isRecurring': newRecurrence,
        };

        for (const key in newClassState) {
            if (newClassState[key as keyof typeof newClassState] !== currentClassState[key as keyof typeof currentClassState]) {
                const dynamicKey: string = key;
                dataToUpdate[dynamicKey] = newClassState[key as keyof typeof newClassState];
                console.log(`Adding to request body ${dynamicKey}: ${newClassState[key as keyof typeof newClassState]}`);
            }
        }

        return dataToUpdate;
    };

    const fetchClasses = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/backend/classes/');
            if (response.ok) {
                const responseData = await response.json();

                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchClasses. The response from backend is valid: ${JSON.stringify(responseData)}`);

                    const fetchedClasses: ClassType[] = responseData.response;
                    setClasses(fetchedClasses);
                } else {
                    console.warn(`Function fetchClasses. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function fetchClasses. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch(error) {
            console.error(`Error while fetching the classes from the server: ${error}`);
        }
    };

    const deleteClass = async () => {
        if (selectedClassId === null || selectedClassName === null) {
            console.warn("No class selected to delete");
            return null;
        }
        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/classes/${selectedClassId}/delete/`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                const responseData = await response.json();

                if (isValidDeleteClassResponse(responseData, selectedClassId, selectedClassName)) {
                    console.log(`Function deleteClass. The response from backend is valid: ${JSON.stringify(responseData)}`);
                } else {
                    console.warn(`Function deleteClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }

                setIsDeleteSuccessful(true);

                removeClass(selectedClassId);

                setSelectedClassId(null);
                setSelectedClassName("");
            } else {
                console.warn(`Function deleteClass. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch(error) {
            console.error(`Error while deleting the class: ${error}`);
        }
    };

    const createClass = async (className: string, classDuration: number = 60, isRecurring: boolean = true) => {
        // TODO: sanitize input
        const data = {
            "name": className,
            "durationMinutes": classDuration,
            "isRecurring": isRecurring,
        };

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/backend/classes/',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            // TODO: refactor component and make function to follow the commom structure
            if (!response.ok) {
                setIsCreateClassError(true);
                const errorMessage = `Function createClass. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            } else {
                console.log('Class was created successfully!');

                const responseData = await response.json();

                if (isValidCreateResponse(responseData, className, classDuration, isRecurring)) {
                    console.log(`Function createClass. The response from backend is valid. ${JSON.stringify(responseData)}`);

                    const newClass = {id: responseData.id, name: responseData.name, durationMinutes: responseData.durationMinutes, isRecurring: responseData.isRecurring};

                    setIsCreateSuccessful(true);
                    setCreatedClassId(responseData.id);
                    setClasses(prevClasses => [...prevClasses, newClass]);
                    addClassToUniqueness(className);

                } else {
                    console.log(`Function createClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`)
                }
            }
        } catch(error) {
            console.error(`Error while sending the data to the server when creating class: ${error}`);
        }
    }

    // TODO: have classToScheduleId as a number?
    const scheduleClass = async (classToScheduleId: string, classToScheduleName: string, dayId: number, dayName: string, time: string) => {
        // TODO: sanitize input and add checks
        const data = {
            "classId": classToScheduleId,
            "day": dayName,
            "classTime": time,
        }

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/backend/schedules/',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorMessage = `Function scheduleClass. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            } else {
                console.log('Class was scheduled successfully!');

                const responseData = await response.json();

                if (isValidScheduleResponse(responseData, Number(classToScheduleId), classToScheduleName, dayName)
                ) {
                    console.log(`Function scheduleClass. The response from backend is valid. ${JSON.stringify(responseData)}`)
                } else {
                    console.log(`Function scheduleClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`)
                }

                const scheduleId = responseData.scheduleId;

                setIsScheduleSuccessful(true);

                addScheduleToState(scheduleId, dayId, time);
                addScheduleToUniqueness(dayId, time);

                setSelectedClassId(null);
                setSelectedClassName("");
            }
        } catch(error) {
            console.error(`Error while sending the data to the server when scheduling class: ${error}`);
        }
    };

    // TODO: should I rather have classId and className as parameters, not call state vars inside the function?
    const editClass = async (newClassName: string, newClassDuration: number, newClassRecurrence: boolean) => {
        if (selectedClassId === null || selectedClassName === null) {
            console.warn("No class selected to edit");
            return null;
        }

        const data = getChangesFromClassEdit(newClassName, newClassDuration, newClassRecurrence);

        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/classes/${selectedClassId}/edit/`,
                {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

        if (response.ok) {
            const responseData = await response.json();

            if (isValidEditResponse(responseData, selectedClassId, newClassName, newClassDuration)) {
                console.log(`Successfully edited class ${newClassName} (was ${selectedClassName}) - ${selectedClassId}. Duration: ${selectedClassDuration} -> ${newClassDuration}.`);
            } else {
                console.warn(`Function editClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
            }

            setIsEditSuccessful(true);

            updateClassName(selectedClassId, newClassName, newClassDuration, newClassRecurrence);
            setSelectedClassDuration(newClassDuration);
            setSelectedClassRecurrence(newClassRecurrence);
            addClassToUniqueness(newClassName);

            // TODO: have state vars reset at modal close?
            setSelectedClassId(null);
            setSelectedClassName("");
            // setSelectedClassRecurrence(true); // TODO: how to handle better?

        } else {
            console.warn(`Function editClass. Request was unsuccessful: ${response.status, response.statusText}`);
        }

        } catch(error) {
            console.error(`Error while sending the data to the server when editing class: ${error}`)
        }
    };

    const fetchSchedules = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/schedules/`)

            if (response.ok) {
                const responseData = await response.json();

                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchSchedules. The response from backend is valid: ${JSON.stringify(responseData)}`);
                    const schedules = responseData.response;

                    setAllSchedulesList(schedules);

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
            const response = await fetch(`http://127.0.0.1:8000/backend/schedules/?class_id=${classId}`)

            if (response.ok) {
                const responseData = await response.json();

                // TODO: validation for elements of the array?
                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchClassSchedules. The response from backend is valid: ${JSON.stringify(responseData)}`);
                    const schedules = responseData.response;
                    const scheduleMap: Map<number, [number, string][]> = new Map();

                    schedules.forEach((element: ScheduleType) => {
                        if (scheduleMap.has(element.day)) {
                            scheduleMap.get(element.day)?.push([element.id, element.classTime])
                        } else {
                            scheduleMap.set(element.day, [[element.id, element.classTime]])
                        }
                    });

                    setCurrentClassScheduleMap(scheduleMap);
                    // TODO: reset currentClassScheduleMap in appropriate place?

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

    const deleteClassSchedule = async(scheduleId: number, day: number, time: string) => {
        if (scheduleId === null || day === null) {
            console.warn("No schedule or day selected");
            return null;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/schedules/${scheduleId}/delete/`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                const responseData = await response.json();

                if (isValidDeleteScheduleResponse(responseData, scheduleId)) {
                    console.log(`Function deleteClassSchedule. The response from backend is valid: ${JSON.stringify(responseData)}`);

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

    const fetchAvailableTimeSlots = async(dayName: string, classDurationToFit: number): Promise<string[]> => {
        if (dayName === null || classDurationToFit === null) {
            console.warn("No day or duration provided");
            return [];
        }

        let slots: string[] = [];

        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/available_time_slots/?day=${dayName}&duration=${classDurationToFit}`)

            if (response.ok) {
                const responseData = await response.json();

                if (isValidAvailableTimeSlotsResponse(responseData)) {
                    console.log(`Function fetchAvailableTimeSlots. The response from backend is valid: ${JSON.stringify(responseData)}`);

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

    const fetchAllClassOccurrences = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/backend/class_occurrences/');

            if (response.ok) {
                const responseData = await response.json();

                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchAllClassOccurrences. The response from backend is valid: ${JSON.stringify(responseData)}`);

                    const classOccurrences: ClassOccurrenceType[] = responseData.response;
                    const occurrencesMap = new Map<number, ClassOccurrenceType>();
                    classOccurrences.forEach((occ) => {
                        occurrencesMap.set(occ.id, occ);
                    });
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
            const response = await fetch(`http://127.0.0.1:8000/backend/class_occurrences/?class_id=${classId}`)

            if (response.ok) {
                const responseData = await response.json();

                // TODO: validation for elements of the array?
                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchClassOccurrences. The response from backend is valid: ${JSON.stringify(responseData)}`);
                    const occurrences = responseData.response;
                    const occurrencesMap: Map<string, [number, string][]> = new Map();

                    occurrences.forEach((element: ClassOccurrenceType) => {
                        if (occurrencesMap.has(element.plannedDate)) {
                            occurrencesMap.get(element.plannedDate)?.push([element.id, element.plannedStartTime])
                        } else {
                            occurrencesMap.set(element.plannedDate, [[element.id, element.plannedStartTime]])
                        }
                    });

                    setCurrentClassOccurrenceMap(occurrencesMap);
                    // TODO: reset setCurrentClassOccurrenceMap in appropriate place?

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

    const createClassOccurrence = async (
        className: string,
        plannedDate: string,
        plannedTime: string,
        duration: number = 60,
        classId?: number,
        scheduleId?: number,
        notes?: string) => {
            // onCreateOccurrence: (classToScheduleId: string, classToScheduleName: string, dayId: number, dayName: string, time: string) => void;
            // TODO: add validation here?
            const data = {
                "fallbackClassName": className,
                "plannedDate": plannedDate,
                "plannedStartTime": plannedTime,
                "plannedDuration": duration,
                "classModel": classId,
                "schedule": scheduleId,
                "notes": notes,
            };

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/backend/class_occurrences/',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorMessage = `Function createClassOccurrence. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            } else {
                console.log('Class occurrence was created successfully!');

                const responseData = await response.json();

                if (isValidCreateOccurrenceResponse(responseData, className, plannedDate, plannedTime, duration, classId, notes)
                ) {
                    console.log(`Function createClassOccurrence. The response from backend is valid. ${JSON.stringify(responseData)}`)
                } else {
                    console.log(`Function createClassOccurrence. The response from backend is NOT valid! ${JSON.stringify(responseData)}`)
                }

                const occurrenceId = responseData.occurrenceId;

                setIsCreateOccurrenceSuccessful(true);

                addClassOccurrenceToState(occurrenceId, plannedDate, plannedTime)
                addOccurrenceToUniqueness(plannedDate, plannedTime);

                setSelectedClassId(null);
                setSelectedClassName("");
            }
        } catch(error) {
            console.error(`Error while sending the data to the server when creating class occurrence: ${error}`);
        }
    };

    const deleteClassOccurrence = async(occurrenceId: number, className: string, date: string, time: string) => {
        if (occurrenceId === null) {
            console.warn("No occurrence selected");
            return null;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/class_occurrences/${occurrenceId}/delete/`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                const responseData = await response.json();

                if (isValidDeleteOccurrenceResponse(responseData, occurrenceId, className, date, time)) {
                    console.log(`Function deleteClassOccurrence. The response from backend is valid: ${JSON.stringify(responseData)}`);

                    removeOccurrenceFromState(occurrenceId, date)
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
        if (date === null || classDurationToFit === null) {
            console.warn("No date or class duration provided");
            return [];
        }
        let intervals: string[] = [];

        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/available_occurrence_time/?date=${date}&duration=${classDurationToFit}`);

            if (response.ok) {
                const responseData = await response.json();

                if (isValidAvailableTimeIntervalsResponse(responseData)) {
                    console.log(`Function fetchAvailableTimeIntervalsOccurrence. The response from backend is valid: ${JSON.stringify(responseData)}`);

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

    const editClassOccurrence = async(
        occurrenceId: number,
        actualDate?: string,
        actualStartTime?: string,
        actualDuration?: number,
        isCancelled?: boolean,
        notes?: string,
    ) => {
        if (occurrenceId === null) {
            console.warn("No occurrence selected");
            return null;
        }

        const data: any = {}

        if (actualDate !== undefined) data.actualDate = actualDate;
        if (actualStartTime !== undefined) data.actualStartTime = actualStartTime;
        if (actualDuration !== undefined) data.actualDuration = actualDuration;
        if (isCancelled !== undefined) data.isCancelled = isCancelled;
        if (notes !== undefined) data.notes = notes;

        if (Object.keys(data).length === 0) {
            console.warn("Function editClassOccurrence. Nothing to edit provided");
            return null;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/class_occurrences/${occurrenceId}/edit/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (response.ok) {
                const responseData = await response.json();

                if (isValidEditOccurrenceResponse(responseData, occurrenceId, actualDate, actualStartTime, actualDuration, isCancelled, notes)) {
                    console.log(`Function editClassOccurrence. The response from backend is valid: ${JSON.stringify(responseData)}`);

                    setIsEditOccurrenceSuccessful(true);
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

    useEffect(() => {
        fetchClasses();
        fetchSchedules();
        fetchAllClassOccurrences();
    },
    []);

    useEffect(() => {
        const classSet: Set<string> = new Set();

        classes.forEach((cls) => {
            classSet.add(cls.name)
        });

        setClassesSet(classSet);
    },
    [classes]);

    useEffect(() => {
        const scheduleSet: Set<string> = new Set();

        allSchedulesList.forEach((schedule) => {
            // TODO: think about handling of time when seconds part is missing (rather BE refactor and no need of slice()??)
            scheduleSet.add(`${schedule.day}-${schedule.classTime.slice(0,5)}`);
        });

        setSchedulesSet(scheduleSet);
    },
    [allSchedulesList]);

    // add useEffect to handle adding the created class to the list?

    useEffect(() => {
        const occurrencesSetTemp: Set<string> = new Set();

        // TODO: use actual time?
        allOccurrencesMap.forEach((occurrence) => {
            occurrencesSetTemp.add(`${occurrence.plannedDate}-${occurrence.plannedStartTime.slice(0, 5)}`);
            // also think about handling of time when seconds part is missing (rather BE refactor and no need of slice()??)
        });

        setOccurrencesSet(occurrencesSetTemp);
    },
    [allOccurrencesMap]);

    const renderHeaderRow = () => {
        return (
        <View style={styles.headerRow}>
            <View style={{marginLeft: 'auto'}}>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed ? styles.primaryButtonPressed : styles.primaryButtonUnpressed,
                    ]}
                    onPress={() => {
                        setIsCreateModalVisible(true)
                    }}>
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>+ Create new class</Text>
                </Pressable>
            </View>
        </View>
        );
    };

    const renderClassList = () => {
        return (
            <FlatList
                data={classes}
                keyExtractor={(cls) => cls.id.toString()}
                renderItem={({ item: cls }) => (
                    <View style={styles.classesList}>
                        <Pressable
                            style={{padding: 10}}
                            onPress={() => {
                                setSelectedClassId(cls.id);
                                setSelectedClassName(cls.name);
                                setSelectedClassDuration(cls.durationMinutes);
                                fetchClassSchedules(cls.id);
                                setIsScheduleModalVisible(true);
                                }}>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.className]}>{cls.name}</Text>
                        </Pressable>
                        <View style={{flexDirection: 'row'}}>
                            <Pressable
                                onPress={() => {
                                    setSelectedClassId(cls.id);
                                    setSelectedClassName(cls.name);
                                    setSelectedClassRecurrence(cls.isRecurring);
                                    setSelectedClassDuration(cls.durationMinutes);
                                    fetchClassOccurrences(cls.id);
                                    setIsOccurrencesModalVisible(true);
                                }}>
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButton]}>See occurrences</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setSelectedClassId(cls.id);
                                    setSelectedClassName(cls.name);
                                    setSelectedClassRecurrence(cls.isRecurring);
                                    setSelectedClassDuration(cls.durationMinutes);
                                    setIsEditModalVisible(true);
                                }}>
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButton]}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setSelectedClassId(cls.id);
                                    setSelectedClassName(cls.name);
                                    setSelectedClassDuration(cls.durationMinutes);
                                    setIsDeleteModalVisible(true);
                                }}>
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButton]}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                )}>
            </FlatList>
        );
    };

    const renderCreateClassModal = () => {
        if (!isCreateModalVisible) {
            return null;
        }
        return (
                <CreateScheduleClass
                    isVisible={isCreateModalVisible}
                    onCreateClass={createClass}
                    onClassUniquenessCheck={checkIfClassUnique}
                    onRequestingTimeSlots={fetchAvailableTimeSlots}
                    onScheduleClass={scheduleClass}
                    onScheduleUniquenessCheck={checkIfScheduleUnique}
                    onScheduleDelete={deleteClassSchedule}
                    onModalClose={() => {
                        setIsCreateModalVisible(false);
                        setIsCreateSuccessful(false);
                        setCreatedClassId(null);
                        setIsScheduleSuccessful(false);
                        setCurrentClassScheduleMap(new Map());
                    }}
                    defaultClassDuration={60} // TODO: have as a variable
                    isCreateSuccess={isCreateSuccessful}
                    isError={isCreateClassError}
                    createdClassId={createdClassId}
                    scheduleData={currentClassScheduleMap}
                    isSheduleSuccess={isScheduleSuccessful}
                />
        );
    };

    const renderDeleteClassModal = () => {
        if (!isDeleteModalVisible) {
            return null;
        }
        return (
            <DeleteClassModal
                isVisible={isDeleteModalVisible}
                onModalClose={() => {
                    setIsDeleteModalVisible(false);
                    setIsDeleteSuccessful(false);
                }}
                onDeleteClass={deleteClass}
                className={selectedClassName ?? ""}
                isSuccess={isDeleteSuccessful}
            />
        );
    };

    const renderEditClassModal = () => {
        if (!isEditModalVisible) {
            return null;
        }
        return (
            <EditClassModal
                isVisible={isEditModalVisible}
                onModalClose={() => {
                    setIsEditModalVisible(false);
                    setIsEditSuccessful(false);
                    setSelectedClassDuration(null);
                }}
                onEditClass={editClass}
                onClassUniquenessCheck={checkIfClassUnique}
                oldClassName={selectedClassName ?? ""}
                oldClassDuration={selectedClassDuration}
                oldClassRecurrence={selectedClassRecurrence}
                isSuccess={isEditSuccessful}
            />
        );
    };

    const renderScheduleListClassModal = () => {
        if (!isScheduleModalVisible) {
            return null;
        }
        return (
            <ClassScheduleModal
                isVisible={isScheduleModalVisible}
                onModalClose={() => {
                    setIsScheduleModalVisible(false);
                    setIsScheduleSuccessful(false);
                    setCurrentClassScheduleMap(new Map());
                }}
                onRequestingTimeSlots={fetchAvailableTimeSlots}
                onScheduleDelete={deleteClassSchedule}
                onScheduleClass={scheduleClass}
                onUniquenessCheck={checkIfScheduleUnique}
                scheduleData={currentClassScheduleMap}
                classId={selectedClassId}
                className={selectedClassName}
                classDuration={selectedClassDuration}
                isSheduleSuccess={isScheduleSuccessful}
            />
        );
    };

    const renderClassOccurrencesModal = () => {
        if (!isOccurrencesModalVisible) {
            return null
        }
        return (
            <ClassOccurrenceModal
                isVisible={isOccurrencesModalVisible}
                onModalClose={() => {
                    setIsOccurrencesModalVisible(false);
                    setCurrentClassOccurrenceMap(new Map());
                    setIsCreateOccurrenceSuccessful(false);
                    setIsEditOccurrenceSuccessful(false);
                }}
                onRequestingTimeIntervals={fetchAvailableTimeIntervalsOccurrence}
                onCreateOccurrence={createClassOccurrence}
                onEditOccurrence={editClassOccurrence}
                onDeleteOccurrence={deleteClassOccurrence}
                onUniquenessCheck={checkIfOccurrenceUnique}
                occurrenceIdTimebyDate={currentClassOccurrenceMap}
                allOccurrenceDataById={allOccurrencesMap}
                classId={selectedClassId}
                className={selectedClassName}
                classDuration={selectedClassDuration}
                isCreateOccurrenceSuccess={isCreateOccurrenceSuccessful}
            />
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScreenTitle titleText={'Class management'}/>
            {renderHeaderRow()}
            {renderClassList()}
            {renderDeleteClassModal()}
            {renderCreateClassModal()}
            {renderEditClassModal()}
            {renderScheduleListClassModal()}
            {renderClassOccurrencesModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 20,
    },
    classesList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    className: {
        paddingLeft: 10,
        textDecorationLine: 'underline',
    },
    actionButton: {
        paddingRight: 10,
        textDecorationLine: 'underline',
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        elevation: 3,
    },
    primaryButtonPressed: {
        backgroundColor: '#c2c0c0',
        borderRadius: 8,
    },
    primaryButtonUnpressed: {
        backgroundColor: 'blue',
        borderRadius: 8,
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
});

export default ClassManagement;
