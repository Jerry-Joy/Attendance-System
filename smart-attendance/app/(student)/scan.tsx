/**
 * Student Scan Tab — Quick access to QR scanner
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius } from '@/constants/Layout';
import { PrimaryButton, Card, GPSStatusIndicator } from '@/components/ui';

export default function StudentScanScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      <View style={styles.content}>
        {/* QR Icon */}
        <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
          <FontAwesome name="qrcode" size={64} color={theme.primary} />
        </View>

        <Text style={[Typography.h2, { color: theme.text, textAlign: 'center', marginTop: Spacing.lg }]}>
          Mark Attendance
        </Text>
        <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
          Scan the QR code displayed by your lecturer to check in
        </Text>

        {/* Scan Button */}
        <PrimaryButton
          title="Open Scanner"
          icon="camera"
          onPress={() => router.push('/scanner')}
          style={{ marginTop: Spacing.xl, width: '100%' }}
        />

        {/* How it works */}
        <Card style={{ marginTop: Spacing.xl, width: '100%' }}>
          <Text style={[Typography.h3, { color: theme.text, marginBottom: Spacing.md }]}>
            How It Works
          </Text>

          <StepItem
            number="1"
            title="Scan QR Code"
            description="Point your camera at the dynamic QR code"
            icon="qrcode"
            theme={theme}
          />
          <StepItem
            number="2"
            title="GPS Verification"
            description="Your location is checked against the venue geofence"
            icon="map-marker"
            theme={theme}
          />
          <StepItem
            number="3"
            title="Attendance Confirmed"
            description="You're marked present for the session"
            icon="check-circle"
            theme={theme}
            isLast
          />
        </Card>

        {/* GPS Status */}
        <View style={styles.gpsStatus}>
          <GPSStatusIndicator status="found" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function StepItem({
  number,
  title,
  description,
  icon,
  theme,
  isLast,
}: {
  number: string;
  title: string;
  description: string;
  icon: keyof typeof FontAwesome.glyphMap;
  theme: any;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.stepRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{number}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <Text style={[Typography.body, { color: theme.text, fontWeight: '600' }]}>{title}</Text>
        <Text style={[Typography.caption, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      <FontAwesome name={icon} size={18} color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsStatus: {
    marginTop: Spacing.lg,
  },
});
