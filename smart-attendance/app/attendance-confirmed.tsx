/**
 * Attendance Confirmed Screen — Success state after QR + GPS verification
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { PrimaryButton, Card, GeofenceBadge } from '@/components/ui';

export default function AttendanceConfirmedScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
          Attendance Confirmed!
        </Text>
        <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
          Your attendance has been recorded successfully
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
            <DetailRow
              icon="book"
              label="Course"
              value="CSC 401 — Software Engineering"
              theme={theme}
            />
            <DetailRow
              icon="calendar"
              label="Date"
              value="Wed, 19 Feb 2026"
              theme={theme}
            />
            <DetailRow
              icon="clock-o"
              label="Time"
              value="10:32 AM"
              theme={theme}
            />
            <DetailRow
              icon="user"
              label="Lecturer"
              value="Prof. Adeyemi"
              theme={theme}
            />
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <FontAwesome name="map-marker" size={16} color={theme.textSecondary} />
              <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                <Text style={[Typography.caption, { color: theme.textSecondary }]}>Venue</Text>
                <Text style={[Typography.body, { color: theme.text }]}>Room 301, CS Building</Text>
              </View>
            </View>
            <View style={{ marginTop: Spacing.sm, alignItems: 'flex-start' }}>
              <GeofenceBadge radius={50} isActive={true} />
            </View>
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
