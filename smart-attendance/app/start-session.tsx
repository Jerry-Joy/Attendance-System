/**
 * Start Session Screen — Lecturer configures and starts an attendance session
 * Includes geofence radius configuration and venue selection.
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { PrimaryButton, SecondaryButton, Card, InputField, GeofenceBadge, SectionHeader } from '@/components/ui';
import { mockCourses } from '@/constants/MockData';

const RADIUS_OPTIONS = [25, 50, 75, 100];
const DURATION_OPTIONS = ['15 min', '30 min', '45 min', '1 hour', '2 hours'];
const GROUP_OPTIONS_DEFAULT = ['All', 'Group A', 'Group B'];

export default function StartSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string }>();
  const theme = useTheme();

  const course = mockCourses.find((c) => c.id === params.courseId) || mockCourses[0];

  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState(50);
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [loading, setLoading] = useState(false);

  const groups = course.groups || GROUP_OPTIONS_DEFAULT;

  const handleCaptureLocation = () => {
    // Simulate GPS capture
    setTimeout(() => setLocationCaptured(true), 800);
  };

  const handleStartSession = () => {
    setLoading(true);
    setTimeout(() => {
      router.push({
        pathname: '/active-session',
        params: {
          courseId: course.id,
          group: selectedGroup,
          radius: String(selectedRadius),
          duration: selectedDuration,
        },
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h3, { color: theme.text }]}>Start Session</Text>
          <Text style={[Typography.caption, { color: theme.textSecondary }]}>
            {course.code} — {course.name}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Course Info Card */}
        <Card elevated>
          <View style={styles.courseInfo}>
            <View style={[styles.courseIcon, { backgroundColor: theme.primaryLight }]}>
              <FontAwesome name="book" size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h3, { color: theme.text }]}>{course.code}</Text>
              <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>{course.name}</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
                {course.studentCount} students enrolled
              </Text>
            </View>
          </View>
        </Card>

        {/* Group Selection */}
        <SectionHeader title="Select Group" />
        <View style={styles.chipRow}>
          {groups.map((group) => (
            <TouchableOpacity
              key={group}
              onPress={() => setSelectedGroup(group)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedGroup === group ? theme.primary : theme.card,
                  borderColor: selectedGroup === group ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  Typography.bodySmall,
                  {
                    color: selectedGroup === group ? '#fff' : theme.text,
                    fontWeight: selectedGroup === group ? '600' : '400',
                  },
                ]}
              >
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Geofence Radius */}
        <SectionHeader title="Geofence Radius" />
        <Card>
          <View style={styles.radiusInfo}>
            <FontAwesome name="bullseye" size={18} color={theme.primary} />
            <Text style={[Typography.bodySmall, { color: theme.textSecondary, marginLeft: Spacing.sm, flex: 1 }]}>
              Students must be within this distance of the venue to mark attendance
            </Text>
          </View>
          <View style={[styles.chipRow, { marginTop: Spacing.md }]}>
            {RADIUS_OPTIONS.map((radius) => (
              <TouchableOpacity
                key={radius}
                onPress={() => setSelectedRadius(radius)}
                style={[
                  styles.radiusChip,
                  {
                    backgroundColor: selectedRadius === radius ? theme.primary : theme.surface,
                    borderColor: selectedRadius === radius ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.bodySmall,
                    {
                      color: selectedRadius === radius ? '#fff' : theme.text,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {radius}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ marginTop: Spacing.md, alignItems: 'flex-start' }}>
            <GeofenceBadge radius={selectedRadius} isActive={true} />
          </View>
        </Card>

        {/* Session Duration */}
        <SectionHeader title="Session Duration" />
        <View style={styles.chipRow}>
          {DURATION_OPTIONS.map((dur) => (
            <TouchableOpacity
              key={dur}
              onPress={() => setSelectedDuration(dur)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedDuration === dur ? theme.primary : theme.card,
                  borderColor: selectedDuration === dur ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  Typography.bodySmall,
                  {
                    color: selectedDuration === dur ? '#fff' : theme.text,
                    fontWeight: selectedDuration === dur ? '600' : '400',
                  },
                ]}
              >
                {dur}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Venue Location */}
        <SectionHeader title="Venue Location" />
        <Card>
          {locationCaptured ? (
            <View>
              <View style={styles.venueRow}>
                <FontAwesome name="check-circle" size={20} color={theme.success} />
                <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                  <Text style={[Typography.body, { color: theme.text, fontWeight: '600' }]}>
                    {course.venueName || 'Current Location'}
                  </Text>
                  <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                    GPS coordinates captured
                  </Text>
                </View>
              </View>
              <SecondaryButton
                title="Recapture Location"
                icon="refresh"
                onPress={() => setLocationCaptured(false)}
                style={{ marginTop: Spacing.md }}
              />
            </View>
          ) : (
            <View>
              <View style={styles.venueRow}>
                <FontAwesome name="map-marker" size={20} color={theme.textSecondary} />
                <Text style={[Typography.body, { color: theme.textSecondary, marginLeft: Spacing.sm }]}>
                  Capture your current GPS location as the venue center
                </Text>
              </View>
              <PrimaryButton
                title="Capture My Location"
                icon="location-arrow"
                onPress={handleCaptureLocation}
                style={{ marginTop: Spacing.md }}
              />
            </View>
          )}
        </Card>

        {/* QR Code Info */}
        <Card style={{ marginTop: Spacing.lg }}>
          <View style={styles.venueRow}>
            <FontAwesome name="qrcode" size={20} color={theme.info} />
            <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
              <Text style={[Typography.bodySmall, { color: theme.text, fontWeight: '600' }]}>
                Dynamic QR Code
              </Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                A time-sensitive QR code will be generated that refreshes every 30 seconds
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Start Button */}
      <View style={[styles.bottomArea, { backgroundColor: theme.background }]}>
        <PrimaryButton
          title="Start Attendance Session"
          icon="play"
          onPress={handleStartSession}
          loading={loading}
          disabled={!locationCaptured}
        />
        {!locationCaptured && (
          <Text style={[Typography.caption, { color: theme.warning, textAlign: 'center', marginTop: Spacing.sm }]}>
            Please capture venue location first
          </Text>
        )}
      </View>
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
  scrollContent: {
    padding: Spacing.md,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  radiusChip: {
    width: 64,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  radiusInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomArea: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
