import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, useColorScheme } from 'react-native';

import ScreenTitle from './ScreenTitle';

type StudentType = {
    id: number;
    firstName: string;
    lastName: string;
};

type RawPriceType = {
    [classId: string]: {
        [className: string]: number
    },
};

type PriceType = Map<number, {
    [className: string]: number
}>;

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

    const [prices, setPrices] = useState<PriceType>(new Map());

    const [payments, setPayments] = useState<PaymentType[]>([]);

    const [paymentTable, setPaymentTable] = useState<PaymentMapType>(new Map());

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

    const createPaymentTable = () => {
        const paymentMap: PaymentMapType = new Map();

        const aggregatedPayments = aggregatePayments();

        students.forEach((student) => {
            const studentName = student.firstName + ' ' + student.lastName;
            const paymentData: ClassPaymentType = new Map();

            prices.forEach((classInfo, classId) => {
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

                        const rawPricesObj: RawPriceType = responseData.response;

                        const pricesObj: PriceType = new Map(
                            Object.entries(rawPricesObj)
                                .map(([key, value]) => [Number(key), value] as [number, { [className: string]: number }])
                                .sort((a, b) => {
                                        const nameA = Object.keys(a[1])[0].toLowerCase();
                                        const nameB = Object.keys(b[1])[0].toLowerCase();
                                        return nameA.localeCompare(nameB);
                                    })
                        );

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
                        studentList.sort((a, b) => a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase()));

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
        createPaymentTable();
    },
    [students, prices, payments]);

    const renderHeaderRow = () => {
        const priceArray = Array.from(prices);
        return (
        <View>
            <View style={{ flexDirection: "row" }}>
                <Text style={{paddingRight: 150}}></Text>
                {priceArray.map(([classId, classInfo]) => {
                    const className = Object.keys(classInfo)[0];
                    return (
                        <View key={classId} style={{ flexDirection: "row", padding: 20  }}>
                            <Text key={classId} style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>{className}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
        );
    };

    const renderTableBody = () => {
        return (
            <View>
            {students.map((student) => {

                const studentData = paymentTable.get(student.id) ?? {studentName: "", paymentData: new Map()};
                const paymentData: ClassPaymentType = studentData ? studentData.paymentData : new Map();

                return (
                    <View key={student.id} style={{ flexDirection: "row", padding: 20  }}>
                        <Text key={student.id} style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>{studentData.studentName}</Text>

                        {Array.from(paymentData.entries()).map(([classId, classInfo]) => {

                            const amount: number = classInfo.amount ?? 0.0;
                            const isPaid: boolean = classInfo.paid ?? false;

                            const classPrice = prices.get(Number(classId));
                            const className = classPrice ? Object.keys(classPrice)[0] : undefined;
                            const price = classPrice && className ? classPrice[className] : 0.0;

                            return (
                                <View key={classId} style={{ flexDirection: "row", paddingHorizontal: 20}}>
                                    <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>{isPaid ? amount : price}</Text>
                                </View>
                            );
                        })}
                    </View>
                );
            })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScreenTitle titleText="Payments"/>
                {renderHeaderRow()}
                {renderTableBody()}
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