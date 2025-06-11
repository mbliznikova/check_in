import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, useColorScheme } from 'react-native';

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

type ClassPaymentType = Map<number, {
    className: string;
    amount: number;
    paid: boolean;
  }>;

type PaymentType = {
    id: number;
    studentId: number;
    classId: number;
    studentName: string;
    className: string;
    amount: number;
    paymentDate: string;
};

type PaymentMapType = Map<number, {
    studentName: string;
    paymentData: ClassPaymentType;
  }>;

const Payments = () => {

    const colorScheme = useColorScheme();

    const [loading, setLoading] = useState(true);

    const [students, setStudents] = useState<StudentType[]>([]);

    const [prices, setPrices] = useState<PriceType>({});

    const [payments, setPayments] = useState<PaymentType[]>([]);

    const [paymentTable, setPaymentTable] = useState<PaymentMapType>(new Map());

    const [summary, setSummary] = useState<number>(0.0);

    // Need to construct the object to have students and classes ids and names, prices (not paid) and payments (paid)

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

    const aggregatePayments = ():Map<string, number[]> => {
        const paidMap: Map<string, number[]> = new Map();

        payments.forEach((payment) => {
            const key = `${payment.studentId}-${payment.classId}`;

            if (!paidMap.has(key)) {
                paidMap.set(key, []);
            }

            paidMap.get(key)!.push(payment.amount)

        });

        return paidMap;
    };

    const createPaymentMap = () => {
        const paymentMap: PaymentMapType = new Map();

        const aggregatedPayments = aggregatePayments();

        students.forEach((student) => {
            const studentName = student.firstName + ' ' + student.lastName;
            const paymentData: ClassPaymentType = new Map();

            Object.entries(prices).forEach(([classId, classInfo]) => {
                const className = Object.keys(classInfo)[0];
                const key = `${student.id}-${classId}`;
                const amount = aggregatedPayments.has(key) ? aggregatedPayments.get(key)!.reduce((acc, curr) => acc + curr, 0) : 0.0;
                const paid = aggregatedPayments.has(key) ? true : false;

                paymentData.set(Number(classId), {
                    className,
                    amount,
                    paid,
                });
            });

            const stdData = {
                studentName,
                paymentData,
            }

            paymentMap.set(student.id, stdData)
        });

        setPaymentTable(paymentMap);
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
             // Assume for now that the query returns the payment data only for the current month
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
    []);

    useEffect(() => {
        createPaymentMap();
    },
    [students, prices, payments]);

    const renderHeaderRow = () => {
        return (
            <View>
                <View>
                    <View style={{ flexDirection: "row", padding: 20}}>
                    <Text style={[{paddingRight: 100, paddingTop: 20}, colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Student</Text>
                        {Object.entries(prices).map(([classId, classInfo]) => (
                            <View key={classId} style={{ flexDirection: "row", padding: 20  }}>
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>{Object.keys(classInfo)[0]}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                {students.map((student) => (
                    <View key={student.id} style={{ padding: 20 }}>
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>{student.firstName + " " + student.lastName}</Text>
                    </View>
                ))}
        </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScreenTitle titleText="Payments"/>
            {renderHeaderRow()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
})

export default Payments;