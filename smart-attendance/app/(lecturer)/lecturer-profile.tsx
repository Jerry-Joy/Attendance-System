/**
 * Lecturer Profile Screen — Account info and settings
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { Spacing, Typography, BorderRadius } from '@/constants/Layout';
import { Card, Avatar, DestructiveButton, SectionHeader } from '@/components/ui';
import { mockLecturer, mockCourses } from '@/constants/MockData';

export default function LecturerProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { logout } = useAuth();

  const [qrAutoRefresh, setQrAutoRefresh] = useState(true);
  const [gpsRequired, setGpsRequired] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[Typography.h2, { color: theme.text }]}>Profile</Text>

        {/* Profile Card */}
        <Card elevated style={{ marginTop: Spacing.md }}>
          <View style={styles.profileRow}>
            <Avatar initials={mockLecturer.avatarInitials} size={64} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[Typography.h3, { color: theme.text }]}>{mockLecturer.name}</Text>
              <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>
                {mockLecturer.title}
              </Text>
              <Text style={[Typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
                {mockLecturer.department}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[Typography.h2, { color: theme.primary }]}>{mockCourses.length}</Text>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Courses</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[Typography.h2, { color: theme.success }]}>30</Text>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Sessions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[Typography.h2, { color: theme.info }]}>135</Text>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>Students</Text>
          </Card>
        </View>

        {/* Session Settings */}
        <SectionHeader title="Session Settings" />
        <Card>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
              <FontAwesome name="qrcode" size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[Typography.body, { color: theme.text }]}>Auto-Refresh QR Code</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                Refreshes every 30 seconds during session
              </Text>
            </View>
            <Switch
              value={qrAutoRefresh}
              onValueChange={setQrAutoRefresh}
              trackColor={{ false: theme.border, true: theme.primary + '50' }}
              thumbColor={qrAutoRefresh ? theme.primary : theme.textTertiary}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.success + '15' }]}>
              <FontAwesome name="map-marker" size={18} color={theme.success} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[Typography.body, { color: theme.text }]}>Require GPS Verification</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                Students must be within geofence
              </Text>
            </View>
            <Switch
              value={gpsRequired}
              onValueChange={setGpsRequired}
              trackColor={{ false: theme.border, true: theme.success + '50' }}
              thumbColor={gpsRequired ? theme.success : theme.textTertiary}
            />
          </View>
        </Card>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <Card>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.warning + '15' }]}>
              <FontAwesome name="bell" size={18} color={theme.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[Typography.body, { color: theme.text }]}>Push Notifications</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                Session alerts and student check-ins
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.border, true: theme.warning + '50' }}
              thumbColor={notifications ? theme.warning : theme.textTertiary}
            />
          </View>
        </Card>

        {/* Logout */}
        <View style={{ marginTop: Spacing.xl }}>
          <DestructiveButton
            title="Logout"
            icon="sign-out"
            onPress={handleLogout}
          />
        </View>

        <Text style={[Typography.caption, { color: theme.textTertiary, textAlign: 'center', marginTop: Spacing.lg }]}>
          SmartAttend v1.0.0 • QR + GPS Geofencing
        </Text>

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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
});
