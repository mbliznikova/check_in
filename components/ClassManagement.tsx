import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet, FlatList, Text, useColorScheme, Pressable, Modal } from "react-native";
import ScreenTitle from "./ScreenTitle";


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

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
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

    const deleteClass = async (classId: number | null, className: string | null) => {
        if (classId === null || className === null) {
            console.warn("No class selected to delete");
            return null;
        }
        try {
            const response = await fetch(`http://127.0.0.1:8000/backend/classes/${classId}/delete/`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                const responseData = await response.json();

                if (isValidDeleteResponse(responseData, classId, className)) {
                    console.log(`Function deleteClass. The response from backend is valid: ${JSON.stringify(responseData)}`);
                } else {
                    console.warn(`Function deleteClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function deleteClass. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch(error) {
            console.error(`Error while deleting the class: ${error}`);
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
                    onPress={() => {}}>
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
                                onPress={() => {}}>
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButton]}>Update</Text>
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

    const renderDeleteClassModal = () => {
        if (!isDeleteModalVisible) {
            return null;
        }
        return (
            <Modal
                visible={isDeleteModalVisible}
                transparent={true}
                onRequestClose={() => {
                    setIsDeleteModalVisible(false)
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <View style={styles.modalInfo}>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                                Do you want to delete {selectedClassName} class (id {selectedClassId})?
                            </Text>
                        </View>
                        <View style={styles.modalButtonsContainer}>
                            <Pressable
                                style={styles.modalConfirmButton}
                                onPress={async () => {
                                    try {
                                        await deleteClass(selectedClassId, selectedClassName);
                                    }
                                    catch (error) {
                                        console.error("Could not delete class: ", error);
                                        alert("Could not delete class.");
                                    }
                                    setIsDeleteModalVisible(false);
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>OK</Text>
                            </Pressable>
                            <Pressable
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setIsDeleteModalVisible(false);
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <SafeAreaView>
            <ScreenTitle titleText={'Class management'}/>
            {renderHeaderRow()}
            {renderClassList()}
            {renderDeleteClassModal()}
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '50%',
        height: '40%',
        backgroundColor: 'black', //TODO: make it adjustable
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalInfo: {
        padding: 20,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        alignItems: 'center',
        width: '30%',
    },
    modalConfirmButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'green',
    },
    modalCancelButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'grey',
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
});

export default ClassManagement;
