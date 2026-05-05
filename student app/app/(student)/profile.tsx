/**
 * Student Profile Screen — Settings, GPS location preferences, and account info
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
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Layout';
import { Card, Avatar, DestructiveButton, SectionHeader, GPSStatusIndicator } from '@/components/ui';
import { Platform } from 'react-native';

export default function StudentProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { logout, student } = useAuth();

  const [locationEnabled, setLocationEnabled] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const displayName = student?.name ?? 'Student';
  const displayInitials = student?.avatarInitials ?? '?';
  const displayIndex = student?.indexNumber ?? '';
  const displayEmail = student?.email ?? '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[Typography.h2, { color: theme.text }]}>Profile</Text>

        {/* Profile Card */}
        <Card elevated style={{ marginTop: Spacing.md }}>
          <View style={styles.profileRow}>
            <Avatar initials={displayInitials} size={64} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[Typography.h3, { color: theme.text }]}>{displayName}</Text>
              <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>
                {displayIndex}
              </Text>
              <Text style={[Typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
                {displayEmail}
              </Text>
            </View>
          </View>
        </Card>

        {/* Location Settings */}
        <SectionHeader title="Location Settings" />
        <Card>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.success + '15' }]}>
              <FontAwesome name="map-marker" size={18} color={theme.success} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[Typography.body, { color: theme.text }]}>Location Services</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                Required for GPS-based attendance
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: theme.border, true: theme.success + '50' }}
              thumbColor={locationEnabled ? theme.success : theme.textTertiary}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
              <FontAwesome name="crosshairs" size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[Typography.body, { color: theme.text }]}>High Accuracy Mode</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                Uses GPS + Wi-Fi for better precision
              </Text>
            </View>
            <Switch
              value={highAccuracy}
              onValueChange={setHighAccuracy}
              trackColor={{ false: theme.border, true: theme.primary + '50' }}
              thumbColor={highAccuracy ? theme.primary : theme.textTertiary}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.info + '15' }]}>
              <FontAwesome name="location-arrow" size={16} color={theme.info} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[Typography.body, { color: theme.text }]}>GPS Status</Text>
            </View>
            <GPSStatusIndicator status={locationEnabled ? 'found' : 'searching'} />
          </View>
        </Card>

        {/* App Settings */}
        <SectionHeader title="App Settings" />
        <Card>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: theme.warning + '15' }]}>
              <FontAwesome name="bell" size={18} color={theme.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[Typography.body, { color: theme.text }]}>Notifications</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>
                Session reminders and alerts
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

        {/* Device Info */}
        <SectionHeader title="Device" />
        <Card>
          <View style={styles.settingRow}>
            <FontAwesome name="mobile" size={22} color={theme.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[Typography.body, { color: theme.text }]}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
              <Text style={[Typography.caption, { color: theme.textSecondary }]}>Current device</Text>
            </View>
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

        <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
          <Text style={[Typography.caption, { color: theme.textTertiary, textAlign: 'center' }]}>
            GCTU Smart Attendance v1.0.0
          </Text>
          <Text style={[Typography.caption, { color: theme.textTertiary, textAlign: 'center', marginTop: 2, fontSize: 10 }]}>
            QR + GPS Geofencing + Blockchain
          </Text>
          <Text style={{ fontSize: 9, color: '#C5960C', textAlign: 'center', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
            Ghana Communication Technology University
          </Text>
        </View>

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
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statDivider: {
    width: 1,
    height: 40,
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
