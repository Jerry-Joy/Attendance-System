/**
 * Splash Screen — App entry point.
 * Blue gradient background with logo and tagline.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Palette } from '@/constants/Colors';
import { Typography, Spacing } from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';

export default function SplashPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(student)/home');
      } else {
        router.replace('/login');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
        <View style={styles.iconCircle}>
          <FontAwesome name="check-circle" size={48} color="#fff" />
        </View>
        <Text style={styles.title}>Smart Attendance</Text>
        <Text style={styles.tagline}>QR Code + GPS Geofencing</Text>
      </Animated.View>
      <ActivityIndicator color="rgba(255,255,255,0.7)" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.blue500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: '#fff',
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
});
