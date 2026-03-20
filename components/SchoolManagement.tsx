import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, View, Text, StyleSheet, FlatList } from "react-native";
import { useOrganizationList } from "@clerk/clerk-expo";

import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useApi } from "@/api/client";
import { useUserRole } from "@/context/UserContext";
import { isValidArrayResponse } from "@/api/validators";
import { SchoolType } from "@/types/school";
import { Header } from "./Header";
import ScreenTitle from "./ScreenTitle";
import CreateSchoolModal from "./CreateSchoolModal";
import EditSchoolModal from "./EditSchoolModal";
import DeleteSchoolModal from "./DeleteSchoolModal";

const SchoolManagement = () => {
    const { apiFetch } = useApi();
    const { createOrganization } = useOrganizationList();
    const textStyle = useThemeTextStyle();
    const { switchSchool, schoolId: activeSchoolId } = useUserRole();

    const [schools, setSchools] = useState<SchoolType[]>([]);
    const [schoolId, setSchoolId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const [isCreateSuccessful, setIsCreateSuccessful] = useState(false);
    const [isEditSuccessful, setIsEditSuccessful] = useState(false);
    const [isDeleteSuccessful, setIsDeleteSuccessful] = useState(false);

    const isValidCreateSchoolResponse = (responseData: any, name: string): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === 'School was created successfully' &&
            'id' in responseData &&
            'name' in responseData && responseData.name === name
        );
    };

    const isValidEditSchoolResponse = (responseData: any, schoolId: number, name: string): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `School was updated successfully` &&
            'schoolId' in responseData && responseData.schoolId === schoolId &&
            'name' in responseData && responseData.name === name
        );
    };

    const isValidDeleteSchoolResponse = (responseData: any, schoolId: number, schoolName: string): boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData && responseData.message === `School ${schoolName} was deleted successfully` &&
            'schoolId' in responseData && responseData.schoolId === schoolId
        );
    };

    const addSchoolToState = (schoolId: number, name: string, clerkOrgId: string, phone: string, address: string) => {
        const newSchools = [...schools];
        newSchools.push({ id: schoolId, name, clerkOrgId, phone, address });
        newSchools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        setSchools(newSchools);
        console.log(`Added new school to state: ${name} : ${schoolId}`);
    };

    const editSchoolInState = (targetSchoolId: number, name: string, phone: string, address: string) => {
        if (!targetSchoolId) {
            console.warn(`No school with id ${targetSchoolId}`);
            return;
        }
        setSchools(prevSchools => prevSchools.map(school =>
            school.id === targetSchoolId
                ? { ...school, name, phone, address }
                : school
        ).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
        console.log(`Updated school ${targetSchoolId}`);
    };

    const removeSchoolFromState = (targetSchoolId: number) => {
        if (!targetSchoolId) {
            console.warn(`No school with id ${targetSchoolId}`);
            return;
        }
        setSchools(schools.filter((s) => s.id !== targetSchoolId));
        console.log(`Removed school ${targetSchoolId} from state`);
    };

    const listSchools = async () => {
        try {
            const response = await apiFetch("/schools/", { method: "GET" });

            if (response.ok) {
                const responseData = await response.json();
                if (isValidArrayResponse(responseData, "response")) {
                    console.log('Function listSchools. The response from backend is valid.');
                    const schoolList: SchoolType[] = responseData.response;
                    schoolList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
                    setSchools(schoolList);
                }
            } else {
                console.log("Function listSchools. Request was unsuccessful: ", response.status, response.statusText);
            }
        } catch (err) {
            console.error("Error while fetching the list of schools: ", err);
        }
    };

    const createSchool = async (name: string, phone: string, address: string) => {
        if (!createOrganization) {
            console.warn('createOrganization is not yet available. Please try again.');
            return;
        }

        let newOrg;
        try {
            newOrg = await createOrganization({ name });
        } catch (error) {
            console.error(`Failed to create Clerk organization: ${error}`);
            return;
        }

        const data = {
            name,
            clerkOrgId: newOrg.id,
            phone,
            address,
        };

        console.log('data is: ' + JSON.stringify(data));

        try {
            const response = await apiFetch("/schools/", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw Error(`Function createSchool. Request was unsuccessful: ${response.status}, ${response.statusText}`);
            }

            const responseData = await response.json();

            if (isValidCreateSchoolResponse(responseData, name)) {
                console.log('Function createSchool. The response from backend is valid.');
                setIsCreateSuccessful(true);
                addSchoolToState(
                    responseData.id,
                    responseData.name,
                    newOrg.id,
                    responseData.phone ?? phone,
                    responseData.address ?? address,
                );
            } else {
                console.warn(`Function createSchool. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
            }
        } catch (error) {
            console.error(`Error while creating school: ${error}`);
        }
    };

    const editSchool = async (newName: string, newPhone: string, newAddress: string) => {
        if (schoolId === null) {
            console.warn("No school selected to edit");
            return;
        }

        const data = { name: newName, phone: newPhone, address: newAddress };
        const previousSchoolId = activeSchoolId;
        switchSchool(schoolId);

        try {
            const response = await apiFetch(`/schools/${schoolId}/edit/`, {
                method: "PATCH",
                headers: { Accept: "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const responseData = await response.json();

                if (isValidEditSchoolResponse(responseData, schoolId, newName)) {
                    console.log('Function editSchool. The response from backend is valid.');
                } else {
                    console.warn(`Function editSchool. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }

                setIsEditSuccessful(true);
                editSchoolInState(schoolId, newName, newPhone, newAddress);
            } else {
                console.warn(`Function editSchool. Request was unsuccessful: ${response.status}, ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while editing school: ${error}`);
        } finally {
            if (previousSchoolId !== null) {
                switchSchool(previousSchoolId);
            }
        }
    };

    const deleteSchool = async () => {
        if (schoolId === null) {
            console.warn("No school selected to delete");
            return;
        }

        const previousSchoolId = activeSchoolId;
        switchSchool(schoolId);

        try {
            const response = await apiFetch(`/schools/${schoolId}/delete/`, {
                method: "DELETE",
            });

            if (response.ok) {
                const responseData = await response.json();

                if (isValidDeleteSchoolResponse(responseData, schoolId, name)) {
                    console.log('Function deleteSchool. The response from backend is valid.');
                } else {
                    console.warn(`Function deleteSchool. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }

                setIsDeleteSuccessful(true);
                removeSchoolFromState(schoolId);
            } else {
                console.warn(`Function deleteSchool. Request was unsuccessful: ${response.status}, ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while deleting school: ${error}`);
        } finally {
            if (previousSchoolId !== null) {
                switchSchool(previousSchoolId);
            }
        }
    };

    useEffect(() => {
        listSchools();
    }, []);

    const renderCreateSchool = () => {
        return (
            <View style={styles.container}>
                <Pressable
                    onPress={() => { setIsCreateModalVisible(true); }}
                    style={({ pressed }) => [
                        styles.button,
                        pressed ? styles.primaryButtonPressed : styles.primaryButtonUnpressed
                    ]}
                >
                    <Text style={[textStyle]}>+ Create School</Text>
                </Pressable>
            </View>
        );
    };

    const renderSchoolList = () => {
        return (
            <FlatList
                data={schools}
                keyExtractor={(school) => school.id.toString()}
                renderItem={({ item: school }) => (
                    <View style={styles.schoolList}>
                        <Text style={[textStyle, styles.schoolName]}>
                            {school.name}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Pressable
                                onPress={() => {
                                    setSchoolId(school.id);
                                    setName(school.name);
                                    setPhone(school.phone);
                                    setAddress(school.address);
                                    setIsEditModalVisible(true);
                                }}
                            >
                                <Text style={[textStyle, styles.actionButtonText]}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setSchoolId(school.id);
                                    setName(school.name);
                                    setIsDeleteModalVisible(true);
                                }}
                            >
                                <Text style={[textStyle, styles.actionButtonText]}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            />
        );
    };

    const renderCreateModal = () => {
        if (!isCreateModalVisible) {
            return null;
        }
        return (
            <CreateSchoolModal
                isVisible={isCreateModalVisible}
                onModalClose={() => {
                    setIsCreateModalVisible(false);
                    setIsCreateSuccessful(false);
                }}
                onCreateSchool={createSchool}
                isCreateSuccess={isCreateSuccessful}
            />
        );
    };

    const renderEditModal = () => {
        if (!isEditModalVisible) {
            return null;
        }
        return (
            <EditSchoolModal
                isVisible={isEditModalVisible}
                onModalClose={() => {
                    setIsEditModalVisible(false);
                    setIsEditSuccessful(false);
                    setSchoolId(null);
                    setName('');
                    setPhone('');
                    setAddress('');
                }}
                oldName={name}
                oldPhone={phone}
                oldAddress={address}
                onEditSchool={editSchool}
                isSuccess={isEditSuccessful}
            />
        );
    };

    const renderDeleteModal = () => {
        if (!isDeleteModalVisible) {
            return null;
        }
        return (
            <DeleteSchoolModal
                isVisible={isDeleteModalVisible}
                onModalClose={() => {
                    setIsDeleteModalVisible(false);
                    setIsDeleteSuccessful(false);
                    setSchoolId(null);
                    setName('');
                }}
                onDeleteSchool={deleteSchool}
                name={name}
                isSuccess={isDeleteSuccessful}
            />
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header/>
            <ScreenTitle titleText='School Management'></ScreenTitle>
            {renderCreateSchool()}
            {renderSchoolList()}
            {renderCreateModal()}
            {renderEditModal()}
            {renderDeleteModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    primaryButtonPressed: {
        backgroundColor: '#c2c0c0',
        borderRadius: 8,
    },
    primaryButtonUnpressed: {
        backgroundColor: 'blue',
        borderRadius: 8,
    },
    schoolList: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    schoolName: {
        paddingLeft: 10,
    },
    actionButtonText: {
        paddingRight: 10,
        textDecorationLine: 'underline',
    },
});

export default SchoolManagement;
