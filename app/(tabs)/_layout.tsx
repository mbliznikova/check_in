import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { SignedIn, SignedOut } from '@clerk/clerk-expo';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <SignedOut>
        <Redirect href="/(auth)/sign-in" />
      </SignedOut>

    <SignedIn>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="check-in"
          options={{
            title: 'Check-in',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="confirm"
          options={{
            title: 'Confirm',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder" color={color} />,
          }}
        />
        <Tabs.Screen
          name="payments"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder" color={color} />,
          }}
        />
        <Tabs.Screen
          name="createStudent"
          options={{
            title: 'Add student',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder" color={color} />,
          }}
        />
        <Tabs.Screen
          name="classes"
          options={{
            title: 'Classes',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder" color={color} />,
          }}
        />
      </Tabs>
      </SignedIn>
    </>
  );
}
