/**
 * Manage Students Screen — Lecturer views enrolled students for a course.
 * Shows join code, student list, and remove option.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Card, Avatar, StatusBadge, SectionHeader } from '@/components/ui';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/Layout';
import { mockCourses, mockEnrolledStudents, EnrolledStudent } from '@/constants/MockData';
import { SafeAreaView } from 'react-native-safe-area-context';

const StudentItem = React.memo(({ student, onRemove }: { student: EnrolledStudent; onRemove: () => void }) => {
  const theme = useTheme();
  return (
    <View style={[styles.studentRow, { borderBottomColor: theme.border }]}>
      <Avatar initials={student.avatarInitials} size={40} />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <Text style={[Typography.body, { color: theme.text }]}>{student.name}</Text>
        <Text style={[Typography.caption, { color: theme.textSecondary }]}>
          {student.indexNumber} • {student.level}
        </Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={[Typography.caption, { color: theme.textTertiary }]}>{student.joinedDate}</Text>
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <FontAwesome name="times-circle" size={18} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function ManageStudentsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();

  const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];
  const students = mockEnrolledStudents[course.id] || [];
  const [studentList, setStudentList] = useState(students);
  const [codeEnabled, setCodeEnabled] = useState(true);

  const handleRemove = (studentId: string, studentName: string) => {
    Alert.alert(
      'Remove Student',
      `Remove ${studentName} from ${course.code}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setStudentList((prev) => prev.filter((s) => s.id !== studentId));
          },
        },
      ]
    );
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my course ${course.code} — ${course.name} on Smart Attendance!\n\nCourse Code: ${course.joinCode}`,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleCopy = () => {
    Alert.alert('Copied!', `Course code ${course.joinCode} copied to clipboard.`);
  };

  const handleToggleCode = () => {
    Alert.alert(
      codeEnabled ? 'Disable Join Code' : 'Enable Join Code',
      codeEnabled
        ? 'New students will not be able to join this course.'
        : 'Students will be able to join using the course code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: codeEnabled ? 'Disable' : 'Enable',
          onPress: () => setCodeEnabled(!codeEnabled),
        },
      ]
    );
  };

  const renderItem = useCallback(({ item }: { item: EnrolledStudent }) => (
    <StudentItem student={item} onRemove={() => handleRemove(item.id, item.name)} />
  ), []);

  const keyExtractor = useCallback((item: EnrolledStudent) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[Typography.h3, { color: theme.text }]}>{course.code}</Text>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>{course.name}</Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      {/* Join Code Card */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <Card style={[styles.codeCard, { marginHorizontal: Spacing.lg }] as any} elevated>
          <View style={styles.codeHeader}>
            <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>Course Join Code</Text>
            <StatusBadge
              label={codeEnabled ? 'Active' : 'Disabled'}
              variant={codeEnabled ? 'success' : 'neutral'}
            />
          </View>

          <View style={[styles.codeBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[Typography.h1, { color: codeEnabled ? theme.primary : theme.textTertiary, letterSpacing: 3 }]}>
              {course.joinCode}
            </Text>
          </View>

          <View style={styles.codeActions}>
            <TouchableOpacity onPress={handleCopy} style={[styles.codeAction, { backgroundColor: theme.primaryLight }]}>
              <FontAwesome name="copy" size={16} color={theme.primary} />
              <Text style={[Typography.caption, { color: theme.primary, marginLeft: 6 }]}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShareCode} style={[styles.codeAction, { backgroundColor: theme.primaryLight }]}>
              <FontAwesome name="share" size={16} color={theme.primary} />
              <Text style={[Typography.caption, { color: theme.primary, marginLeft: 6 }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleToggleCode} style={[styles.codeAction, { backgroundColor: codeEnabled ? theme.error + '15' : theme.success + '15' }]}>
              <FontAwesome name={codeEnabled ? 'ban' : 'check'} size={16} color={codeEnabled ? theme.error : theme.success} />
              <Text style={[Typography.caption, { color: codeEnabled ? theme.error : theme.success, marginLeft: 6 }]}>
                {codeEnabled ? 'Disable' : 'Enable'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>

      {/* Student Count */}
      <View style={styles.countRow}>
        <SectionHeader title={`Enrolled Students (${studentList.length})`} />
      </View>

      {/* Student List */}
      <FlatList
        data={studentList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={40} color={theme.textTertiary} />
            <Text style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.md, textAlign: 'center' }]}>
              No students enrolled yet.{'\n'}Share the course code to get started.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  codeCard: {},
  codeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeBox: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeActions: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  codeAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    minHeight: 44,
  },
  countRow: { paddingHorizontal: Spacing.lg },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  rightSection: { alignItems: 'flex-end', gap: 4 },
  removeButton: { padding: 4, minWidth: 32, minHeight: 32, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl },
});
