/**
 * Lecturer Reports Screen — Attendance analytics and course reports
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { Card, StatCard, SectionHeader, StatusBadge } from '@/components/ui';
import { mockCourses } from '@/constants/MockData';

// Mock weekly data
const weeklyData = [
  { day: 'Mon', rate: 82 },
  { day: 'Tue', rate: 78 },
  { day: 'Wed', rate: 91 },
  { day: 'Thu', rate: 85 },
  { day: 'Fri', rate: 88 },
];

const courseReports = [
  { code: 'CSC 401', name: 'Software Engineering', rate: 84, sessions: 12, gpsRate: 92 },
  { code: 'CSC 405', name: 'Computer Networks', rate: 78, sessions: 10, gpsRate: 88 },
  { code: 'CSC 411', name: 'Artificial Intelligence', rate: 91, sessions: 8, gpsRate: 95 },
];

export default function LecturerReportsScreen() {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('week');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[Typography.h2, { color: theme.text }]}>Reports</Text>
        <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>
          Attendance analytics and insights
        </Text>

        {/* Period Filter */}
        <View style={styles.filterRow}>
          {(['week', 'month', 'semester'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedPeriod === period ? theme.primary : theme.card,
                  borderColor: selectedPeriod === period ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  Typography.caption,
                  {
                    color: selectedPeriod === period ? '#fff' : theme.text,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  },
                ]}
              >
                This {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall Stats */}
        <View style={styles.statsRow}>
          <StatCard value="84%" label="Avg. Attendance" color={theme.success} />
          <StatCard value="30" label="Total Sessions" color={theme.primary} />
          <StatCard value="92%" label="GPS Verified" color={theme.info} />
        </View>

        {/* Weekly Bar Chart (simple) */}
        <SectionHeader title="Weekly Trend" />
        <Card>
          <View style={styles.chartContainer}>
            {weeklyData.map((item) => (
              <View key={item.day} style={styles.barColumn}>
                <Text style={[Typography.caption, { color: theme.textSecondary, marginBottom: 4 }]}>
                  {item.rate}%
                </Text>
                <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${item.rate}%`,
                        backgroundColor: item.rate >= 85 ? theme.success : item.rate >= 75 ? theme.warning : theme.error,
                      },
                    ]}
                  />
                </View>
                <Text style={[Typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Verification Breakdown */}
        <SectionHeader title="Verification Methods" />
        <Card>
          <View style={styles.verifyRow}>
            <View style={[styles.verifyIcon, { backgroundColor: theme.success + '15' }]}>
              <FontAwesome name="map-marker" size={18} color={theme.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.body, { color: theme.text }]}>QR + GPS Verified</Text>
              <View style={[styles.percentBar, { backgroundColor: theme.border }]}>
                <View style={[styles.percentFill, { width: '92%', backgroundColor: theme.success }]} />
              </View>
            </View>
            <Text style={[Typography.h3, { color: theme.success }]}>92%</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.verifyRow}>
            <View style={[styles.verifyIcon, { backgroundColor: theme.warning + '15' }]}>
              <FontAwesome name="qrcode" size={18} color={theme.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.body, { color: theme.text }]}>QR Only</Text>
              <View style={[styles.percentBar, { backgroundColor: theme.border }]}>
                <View style={[styles.percentFill, { width: '8%', backgroundColor: theme.warning }]} />
              </View>
            </View>
            <Text style={[Typography.h3, { color: theme.warning }]}>8%</Text>
          </View>
        </Card>

        {/* Per-Course Reports */}
        <SectionHeader title="Course Breakdown" />
        {courseReports.map((course) => (
          <Card key={course.code} style={{ marginBottom: Spacing.sm }}>
            <View style={styles.courseRow}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: theme.text, fontWeight: '600' }]}>
                  {course.code}
                </Text>
                <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                  {course.name} • {course.sessions} sessions
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[Typography.h3, { color: course.rate >= 85 ? theme.success : theme.warning }]}>
                  {course.rate}%
                </Text>
                <View style={styles.gpsSmall}>
                  <FontAwesome name="map-marker" size={10} color={theme.success} />
                  <Text style={[Typography.caption, { color: theme.textSecondary, marginLeft: 2, fontSize: 10 }]}>
                    {course.gpsRate}% GPS
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.percentBar, { backgroundColor: theme.border, marginTop: Spacing.sm }]}>
              <View
                style={[
                  styles.percentFill,
                  {
                    width: `${course.rate}%`,
                    backgroundColor: course.rate >= 85 ? theme.success : theme.warning,
                  },
                ]}
              />
            </View>
          </Card>
        ))}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: Spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: 28,
    height: 100,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  verifyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  percentFill: {
    height: '100%',
    borderRadius: 3,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});
