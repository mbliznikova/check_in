import { useState, useEffect } from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';

const CurrentDate = () => {
    const textStyle = useThemeTextStyle();
    const [dateString, setDateString] = useState<string | null>(null);

    useEffect(() => {
        const d = new Date();
        setDateString(
            `${d.toLocaleString('en-US', {weekday: 'long'})}, ` +
            `${d.toLocaleString('en-US', {month: 'short'})} ${d.getDate()} ${d.getFullYear()}`
        );
    }, []);

    if (!dateString) return null;

    return (
        <View style={styles.container}>
            <Text style={[
                styles.container,
                styles.mainTextStyle,
                textStyle
                ]}>
                    {dateString}
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