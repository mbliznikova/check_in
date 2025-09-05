import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet, FlatList, Text, useColorScheme, Pressable, Modal } from "react-native";
import ScreenTitle from "./ScreenTitle";

type StudentType = {
    id: number,
    firstName: string,
    lastName: string
};

const StudentManagement = () => {
    const colorScheme = useColorScheme();

    const [students, setStudents] = useState<StudentType[]>([]);

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === "object" &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    };

    const renderHeader = () => {
        return (
            <View style={styles.headerRow}>
                <Pressable
                    onPress={() => {}}
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
            const response = await fetch('http://127.0.0.1:8000/backend/students/');
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

    useEffect(() => {
        fetchStudents();
    }, []);

    const renderStudentList = () => {
        return (
            <FlatList
                data={students}
                keyExtractor={(std) => std.id.toString()}
                renderItem={({ item: std }) => (
                    <View style={styles.studentList}>
                        <Pressable
                            onPress={() => {}}
                            style={{padding: 10}}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.studentName]}>
                                {`${std.firstName} ${std.lastName}`}
                            </Text>
                        </Pressable>
                        <View style={{flexDirection: 'row'}}>
                            <Pressable
                                onPress={() => {}}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButtonText]}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {}}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.actionButtonText]}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            ></FlatList>
        );
    };

    return (
        <SafeAreaView>
            <ScreenTitle titleText='Student Management'></ScreenTitle>
            {renderHeader()}
            {renderStudentList()}
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