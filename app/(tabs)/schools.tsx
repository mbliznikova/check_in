import { StyleSheet, SafeAreaView} from 'react-native';

import SchoolManagement from '@/components/SchoolManagement';

export default function Schools() {
    return (
        <SafeAreaView style={styles.appContainer}>
            <SchoolManagement/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    appContainer: {
      flex: 1,
    },
});
