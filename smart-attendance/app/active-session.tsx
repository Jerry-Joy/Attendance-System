/**
 * Active Session Screen — Lecturer view during a live attendance session
 * Shows dynamic QR code, GPS geofence status, and live student count.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { PrimaryButton, SecondaryButton, DestructiveButton, Card, StatusBadge, StatCard, GeofenceBadge } from '@/components/ui';
import { mockCourses, mockAttendingStudents } from '@/constants/MockData';

export default function ActiveSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string; group?: string; radius?: string; duration?: string }>();
  const theme = useTheme();

  const course = mockCourses.find((c) => c.id === params.courseId) || mockCourses[0];
  const radius = Number(params.radius) || 50;

  const [studentCount, setStudentCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [qrCode, setQrCode] = useState('QR-CSC401-T1-ABCDEF');
  const [sessionActive, setSessionActive] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for geofence indicator
  useEffect(() => {
    if (sessionActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [sessionActive]);

  // QR code refresh animation
  useEffect(() => {
    if (sessionActive) {
      const interval = setInterval(() => {
        // Simulate QR refresh every 30 seconds
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        setQrCode(`QR-${course.code.replace(' ', '')}-T${Math.floor(elapsed / 30) + 1}-${code}`);

        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [sessionActive, elapsed]);

  // Timer and simulated student joins
  useEffect(() => {
    if (sessionActive) {
      const timer = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      // Simulate students joining progressively
      const joinTimers = mockAttendingStudents.map((_, i) =>
        setTimeout(() => setStudentCount((prev) => Math.min(prev + 1, mockAttendingStudents.length)), (i + 1) * 2500)
      );

      return () => {
        clearInterval(timer);
        joinTimers.forEach(clearTimeout);
      };
    }
  }, [sessionActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this attendance session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            setSessionActive(false);
            setTimeout(() => {
              router.push('/session-summary');
            }, 500);
          },
        },
      ]
    );
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={[Typography.h3, { color: theme.text }]}>{course.code}</Text>
            <StatusBadge label="LIVE" variant="success" />
          </View>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>
            {params.group || 'All'} • {course.name}
          </Text>
        </View>
      </View>

      {/* QR Code Display */}
      <View style={styles.qrSection}>
        <Animated.View
          style={[
            styles.qrContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              ...Shadows.md,
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <FontAwesome name="qrcode" size={120} color={theme.text} />
        </Animated.View>
        <Text style={[Typography.caption, { color: theme.textSecondary, marginTop: Spacing.sm, fontFamily: 'SpaceMono' }]}>
          {qrCode}
        </Text>
        <Text style={[Typography.caption, { color: theme.textTertiary, marginTop: 2 }]}>
          Refreshes every 30 seconds
        </Text>
      </View>

      {/* GPS Geofence Indicator */}
      <Animated.View
        style={[
          styles.geofenceSection,
          {
            backgroundColor: theme.success + '08',
            borderColor: theme.success + '20',
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <FontAwesome name="map-marker" size={20} color={theme.success} />
        <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
          <Text style={[Typography.bodySmall, { color: theme.success, fontWeight: '600' }]}>
            GPS Geofence Active
          </Text>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>
            {course.venueName || 'Current Location'} • {radius}m radius
          </Text>
        </View>
        <GeofenceBadge radius={radius} isActive={true} />
      </Animated.View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard value={studentCount} label="Present" color={theme.success} />
        <StatCard value={course.studentCount - studentCount} label="Remaining" color={theme.warning} />
        <StatCard value={formatTime(elapsed)} label="Elapsed" color={theme.primary} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <SecondaryButton
          title="Live Monitor"
          icon="users"
          onPress={() => router.push('/live-monitor')}
          style={{ flex: 1 }}
        />
        <DestructiveButton
          title="End Session"
          icon="stop"
          onPress={handleEndSession}
          style={{ flex: 1 }}
        />
      </View>

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <FontAwesome name="info-circle" size={14} color={theme.textTertiary} />
        <Text style={[Typography.caption, { color: theme.textTertiary, marginLeft: 6 }]}>
          Students scan the QR code and their GPS is verified automatically
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  qrContainer: {
    width: 180,
    height: 180,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  geofenceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: 'auto',
    marginBottom: Spacing.md,
  },
});
