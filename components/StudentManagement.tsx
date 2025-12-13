import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet, FlatList, Text, useColorScheme, Pressable } from "react-native";

import { useApi } from "@/api/client";
import ScreenTitle from "./ScreenTitle";
import CreateStudentModal from "./CreateStudentModal";
import DeleteStudentModal from "./DeleteStudentModal";
import EditStudentModal from "./EditStudentModal";
import { Header } from "./Header";

type StudentType = {
    id: number,
    firstName: string,
    lastName: string,
    isLiabilityFormSent: boolean,
    emergencyContacts: string,
};

const StudentManagement = () => {
    const { apiFetch } = useApi();

    const colorScheme = useColorScheme();

    const [students, setStudents] = useState<StudentType[]>([]);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const [studentId, setStudentId] = useState<number | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLiabilityFormSent, setIsLiabilityFormSent] = useState(false);
    const [emergencyContact, setEmergencyContact] = useState("");

    const [isCreateSuccessful, setIsCreateSuccessful] = useState(false);
    const [isEditSuccessful, setIsEditSuccessful] = useState(false);
    const [isDeleteSuccessful, setIsDeleteSuccessful] = useState(false);

    const [studentsSet, setStudentsSet] = useState<Set<string>>(new Set());

    const isValidArrayResponse = (responseData: any, key: string): boolean => {
        return (
            typeof responseData === "object" &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    };

    const isValidCreateStudentResponse = (
        responseData: any,
        firstName: string,
        lastName: string,
        isLiabilityChecked: boolean,
        contacts: string
    ) => {
        return (
            typeof responseData === 'object' &&
            typeof responseData !== null &&
            'message' in responseData && responseData.message === 'Student was created successfully' &&
            'studentId' in responseData &&
            'firstName' in responseData && responseData.firstName === firstName &&
            'lastName' in responseData && responseData.lastName === lastName &&
            'isLiabilityFormSent' in responseData && responseData.isLiabilityFormSent === isLiabilityChecked &&
            'emergencyContacts' in responseData && responseData.emergencyContacts === contacts
        );
    };

    const isValidEditStudentResponse = (
        responseData: any,
        studentId: number,
        newFirstName: string,
        newLastName: string,
        isLiabilityChecked: boolean,
        contacts: string): boolean => {
            return (
                typeof responseData === 'object' &&
                responseData !== null &&
                'message' in responseData && responseData.message === `Student ${studentId} was updated successfully` &&
                'studentId' in responseData && responseData.studentId === studentId &&
                'firstName' in responseData && responseData.firstName === newFirstName &&
                'lastName' in responseData && responseData.lastName === newLastName &&
                'isLiabilityFormSent' in responseData && responseData.isLiabilityFormSent === isLiabilityChecked &&
                'emergencyContacts' in responseData && responseData.emergencyContacts === contacts
            );
    };

    const isValidDeleteStudentResponse = (responseData: any, studentId: number): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `Student ${studentId} was delete successfully` &&
            'studentId' in responseData && responseData.studentId === studentId
        );
    };

    const addStudentToState = (studentId: number, firstName: string, lastName: string, isLiabilityForm: boolean, contacts: string) => {
        const newStudents = [...students];
        newStudents.push({id: studentId, firstName: firstName, lastName: lastName, isLiabilityFormSent: isLiabilityForm, emergencyContacts: contacts});
        newStudents.sort((a, b) => a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase()));

        setStudents(newStudents);

        console.log(`Added new student to the state variable: ${firstName} ${lastName} : ${studentId}`);
    };

    const editStudentInState = (targetStudentId: number, newFirstName: string, newLastName: string, isLiabilityChecked: boolean, contacts: string) => {
        if (!targetStudentId) {
            console.warn(`No student with id ${targetStudentId}`);
            return;
        }

        // TODO: update onlu changed fields?

        setStudents(prevStudents => prevStudents.map(student =>
                student.id === targetStudentId
                ? { ...student, firstName: newFirstName, lastName: newLastName, isLiabilityFormSent: isLiabilityChecked, emergencyContacts: contacts }
                : student
            ).sort((a, b) => a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase()))
        );

        console.log(`Updated student ${targetStudentId} from
            ${firstName} ${lastName}, is liability form sent: ${isLiabilityFormSent}, contacts ${emergencyContact} to
            ${newFirstName} ${newLastName}, liability form sent: ${isLiabilityChecked}, emergency contacts: ${contacts}`);
    };

    const removeStudentFromState = (targetStudentId: number) => {
        if (!targetStudentId) {
            console.warn(`No student with id ${targetStudentId}`);
            return;
        }
        const newStudents = students.filter((std) => std.id !== targetStudentId);
        setStudents(newStudents);
        console.log(`Removed the student ${targetStudentId} from the state variable`);
    };

    const addStudentToUniqueness = (firstName: string, lastName: string) => {
        const newSet = new Set(studentsSet);
        newSet.add(`${firstName} ${lastName}`)
        console.log(`Added ${firstName} ${lastName} to uniqueness`);

        setStudentsSet(newSet);
    };

    // TODO: make sure the parameters are not empty?
    const removeStudentFromUniqueness = (firstName: string, lastName: string) => {
        const newSet = new Set(studentsSet);
        newSet.delete(`${firstName} ${lastName}`)
        console.log(`Removed ${firstName} ${lastName} from uniqueness`);

        setStudentsSet(newSet);
    };

    const ifStudentNameUnique = (firstName: string, lastName: string): boolean => {
        const studentToCheck = `${firstName} ${lastName}`;

        return !studentsSet.has(studentToCheck);
    };

    const getChangesFromEdit = (newFirstName: string, newLastName: string, isLiabilityChecked: boolean, contacts: string) => {
        const dataToUpdate: Record<string, string | boolean> = {};

        const currentStudentState = {
            'firstName': firstName,
            'lastName': lastName,
            'isLiabilityFormSent': isLiabilityFormSent,
            'emergencyContacts': emergencyContact,
        };

        const newStudentState = {
            'firstName': newFirstName,
            'lastName': newLastName,
            'isLiabilityFormSent': isLiabilityChecked,
            'emergencyContacts': contacts,
        };

        for (const key in newStudentState) {
            if (newStudentState[key as keyof typeof newStudentState] !== currentStudentState[key as keyof typeof currentStudentState]) {
                const dynamicKey: string = key;
                dataToUpdate[dynamicKey] = newStudentState[key as keyof typeof newStudentState];
                console.log(`Adding to request body ${dynamicKey}: ${newStudentState[key as keyof typeof newStudentState]}`);
            }
        }

        return dataToUpdate;
    };

    const renderHeader = () => {
        return (
            <View style={styles.headerRow}>
                <Pressable
                    onPress={() => {
                        setIsCreateModalVisible(true);
                    }}
                    style={({pressed}) => [
                        styles.button,
                        pressed ? styles.primaryButtonPressed : styles.primaryButtonUnpressed
                    ]}
                >
                    <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>
                        + Add new student
                    </Text>
                </Pressable>
            </View>
        );
    };

    const fetchStudents = async () => {
        try {
            const response = await apiFetch("/students/",
                { method: "GET" }
            );

            if (response.ok) {
                const responseData = await response.json();
                if (isValidArrayResponse(responseData, "response")) {
                    console.log("Function fetchStudents at StudentManagement.tsx. The response from backend is valid." + JSON.stringify(responseData))

                    const studentList: StudentType[] = responseData.response;
                    studentList.sort((a, b) => a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase()));

                    setStudents(studentList);
                }
            } else {
                console.log("Function fetchStudents at StudentManagement.tsx. Request was unsuccessful: ", response.status, response.statusText)
            }
        } catch (err) {
            console.error("Error while fetching the list of students: ", err);
        }
    };

    const createStudent = async (firstName: string, lastName: string, isLiabilityChecked: boolean, contacts: string) => {
        const data = {
            "firstName": firstName,
            "lastName": lastName,
            "isLiabilityFormSent": isLiabilityChecked,
            "emergencyContacts": contacts,
        };

        console.log('data is: ' + JSON.stringify(data));

        try {
            const response = await apiFetch("/students/", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorMessage = `Function createStudent. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            } else {
                console.log('Student was created successfully!');

                const responseData = await response.json();

                if ( isValidCreateStudentResponse(responseData, firstName, lastName, isLiabilityChecked, contacts)
                ) {
                    console.log(`Function createStudent. The response from backend is valid. ${JSON.stringify(responseData)}`);

                    setIsCreateSuccessful(true);

                    addStudentToState(
                        responseData.studentId,
                        responseData.firstName,
                        responseData.lastName,
                        responseData.isLiabilityFormSent,
                        responseData.emergencyContacts,
                    );

                    addStudentToUniqueness(responseData.firstName, responseData.lastName);
                } else {
                    console.warn(`Function createStudent. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            }
        } catch(error) {
            console.error(`Error while sending the data to the server at creating student: ${error}`);
        }
    };

    const editStudent = async (newFirstName: string, newLastName: string, isLiabilityChecked: boolean, contacts: string) => {
        if (studentId === null) {
            console.warn("No student selected to delete");
            return null;
        }

        const data = getChangesFromEdit(newFirstName, newLastName, isLiabilityChecked, contacts);

        try {
            const response = await apiFetch(`/students/${studentId}/edit/`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const responseData = await response.json();

                if (isValidEditStudentResponse(responseData, studentId, newFirstName, newLastName, isLiabilityChecked, contacts)) {
                    console.log(`Function editStudent. The response from backend is valid! ${JSON.stringify(responseData)}`);
                } else {
                    console.warn(`Function editStudent. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }

                setIsEditSuccessful(true);

                if (firstName !== newFirstName || lastName !== newLastName) {
                    console.log(`Updating uniqueness with ${newFirstName} ${newLastName}`);
                    removeStudentFromUniqueness(firstName, lastName);
                    addStudentToUniqueness(newFirstName, newLastName)
                }

                editStudentInState(studentId, newFirstName, newLastName, isLiabilityChecked, contacts);

            } else {
                console.warn(`Function editStudent. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch(error) {
            console.error(`Error while editing the student: ${error}`);
        }
    };

    const deleteStudent = async () => {
        if (studentId === null) {
            console.warn("No student selected to delete");
            return null;
        }
        try {
            const response = await apiFetch(`/students/${studentId}/delete/`, {
                method: "DELETE",
            });

            if (response.ok) {
                const responseData = await response.json();

                if (isValidDeleteStudentResponse(responseData, studentId)) {
                    console.log(`Function deleteStudent. The response from backend is valid: ${JSON.stringify(responseData)}`);
                } else {
                    console.warn(`Function deleteStudent. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }

                setIsDeleteSuccessful(true);

                removeStudentFromState(studentId);

                removeStudentFromUniqueness(firstName, lastName);

            } else {
                console.warn(`Function deleteStudent. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch(error) {
            console.error(`Error while deleting the student: ${error}`);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const allStudentsSet: Set<string> = new Set();

        students.forEach((std) => {
            allStudentsSet.add(`${std.firstName} ${std.lastName}`)
        });

        setStudentsSet(allStudentsSet);
    }, [students]);

    const renderStudentList = () => {
        return (
            <FlatList
                data={students}
                keyExtractor={(std) => std.id.toString()}
                renderItem={({ item: std }) => (
                    <View style={styles.studentList}>
                        <Pressable
                            onPress={() => {
                                setStudentId(std.id);
                                setFirstName(std.firstName);
                                setLastName(std.lastName);
                                setIsLiabilityFormSent(std.isLiabilityFormSent);
                                setEmergencyContact(std.emergencyContacts);
                                setIsEditModalVisible(true);
                            }}
                            style={{padding: 10}}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.studentName]}>
                                {`${std.firstName} ${std.lastName}`}
                            </Text>
                        </Pressable>
                        <View style={{flexDirection: 'row'}}>
                            <Pressable
                                onPress={() => {
                                    setStudentId(std.id);
                                    setFirstName(std.firstName);
                                    setLastName(std.lastName);
                                    setIsLiabilityFormSent(std.isLiabilityFormSent);
                                    setEmergencyContact(std.emergencyContacts);
                                    setIsEditModalVisible(true);
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButtonText]}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setStudentId(std.id);
                                    setFirstName(std.firstName);
                                    setLastName(std.lastName);
                                    setIsDeleteModalVisible(true);
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButtonText]}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            ></FlatList>
        );
    };

    const renderCreateModal = () => {
        if (!isCreateModalVisible) {
            return null;
        }
        return (
            <CreateStudentModal
                isVisible={isCreateModalVisible}
                onModalClose={() => {
                    setIsCreateModalVisible(false);
                    setIsCreateSuccessful(false);
                }}
                onCreateStudent={createStudent}
                onUniquenessCheck={ifStudentNameUnique}
                isCreateSuccess={isCreateSuccessful}
            />
        );
    };

    const renderEditModal = () => {
        if (!isEditModalVisible) {
            return null;
        }
        return (
            <EditStudentModal
                isVisible={isEditModalVisible}
                onModalClose={() => {
                    setIsEditModalVisible(false);
                    setIsEditSuccessful(false);
                    setStudentId(null);
                    setFirstName('');
                    setLastName('');
                    setIsLiabilityFormSent(false);
                    setEmergencyContact("");
                }}
                oldFirstName={firstName}
                oldLastName={lastName}
                onEditStudent={editStudent}
                onUniquenessCheck={ifStudentNameUnique}
                isLiabilityFormSent={isLiabilityFormSent}
                emergencyContacts={emergencyContact}
                isSuccess={isEditSuccessful}
            />
        );
    };

    const renderDeleteStudentModal = () => {
        if (!isDeleteModalVisible) {
            return null;
        }
        return (
            <DeleteStudentModal
                isVisible={isDeleteModalVisible}
                onModalClose={() => {
                    setIsDeleteModalVisible(false);
                    setIsDeleteSuccessful(false);
                    setStudentId(null);
                    setFirstName('');
                    setLastName('');
                    setIsLiabilityFormSent(false);
                    setEmergencyContact("");
                }}
                onDeleteStudent={deleteStudent}
                firstName={firstName}
                lastName={lastName}
                isSuccess={isDeleteSuccessful}
            />
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header/>
            <ScreenTitle titleText='Student Management'></ScreenTitle>
            {renderHeader()}
            {renderStudentList()}
            {renderCreateModal()}
            {renderEditModal()}
            {renderDeleteStudentModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        padding: 20,
        paddingBottom: 20,
        marginLeft: 'auto'
    },
    studentList: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    studentName: {
        paddingLeft: 10,
        textDecorationLine: 'underline',
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        // elevation: 3,
    },
    primaryButtonPressed: {
        backgroundColor: '#c2c0c0',
        borderRadius: 8,
    },
    primaryButtonUnpressed: {
        backgroundColor: 'blue',
        borderRadius: 8,
    },
    actionButtonText: {
        paddingRight: 10,
        textDecorationLine: 'underline',
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
});

export default StudentManagement;