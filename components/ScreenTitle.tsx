import {View, Text, StyleSheet} from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

const ScreenTitle = ({
    titleText = "Screen Title"
}) => {
    const textStyle = useThemeTextStyle();
    return (
        <View style={styles.container}>
            <Text style={[
                styles.container, 
                styles.mainTextStyle,
                textStyle
                ]}>
                    {titleText}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 5,
    },
    mainTextStyle: {
        fontSize: 25, 
        fontWeight: 'heavy'
    },
})

export default ScreenTitle;