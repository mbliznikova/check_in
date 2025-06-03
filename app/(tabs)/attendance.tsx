import { StyleSheet, SafeAreaView} from 'react-native';

import Attendance from '@/components/Attendance';

export default function AttendanceReport() {
  return (
    <SafeAreaView style={styles.appContainer}>
      <Attendance/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
