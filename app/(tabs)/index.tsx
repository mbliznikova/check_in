import { Image, StyleSheet, Platform } from 'react-native';

import ClassName from '@/components/ClassName';
import ScreenTitle from '@/components/ScreenTitle';
import CurrentDate from '@/components/CurrentDate';
import StudentList from '@/components/StudentList';

import { View, SafeAreaView, ScrollView } from 'react-native';
import Student from '@/components/Student';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.appContainer}>
      <View style={styles.contentContainer}>
          <CurrentDate/>
          <ScreenTitle titleText='Checked-in today'></ScreenTitle>
          <ClassName name='Longsword' />
          <ClassName name='Private Lessons' />
          <ClassName name='Self-defence' />
          <ClassName name='Junior knights' />
          <View style={styles.separator} />
          <StudentList></StudentList>
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
