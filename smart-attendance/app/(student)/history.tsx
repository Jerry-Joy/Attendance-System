/**
 * Student History Screen — Attendance history with filtering
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
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius } from '@/constants/Layout';
import { Card, StatusBadge } from '@/components/ui';
import { mockAttendance, AttendanceRecord } from '@/constants/MockData';

type FilterOption = 'all' | 'present' | 'absent';

export default function StudentHistoryScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<FilterOption>('all');

  const filtered = mockAttendance.filter((r) => {
    if (filter === 'present') return r.status === 'present';
    if (filter === 'absent') return r.status === 'absent';
    return true;
  });

  const presentCount = mockAttendance.filter((r) => r.status === 'present').length;
  const absentCount = mockAttendance.filter((r) => r.status === 'absent').length;

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <Card style={{ marginBottom: Spacing.sm }}>
      <View style={styles.recordRow}>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'present' ? theme.success : theme.error }]} />
        <View style={{ flex: 1 }}>
          <Text style={[Typography.body, { color: theme.text, fontWeight: '600' }]}>
            {item.courseCode}
          </Text>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>
            {item.courseName}
          </Text>
          <Text style={[Typography.caption, { color: theme.textTertiary, marginTop: 2 }]}>
            {item.date} • {item.time}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <StatusBadge
            label={item.status === 'present' ? 'Present' : 'Absent'}
            variant={item.status === 'present' ? 'success' : 'error'}
          />
          {item.method && (
            <View style={styles.methodBadge}>
              <FontAwesome
                name={item.method === 'QR+GPS' ? 'map-marker' : 'qrcode'}
                size={10}
                color={item.method === 'QR+GPS' ? theme.success : theme.warning}
              />
              <Text style={[Typography.caption, { color: theme.textSecondary, marginLeft: 4, fontSize: 10 }]}>
                {item.method}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: theme.text }]}>Attendance History</Text>
        <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>
          {mockAttendance.length} records
        </Text>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterRow}>
        {([
          { key: 'all', label: 'All', count: mockAttendance.length },
          { key: 'present', label: 'Present', count: presentCount },
          { key: 'absent', label: 'Absent', count: absentCount },
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: Spacing.md }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="calendar-o" size={48} color={theme.textTertiary} />
            <Text style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              No records found
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
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
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
});
