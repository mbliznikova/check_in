import { Image, StyleSheet, Platform } from 'react-native';

import ScreenTitle from '@/components/ScreenTitle';
import CurrentDate from '@/components/CurrentDate';
import School from '@/components/School';

import { View, SafeAreaView } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.appContainer}>
      <View style={styles.contentContainer}>
          <CurrentDate/>
          <ScreenTitle titleText='Checked-in today'></ScreenTitle>
          <School/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16, 
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 10,
  },
});
