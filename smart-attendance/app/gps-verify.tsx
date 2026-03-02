/**
 * GPS Verify Screen — Verifies student location within geofence
 * Replaces the old BLE proximity verification with GPS geofencing.
 * Flow: QR Scanned → GPS Location Check → Geofence Validation → Attendance Confirmed
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { Card, GPSStatusIndicator, GeofenceBadge } from '@/components/ui';

type VerifyStep = 'locating' | 'checking' | 'verifying' | 'success' | 'failed';

interface StepConfig {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  gpsStatus: 'searching' | 'found' | 'verified' | 'outside';
}

export default function GPSVerifyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [step, setStep] = useState<VerifyStep>('locating');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pinBounce = useRef(new Animated.Value(0)).current;

  // Pulse animation for the location icon
  useEffect(() => {
    if (step !== 'success' && step !== 'failed') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [step]);

  // Pin drop animation on success
  useEffect(() => {
    if (step === 'success') {
      Animated.sequence([
        Animated.timing(pinBounce, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(pinBounce, {
          toValue: 0,
          friction: 3,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step]);

  // Simulate GPS verification steps
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Step 1 → 2: Getting GPS coordinates
    timers.push(
      setTimeout(() => {
        setStep('checking');
        Animated.timing(progressAnim, {
          toValue: 0.33,
          duration: 400,
          useNativeDriver: false,
        }).start();
      }, 1500)
    );

    // Step 2 → 3: Checking geofence
    timers.push(
      setTimeout(() => {
        setStep('verifying');
        Animated.timing(progressAnim, {
          toValue: 0.66,
          duration: 400,
          useNativeDriver: false,
        }).start();
      }, 3000)
    );

    // Step 3 → Success
    timers.push(
      setTimeout(() => {
        setStep('success');
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }).start();
      }, 4500)
    );

    // Navigate to confirmed
    timers.push(
      setTimeout(() => {
        router.replace('/attendance-confirmed');
      }, 6000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const stepConfig: Record<VerifyStep, StepConfig> = {
    locating: {
      icon: 'location-arrow',
      title: 'Getting Your Location',
      subtitle: 'Requesting GPS coordinates...',
      color: theme.warning,
      gpsStatus: 'searching',
    },
    checking: {
      icon: 'map-marker',
      title: 'Location Found',
      subtitle: 'Checking geofence boundary...',
      color: theme.info,
      gpsStatus: 'found',
    },
    verifying: {
      icon: 'map-marker',
      title: 'Verifying Position',
      subtitle: 'Confirming you are within 50m of the venue...',
      color: theme.primary,
      gpsStatus: 'found',
    },
    success: {
      icon: 'check-circle',
      title: 'Location Verified!',
      subtitle: 'You are within the geofenced area',
      color: theme.success,
      gpsStatus: 'verified',
    },
    failed: {
      icon: 'times-circle',
      title: 'Outside Geofence',
      subtitle: 'You are not within the required area',
      color: theme.error,
      gpsStatus: 'outside',
    },
  };

  const current = stepConfig[step];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: theme.text }]}>GPS Verification</Text>
        <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>
          Confirming your physical presence
        </Text>
      </View>

      {/* Main Animation Area */}
      <View style={styles.animationArea}>
        {/* Geofence rings */}
        <View style={[styles.geofenceRing, styles.ringOuter, { borderColor: current.color + '15' }]} />
        <View style={[styles.geofenceRing, styles.ringMiddle, { borderColor: current.color + '25' }]} />
        <View style={[styles.geofenceRing, styles.ringInner, { borderColor: current.color + '40' }]} />

        {/* Center icon */}
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: current.color + '15',
              borderColor: current.color + '30',
              transform: [
                { scale: pulseAnim },
                { translateY: step === 'success' ? pinBounce : 0 },
              ],
            },
          ]}
        >
          <FontAwesome name={current.icon} size={48} color={current.color} />
        </Animated.View>
      </View>

      {/* Status Text */}
      <View style={styles.statusArea}>
        <Text style={[Typography.h3, { color: theme.text, textAlign: 'center' }]}>
          {current.title}
        </Text>
        <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 4 }]}>
          {current.subtitle}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressWidth, backgroundColor: current.color },
            ]}
          />
        </View>
        <View style={styles.progressSteps}>
          <StepDot active={true} color={current.color} label="QR Scanned" theme={theme} />
          <StepDot active={step !== 'locating'} color={current.color} label="GPS Located" theme={theme} />
          <StepDot active={step === 'verifying' || step === 'success'} color={current.color} label="Geofence OK" theme={theme} />
          <StepDot active={step === 'success'} color={current.color} label="Confirmed" theme={theme} />
        </View>
      </View>

      {/* Info Card */}
      <Card style={{ marginHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
        <View style={styles.infoRow}>
          <FontAwesome name="building" size={16} color={theme.textSecondary} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Venue</Text>
            <Text style={[Typography.body, { color: theme.text }]}>Room 301, CS Building</Text>
          </View>
        </View>
        <View style={[styles.infoRow, { marginTop: Spacing.sm }]}>
          <FontAwesome name="bullseye" size={16} color={theme.textSecondary} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Geofence Radius</Text>
            <Text style={[Typography.body, { color: theme.text }]}>50 meters</Text>
          </View>
        </View>
        <View style={{ marginTop: Spacing.md, alignItems: 'flex-start' }}>
          <GPSStatusIndicator status={current.gpsStatus} />
        </View>
      </Card>
    </SafeAreaView>
  );
}

// Step dot component
function StepDot({ active, color, label, theme }: { active: boolean; color: string; label: string; theme: any }) {
  return (
    <View style={styles.stepDot}>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: active ? color : theme.border,
            borderColor: active ? color : theme.border,
          },
        ]}
      >
        {active && <FontAwesome name="check" size={8} color="#fff" />}
      </View>
      <Text style={[Typography.caption, { color: active ? theme.text : theme.textTertiary, marginTop: 4 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  animationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 280,
  },
  geofenceRing: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 999,
    borderStyle: 'dashed',
  },
  ringOuter: {
    width: 240,
    height: 240,
  },
  ringMiddle: {
    width: 180,
    height: 180,
  },
  ringInner: {
    width: 120,
    height: 120,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  statusArea: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  stepDot: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
