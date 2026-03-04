import { useState, useEffect } from "react";
import { useApi } from "@/api/client";
import { isValidArrayResponse } from "@/api/validators";
import { ClassType, PriceItem, PriceMap } from "@/types/class";

const isValidCreateResponse = (responseData: any, className: string, classDuration: number, isRecurring: boolean): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Class was created successfully' &&
        'id' in responseData &&
        'name' in responseData && responseData.name === className &&
        'durationMinutes' in responseData && responseData.durationMinutes === classDuration &&
        'isRecurring' in responseData && responseData.isRecurring === isRecurring
    );
};

const isValidEditClassResponse = (responseData: any, classId: number, className: string, classDuration: number): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Class was updated successfully' &&
        'classId' in responseData && responseData.classId === classId &&
        'className' in responseData && responseData.className === className &&
        'durationMinutes' in responseData && responseData.durationMinutes === classDuration
    );
};

const isValidDeleteClassResponse = (responseData: any, classId: number, className: string): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === `Class ${classId} - ${className} was deleted successfully` &&
        'classId' in responseData && responseData.classId === classId &&
        'className' in responseData && responseData.className === className
    );
};

const isValidPriceResponse = (responseData: any): boolean => {
    return (
        typeof responseData === "object" &&
        responseData !== null &&
        'response' in responseData
    );
};

const isValidEditPriceResponse = (responseData: any, priceId: number, newAmount: number): boolean => {
    return (
        typeof responseData === "object" &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Price was updated successfully' &&
        'id' in responseData && responseData.id === priceId &&
        'amount' in responseData && responseData.amount == newAmount
    );
};

const isValidCreatePriceResponse = (responseData: any, classId: number, amount: number): boolean => {
    return (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData && responseData.message === 'Price was created successfully' &&
        'priceId' in responseData &&
        'classId' in responseData && responseData.classId === classId &&
        'amount' in responseData && responseData.amount === amount
    );
};

export function useClassData() {
    const { apiFetch } = useApi();

    const [classes, setClasses] = useState<ClassType[]>([]);
    const [classesSet, setClassesSet] = useState<Set<string>>(new Set());
    const [prices, setPrices] = useState<PriceMap>(new Map());
    const [createdClassId, setCreatedClassId] = useState<number | null>(null);
    const [createModal, setCreateModal] = useState({ isVisible: false, isSuccess: false, isError: false });
    const [editModal, setEditModal] = useState({ isVisible: false, isSuccess: false });
    const [deleteModal, setDeleteModal] = useState({ isVisible: false, isSuccess: false });

    useEffect(() => {
        fetchClasses();
        fetchPrices();
    }, []);

    useEffect(() => {
        const classSet: Set<string> = new Set();
        classes.forEach((cls) => { classSet.add(cls.name); });
        setClassesSet(classSet);
    }, [classes]);

    const fetchClasses = async () => {
        try {
            const response = await apiFetch("/classes/", { method: "GET" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidArrayResponse(responseData, 'response')) {
                    console.log(`Function fetchClasses. The response from backend is valid.`);
                    setClasses(responseData.response);
                } else {
                    console.warn(`Function fetchClasses. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
            } else {
                console.warn(`Function fetchClasses. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while fetching the classes from the server: ${error}`);
        }
    };

    const fetchPrices = async () => {
        try {
            const response = await apiFetch("/prices/", { method: "GET" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidPriceResponse(responseData)) {
                    console.log("Function fetchPrices. The response from backend is valid.");
                    const priceData: PriceMap = new Map(
                        Object.entries(responseData.response).map(
                            ([classIdStr, value]) => [Number(classIdStr), value] as [number, PriceItem]
                        )
                    );
                    setPrices(priceData);
                }
            } else {
                console.log("Function fetchPrices. Request was unsuccessful: ", response.status, response.statusText);
            }
        } catch (err) {
            console.error("Error while fetching the list of prices: ", err);
        }
    };

    const createClassPrice = async (classId: number, amount: number) => {
        if (!classId || !amount) {
            console.warn("No class id or no amount");
            return;
        }
        const data = { classId, amount };
        try {
            const response = await apiFetch("/prices/", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw Error(`Function createClassPrice. Request was unsuccessful: ${response.status}, ${response.statusText}`);
            }
            console.log('Price was created successfully!');
            const responseData = await response.json();
            if (isValidCreatePriceResponse(responseData, classId, amount)) {
                console.log(`Function createClassPrice. The response from backend is valid.`);
            } else {
                console.log(`Function createClassPrice. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
            }
        } catch (error) {
            console.error(`Error while sending the data to the server when creating price: ${error}`);
        }
    };

    const createClass = async (className: string, price: number, classDuration: number = 60, isRecurring: boolean = true) => {
        const data = { name: className, durationMinutes: classDuration, isRecurring };
        try {
            const response = await apiFetch("/classes/", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                setCreateModal(prev => ({ ...prev, isError: true }));
                throw Error(`Function createClass. Request was unsuccessful: ${response.status}, ${response.statusText}`);
            }
            console.log('Class was created successfully!');
            const responseData = await response.json();
            if (isValidCreateResponse(responseData, className, classDuration, isRecurring)) {
                console.log(`Function createClass. The response from backend is valid.`);
                const newClass: ClassType = {
                    id: responseData.id,
                    name: responseData.name,
                    durationMinutes: responseData.durationMinutes,
                    isRecurring: responseData.isRecurring,
                };
                setCreateModal(prev => ({ ...prev, isSuccess: true }));
                setCreatedClassId(responseData.id);
                setClasses(prevClasses => [...prevClasses, newClass]);
                createClassPrice(responseData.id, price);
            } else {
                console.log(`Function createClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
            }
        } catch (error) {
            console.error(`Error while sending the data to the server when creating class: ${error}`);
        }
    };

    const editClass = async (
        classId: number,
        currentName: string,
        currentDuration: number,
        currentRecurrence: boolean,
        newName: string,
        newDuration: number,
        newRecurrence: boolean,
    ) => {
        const dataToUpdate: Record<string, string | number | boolean> = {};
        const current = { name: currentName, durationMinutes: currentDuration, isRecurring: currentRecurrence };
        const next = { name: newName, durationMinutes: newDuration, isRecurring: newRecurrence };
        for (const key in next) {
            if (next[key as keyof typeof next] !== current[key as keyof typeof current]) {
                dataToUpdate[key] = next[key as keyof typeof next];
                console.log(`Adding to request body ${key}: ${next[key as keyof typeof next]}`);
            }
        }
        try {
            const response = await apiFetch(`/classes/${classId}/edit/`, {
                method: "PUT",
                headers: { Accept: "application/json" },
                body: JSON.stringify(dataToUpdate),
            });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidEditClassResponse(responseData, classId, newName, newDuration)) {
                    console.log(`Successfully edited class ${newName} (was ${currentName}) - ${classId}. Duration: ${currentDuration} -> ${newDuration}.`);
                } else {
                    console.warn(`Function editClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
                setEditModal(prev => ({ ...prev, isSuccess: true }));
                setClasses(prevClasses =>
                    prevClasses.map(cls =>
                        cls.id === classId
                            ? { ...cls, name: newName, durationMinutes: newDuration, isRecurring: newRecurrence }
                            : cls
                    )
                );
            } else {
                console.warn(`Function editClass. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while sending the data to the server when editing class: ${error}`);
        }
    };

    const deleteClass = async (classId: number, className: string) => {
        try {
            const response = await apiFetch(`/classes/${classId}/delete/`, { method: "DELETE" });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidDeleteClassResponse(responseData, classId, className)) {
                    console.log(`Function deleteClass. The response from backend is valid.`);
                } else {
                    console.warn(`Function deleteClass. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
                setDeleteModal(prev => ({ ...prev, isSuccess: true }));
                setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
            } else {
                console.warn(`Function deleteClass. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while deleting the class: ${error}`);
        }
    };

    const editPrice = async (priceId: number, newAmount: number, classId: number) => {
        const data = { amount: newAmount };
        try {
            const response = await apiFetch(`/prices/${priceId}/`, {
                method: "PATCH",
                headers: { Accept: "application/json" },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                const responseData = await response.json();
                if (isValidEditPriceResponse(responseData, priceId, newAmount)) {
                    console.log(`Function editPrice. The response from backend is valid.`);
                } else {
                    console.warn(`Function editPrice. The response from backend is NOT valid! ${JSON.stringify(responseData)}`);
                }
                setEditModal(prev => ({ ...prev, isSuccess: true }));
                const newMap = new Map(prices);
                const item = newMap.get(classId);
                if (item) {
                    newMap.set(classId, { ...item, amount: newAmount });
                    setPrices(newMap);
                }
            } else {
                console.warn(`Function editPrice. Request was unsuccessful: ${response.status, response.statusText}`);
            }
        } catch (error) {
            console.error(`Error while editing a price: ${error}`);
        }
    };

    const checkIfClassUnique = (name: string): boolean => {
        return !classesSet.has(name);
    };

    const openCreateModal = () => setCreateModal(prev => ({ ...prev, isVisible: true }));
    const closeCreateModal = () => {
        setCreateModal({ isVisible: false, isSuccess: false, isError: false });
        setCreatedClassId(null);
    };

    const openEditModal = () => setEditModal(prev => ({ ...prev, isVisible: true }));
    const closeEditModal = () => setEditModal({ isVisible: false, isSuccess: false });

    const openDeleteModal = () => setDeleteModal(prev => ({ ...prev, isVisible: true }));
    const closeDeleteModal = () => setDeleteModal({ isVisible: false, isSuccess: false });

    return {
        // Read-only state
        classes,
        prices,
        createdClassId,
        isCreateModalVisible: createModal.isVisible,
        isCreateSuccess: createModal.isSuccess,
        isCreateError: createModal.isError,
        isEditModalVisible: editModal.isVisible,
        isEditSuccess: editModal.isSuccess,
        isDeleteModalVisible: deleteModal.isVisible,
        isDeleteSuccess: deleteModal.isSuccess,
        // Actions
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,
        openDeleteModal,
        closeDeleteModal,
        createClass,
        editClass,
        deleteClass,
        editPrice,
        checkIfClassUnique,
    };
}
