import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet, FlatList, Text, useColorScheme, Pressable, Modal } from "react-native";

import ScreenTitle from "./ScreenTitle";
import CreateScheduleClass from "./CreateScheduleClass";
import DeleteClassModal from "./DeleteClassModal";
import EditClassModal from "./EditClassModal";


type ClassType = {
    id: number;
    name: string;
};

const ClassManagement = () => {
    const colorScheme = useColorScheme();

    const [classes, setClasses] = useState<ClassType[]>([]);

    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedClassName, setSelectedClassName] = useState<string | null>(null);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

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
    const isValidScheduleResponse = (responseData: any, classId: number, dayName: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === 'Schedule was created successfully' &&
            'classId' in responseData && responseData.classId === classId &&
            // 'className' in responseData && responseData.className === className &&
            'day'  in responseData && responseData.day === dayName &&
            'time' in responseData // TODO: handle the time from response better
        );
    };

    const isValidDeleteResponse = (responseData: any, classId: number, className: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Class ${classId} - ${className} was delete successfully` &&
            'classId' in responseData && responseData.classId === classId &&
            'className' in responseData && responseData.className === className
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

                if (isValidDeleteResponse(responseData, selectedClassId, selectedClassName)) {
                    console.log(`Function deleteClass. The response from backend is valid: ${JSON.stringify(responseData)}`);
                } else {
                    console.warn(`Function deleteClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }

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

            if (!response.ok) {
                const errorMessage = `Function createClass. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            } else {
                console.log('Class was created successfully!');

                const responseData = await response.json();

                if (isValidCreateResponse(responseData, className)) {
                    console.log(`Function createClass. The response from backend is valid. ${JSON.stringify(responseData)}`)
                    setCreateClassStatus(`Class ${className} has been created with id ${responseData.id}`);
                } else {
                    console.log(`Function createClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`)
                }
            }
        } catch(error) {
            console.error(`Error while sending the data to the server when creating class: ${error}`);
        }
    }

    const scheduleClass = async (classToScheduleId: string, day: string, time: string) => {
        // TODO: sanitize input and add checks
        const data = {
            "classId": classToScheduleId,
            "day": day,
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

                if (isValidScheduleResponse(responseData, Number(classToScheduleId), day)
                ) {
                    console.log(`Function scheduleClass. The response from backend is valid. ${JSON.stringify(responseData)}`)
                } else {
                    console.log(`Function scheduleClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`)
                }

                setSelectedClassId(null);
                setSelectedClassName("");
            }
        } catch(error) {
            console.error(`Error while sending the data to the server when scheduling class: ${error}`);
        }
    };

    const editClassName = async (newClassName: string) => {
        if (selectedClassId === null || selectedClassName === null) {
            console.warn("No class selected to delete");
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

            // TODO: update the name of the class here?
            setSelectedClassId(null);
            setSelectedClassName("");
        } else {
            console.warn(`Function editClassName. Request was unsuccessful: ${response.status, response.statusText}`);
        }

        } catch(error) {
            console.error(`Error while sending the data to the server when editing class: ${error}`)
        }
    };

    useEffect(() => {
        fetchClasses();
    },
    []);

    // add useEffect to handle adding the created class to the list

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
                            onPress={() => {}}>
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
                    }}
                    statusMessage={createClassStatus}
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
