/**
 * Student Home Screen — Dashboard with enrolled courses, quick scan, and GPS status
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { PrimaryButton, Card, Avatar, GPSStatusIndicator } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api, mapCourse, MappedCourse } from '@/lib/api';

export default function StudentHomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { student } = useAuth();

  const [courses, setCourses] = useState<MappedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      const raw = await api.getCourses();
      setCourses(raw.map(mapCourse));
    } catch { /* keep previous */ }
  }, []);

  useEffect(() => {
    loadCourses().finally(() => setLoading(false));
  }, [loadCourses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const name = student?.name ?? 'Student';
  const initials = student?.avatarInitials ?? '?';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>Welcome back,</Text>
            <Text style={[Typography.h2, { color: theme.text }]}>{name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(student)/profile')}>
            <Avatar initials={initials} size={48} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} elevated>
            <Text style={[Typography.h2, { color: theme.primary }]}>{courses.length}</Text>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Courses</Text>
          </Card>
        </View>

        {/* GPS Status */}
        <Card style={{ marginTop: Spacing.md }}>
          <View style={styles.gpsRow}>
            <GPSStatusIndicator status="found" />
            <View style={[styles.gpsDot, { backgroundColor: theme.success }]} />
          </View>
          <Text style={[Typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
            Location services ready for GPS verification
          </Text>
        </Card>

        {/* Scan Button */}
        <PrimaryButton
          title="Scan QR Code"
          icon="qrcode"
          onPress={() => router.push('/scanner')}
          style={{ marginTop: Spacing.lg }}
        />

        {/* My Courses */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[Typography.h3, { color: theme.text }]}>My Courses</Text>
          <TouchableOpacity onPress={() => router.push('/join-course')}>
            <Text style={[Typography.bodySmall, { color: theme.primary, fontWeight: '600' }]}>+ Join</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: Spacing.lg }} />
        ) : courses.length === 0 ? (
          <Card style={{ marginBottom: Spacing.sm, alignItems: 'center', paddingVertical: Spacing.xl }}>
            <FontAwesome name="book" size={32} color={theme.textTertiary} />
            <Text style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.sm }]}>
              No courses yet — join one to get started
            </Text>
          </Card>
        ) : (
          courses.map((course) => (
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
                <Text style={[Typography.caption, { color: theme.textTertiary }]}>
                  {course.studentCount} students
                </Text>
              </View>
            </Card>
          ))
        )}

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
