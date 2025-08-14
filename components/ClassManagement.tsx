import { useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";


type ClassType = {
    id: number;
    name: string;
};

const ClassManagement = () => {
    const [classes, setClasses] = useState<ClassType[]>([]);

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === 'object' &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    }

    const fetchClasses = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/backend/classes_list/');
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

    useEffect(() => {
        fetchClasses();
    },
    []);

    // add useEffect to handle adding the created class to the list

    return (
        // Add rendering the list of classes with Edit/Delete and Add Class button
        <SafeAreaView></SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
});

export default ClassManagement;