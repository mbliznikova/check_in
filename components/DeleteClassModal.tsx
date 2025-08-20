import { Modal, View, Text, StyleSheet, useColorScheme, Pressable } from "react-native";

type DeleteClassModalProps = {
    isVisible: boolean;
    onModalClose: () => void;
    onDeleteClass: () => void;
    className: string,
};

const DeleteClassModal = ({
    isVisible = false,
    onModalClose,
    onDeleteClass,
    className,
}: DeleteClassModalProps) => {

    const colorScheme = useColorScheme();

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={() => {onModalClose}}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <View style={styles.modalInfo}>
                        <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor, {fontWeight: "bold"}]}>
                            Do you want to delete {className} class?
                        </Text>
                    </View>
                    <View style={styles.modalButtonsContainer}>
                        <Pressable
                            style={styles.modalConfirmButton}
                            onPress={() => {
                                onDeleteClass();
                                onModalClose();
                            }}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>OK</Text>
                        </Pressable>
                        <Pressable
                            style={styles.modalCancelButton}
                            onPress={onModalClose}
                        >
                            <Text style={[colorScheme === 'dark'? styles.lightColor : styles.darkColor]}>Cancel</Text>
                        </Pressable>
                    </View>
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
    darkColor: {
        color: 'black',
    },
    lightColor: {
        color: 'white',
    },
});

export default DeleteClassModal;
