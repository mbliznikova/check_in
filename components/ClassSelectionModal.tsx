import * as React from 'react';  
import { useEffect, useState } from 'react';
import {View, StyleSheet, Pressable, Button, Text, Modal} from 'react-native';

import Checkbox from './Checkbox';

type StudentType = {
    firstName: string;
    lastName: string;
    id: number;
    classes?: Set<number>;
};

type ClassType = {
    id: number;
    name: string;
};

type ClassSelectionModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onConfirm: (selectedClassesIds: number[]) => void;
    student?: StudentType | null;
    allClassesList: ClassType[];
};

const ClassSelectionModal = ({
    isVisible = false,
    onModalClose,
    onConfirm,
    student,
    allClassesList
}: ClassSelectionModalProps) => {

    const [classSelectionState, setClassSelectionState] = useState(() => {
        return new Map(allClassesList.map(cls => [cls.id, false]))
    });

    const [isModalVisible, setIsModalVisible] = useState(isVisible);

    useEffect(() => {
        setIsModalVisible(isVisible);

        if (student?.classes?.size) {
            initializeClassSelection(student);
        }

        return () => {
            resetClassSelection();
        };

    }, [isVisible, student]);

    function getSelectedClassesIds() {
        const classesIds: number[] = [];
        classSelectionState?.forEach((value, key) => {
            if (value === true) {
                classesIds.push(key);
            }
        })
        return classesIds;
    }

    function toggleClass(classId: number) {
        setClassSelectionState(prevSelectedClasses => {
            return new Map(prevSelectedClasses).set(classId, !prevSelectedClasses?.get(classId));
        })
    }

    function initializeClassSelection(student: StudentType) {
        if (student.classes?.size) {
            Array.from(student.classes).forEach(clsId => {
                setClassSelectionState(prevSelectedClasses => {
                    return new Map(prevSelectedClasses).set(clsId, true);
                })
            })
        }
    }

    function resetClassSelection() {
        setClassSelectionState(new Map(allClassesList.map(cls => [cls.id, false])));
    }

    function closeModal() {
        setIsModalVisible(false);
        onModalClose();
    }

    return (
        <Modal
            visible={isModalVisible}
            transparent={true}
            animationType='fade'
            onRequestClose={() => {
                closeModal();
            }}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                     <Text style={styles.modalTitle}>Check in {student?.firstName} {student?.lastName}</Text>
                     <View style={styles.modalList}>
                        {allClassesList.map((cls) => (
                                <Checkbox
                                    key={cls.id}
                                    label={cls.name}
                                    checked={classSelectionState?.get(cls.id) ?? false}
                                    onChange={() => {toggleClass(cls.id)}}>
                                </Checkbox>
                            ))}
                     </View>
                     <Pressable style={styles.modalConfirmButton} onPress={() => {
                        onConfirm(getSelectedClassesIds());
                        closeModal();
                     }}>
                        <Text style={styles.modalText}>Confirm</Text>
                     </Pressable>
                     <Pressable style={styles.modalCancelButton} onPress={() => {
                        closeModal();
                     }}>
                        <Text style={styles.modalText}>Cancel</Text>
                     </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        padding: 35,
        borderRadius: 20,
        alignItems: 'center',
      },
      modalTitle: {
        fontSize: 20, 
        fontWeight: 'bold',
        padding: 10
      },
      modalList: {
        paddingVertical: 15,
      },
      modalListItem: {
        paddingVertical: 10,
      },
      modalConfirmButton: {
        // width: '100%',
        // flex: 1,
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'blue',
      },
      modalCancelButton: {
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'grey',
      },
      modalText: {
        color: 'white',
      },
  });

export default ClassSelectionModal;
