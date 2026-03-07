/**
 * Attendance Confirmed Screen — Success state after QR + GPS verification.
 * Receives real session data via route params, saves record to AttendanceContext.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius } from '@/constants/Layout';
import { PrimaryButton, Card, GeofenceBadge } from '@/components/ui';
import { useAttendance } from '@/context/AttendanceContext';
import { ApiError } from '@/lib/api';

export default function AttendanceConfirmedScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { addRecord, markOnServer } = useAttendance();
  const [serverError, setServerError] = useState<string | null>(null);

  const params = useLocalSearchParams<{
    token: string;
    courseId: string;
    courseCode: string;
    venueName: string;
    radius: string;
    distance: string;
    latitude: string;
    longitude: string;
  }>();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Derive display values from route params
  const courseCode = params.courseCode || 'Unknown';
  const courseName = params.courseCode || courseCode;
  const method = 'QR+GPS';
  const venueName = params.venueName || 'Lecture Venue';
  const radius = params.radius ? parseFloat(params.radius) : 50;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Save attendance record locally + mark on server
  useEffect(() => {
    if (params.token) {
      addRecord({
        courseCode,
        courseName,
        date: dateStr,
        time: timeStr,
        status: 'present',
        method,
        venueName,
        radius,
        token: params.token,
      });

      // Fire API call to record attendance on backend
      markOnServer({
        token: params.token,
        courseId: params.courseId,
        latitude: params.latitude ? parseFloat(params.latitude) : undefined,
        longitude: params.longitude ? parseFloat(params.longitude) : undefined,
      }).catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 409) {
            setServerError('Attendance was already recorded for this session.');
          } else {
            setServerError(err.message || 'Failed to record attendance on the server. Please try again.');
          }
        } else {
          setServerError('Network error — attendance may not have been saved. Please check your connection.');
        }
      });
    }
  }, [params.token]);

  // Animations
  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      <View style={styles.content}>
        {/* Success animation */}
        <Animated.View
          style={[
            styles.successCircle,
            {
              backgroundColor: theme.success + '15',
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.innerCircle, { backgroundColor: theme.success + '25' }]}>
            <FontAwesome name="check-circle" size={72} color={theme.success} />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={[Typography.h1, { color: theme.text, textAlign: 'center', marginTop: Spacing.lg }]}>
          {serverError ? 'Already Recorded' : 'Attendance Confirmed!'}
        </Text>
        <Text style={[Typography.body, { color: serverError ? theme.warning : theme.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
          {serverError || 'Your attendance has been recorded successfully'}
        </Text>

        {/* Verification Badge */}
        <View style={[styles.verifyBadge, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}>
          <FontAwesome name="shield" size={16} color={theme.success} />
          <Text style={[Typography.bodySmall, { color: theme.success, fontWeight: '600', marginLeft: 8 }]}>
            QR + GPS Verified
          </Text>
        </View>

        {/* Details Card */}
        <Animated.View style={{ opacity: fadeAnim, width: '100%', paddingHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
          <Card>
            <DetailRow icon="book" label="Course" value={`${courseCode} — ${courseName}`} theme={theme} />
            <DetailRow icon="calendar" label="Date" value={dateStr} theme={theme} />
            <DetailRow icon="clock-o" label="Time" value={timeStr} theme={theme} />
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <FontAwesome name="map-marker" size={16} color={theme.textSecondary} />
              <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                <Text style={[Typography.caption, { color: theme.textSecondary }]}>Venue</Text>
                <Text style={[Typography.body, { color: theme.text }]}>{venueName}</Text>
              </View>
            </View>
            {method === 'QR+GPS' && (
              <View style={{ marginTop: Spacing.sm, alignItems: 'flex-start' }}>
                <GeofenceBadge radius={radius} isActive={true} />
              </View>
            )}
          </Card>
        </Animated.View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomArea}>
        <PrimaryButton
          title="Back to Home"
          icon="home"
          onPress={() => router.replace('/(student)/home')}
        />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value, theme }: {
  icon: keyof typeof FontAwesome.glyphMap;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.detailRow}>
      <FontAwesome name={icon} size={16} color={theme.textSecondary} />
      <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
        <Text style={[Typography.caption, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[Typography.body, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  bottomArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
