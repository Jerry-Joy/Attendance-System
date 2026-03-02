/**
 * Create Course Screen — Lecturer fills in course details.
 * On submit, a unique join code is generated (mock) and shown.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Card, PrimaryButton, SecondaryButton, InputField, StatusBadge, SectionHeader } from '@/components/ui';
import { Typography, Spacing, BorderRadius } from '@/constants/Layout';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenState = 'form' | 'success';

/** Generate a mock join code like "CSC401-XK9F" */
function generateJoinCode(courseCode: string): string {
  const stripped = courseCode.replace(/\s+/g, '').toUpperCase();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${stripped}-${suffix}`;
}

const LEVELS = ['Level 100', 'Level 200', 'Level 300', 'Level 400'];

export default function CreateCourseScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [state, setState] = useState<ScreenState>('form');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Level 400');
  const [groups, setGroups] = useState('All');
  const [joinCode, setJoinCode] = useState('');

  const isValid = code.trim().length >= 3 && name.trim().length >= 3;

  const handleCreate = () => {
    if (!isValid) {
      Alert.alert('Missing Info', 'Please enter a course code and name (at least 3 characters each).');
      return;
    }
    const generated = generateJoinCode(code.trim());
    setJoinCode(generated);
    setState('success');
  };

  const handleDone = () => {
    router.back();
  };

  const handleCopyCode = () => {
    Alert.alert('Copied!', `Join code ${joinCode} copied to clipboard.`);
  };

  // ──────────── Success State ────────────
  if (state === 'success') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 48 }} />
          <Text style={[Typography.h3, { color: theme.text }]}>Course Created</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.successContent}>
          <Animated.View entering={BounceIn.duration(500)} style={styles.successIcon}>
            <View style={[styles.checkCircle, { backgroundColor: theme.success }]}>
              <FontAwesome name="check" size={40} color="#fff" />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Text style={[Typography.h2, { color: theme.text, textAlign: 'center' }]}>
              {code.trim().toUpperCase()}
            </Text>
            <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 4 }]}>
              {name.trim()}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <Card style={[styles.codeCard, { marginTop: Spacing.xl }] as any} elevated>
              <Text style={[Typography.bodySmall, { color: theme.textSecondary, textAlign: 'center' }]}>
                Share this code with your students
              </Text>
              <View style={[styles.codeBox, { backgroundColor: theme.background, borderColor: theme.primary + '40' }]}>
                <Text style={[Typography.h1, { color: theme.primary, letterSpacing: 3 }]}>
                  {joinCode}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCopyCode} style={[styles.copyRow, { backgroundColor: theme.primaryLight }]}>
                <FontAwesome name="copy" size={16} color={theme.primary} />
                <Text style={[Typography.bodySmall, { color: theme.primary, marginLeft: 8, fontWeight: '600' }]}>
                  Copy Code
                </Text>
              </TouchableOpacity>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(700)}>
            <Card style={{ marginTop: Spacing.md }}>
              <View style={styles.detailRow}>
                <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>Level</Text>
                <Text style={[Typography.body, { color: theme.text }]}>{selectedLevel}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.detailRow}>
                <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>Groups</Text>
                <Text style={[Typography.body, { color: theme.text }]}>{groups || 'All'}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.detailRow}>
                <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>Students</Text>
                <Text style={[Typography.body, { color: theme.text }]}>0 enrolled</Text>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(900)} style={{ marginTop: Spacing.xl }}>
            <PrimaryButton title="Done" onPress={handleDone} icon="check" />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ──────────── Form State ────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[Typography.h3, { color: theme.text }]}>Create Course</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        {/* Course Code */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary, marginBottom: 6 }]}>
            Course Code *
          </Text>
          <InputField
            value={code}
            onChangeText={setCode}
            placeholder="e.g. CSC 401"
            icon="book"
            autoCapitalize="words"
          />
        </Animated.View>

        {/* Course Name */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary, marginBottom: 6 }]}>
            Course Name *
          </Text>
          <InputField
            value={name}
            onChangeText={setName}
            placeholder="e.g. Software Engineering"
            icon="graduation-cap"
            autoCapitalize="words"
          />
        </Animated.View>

        {/* Level Picker */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary, marginBottom: 6 }]}>
            Level
          </Text>
          <View style={styles.levelRow}>
            {LEVELS.map((lvl) => {
              const selected = selectedLevel === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  onPress={() => setSelectedLevel(lvl)}
                  style={[
                    styles.levelChip,
                    {
                      backgroundColor: selected ? theme.primary : theme.surface,
                      borderColor: selected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.caption,
                      { color: selected ? '#fff' : theme.textSecondary, fontWeight: selected ? '700' : '400' },
                    ]}
                  >
                    {lvl.replace('Level ', 'L')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Groups */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary, marginBottom: 6 }]}>
            Groups (optional)
          </Text>
          <InputField
            value={groups}
            onChangeText={setGroups}
            placeholder="e.g. Group A, Group B or All"
            icon="object-group"
          />
          <Text style={[Typography.caption, { color: theme.textTertiary, marginTop: 4 }]}>
            Separate multiple groups with commas. Leave as "All" for a single group.
          </Text>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={{ marginTop: Spacing.xl }}>
          <Card style={[styles.infoCard, { backgroundColor: theme.primaryLight + '60' }] as any}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name="info-circle" size={18} color={theme.primary} />
              <Text style={[Typography.bodySmall, { color: theme.primary, marginLeft: 8, flex: 1 }]}>
                A unique join code will be generated automatically. Share it with your students so they can enroll.
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Create Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={{ marginTop: Spacing.xl }}>
          <PrimaryButton
            title="Create Course"
            onPress={handleCreate}
            icon="plus-circle"
            disabled={!isValid}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  formContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  successContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, alignItems: 'center' },
  successIcon: { marginBottom: Spacing.lg },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelRow: { flexDirection: 'row', gap: Spacing.sm },
  levelChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  codeCard: {},
  codeBox: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.sm,
    minHeight: 48,
  },
  infoCard: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: { height: 1 },
});
