import {View, Text, StyleSheet, useColorScheme} from 'react-native';

const ScreenTitle = ({
    titleText = "Screen Title"
}) => {
    const colorScheme = useColorScheme();
    return (
        <View style={styles.container}>
            <Text style={[
                styles.container, 
                styles.mainTextStyle,
                colorScheme === 'dark' ? styles.lightColor : styles.darkColor
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
    darkColor: {
        color: 'black',
      },
    lightColor: {
        color: 'white',
      },
})

export default ScreenTitle;