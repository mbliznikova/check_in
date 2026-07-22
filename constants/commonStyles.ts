import { StyleSheet } from 'react-native';
import { TOGGLE_COLOR } from './Colors';

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
    emptyMessage: {
        textAlign: 'center',
        padding: 20,
    },
    formContainer: {
        alignSelf: 'stretch',
        paddingHorizontal: 10,
    },
    fieldGroup: {
        alignSelf: 'stretch',
        marginBottom: 14,
    },
    fieldLabel: {
        fontSize: 13,
        marginBottom: 6,
        marginLeft: 2,
    },
    fullWidthInput: {
        width: '100%',
    },
    sideBySideRow: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    segmentedToggle: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: TOGGLE_COLOR,
    },
    segmentedPill: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    segmentedPillActive: {
        backgroundColor: TOGGLE_COLOR,
    },
    segmentedPillText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
