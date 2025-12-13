import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SignOutButton } from './SignOutButton';

export function Header() {
    return (
        <View style={styles.container}>
            <SignOutButton/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 16,
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  });
