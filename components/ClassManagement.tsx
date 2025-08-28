import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet, FlatList, Text, useColorScheme, Pressable, Modal } from "react-native";

import ScreenTitle from "./ScreenTitle";
import CreateScheduleClass from "./CreateScheduleClass";
import DeleteClassModal from "./DeleteClassModal";
import EditClassModal from "./EditClassModal";
import ClassScheduleModal from "./ClassScheduleModal";


type ClassType = {
    id: number;
    name: string;
};

type ScheduleType = {
    id: number,
    classTime: string,
    classModel: number,
    day: number,
};

const ClassManagement = () => {
    const colorScheme = useColorScheme();

    const [classes, setClasses] = useState<ClassType[]>([]);

    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedClassName, setSelectedClassName] = useState<string | null>(null);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);

    const [isDeleteSuccessful, setIsDeleteSuccessful] = useState(false);
    const [isEditSuccessful, setIsEditSuccessful] = useState(false);
    const [isScheduleSuccessful, setIsScheduleSuccessful] = useState(false);

    const [currentClassScheduleMap, setCurrentClassScheduleMap] = useState<Map<number, [number, string][]>>(new Map());

    const [createClassStatus, setCreateClassStatus] = useState("");

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    };

    const isValidCreateResponse = (responseData: any, className: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === 'Class was created successfully' &&
            'id' in responseData &&
            'name' in responseData && responseData.name === className
        );
    };

    // TODO: handle the created class name - comes from the modal
    const isValidScheduleResponse = (responseData: any, classId: number, className: string, dayName: string): Boolean => {
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

    const isValidDeleteClassResponse = (responseData: any, classId: number, className: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Class ${classId} - ${className} was delete successfully` &&
            'classId' in responseData && responseData.classId === classId &&
            'className' in responseData && responseData.className === className
        );
    };

    const isValidDeleteScheduleResponse = (responseData: any, scheduleId: number): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Schedule ${scheduleId} was delete successfully` &&
            'scheduleId' in responseData && responseData.scheduleId === scheduleId
        );
    };

    const isValidEditResponse = (responseData: any, classId: number, className: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Class was updated successfully` && // TODO: update the message here and in BE
            'classId' in responseData && responseData.classId === classId &&
            'className' in responseData && responseData.className === className
        );
    };

    const removeClass = (targetClassId: number) => {
        const updatedClasses = classes.filter(cls => cls.id != targetClassId);
        setClasses(updatedClasses);
    };

    const updateClassName = (targetClassId: number, newName: string) => {
        setClasses(prevClasses => prevClasses.map(cls => cls.id === targetClassId ? {...cls, name: newName} : cls));
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
        updatedMap.set(day, udpatedSchedule);

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

    const createClass = async (className: string) => {
        // TODO: sanitize input
        const data = {
            "name": className
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
                const errorMessage = `Function createClass. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            } else {
                console.log('Class was created successfully!');

                const responseData = await response.json();

                if (isValidCreateResponse(responseData, className)) {
                    console.log(`Function createClass. The response from backend is valid. ${JSON.stringify(responseData)}`);

                    const newClass = {id: responseData.id, name: responseData.name};

                    setCreateClassStatus(`Class ${className} has been created with id ${responseData.id}`);
                    setClasses(prevClasses => [...prevClasses, newClass]);

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

                setSelectedClassId(null);
                setSelectedClassName("");
            }
        } catch(error) {
            console.error(`Error while sending the data to the server when scheduling class: ${error}`);
        }
    };

    // TODO: should I rather have classId and className as parameters, not call state vars inside the function?
    const editClassName = async (newClassName: string) => {
        if (selectedClassId === null || selectedClassName === null) {
            console.warn("No class selected to edit");
            return null;
        }

        const data = {
            "name": newClassName,
        }

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

            if (isValidEditResponse(responseData, selectedClassId, newClassName)) {
                console.log(`Successfully edited class ${newClassName} (was ${selectedClassName}) - ${selectedClassId}!`);
            } else {
                console.warn(`Function editClassName. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
            }

            setIsEditSuccessful(true);

            updateClassName(selectedClassId, newClassName);

            setSelectedClassId(null);
            setSelectedClassName("");
        } else {
            console.warn(`Function editClassName. Request was unsuccessful: ${response.status, response.statusText}`);
        }

        } catch(error) {
            console.error(`Error while sending the data to the server when editing class: ${error}`)
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

    const deleteClassSchedule = async(scheduleId: number, day: number) => {
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

    useEffect(() => {
        fetchClasses();
    },
    []);

    // add useEffect to handle adding the created class to the list?

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
                                    setIsEditModalVisible(true);
                                }}>
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButton]}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setSelectedClassId(cls.id);
                                    setSelectedClassName(cls.name);
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
                    onScheduleClass={scheduleClass}
                    onModalClose={() => {
                        setIsCreateModalVisible(false);
                        setCreateClassStatus("");
                    }}
                    statusMessage={createClassStatus}
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
                    setIsDeleteModalVisible(false)
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
                    setIsEditModalVisible(false)
                }}
                onEditClass={editClassName}
                oldClassName={selectedClassName ?? ""}
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
                    setIsScheduleModalVisible(false)
                }}
                onScheduleDelete={deleteClassSchedule}
                onScheduleClass={scheduleClass}
                scheduleData={currentClassScheduleMap}
                classId={selectedClassId}
                className={selectedClassName}
                isSheduleSuccess={isScheduleSuccessful}
            />
        );
    };

    return (
        <SafeAreaView>
            <ScreenTitle titleText={'Class management'}/>
            {renderHeaderRow()}
            {renderClassList()}
            {renderDeleteClassModal()}
            {renderCreateClassModal()}
            {renderEditClassModal()}
            {renderScheduleListClassModal()}
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
