import * as React from 'react';  
import { useEffect, useState } from 'react';
import {View, StyleSheet, Pressable, Button, Text, Modal} from 'react-native';

import Checkbox from './Checkbox';

type StudentType = {
    firstName: string;
    lastName: string;
    id: number;
    classes?: Set<number>;
    occurrences?: Set<number>;
};

type ClassSelectionModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onConfirm: (selectedClassesIds: number[]) => void;
    student?: StudentType | null;
    allClassOccurrencesList: ClassOccurrenceType[];
};

type ClassOccurrenceType = {
    id: number;
    classId: number | null;
    fallbackClassName: string;
    schedule: string;
    plannedDate: string;
    actualDate: string;
    plannedStartTime: string;
    actualStartTime: string;
    plannedDuration: number;
    actualDuration: number;
    isCancelled: boolean;
    notes: string;
};

const ClassSelectionModal = ({
    isVisible = false,
    onModalClose,
    onConfirm,
    student,
    allClassOccurrencesList: allClassOccurrencesList
}: ClassSelectionModalProps) => {

    const [classSelectionState, setClassSelectionState] = useState(() => {
        return new Map(allClassOccurrencesList.map(cls => [cls.id, false]))
    });

    const [isModalVisible, setIsModalVisible] = useState(isVisible);

    useEffect(() => {
        setIsModalVisible(isVisible);

        if (student?.occurrences?.size) {
            initializeClassSelection(student);
        }

        return () => {
            resetClassSelection();
        };

    }, [isVisible, student]);

    function getSelectedOccurrenceIds(selectedStateMap: Map<number, boolean>) {
        return Array.from(selectedStateMap.entries()).filter(([_, v]) => v).map(([k]) => k);
      }

    function toggleClass(classId: number) {
        setClassSelectionState(prev => {
            const next = new Map(prev);
            next.set(classId, !Boolean(prev.get(classId)));
            return next;
          });
    }

    function initializeClassSelection(student: StudentType) {
            const base = new Map<number, boolean>(
              allClassOccurrencesList.map(cls => [cls.id, false])
            );

            if (student?.occurrences) {
              for (const clsId of student.occurrences) {
                if (base.has(clsId)) base.set(clsId, true);
              }
            }

            setClassSelectionState(base);
    }

    function resetClassSelection() {
        setClassSelectionState(new Map(allClassOccurrencesList.map(cls => [cls.id, false])));
    }

    function closeModal() { // TODO: set all necessary things to null?
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
                        {allClassOccurrencesList.map((cls) => ( // TODO: check/make it scrollable?
                                <Checkbox
                                    key={cls.id}
                                    label={`${cls.fallbackClassName} - ${cls.actualStartTime.slice(0, 5)}`}
                                    checked={classSelectionState?.get(cls.id) ?? false}
                                    onChange={() => {
                                        toggleClass(cls.id)
                                        }}>
                                </Checkbox>
                            ))}
                     </View>

                     <Pressable
                        style={styles.modalConfirmButton}
                        onPress={() => {
                            const selected = getSelectedOccurrenceIds(classSelectionState)
                            onConfirm(selected);
                            closeModal();
                        }}
                    >
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
