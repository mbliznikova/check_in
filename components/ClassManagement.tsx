import { useState } from "react";
import { SafeAreaView, View, StyleSheet, FlatList, Text, Pressable } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

import { useClassData } from "@/hooks/useClassData";
import { useClassSchedules } from "@/hooks/useClassSchedules";
import { useClassOccurrences } from "@/hooks/useClassOccurrences";
import { SelectedClassState } from "@/types/class";
import ScreenTitle from "./ScreenTitle";
import CreateScheduleClass from "./CreateScheduleClass";
import DeleteClassModal from "./DeleteClassModal";
import EditClassModal from "./EditClassModal";
import ClassScheduleModal from "./ClassScheduleModal";
import ClassOccurrenceModal from "./ClassOccurrencesModal";

const INITIAL_SELECTED_CLASS: SelectedClassState = {
    id: null,
    name: '',
    duration: 60,
    isRecurring: true,
    price: 0,
    priceId: null,
};

const ClassManagement = () => {
    const textStyle = useThemeTextStyle();

    const classData = useClassData();
    const classSchedules = useClassSchedules();
    const classOccurrences = useClassOccurrences();

    const [selectedClass, setSelectedClass] = useState<SelectedClassState>(INITIAL_SELECTED_CLASS);

    const resetSelectedClass = () => setSelectedClass(INITIAL_SELECTED_CLASS);

    return (
        <SafeAreaView style={{ flex: 1 }}>

            <ScreenTitle titleText={'Class management'} />

            <View style={styles.headerRow}>
                <View style={{ marginLeft: 'auto' }}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed ? styles.primaryButtonPressed : styles.primaryButtonUnpressed,
                        ]}
                        onPress={classData.openCreateModal}>
                        <Text style={[textStyle]}>+ Create Class</Text>
                    </Pressable>
                </View>
            </View>

            <FlatList
                data={classData.classes}
                keyExtractor={(cls) => cls.id.toString()}
                renderItem={({ item: cls }) => (
                    <View style={styles.classesList}>
                        <Pressable
                            style={{ padding: 10 }}
                            onPress={() => {
                                setSelectedClass({
                                    ...INITIAL_SELECTED_CLASS,
                                    id: cls.id,
                                    name: cls.name,
                                    duration: cls.durationMinutes,
                                });
                                classSchedules.fetchClassSchedules(cls.id);
                                classSchedules.openScheduleModal();
                            }}>
                            <Text style={[textStyle, styles.className]}>{cls.name}</Text>
                        </Pressable>
                        <View style={{ flexDirection: 'row' }}>
                            <Pressable
                                onPress={() => {
                                    setSelectedClass({
                                        ...INITIAL_SELECTED_CLASS,
                                        id: cls.id,
                                        name: cls.name,
                                        duration: cls.durationMinutes,
                                        isRecurring: cls.isRecurring,
                                    });
                                    classOccurrences.fetchClassOccurrences(cls.id);
                                    classOccurrences.openOccurrenceModal();
                                }}>
                                <Text style={[textStyle, styles.actionButton]}>See occurrences</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    const currentPrice = classData.prices.get(cls.id)?.amount ?? 0;
                                    const currentPriceId = classData.prices.get(cls.id)?.priceId ?? null;
                                    setSelectedClass({
                                        id: cls.id,
                                        name: cls.name,
                                        duration: cls.durationMinutes,
                                        isRecurring: cls.isRecurring,
                                        price: currentPrice,
                                        priceId: currentPriceId,
                                    });
                                    classData.openEditModal();
                                }}>
                                <Text style={[textStyle, styles.actionButton]}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setSelectedClass({
                                        ...INITIAL_SELECTED_CLASS,
                                        id: cls.id,
                                        name: cls.name,
                                        duration: cls.durationMinutes,
                                    });
                                    classData.openDeleteModal();
                                }}>
                                <Text style={[textStyle, styles.actionButton]}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                )}>
            </FlatList>

            {classData.isCreateModalVisible && (
                <CreateScheduleClass
                    isVisible={classData.isCreateModalVisible}
                    onCreateClass={classData.createClass}
                    onClassUniquenessCheck={classData.checkIfClassUnique}
                    onRequestingTimeSlots={classSchedules.fetchAvailableTimeSlots}
                    onScheduleClass={classSchedules.scheduleClass}
                    onScheduleUniquenessCheck={classSchedules.checkIfScheduleUnique}
                    onScheduleDelete={classSchedules.deleteClassSchedule}
                    onModalClose={() => {
                        classData.closeCreateModal();
                        classSchedules.clearScheduleContext();
                        resetSelectedClass();
                    }}
                    defaultClassDuration={60}
                    isCreateSuccess={classData.isCreateSuccess}
                    isError={classData.isCreateError}
                    createdClassId={classData.createdClassId}
                    scheduleData={classSchedules.currentClassScheduleMap}
                    isSheduleSuccess={classSchedules.isScheduleSuccess}
                />
            )}

            {classData.isDeleteModalVisible && (
                <DeleteClassModal
                    isVisible={classData.isDeleteModalVisible}
                    onModalClose={() => {
                        classData.closeDeleteModal();
                        resetSelectedClass();
                    }}
                    onDeleteClass={() => {
                        if (selectedClass.id !== null && selectedClass.name) {
                            classData.deleteClass(selectedClass.id, selectedClass.name);
                        }
                    }}
                    className={selectedClass.name}
                    isSuccess={classData.isDeleteSuccess}
                />
            )}

            {classData.isEditModalVisible && selectedClass.id !== null && selectedClass.priceId !== null && (
                <EditClassModal
                    isVisible={classData.isEditModalVisible}
                    onModalClose={() => {
                        classData.closeEditModal();
                        resetSelectedClass();
                    }}
                    onEditClass={(newName, newDuration, newRecurrence) => {
                        if (selectedClass.id !== null) {
                            classData.editClass(
                                selectedClass.id,
                                selectedClass.name,
                                selectedClass.duration,
                                selectedClass.isRecurring,
                                newName,
                                newDuration,
                                newRecurrence,
                            );
                        }
                    }}
                    onEditPrice={(priceId, newAmount, classId) => {
                        classData.editPrice(priceId, newAmount, classId);
                        setSelectedClass(prev => ({ ...prev, price: newAmount }));
                    }}
                    onClassUniquenessCheck={classData.checkIfClassUnique}
                    classId={selectedClass.id}
                    oldClassName={selectedClass.name}
                    oldClassDuration={selectedClass.duration}
                    oldClassRecurrence={selectedClass.isRecurring}
                    oldClassPrice={selectedClass.price}
                    priceId={selectedClass.priceId}
                    isSuccess={classData.isEditSuccess}
                />
            )}

            {classSchedules.isScheduleModalVisible && (
                <ClassScheduleModal
                    isVisible={classSchedules.isScheduleModalVisible}
                    onModalClose={() => {
                        classSchedules.closeScheduleModal();
                        resetSelectedClass();
                    }}
                    onRequestingTimeSlots={classSchedules.fetchAvailableTimeSlots}
                    onScheduleDelete={classSchedules.deleteClassSchedule}
                    onScheduleClass={classSchedules.scheduleClass}
                    onUniquenessCheck={classSchedules.checkIfScheduleUnique}
                    scheduleData={classSchedules.currentClassScheduleMap}
                    classId={selectedClass.id}
                    className={selectedClass.name}
                    classDuration={selectedClass.duration}
                    isSheduleSuccess={classSchedules.isScheduleSuccess}
                />
            )}

            {classOccurrences.isOccurrenceModalVisible && (
                <ClassOccurrenceModal
                    isVisible={classOccurrences.isOccurrenceModalVisible}
                    onModalClose={() => {
                        classOccurrences.closeOccurrenceModal();
                        resetSelectedClass();
                    }}
                    onRequestingTimeIntervals={classOccurrences.fetchAvailableTimeIntervalsOccurrence}
                    onCreateOccurrence={classOccurrences.createClassOccurrence}
                    onEditOccurrence={classOccurrences.editClassOccurrence}
                    onDeleteOccurrence={classOccurrences.deleteClassOccurrence}
                    onUniquenessCheck={classOccurrences.checkIfOccurrenceUnique}
                    occurrenceIdTimebyDate={classOccurrences.currentClassOccurrenceMap}
                    allOccurrenceDataById={classOccurrences.allOccurrencesMap}
                    classId={selectedClass.id}
                    className={selectedClass.name}
                    classDuration={selectedClass.duration}
                    isCreateOccurrenceSuccess={classOccurrences.isCreateOccurrenceSuccess}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 20,
    },
    classesList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    className: {
        paddingLeft: 10,
        textDecorationLine: 'underline',
    },
    actionButton: {
        paddingRight: 10,
        textDecorationLine: 'underline',
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        elevation: 3,
    },
    primaryButtonPressed: {
        backgroundColor: '#c2c0c0',
        borderRadius: 8,
    },
    primaryButtonUnpressed: {
        backgroundColor: 'blue',
        borderRadius: 8,
    },
});

export default ClassManagement;
