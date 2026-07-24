import {View, Text, StyleSheet} from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

const ScreenTitle = ({
    titleText = "Screen Title",
    centered = false,
}) => {
    const textStyle = useThemeTextStyle();
    return (
        <View style={[styles.container, centered && styles.containerCentered]}>
            <Text style={[
                styles.container,
                centered && styles.containerCentered,
                styles.mainTextStyle,
                centered && styles.mainTextStyleCentered,
                textStyle
                ]}>
                    {titleText}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
        alignItems: 'flex-start',
        paddingBottom: 20,
    },
    containerCentered: {
        alignItems: 'center',
    },
    mainTextStyle: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    mainTextStyleCentered: {
        textAlign: 'center',
    },
})

export default ScreenTitle;