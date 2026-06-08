import '../global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { AppProvider } from '@/src/contexts/AppContext';
import { LiveSessionProvider } from '@/src/contexts/LiveSessionContext';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="scanner" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="gps-verify" />
      <Stack.Screen name="attendance-confirmed" />
      <Stack.Screen name="join-course" />
    </Stack>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    async function prepare() {
      try {
        // Add any initialization logic here (fonts, data loading, etc.)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <LiveSessionProvider>
            <StatusBar style="light" backgroundColor="#081637" translucent={false} />
            <RootLayoutNav />
          </LiveSessionProvider>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
