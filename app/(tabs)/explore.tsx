import { StyleSheet, SafeAreaView} from 'react-native';

import AttendancePaymentsReport from '@/components/AttendancePaymentsReport';

export default function TabTwoScreen() {
  return (
    <SafeAreaView style={styles.appContainer}>
      <AttendancePaymentsReport/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
