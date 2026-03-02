/**
 * Lecturer Tab Layout — 3 tabs: Courses, Reports, Profile
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/Layout';

export default function LecturerTabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          ...Typography.caption,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="th-large" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lecturer-profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
