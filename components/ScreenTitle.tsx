import {View, Text, StyleSheet} from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

const ScreenTitle = ({
    titleText = "Screen Title",
    centered = true,
}) => {
    const textStyle = useThemeTextStyle();
    return (
        <View style={[styles.container, !centered && styles.containerLeft]}>
            <Text style={[
                styles.container,
                !centered && styles.containerLeft,
                styles.mainTextStyle,
                !centered && styles.mainTextStyleLeft,
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
        alignItems: 'center',
        paddingBottom: 20,
    },
    containerLeft: {
        alignItems: 'flex-start',
    },
    mainTextStyle: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mainTextStyleLeft: {
        textAlign: 'left',
    },
})

export default ScreenTitle;