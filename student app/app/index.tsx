/**
 * Splash Screen — App entry point.
 * Blue gradient background with logo and tagline.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Palette } from '@/constants/Colors';
import { Typography, Spacing } from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';

export default function SplashPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for token check to complete
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(student)/home');
      } else {
        router.replace('/login');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
        <View style={styles.iconCircle}>
          <Image source={require('@/assets/images/gctu-crest.png')} style={styles.crestImage} resizeMode="contain" />
        </View>
        <Text style={styles.brand}>GCTU</Text>
        <Text style={styles.title}>Smart Attendance</Text>
        <Text style={styles.university}>Ghana Communication Technology University</Text>
        <Text style={styles.tagline}>QR Code + GPS Geofencing + Blockchain</Text>
      </Animated.View>
      <ActivityIndicator color="rgba(255,255,255,0.7)" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.gctuBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  crestImage: {
    width: 80,
    height: 80,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 6,
    marginBottom: 2,
  },
  title: {
    ...Typography.h2,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.sm,
  },
  university: {
    fontSize: 10,
    color: Palette.gctuGold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.6)',
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
});
