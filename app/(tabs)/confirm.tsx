import { StyleSheet, SafeAreaView} from 'react-native';

import ConfirmationList from '@/components/ConfirmationList';

export default function Confirm() {
  return (
    <SafeAreaView style={styles.appContainer}>
      <ConfirmationList/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
