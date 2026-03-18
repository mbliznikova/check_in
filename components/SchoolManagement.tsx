import { Pressable, SafeAreaView, View, Text, StyleSheet, } from "react-native";

import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { Header } from "./Header";
import ScreenTitle from "./ScreenTitle";

const SchoolManagement = () => {
    const textStyle = useThemeTextStyle();

    const renderCreateSchool = () => {
        return (
            <View style={styles.container}>
                <Pressable
                    onPress = {() => {}}
                    style={({ pressed }) => [
                        styles.button,
                        pressed ? styles.primaryButtonPressed : styles.primaryButtonUnpressed
                    ]}
                >
                    <Text style={[textStyle]}>+  Create School</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header/>
            <ScreenTitle titleText='School Management'></ScreenTitle>
            {renderCreateSchool()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
      },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    primaryButtonPressed: {
        backgroundColor: '#c2c0c0',
        borderRadius: 8,
    },
    primaryButtonUnpressed: {
        backgroundColor: 'blue',
        borderRadius: 8,
    },
});

export default SchoolManagement;
