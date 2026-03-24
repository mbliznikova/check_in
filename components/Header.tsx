import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SignOutButton } from './SignOutButton';
import { SchoolPicker } from './SchoolPicker';

export function Header() {
    return (
        <View style={styles.container}>
            <SchoolPicker />
            <SignOutButton/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });
