import { Tabs, Redirect } from 'expo-router';
import { Home, ScanLine, History, User, LucideIcon } from 'lucide-react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { View, ActivityIndicator, Platform, Text } from 'react-native';

// GCTU Brand Colors
const COLORS = {
  primary: '#081637',      // Navy
  accent: '#F5B41C',       // Gold
  white: '#FFFFFF',
  focusBg: '#DAE1FF',      // Light navy tint
  accentBg: '#FEF3C7',     // Light gold tint
  inactive: '#94A3B8',     // Gray
  bar: '#F1F5F9',          // Light gray background
};

type Theme = 'default' | 'accent';

function TabIcon({ 
  Icon, 
  color, 
  focused, 
  theme = 'default', 
  label 
}: {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
  theme?: Theme;
  label: string;
}) {
  const isAccent = theme === 'accent';
  const outerBg   = focused ? (isAccent ? COLORS.accentBg : COLORS.focusBg)  : 'transparent';
  const innerBg   = focused ? (isAccent ? COLORS.accent   : COLORS.primary)  : 'transparent';
  const iconColor = focused ? (isAccent ? COLORS.primary  : COLORS.white)    : color;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer glow ring */}
      <View style={{
        width: 52, 
        height: 52,
        borderRadius: 26,
        backgroundColor: outerBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Inner pill */}
        <View style={{
          width: 38, 
          height: 38,
          borderRadius: 19,
          backgroundColor: innerBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon color={iconColor} size={18} strokeWidth={2} />
        </View>
      </View>
      {/* Label always rendered, just changes color */}
      <Text style={{
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
        color: focused ? COLORS.primary : COLORS.inactive,
      }}>
        {label}
      </Text>
    </View>
  );
}

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
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 16,
          left: 20,
          right: 20,
          height: 80,
          backgroundColor: COLORS.bar,
          borderRadius: 40,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={History} color={color} focused={focused} label="History" />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={ScanLine} color={color} focused={focused} theme="accent" label="Scan" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={User} color={color} focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}
