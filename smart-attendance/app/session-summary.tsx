/**
 * Session Summary Screen — Post-session attendance report
 * Shows GPS verification stats, geofence details, and attendance breakdown.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { PrimaryButton, Card, StatCard, StatusBadge, GeofenceBadge, SectionHeader } from '@/components/ui';
import { mockSessionSummary, mockAttendingStudents } from '@/constants/MockData';

export default function SessionSummaryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const summary = mockSessionSummary;

  const attendanceRate = Math.round((summary.presentCount / summary.totalStudents) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: theme.text }]}>Session Summary</Text>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>
            {summary.courseCode} — {summary.date}
          </Text>
        </View>
        <StatusBadge label="Completed" variant="success" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Attendance Rate */}
        <View style={[styles.rateCircle, { backgroundColor: theme.success + '10' }]}>
          <Text style={[Typography.h1, { color: theme.success, fontSize: 48 }]}>
            {attendanceRate}%
          </Text>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>Attendance Rate</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard value={summary.presentCount} label="Present" color={theme.success} />
          <StatCard value={summary.absentCount} label="Absent" color={theme.error} />
          <StatCard value={summary.totalStudents} label="Total" color={theme.primary} />
        </View>

        {/* Session Details */}
        <SectionHeader title="Session Details" />
        <Card>
          <DetailRow icon="book" label="Course" value={`${summary.courseCode} — ${summary.courseName}`} theme={theme} />
          <DetailRow icon="calendar" label="Date" value={summary.date} theme={theme} />
          <DetailRow icon="clock-o" label="Time" value={`${summary.startTime} — ${summary.endTime}`} theme={theme} />
          <DetailRow icon="hourglass-half" label="Duration" value={summary.duration} theme={theme} />
          <DetailRow icon="map-marker" label="Venue" value={summary.venueName} theme={theme} />
          <View style={{ marginTop: Spacing.sm, alignItems: 'flex-start' }}>
            <GeofenceBadge radius={summary.geofenceRadius} isActive={false} />
          </View>
        </Card>

        {/* Verification Breakdown */}
        <SectionHeader title="Verification Breakdown" />
        <Card>
          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownIcon, { backgroundColor: theme.success + '15' }]}>
              <FontAwesome name="map-marker" size={16} color={theme.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.body, { color: theme.text }]}>QR + GPS Verified</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                Scanned QR and within geofence
              </Text>
            </View>
            <Text style={[Typography.h3, { color: theme.success }]}>{summary.qrGpsVerified}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.breakdownRow}>
            <View style={[styles.breakdownIcon, { backgroundColor: theme.warning + '15' }]}>
              <FontAwesome name="qrcode" size={16} color={theme.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.body, { color: theme.text }]}>QR Only</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                Scanned QR but GPS unverified
              </Text>
            </View>
            <Text style={[Typography.h3, { color: theme.warning }]}>{summary.qrOnlyVerified}</Text>
          </View>

          {/* Bar chart visualization */}
          <View style={[styles.barContainer, { marginTop: Spacing.md }]}>
            <View
              style={[
                styles.barSegment,
                {
                  flex: summary.qrGpsVerified,
                  backgroundColor: theme.success,
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                },
              ]}
            />
            <View
              style={[
                styles.barSegment,
                {
                  flex: summary.qrOnlyVerified,
                  backgroundColor: theme.warning,
                },
              ]}
            />
            <View
              style={[
                styles.barSegment,
                {
                  flex: summary.absentCount,
                  backgroundColor: theme.error + '50',
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                },
              ]}
            />
          </View>
          <View style={styles.legendRow}>
            <LegendDot color={theme.success} label="GPS Verified" />
            <LegendDot color={theme.warning} label="QR Only" />
            <LegendDot color={theme.error + '50'} label="Absent" />
          </View>
        </Card>

        {/* Recent Check-ins */}
        <SectionHeader title="Recent Check-ins" />
        {mockAttendingStudents.slice(0, 5).map((student) => (
          <Card key={student.id} style={{ marginBottom: Spacing.sm }}>
            <View style={styles.studentRow}>
              <View style={[styles.studentDot, { backgroundColor: student.gpsVerified ? theme.success : theme.warning }]} />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: theme.text }]}>{student.name}</Text>
                <Text style={[Typography.caption, { color: theme.textSecondary }]}>{student.indexNumber}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[Typography.caption, { color: student.gpsVerified ? theme.success : theme.warning, fontWeight: '600' }]}>
                  {student.gpsVerified ? 'QR+GPS' : 'QR Only'}
                </Text>
                <Text style={[Typography.caption, { color: theme.textTertiary }]}>{student.time}</Text>
              </View>
            </View>
          </Card>
        ))}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomArea, { backgroundColor: theme.background }]}>
        <PrimaryButton
          title="Back to Courses"
          icon="th-large"
          onPress={() => router.replace('/(lecturer)/courses')}
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[Typography.caption, { color: '#888' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  rateCircle: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  barContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  bottomArea: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
