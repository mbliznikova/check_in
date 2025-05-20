import { StyleSheet, SafeAreaView} from 'react-native';

import AttendancePaymentsReport from '@/components/AttendancePaymentsReport';

export default function MainReport() {
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
