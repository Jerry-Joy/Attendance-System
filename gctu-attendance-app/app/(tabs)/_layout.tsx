import { Tabs, Redirect } from 'expo-router';
import { Home, ScanLine, History, User } from 'lucide-react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color="#F5B41C" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#F8FAFC',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#F5B41C',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
