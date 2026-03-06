/**
 * Join Course Screen — Student enters a course code to enroll.
 * Shows course preview before confirming.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { PrimaryButton, SecondaryButton, InputField, Card } from '@/components/ui';
import { Typography, Spacing, BorderRadius } from '@/constants/Layout';
import { api, MappedCourse, mapCourse } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

type JoinState = 'enter' | 'preview' | 'success';

export default function JoinCourseScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [state, setState] = useState<JoinState>('enter');
  const [foundCourse, setFoundCourse] = useState<MappedCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 4) return;
    setLoading(true);
    setError('');
    try {
      const raw = await api.joinCourse(trimmed);
      setFoundCourse(mapCourse(raw));
      setState('preview');
    } catch (e: any) {
      if (e.message?.toLowerCase().includes('already enrolled')) {
        Alert.alert('Already Enrolled', 'You are already enrolled in this course.');
      } else {
        Alert.alert('Course Not Found', e.message || 'No course matches this code. Please check and try again.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    // Already joined in handleLookup (POST /courses/join), just show success
    setState('success');
  };

  const handleDone = () => {
    router.back();
  };

  // ─── Enter Code State ───
  if (state === 'enter') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[Typography.h2, { color: theme.text }]}>Join Course</Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={styles.content}>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.centerContent}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                <FontAwesome name="plus-circle" size={48} color={theme.primary} />
              </View>

              <Text style={[Typography.h2, { color: theme.text, textAlign: 'center', marginTop: Spacing.lg }]}>
                Enter Course Code
              </Text>
              <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.lg }]}>
                Ask your lecturer for the course join code and enter it below
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.formSection}>
              <InputField
                value={code}
                onChangeText={(text) => setCode(text.toUpperCase())}
                placeholder="e.g. CSC401-XK9F"
                icon="key"
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLookup}
              />

              <PrimaryButton
                title={loading ? 'Searching...' : 'Find Course'}
                onPress={handleLookup}
                icon="search"
                disabled={code.trim().length < 4 || loading}
                style={{ marginTop: Spacing.lg }}
              />
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── Preview Course State ───
  if (state === 'preview' && foundCourse) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setState('enter')} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[Typography.h2, { color: theme.text }]}>Course Found</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.centerContent}>
            <View style={[styles.iconCircle, { backgroundColor: theme.success + '20' }]}>
              <FontAwesome name="check-circle" size={48} color={theme.success} />
            </View>

            <Text style={[Typography.h2, { color: theme.text, textAlign: 'center', marginTop: Spacing.lg }]}>
              Is this your course?
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Card style={{ marginTop: Spacing.xl }} elevated>
              <View style={styles.previewHeader}>
                <Text style={[Typography.h2, { color: theme.primary }]}>{foundCourse.code}</Text>
              </View>
              <Text style={[Typography.h3, { color: theme.text, marginTop: Spacing.sm }]}>
                {foundCourse.name}
              </Text>

              <View style={[styles.previewDivider, { backgroundColor: theme.border }]} />

              <View style={styles.previewRow}>
                <FontAwesome name="users" size={16} color={theme.textSecondary} style={{ width: 28 }} />
                <Text style={[Typography.body, { color: theme.textSecondary }]}>
                  {foundCourse.studentCount} students enrolled
                </Text>
              </View>
              <View style={styles.previewRow}>
                <FontAwesome name="key" size={16} color={theme.textSecondary} style={{ width: 28 }} />
                <Text style={[Typography.body, { color: theme.textSecondary }]}>
                  Code: {foundCourse.joinCode}
                </Text>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.previewActions}>
            <PrimaryButton
              title="Confirm & Join"
              onPress={handleJoin}
              icon="check"
            />
            <SecondaryButton
              title="Not My Course"
              onPress={() => { setCode(''); setState('enter'); }}
              icon="times"
              style={{ marginTop: Spacing.sm }}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Success State ───
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.successContent}>
        <Animated.View entering={BounceIn.duration(600)}>
          <View style={[styles.successCircle, { backgroundColor: theme.success + '20' }]}>
            <FontAwesome name="check" size={48} color={theme.success} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={[Typography.h1, { color: theme.text, textAlign: 'center', marginTop: Spacing.lg }]}>
            Course Joined!
          </Text>
          <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
            You've successfully enrolled in
          </Text>
          <Text style={[Typography.h3, { color: theme.primary, textAlign: 'center', marginTop: Spacing.xs }]}>
            {foundCourse?.code} — {foundCourse?.name}
          </Text>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.md, paddingHorizontal: Spacing.xl }]}>
            You'll be notified when your lecturer starts an attendance session for this course.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottomActions}>
        <PrimaryButton
          title="Back to Home"
          onPress={handleDone}
          icon="home"
        />
      </View>
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
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  centerContent: { alignItems: 'center', marginTop: Spacing.xl },
  iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  formSection: { marginTop: Spacing.xl },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewDivider: { height: 1, marginVertical: Spacing.md },
  previewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, minHeight: 40 },
  previewActions: { marginTop: Spacing.xl },
  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg },
  successCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  bottomActions: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
});
