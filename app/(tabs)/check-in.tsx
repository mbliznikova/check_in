import { Image, StyleSheet, Platform } from 'react-native';

import ScreenTitle from '@/components/ScreenTitle';
import CurrentDate from '@/components/CurrentDate';
import School from '@/components/School';
import { Header } from '@/components/Header';

import { View, SafeAreaView } from 'react-native';

export default function CheckIn() {
  return (
    <SafeAreaView style={styles.appContainer}>
      <Header/>
      <View style={styles.contentContainer}>
        <CurrentDate />
        <ScreenTitle titleText='Checked-in today'></ScreenTitle>
        <School/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16, 
  },
});
