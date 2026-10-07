import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, DESTRUCTIVE_COLOR } from '@/constants/Colors';

export function useModalStyles() {
    const colorScheme = useColorScheme() ?? 'light';
    return {
        ...staticModalStyles,
        modalContainer: {
            ...staticModalStyles.modalContainer,
            backgroundColor: Colors[colorScheme].background,
        },
        modalView: {
            ...staticModalStyles.modalView,
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].border,
        },
    };
}

const staticModalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '85%',
        maxWidth: 360,
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalConfirmButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'green',
    },
    modalCancelButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: 'grey',
    },
    modalDeleteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginVertical: 10,
        borderRadius: 15,
        backgroundColor: DESTRUCTIVE_COLOR,
    },
    modalDisabled: {
        opacity: 0.5,
    },
    modalInfo: {
        padding: 20,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    modalButtonsRow: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    modalErrorText: {
        color: DESTRUCTIVE_COLOR,
        textAlign: 'center',
        marginVertical: 10,
    },
    modalActionLink: {
        textDecorationLine: 'underline',
    },
});
