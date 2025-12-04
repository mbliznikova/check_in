import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, useColorScheme, ScrollView, Dimensions, Pressable, Modal, TextInput } from 'react-native';

import ScreenTitle from './ScreenTitle';
import { Header } from './Header';

type StudentType = {
    id: number;
    firstName: string;
    lastName: string;
};

type RawPriceType = {
    [classId: string]: {
        className: string;
        amount: number;
        priceId: number;
    };
};

type PriceType = Map<number, {
    className: string;
    amount: number;
    priceId: number;
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

    const screenWidth = Dimensions.get('window').width;

    const [loading, setLoading] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [students, setStudents] = useState<StudentType[]>([]);

    const [prices, setPrices] = useState<PriceType>(new Map());

    const [payments, setPayments] = useState<PaymentType[]>([]);

    const [paymentTable, setPaymentTable] = useState<PaymentMapType>(new Map());

    const [summary, setSummary] = useState<number>(0.0);

    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

    const [selectedPrice, setSelectedPrice] = useState<number>(0.0);

    const [selectedStudentName, setSelectedStudentName] = useState<string>("");

    const [selectedClassName, setSelectedClassName] = useState<string>("");

    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const monthNumber = today.getMonth() + 1;
    const todayYear = today.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(monthNumber);

    const [selectedYear, setSelectedYear] = useState(todayYear);

    const [monthInput, setMonthInput] = useState(selectedMonth.toString());

    const [yearInput, setYearInput] = useState(selectedYear.toString());

    const readMonth = (monthString: string) => {
        console.log('The month from user input is: ' + monthString);
        const monthConverted = Number(monthString);
        if (!Number.isNaN(monthConverted) && 1 <= monthConverted && monthConverted <= 12) {
            setSelectedMonth(monthConverted);
        } else {
            console.warn('The month number from ' + monthString + ' is incorrect: ' + monthConverted);
        }
        setMonthInput(monthString);
    };

    const readYear = (yearString: string) => {
        console.log('The year from user input is: ' + yearString);
        const yearConverted = Number(yearString);
        // TODO: think about year range?
        if (!Number.isNaN(yearConverted)) {
            setSelectedYear(yearConverted);
        } else {
            console.warn('The year number from ' + yearString + ' is incorrect: ' + yearConverted);
        }
        setYearInput(yearString);
    };

    const isValidArrayResponse = (responseData: any, key: string): boolean => {
        return (
            typeof responseData === "object" &&
            responseData !== null &&
            key in responseData &&
            Array.isArray(responseData[key])
        );
    };

    const isGeneralValidResponse = (responseData: any, key: string): boolean => {
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
                const className = classInfo.className;
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
                            .map(
                                ([key, value]): [number, { className: string; amount: number; priceId: number }] =>
                                    [Number(key), value]
                            )
                            .sort((a, b) =>
                                a[1].className.toLowerCase().localeCompare(b[1].className.toLowerCase())
                            )
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
        try {
            const params = new URLSearchParams();
            params.append('month', selectedMonth.toString());
            params.append('year', selectedYear.toString());
            const response = await fetch(`http://127.0.0.1:8000/backend/payments/?${params}`);

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
            const params = new URLSearchParams();
            params.append('month', selectedMonth.toString());
            params.append('year', selectedYear.toString());
            const response = await fetch(`http://127.0.0.1:8000/backend/payment_summary/?${params}`);

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
    };

    const submitPayment = async (
        studentId: number,
        classId: number,
        studentName: string,
        className: string,
        amount: number,
    ) => {
        const todayDate = today.toISOString();
        const todayMonth = today.getMonth() + 1;
        const todayYear = today.getFullYear();

        const data = {
            paymentData: {
                studentId: studentId,
                classId: classId,
                studentName: studentName,
                className: className,
                amount: amount,
                paymentDate: todayDate,
                month: todayMonth, // TODO: handle it better [from UI]
                year: todayYear, // TODO: handle it better [from UI]
            }
        }

        console.log('data is: ' + JSON.stringify(data));

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/backend/payments/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorMessage = `Function submitPayment. Request was unsuccessful: ${response.status}, ${response.statusText}`;
                throw Error(errorMessage);
            }

            console.log('Payment was sent successfully!');

            const responseData = await response.json();
            // TODO: validation function and think of studentId, classId and paymentDate more precise validation
            if (
                typeof responseData === 'object' &&
                responseData !== null &&
                'message' in responseData && responseData.message === 'Payment was successfully created' &&
                'paymentId' in responseData && typeof responseData.paymentId === 'number' &&
                // Not checking responseData.classId === classId for the case the student/class was deleted and no such FK in Payment in BE,
                // but the payment was added (retrospective), in case Payments FE was not refreshed after student/class was deleted?
                'studentId' in responseData &&
                'classId' in responseData &&
                'studentName' in responseData && responseData.studentName === studentName &&
                'className' in responseData && responseData.className === className &&
                'amount' in responseData && responseData.amount === amount &&
                // Not checking the exact value for paymentDate now because if, fsr, the BE fails to parse and
                // inserts it's default value, there will be mismatch. Could happen in seconds around midnight/another month/etc
                'paymentDate' in responseData &&
                'paymentMonth' in responseData && 'paymentYear' in responseData &&
                responseData.paymentMonth === todayMonth && responseData.paymentYear === todayYear
            ) {
                console.log('Function submitPayment. The response from backend is valid. ' + JSON.stringify(responseData));
            } else {
                console.warn('Function submitPayment. The response from backend is NOT valid! '  + JSON.stringify(responseData));
            }

        } catch (err) {
            console.warn("Error while sending the data to the server at student check-in: ", err);
        }
    };

    const submitMonthYearSelection = async() => {
        console.log('Function submitMonthYearSelection: requesting Payment data for ' + selectedMonth + ' of ' + selectedYear);
        fetchPayments();
        fetchSummary();
    };

    useEffect(() => {
        fetchPrices();
        fetchStudents();
        fetchPayments();
        fetchSummary();
    },
    []);

    useEffect(() => {
        // TODO: make sure the payment is loaded if there are payments at all?.. Avoid case when no payments made yet this month and it blocks
        const ready = students.length > 0 && prices.size > 0;

        if (ready) {
            createPaymentTable();
        }
    },
    [students, prices, payments]);

    const renderHeaderRow = () => {
        const priceArray = Array.from(prices);
        return (
        <View>
            <View style={[styles.headerRow, styles.whiteBorderLine]}>
                <Text style={{paddingRight: 150}}></Text>
                {priceArray.map(([classId, classInfo]) => {
                    const className = classInfo.className;
                    return (
                        <Text key={classId} style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                            {className}
                        </Text>
                    );
                })}
            </View>
        </View>
        );
    };

    const renderTableBody = () => {
        return (
            <View style={styles.whiteBorderLine}>
            {students.map((student) => {

                const studentData = paymentTable.get(student.id) ?? {studentName: "", paymentData: new Map()};
                const paymentData: ClassPaymentType = studentData ? studentData.paymentData : new Map();

                return (
                    <View key={student.id} style={styles.spaceBetweenRow}>
                        <View style={{ width: 120 }}>
                            <Text key={student.id} style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                                {studentData.studentName}
                            </Text>
                        </View>

                        {Array.from(paymentData.entries()).map(([classId, classInfo]) => {

                            const amount: number = classInfo.amount ?? 0.0;
                            const isPaid: boolean = classInfo.paid ?? false;

                            const classPrice = prices.get(Number(classId));
                            const className = classPrice ? classPrice.className : "Undefined";
                            const price = classPrice ? classPrice.amount : 0.0;

                            return (
                                <View key={classId} style={[styles.spaceBetweenRow]}>
                                    <View key={classId} style={[styles.column, styles.cell]}>
                                        <Text style={[isPaid? styles.paidText : styles.unpaidText, { fontWeight: "bold" }]}>
                                            {isPaid ? amount + " - Paid" : price}
                                        </Text>
                                        <View style={styles.paymentButtonContainer}>
                                            <Pressable
                                                style={[styles.paymentButton, isPaid? styles.paidBorder : styles.unpaidBorder]}
                                                onPress={() => {
                                                    setSelectedStudentId(student.id);
                                                    setSelectedClassId(classId);
                                                    setSelectedStudentName(studentData.studentName);
                                                    setSelectedClassName(className);
                                                    setSelectedPrice(price);
                                                    setIsModalVisible(true);
                                                }}>
                                                <Text style={[isPaid? styles.paidText : styles.unpaidText]}>{isPaid ? "Pay more?" : "Pay"}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                );
            })}
            </View>
        );
    };

    const renderModal = () => {
        if (!isModalVisible || selectedStudentId === null || selectedClassId === null) {
            return null;
        }
        return (
            <Modal
                visible={isModalVisible}
                transparent={true}
                onRequestClose={() => {
                    setIsModalVisible(false)
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <View style={styles.modalInfo}>
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                                Do you want to add ${selectedPrice} for {selectedStudentName}, {selectedClassName} class?
                            </Text>
                        </View>
                        <View style={styles.modalButtonsContainer}>
                            <Pressable
                                style={styles.modalConfirmButton}
                                onPress={async () => {
                                    try {
                                        await submitPayment(
                                            selectedStudentId,
                                            selectedClassId,
                                            selectedStudentName,
                                            selectedClassName,
                                            selectedPrice,
                                        );
                                        await fetchPayments();
                                        await fetchSummary();
                                        setIsModalVisible(false);
                                } catch (error) {
                                    console.error("Could not submit payment: ", error);
                                    alert("Could not complete payment.");
                                }
                                }}
                            >
                                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>OK</Text>
                            </Pressable>
                            <Pressable
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setIsModalVisible(false);
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

    const renderSummary = () => {
        return (
            <View style={[styles.spaceBetweenRow]}>
                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.summary]}>Summary:</Text>
                <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.summary]}>{summary}</Text>
            </View>
        );
    };

    const renderSelector = () => {
        return (
            <View style={styles.selector}>
                <View style={{paddingRight: 20}}>
                    <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.selectorText]}>Select month and year to display:</Text>
                </View>
                <TextInput
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                    value={monthInput}
                    onChangeText={(newMonth) => {readMonth(newMonth)}}
                />
                <View style={{width: 10}}></View>
                <TextInput
                    style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, styles.inputFeld]}
                    value={yearInput}
                    onChangeText={(newYear) => {readYear(newYear)}}
                />
                <View style={{width: 10}}></View>
                <Pressable
                    onPress = {() => {
                        submitMonthYearSelection();
                    }}
                    style={[styles.paymentButton, styles.selectorButtonColor]}
                >
                    <Text style={colorScheme === 'dark'? styles.lightColor : styles.darkColor}>Show</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header/>
            <ScreenTitle titleText={`Payments (${monthName} ${todayYear})`}/>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            {renderSelector()}
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <ScrollView horizontal={true}>
                    <View style={{minWidth: screenWidth }}>
                        {renderHeaderRow()}
                        {renderTableBody()}
                        {renderModal()}
                        {renderSummary()}
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // TODO: think of how to adjust for different screen sizes
    container: {
        flex: 1,
        padding: 10,
    },
    whiteBorderLine: {
        borderBottomWidth: 1,
        borderBottomColor: 'white',
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: 'space-between',
        padding: 20,
    },
    spaceBetweenRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
    cell: {
        width: 100,
        // padding: 10,
    },
    column: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    paymentButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentButton: {
        paddingVertical: 7,
        paddingHorizontal: 5,
        marginVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
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
    paidText: {
        color: 'green',
    },
    unpaidText: {
        color: 'red',
    },
    paidBorder: {
        borderColor: 'green',
    },
    unpaidBorder: {
        borderColor: 'red',
    },
    summary: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    selector: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectorText: {
        paddingHorizontal: 10,
        fontWeight: 'bold',
    },
    selectorButtonColor: {
        borderColor: 'grey',
    },
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
    inputFeld: {
        height: 30,
        width: 100,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 15,
      },
})

export default Payments;