import * as React from 'react';  
import { useEffect, useState } from 'react';
import {View, StyleSheet, Pressable, Button, Text, Modal, useColorScheme} from 'react-native';


type ClassOccurrenceModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onRequestingTimeSlots: (dayName: string, classDurationToFit: number) => Promise<string[]>;
    onCreateOccurrence: (className: string, plannedDate: string, plannedTime: string, duration: number, classId?: number, scheduleId?: number, notes?: string) => void;
    onUniquenessCheck: (dayId: number, time: string) => boolean;
    scheduleData: Map<number, [number, string][]>;
    classId: number | null;
    className: string | null;
    classDuration: number | null;
    isCreateOccurrenceSuccess: boolean;
};

const ClassOccurrenceModal = ({
    isVisible = false,
    onModalClose,
    onRequestingTimeSlots,
    onCreateOccurrence,
    onUniquenessCheck,
    scheduleData = new Map(),
    classId,
    className,
    classDuration,
    isCreateOccurrenceSuccess = false,
}: ClassOccurrenceModalProps) => {

    const colorScheme = useColorScheme();
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            <View></View>
        </Modal>
    );
};

export default ClassOccurrenceModal;