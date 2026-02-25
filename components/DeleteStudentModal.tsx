import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { modalStyles } from '@/constants/modalStyles';

type DeleteStudentModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onDeleteStudent: () => void;
    firstName: string,
    lastName: string,
    isSuccess: boolean,
};

const DeleteStudentModal = ({
    isVisible = false,
    onModalClose,
    onDeleteStudent,
    firstName,
    lastName,
    isSuccess = false,
}: DeleteStudentModalProps) => {

    const textStyle = useThemeTextStyle();

    const renderModalDelete = () => {
        return (
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[textStyle, {fontWeight: "bold"}]}>
                            {`Do you want to delete ${firstName} ${lastName}?`}
                        </Text>
                    </View>
                    <View style={[styles.modalButtonsContainer, styles.modalManyButtonsContainer]}>
                        <Pressable
                            style={modalStyles.modalConfirmButton}
                            onPress={() => {
                                onDeleteStudent();
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
                        <Text style={[textStyle, {fontWeight: "bold"}]}>
                            {`Student ${firstName} ${lastName} was deleted successfully`}
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
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        width: '30%',
    },
    modalManyButtonsContainer: {
        justifyContent: 'space-between',
    },
    modalSingleButtonContainer: {
         justifyContent: 'center'
    },
});

export default DeleteStudentModal;
