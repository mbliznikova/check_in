import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

import ScreenTitle from './ScreenTitle';

type StudentType = {
    id: number;
    firstName: string;
    lastName: string;
};

type PriceType = {
    [classId: string]: {
        [className: string]: number
    },
};

type PaymentType = {
    id: number;
    studentId: number;
    classId: number;
    studentName: string;
    className: string;
    amount: number;
    paymentDate: string;
};

const Payments = () => {

    const [loading, setLoading] = useState(true);

    const [students, setStudents] = useState<StudentType[]>([]);

    const [prices, setPrices] = useState<PriceType>({});

    const [payments, setPayments] = useState<PaymentType[]>([]);

    const [summary, setSummary] = useState<number>(0.0);

    const isValidArrayResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === "object" &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    };

    const isGeneralValidResponse = (responseData: any, key: string): Boolean => {
        return (
            typeof responseData === "object" &&
            responseData !== null &&
            key in responseData
        );
    };

    useEffect(() => {

        const fetchPrices = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/prices/');
                if (response.ok) {
                    const responseData = await response.json();
                    if (isGeneralValidResponse(responseData, "response")) {
                        console.log("Function fetchPrices at Payments.tsx. The response from backend is valid." + JSON.stringify(responseData))

                        const pricesObj: PriceType = responseData.response;

                        setPrices(pricesObj);
                    }
                } else {
                    console.log("Function fetchPrices at Payments.tsx. Request was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of prices: ", err);
            }
        }

        const fetchStudents = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/students/');
                if (response.ok) {
                    const responseData = await response.json();
                    if (isValidArrayResponse(responseData, "response")) {
                        console.log("Function fetchStudents at Payments.tsx. The response from backend is valid." + JSON.stringify(responseData))

                        const studentList: StudentType[] = responseData.response;

                        setStudents(studentList);
                    }
                } else {
                    console.log("Function fetchStudents at Payments.tsx. Request was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of students: ", err);
            }
        }

        const fetchPayments = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/payments/');
                if (response.ok) {
                    const responseData = await response.json();
                    if (isValidArrayResponse(responseData, "response")) {
                        console.log("Function fetchPayments at Payments.tsx. The response from backend is valid." + JSON.stringify(responseData))

                        const paymentList: PaymentType[] = responseData.response;

                        setPayments(paymentList);
                    }
                } else {
                    console.log("Function fetchPayments at Payments.tsx. Request was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the list of payments: ", err);
            }
        }

        const fetchSummary = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/backend/payment_summary/');
                if (response.ok) {
                    const responseData = await response.json();
                    if (isGeneralValidResponse(responseData, "response")) {
                        console.log("Function fetchSummary at Payments.tsx. The response from backend is valid." + JSON.stringify(responseData))

                        const summary: number = responseData.response.summary ?? 0.0;

                        setSummary(summary);
                    }
                } else {
                    console.log("Function fetchSummary at Payments.tsx. Request was unsuccessful: ", response.status, response.statusText)
                }
            } catch (err) {
                console.error("Error while fetching the payment summary: ", err);
            }
        }

        fetchPrices();
        fetchStudents();
        fetchPayments();
        fetchSummary();
    },
    [])

    return (
        <SafeAreaView style={styles.container}>
            <ScreenTitle titleText="Payments"/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
})

export default Payments;