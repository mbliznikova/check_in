import {View, Text, StyleSheet} from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

const CurrentDate = () => {
    const textStyle = useThemeTextStyle();
    const date = new Date();
    return (
        <View style={styles.container}>
            <Text style={[
                styles.container, 
                styles.mainTextStyle,
                textStyle
                ]}>
                    {date.toLocaleString('en-US', {weekday: 'long'})}, {date.toLocaleString('en-US', {month: 'short'})} {date.getDate()} {date.getFullYear()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 15,
    },
    mainTextStyle: {
        fontSize: 20, 
        fontWeight: 'normal',
    },
})

export default CurrentDate;