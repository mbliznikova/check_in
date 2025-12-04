import { Image, StyleSheet, Platform } from 'react-native';

import ScreenTitle from '@/components/ScreenTitle';
import CurrentDate from '@/components/CurrentDate';
import School from '@/components/School';
import { SignOutButton } from '@/components/SignOutButton';

import { View, SafeAreaView } from 'react-native';

export default function CheckIn() {
  return (
    <SafeAreaView style={styles.appContainer}>
      <View style={styles.contentContainer}>

        <View style={styles.headerRow}>
          <View style={styles.centerContainer}>
            <CurrentDate />
          </View>
          <SignOutButton />
        </View>

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
  centerContainer: {
    flex: 1,
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
});
