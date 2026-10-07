import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignOutButton } from './SignOutButton';
import { SchoolPicker } from './SchoolPicker';
import ManageAccountModal from './ManageAccountModal';
import { useThemeTextStyle } from '@/hooks/useThemeTextStyle';
import { useModalStyles } from '@/constants/modalStyles';
import { mixpanel } from '@/utils/mixpanel';

export function Header() {
    const insets = useSafeAreaInsets();
    const textStyle = useThemeTextStyle();
    const modalStyles = useModalStyles();
    const [isManageAccountVisible, setIsManageAccountVisible] = useState(false);

    return (
        <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
            <SchoolPicker />
            <View style={styles.accountGroup}>
                <Pressable onPress={() => { mixpanel.track('Manage account clicked'); setIsManageAccountVisible(true); }}>
                    <Text style={[textStyle, modalStyles.modalActionLink]}>
                        Manage account
                    </Text>
                </Pressable>
                <SignOutButton/>
            </View>
            <ManageAccountModal
                isVisible={isManageAccountVisible}
                onModalClose={() => setIsManageAccountVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    accountGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
  });
