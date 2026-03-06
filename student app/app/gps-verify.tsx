/**
 * GPS Verify Screen — Real location verification via expo-location.
 * Receives QR payload data via route params from scanner.tsx.
 * Gets the student's GPS coords → calculates Haversine distance → compares to geofence radius.
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { Card, GPSStatusIndicator, GeofenceBadge, PrimaryButton } from '@/components/ui';

type VerifyStep = 'permission' | 'locating' | 'checking' | 'success' | 'failed';

interface StepConfig {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  gpsStatus: 'searching' | 'found' | 'verified' | 'outside';
}

/** Haversine formula — returns distance in metres between two lat/lng pairs */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function GPSVerifyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{
    token: string;
    courseId: string;
    courseCode: string;
    lat: string;
    lng: string;
    radius: string;
    exp: string;
  }>();

  const [step, setStep] = useState<VerifyStep>('locating');
  const [distance, setDistance] = useState<number | null>(null);
  const [failReason, setFailReason] = useState('');
  const [studentCoords, setStudentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pinBounce = useRef(new Animated.Value(0)).current;

  const venueLat = params.lat ? parseFloat(params.lat) : null;
  const venueLng = params.lng ? parseFloat(params.lng) : null;
  const radius = params.radius ? parseFloat(params.radius) : 50;

  // Venue name passed through route params or fallback
  const venueName = (params as any).venueName || 'Lecture Venue';

  // ── Pulse animation ──
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

  // ── Pin drop animation on success ──
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

  // ── Real GPS verification ──
  useEffect(() => {
    let cancelled = false;

    async function verify() {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setFailReason('Location permission was denied. Please allow GPS access and try again.');
          setStep('failed');
        }
        return;
      }

      // 2. Start locating
      if (!cancelled) {
        setStep('locating');
        animateProgress(0.25);
      }

      // 3. Get current position
      let location: Location.LocationObject;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      } catch {
        if (!cancelled) {
          setFailReason('Could not get your GPS location. Make sure location services are enabled.');
          setStep('failed');
        }
        return;
      }

      if (cancelled) return;

      setStep('checking');
      animateProgress(0.6);

      const studentLat = location.coords.latitude;
      const studentLng = location.coords.longitude;
      if (!cancelled) setStudentCoords({ lat: studentLat, lng: studentLng });
      // GPS accuracy reported by the device (metres). We use this as a buffer
      // so that natural GPS drift doesn't cause false negatives.
      const gpsAccuracy = location.coords.accuracy ?? 0;

      // 4. If lecturer didn't share location, skip geofence (QR Only)
      if (venueLat == null || venueLng == null) {
        // No GPS coords in QR — just confirm with QR Only
        await delay(500);
        if (!cancelled) {
          setStep('success');
          animateProgress(1);
          await delay(1500);
          navigateToConfirmed('QR Only', null);
        }
        return;
      }

      // 5. Calculate distance
      const dist = haversineDistance(studentLat, studentLng, venueLat, venueLng);
      if (!cancelled) setDistance(Math.round(dist));

      await delay(600);
      if (cancelled) return;

      // 6. Check geofence — add GPS accuracy as a tolerance buffer so that
      //    normal GPS drift (especially indoors) doesn't cause false failures.
      const effectiveRadius = radius + Math.min(gpsAccuracy, 30); // cap buffer at 30 m
      if (dist <= effectiveRadius) {
        setStep('success');
        animateProgress(1);
        await delay(1500);
        if (!cancelled) navigateToConfirmed('QR+GPS', Math.round(dist));
      } else {
        setFailReason(
          `You are ${Math.round(dist)}m away from the venue. You need to be within ${radius}m.`,
        );
        setStep('failed');
        animateProgress(1);
      }
    }

    verify();
    return () => { cancelled = true; };
  }, []);

  function animateProgress(to: number) {
    Animated.timing(progressAnim, {
      toValue: to,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }

  function navigateToConfirmed(method: 'QR+GPS' | 'QR Only', dist: number | null) {
    router.replace({
      pathname: '/attendance-confirmed',
      params: {
        token: params.token,
        courseId: params.courseId,
        courseCode: params.courseCode,
        method,
        venueName,
        radius: radius.toString(),
        distance: dist?.toString() ?? '',
        latitude: studentCoords?.lat?.toString() ?? '',
        longitude: studentCoords?.lng?.toString() ?? '',
      },
    });
  }

  // ── Step config ──
  const stepConfig: Record<VerifyStep, StepConfig> = {
    permission: {
      icon: 'lock',
      title: 'Permission Required',
      subtitle: 'Requesting location access...',
      color: theme.warning,
      gpsStatus: 'searching',
    },
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
      subtitle: distance != null
        ? `You are ${distance}m from the venue — checking geofence...`
        : 'Checking geofence boundary...',
      color: theme.info,
      gpsStatus: 'found',
    },
    success: {
      icon: 'check-circle',
      title: 'Location Verified!',
      subtitle: distance != null
        ? `You are ${distance}m from the venue (within ${radius}m)`
        : 'QR verified — GPS geofence not required for this session',
      color: theme.success,
      gpsStatus: 'verified',
    },
    failed: {
      icon: 'times-circle',
      title: 'Verification Failed',
      subtitle: failReason,
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
        <View style={[styles.geofenceRing, styles.ringOuter, { borderColor: current.color + '15' }]} />
        <View style={[styles.geofenceRing, styles.ringMiddle, { borderColor: current.color + '25' }]} />
        <View style={[styles.geofenceRing, styles.ringInner, { borderColor: current.color + '40' }]} />

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
          <StepDot active={step !== 'permission' && step !== 'locating'} color={current.color} label="GPS Located" theme={theme} />
          <StepDot active={step === 'success'} color={current.color} label="Geofence OK" theme={theme} />
          <StepDot active={step === 'success'} color={current.color} label="Confirmed" theme={theme} />
        </View>
      </View>

      {/* Info Card */}
      <Card style={{ marginHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
        <View style={styles.infoRow}>
          <FontAwesome name="building" size={16} color={theme.textSecondary} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Venue</Text>
            <Text style={[Typography.body, { color: theme.text }]}>{venueName}</Text>
          </View>
        </View>
        <View style={[styles.infoRow, { marginTop: Spacing.sm }]}>
          <FontAwesome name="bullseye" size={16} color={theme.textSecondary} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Geofence Radius</Text>
            <Text style={[Typography.body, { color: theme.text }]}>{radius} meters</Text>
          </View>
        </View>
        <View style={{ marginTop: Spacing.md, alignItems: 'flex-start' }}>
          <GPSStatusIndicator status={current.gpsStatus} />
        </View>
      </Card>

      {/* Retry button on failure */}
      {step === 'failed' && (
        <View style={styles.retryArea}>
          <PrimaryButton
            title="Retry Verification"
            icon="refresh"
            onPress={() => router.replace({
              pathname: '/gps-verify',
              params: {
                token: params.token,
                courseId: params.courseId,
                courseCode: params.courseCode,
                lat: params.lat,
                lng: params.lng,
                radius: params.radius,
                exp: params.exp,
              },
            })}
          />
          <Text
            style={[Typography.bodySmall, { color: theme.primary, textAlign: 'center', marginTop: Spacing.md }]}
            onPress={() => router.replace('/(student)/home')}
          >
            Back to Home
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
  retryArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
  },
});
