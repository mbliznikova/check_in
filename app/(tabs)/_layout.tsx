import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform, ActivityIndicator, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { SignedIn, SignedOut } from '@clerk/clerk-expo';

import { useUserRole } from '@/context/UserContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const {role, isLoading} = useUserRole();

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <ActivityIndicator/>
      </View>
    );
  }

  const show = (roles: string[]) => role !== null && roles.includes(role);

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
            href: show(["kiosk", "teacher", "admin", "owner"]) ? undefined : null,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="confirm"
          options={{
            title: 'Confirm',
            href: show(["teacher", "admin", "owner"]) ? undefined : null,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            href: show(["teacher", "admin", "owner"]) ? undefined : null,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder" color={color} />,
          }}
        />

        <Tabs.Screen
          name="payments"
          options={{
            title: 'Payments',
            href: show(["teacher", "admin", "owner"]) ? undefined : null,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder" color={color} />,
          }}
        />

        <Tabs.Screen
          name="studentManagement"
          options={{
            title: 'Students',
            href: show(["teacher", "admin", "owner"]) ? undefined : null,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder" color={color} />,
          }}
        />

        <Tabs.Screen
          name="classManagement"
          options={{
            title: 'Classes',
            href: show(["teacher", "admin", "owner"]) ? undefined : null,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder" color={color} />,
          }}
        />

      </Tabs>
      </SignedIn>
    </>
  );
}
