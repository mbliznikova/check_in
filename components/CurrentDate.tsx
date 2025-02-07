import {View, Text, StyleSheet, useColorScheme} from 'react-native';

const CurrentDate = () => {
    const colorScheme = useColorScheme();
    const date = new Date();
    return (
        <View style={styles.container}>
            <Text style={[
                styles.container, 
                styles.mainTextStyle,
                colorScheme === 'dark' ? styles.lightColor : styles.darkColor
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
    darkColor: {
        color: 'black',
      },
    lightColor: {
        color: 'white',
      },
})

export default CurrentDate;