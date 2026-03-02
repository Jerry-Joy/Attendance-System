/**
 * Lecturer Courses Screen — Course list with session management
 */
import React from 'react';
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
import { Card, Avatar, PrimaryButton, GeofenceBadge } from '@/components/ui';
import { mockLecturer, mockCourses, Course } from '@/constants/MockData';

export default function LecturerCoursesScreen() {
  const router = useRouter();
  const theme = useTheme();

  const renderCourse = ({ item }: { item: Course }) => (
    <Card elevated style={{ marginBottom: Spacing.md }}>
      <View style={styles.courseHeader}>
        <View style={[styles.courseIcon, { backgroundColor: theme.primaryLight }]}>
          <FontAwesome name="book" size={20} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h3, { color: theme.text }]}>{item.code}</Text>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>{item.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/manage-students', params: { courseId: item.id } })}
        >
          <FontAwesome name="users" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.courseStats}>
        <View style={styles.statItem}>
          <FontAwesome name="users" size={14} color={theme.textSecondary} />
          <Text style={[Typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
            {item.studentCount} students
          </Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="calendar" size={14} color={theme.textSecondary} />
          <Text style={[Typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
            Last: {item.lastSession}
          </Text>
        </View>
      </View>

      {item.venueName && (
        <View style={styles.venueRow}>
          <FontAwesome name="map-marker" size={14} color={theme.textSecondary} />
          <Text style={[Typography.caption, { color: theme.textSecondary, marginLeft: 4, flex: 1 }]}>
            {item.venueName}
          </Text>
          <GeofenceBadge radius={50} isActive={false} />
        </View>
      )}

      <PrimaryButton
        title="Start Session"
        icon="play"
        onPress={() =>
          router.push({ pathname: '/start-session', params: { courseId: item.id } })
        }
        style={{ marginTop: Spacing.md }}
      />
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>Good morning,</Text>
          <Text style={[Typography.h2, { color: theme.text }]}>{mockLecturer.name}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(lecturer)/lecturer-profile')}>
          <Avatar initials={mockLecturer.avatarInitials} size={48} />
        </TouchableOpacity>
      </View>

      {/* Course List */}
      <FlatList
        data={mockCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={{ padding: Spacing.md }}
        ListHeaderComponent={
          <TouchableOpacity
            onPress={() => router.push('/create-course')}
            style={[styles.addCourse, { borderColor: theme.primary }]}
          >
            <FontAwesome name="plus" size={16} color={theme.primary} />
            <Text style={[Typography.body, { color: theme.primary, fontWeight: '600', marginLeft: Spacing.sm }]}>
              Create New Course
            </Text>
          </TouchableOpacity>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  addCourse: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  courseStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
