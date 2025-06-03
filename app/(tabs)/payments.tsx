import { StyleSheet, SafeAreaView} from 'react-native';

import Payments from '@/components/Payments';

export default function PaymentsReport() {
    return (
      <SafeAreaView style={styles.appContainer}>
        <Payments/>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    appContainer: {
      flex: 1,
    },
  });
