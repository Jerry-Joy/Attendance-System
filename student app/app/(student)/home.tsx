/**
 * Student Home Screen — Dashboard with schedule, quick scan, and GPS status
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
import { PrimaryButton, Card, Avatar, StatusBadge, GPSStatusIndicator } from '@/components/ui';
import { mockStudent, mockSchedule, mockStudentCourses, mockCourses } from '@/constants/MockData';

export default function StudentHomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>Welcome back,</Text>
            <Text style={[Typography.h2, { color: theme.text }]}>{mockStudent.name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(student)/profile')}>
            <Avatar initials={mockStudent.avatarInitials} size={48} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} elevated>
            <Text style={[Typography.h2, { color: theme.success }]}>{mockStudent.attendanceRate}%</Text>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Attendance</Text>
          </Card>
          <Card style={styles.statCard} elevated>
            <Text style={[Typography.h2, { color: theme.primary }]}>{mockStudent.totalSessions}</Text>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Sessions</Text>
          </Card>
          <Card style={styles.statCard} elevated>
            <Text style={[Typography.h2, { color: theme.error }]}>{mockStudent.missedSessions}</Text>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Missed</Text>
          </Card>
        </View>

        {/* GPS Status */}
        <Card style={{ marginTop: Spacing.md }}>
          <View style={styles.gpsRow}>
            <GPSStatusIndicator status={mockStudent.locationEnabled ? 'found' : 'searching'} />
            <View style={[
              styles.gpsDot,
              { backgroundColor: mockStudent.locationEnabled ? theme.success : theme.error }
            ]} />
          </View>
          <Text style={[Typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
            {mockStudent.locationEnabled
              ? 'Location services enabled — Ready for GPS verification'
              : 'Enable location services for attendance verification'}
          </Text>
        </Card>

        {/* Scan Button */}
        <PrimaryButton
          title="Scan QR Code"
          icon="qrcode"
          onPress={() => router.push('/scanner')}
          style={{ marginTop: Spacing.lg }}
        />

        {/* Today's Schedule */}
        <Text style={[Typography.h3, { color: theme.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
          Today's Schedule
        </Text>
        {mockSchedule.map((item) => {
          const course = mockCourses.find((c) => c.code === item.courseCode);
          return (
            <Card key={item.id} style={{ marginBottom: Spacing.sm }}>
              <View style={styles.scheduleRow}>
                <View style={[styles.timeBox, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[Typography.bodySmall, { color: theme.primary, fontWeight: '700' }]}>
                    {item.time}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={[Typography.body, { color: theme.text, fontWeight: '600' }]}>
                    {item.courseCode}
                  </Text>
                  {course && (
                    <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                      {course.name}
                    </Text>
                  )}
                </View>
                <StatusBadge
                  label={item.status === 'completed' ? 'Done' : item.status === 'active' ? 'Now' : 'Upcoming'}
                  variant={item.status === 'completed' ? 'success' : item.status === 'active' ? 'info' : 'neutral'}
                />
              </View>
            </Card>
          );
        })}

        {/* My Courses */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[Typography.h3, { color: theme.text }]}>My Courses</Text>
          <TouchableOpacity onPress={() => router.push('/join-course')}>
            <Text style={[Typography.bodySmall, { color: theme.primary, fontWeight: '600' }]}>+ Join</Text>
          </TouchableOpacity>
        </View>
        {mockStudentCourses.map((course) => (
          <Card key={course.id} style={{ marginBottom: Spacing.sm }}>
            <View style={styles.courseRow}>
              <View style={[styles.courseIcon, { backgroundColor: theme.primaryLight }]}>
                <FontAwesome name="book" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: theme.text, fontWeight: '600' }]}>
                  {course.code}
                </Text>
                <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                  {course.name}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={14} color={theme.textTertiary} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gpsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
});
