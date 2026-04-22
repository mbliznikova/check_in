import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
    inputField: {
        width: 200,
        borderWidth: 1,
        borderColor: 'gray',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 15,
    },
    separator: {
        height: 1,
        backgroundColor: 'gray',
        marginVertical: 10,
    },
    spaceBetweenRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
});
