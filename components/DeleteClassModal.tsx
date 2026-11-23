import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type DeleteClassModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onDeleteClass: () => void;
    className: string,
    isSuccess: boolean,
};

const DeleteClassModal = ({
    isVisible = false,
    onModalClose,
    onDeleteClass,
    className,
    isSuccess = false,
}: DeleteClassModalProps) => {

    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();
    const colorScheme = useColorScheme() ?? 'light';

    const renderModalDelete = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, styles.modalInfoText]}>
                            Do you want to delete {className} class?
                        </Text>
                        <Text style={[styles.modalNoteText, { color: Colors[colorScheme].textMuted }]}>
                            Schedule will be deleted. Attendance history is kept. This week&apos;s sessions stay — delete manually if needed.
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                            style={modalStyles.modalDeleteButton}
                            onPress={() => {
                                onDeleteClass();
                            }}
                        >
                            <Text style={[textStyle]}>Delete</Text>
                        </Pressable>
                        <Pressable
                            style={modalStyles.modalCancelButton}
                            onPress={onModalClose}
                        >
                            <Text style={[textStyle]}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    const renderSuccessConfirmation = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, styles.modalInfoText]}>
                            Class {className} was deleted successfully
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalSingleButtonContainer]}>
                        <Pressable
                            style={modalStyles.modalConfirmButton}
                            onPress={onModalClose}
                        >
                             <Text style={[textStyle]}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onModalClose}
        >
            {isSuccess ? renderSuccessConfirmation() : renderModalDelete()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalInfo: {
        padding: 20,
        alignSelf: 'stretch',
    },
    modalInfoText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalNoteText: {
        marginTop: 12,
        textAlign: 'center',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        gap: 16,
    },
    modalManyButtonsContainer: {
        justifyContent: 'center',
    },
    modalSingleButtonContainer: {
         justifyContent: 'center'
    },
});

export default DeleteClassModal;
