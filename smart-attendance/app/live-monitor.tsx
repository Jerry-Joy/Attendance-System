/**
 * Live Monitor Screen — Real-time view of students checking in
 * Shows GPS verification status per student.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { Card, Avatar, StatusBadge, StatCard } from '@/components/ui';
import { mockAttendingStudents, AttendingStudent } from '@/constants/MockData';

type FilterOption = 'all' | 'gps-verified' | 'qr-only';

export default function LiveMonitorScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [filter, setFilter] = useState<FilterOption>('all');

  const gpsVerifiedCount = mockAttendingStudents.filter((s) => s.gpsVerified).length;
  const qrOnlyCount = mockAttendingStudents.filter((s) => !s.gpsVerified).length;

  const filteredStudents = mockAttendingStudents.filter((s) => {
    if (filter === 'gps-verified') return s.gpsVerified;
    if (filter === 'qr-only') return !s.gpsVerified;
    return true;
  });

  const renderStudent = ({ item }: { item: AttendingStudent }) => (
    <Card style={{ marginBottom: Spacing.sm }}>
      <View style={styles.studentRow}>
        <Avatar initials={item.name.split(' ').map((n) => n[0]).join('')} size={42} />
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={[Typography.body, { color: theme.text, fontWeight: '600' }]}>
            {item.name}
          </Text>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>
            {item.indexNumber}
          </Text>
        </View>
        <View style={styles.studentRight}>
          <View style={styles.verifyBadge}>
            <FontAwesome
              name={item.gpsVerified ? 'map-marker' : 'qrcode'}
              size={12}
              color={item.gpsVerified ? theme.success : theme.warning}
            />
            <Text
              style={[
                Typography.caption,
                {
                  color: item.gpsVerified ? theme.success : theme.warning,
                  marginLeft: 4,
                  fontWeight: '600',
                },
              ]}
            >
              {item.gpsVerified ? 'GPS ✓' : 'QR Only'}
            </Text>
          </View>
          <Text style={[Typography.caption, { color: theme.textTertiary, marginTop: 2 }]}>
            {item.time}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h3, { color: theme.text }]}>Live Monitor</Text>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>
            {mockAttendingStudents.length} students checked in
          </Text>
        </View>
        <StatusBadge label="LIVE" variant="success" />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard value={mockAttendingStudents.length} label="Total" color={theme.primary} />
        <StatCard value={gpsVerifiedCount} label="GPS Verified" color={theme.success} />
        <StatCard value={qrOnlyCount} label="QR Only" color={theme.warning} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {([
          { key: 'all', label: 'All', count: mockAttendingStudents.length },
          { key: 'gps-verified', label: 'GPS Verified', count: gpsVerifiedCount },
          { key: 'qr-only', label: 'QR Only', count: qrOnlyCount },
        ] as const).map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? theme.primary : theme.card,
                borderColor: filter === f.key ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                Typography.caption,
                {
                  color: filter === f.key ? '#fff' : theme.text,
                  fontWeight: '600',
                },
              ]}
            >
              {f.label} ({f.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        renderItem={renderStudent}
        contentContainerStyle={{ padding: Spacing.md }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={48} color={theme.textTertiary} />
            <Text style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              No students match this filter
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentRight: {
    alignItems: 'flex-end',
  },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
});
