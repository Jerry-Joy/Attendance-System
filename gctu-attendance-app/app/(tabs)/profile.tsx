import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Switch, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Bell, Smartphone, LogOut, Shield, Award, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import * as Device from 'expo-device';

export default function ProfileTab() {
  const { student, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    setShowConfirm(false);
    logout();
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Logout Confirm Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center" style={styles.modal}>
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#FEE2E2' }}>
              <LogOut size={32} color="#DC2626" strokeWidth={2} />
            </View>
            <Text className="text-2xl font-bold text-primary mb-2">Log Out?</Text>
            <Text className="text-sm text-on-surface-variant text-center mb-8 leading-relaxed">
              Are you sure you want to log out of your account?
            </Text>
            <View className="flex-row gap-3 w-full">
              <Pressable
                onPress={() => setShowConfirm(false)}
                className="flex-1 h-14 rounded-xl items-center justify-center border-2 active:opacity-70"
                style={{ borderColor: '#E2E8F0' }}
              >
                <Text className="font-bold text-base text-primary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleLogout}
                className="flex-1 h-14 rounded-xl items-center justify-center active:opacity-90"
                style={[{ backgroundColor: '#DC2626' }, styles.logoutButton]}
              >
                <Text className="font-bold text-base text-white">Log Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Simple Header */}
      <LinearGradient
        colors={['#081637', '#0A1F4D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View className="px-5 pb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white tracking-tight mt-1">My Profile</Text>
            </View>
            <Pressable
              onPress={() => router.push('/notifications')}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-80 border border-white/20 ml-3"
              style={styles.notificationButton}
            >
              <Bell size={20} color="#FFFFFF" strokeWidth={2} />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary items-center justify-center border-2 border-primary">
                  <Text className="text-[10px] font-bold text-primary">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingTop: 20, paddingBottom: 24, gap: 20 }}>
        {/* Enhanced Profile Card with GCTU Branding */}
        <View className="bg-white rounded-2xl overflow-hidden" style={styles.profileCard}>
          {/* GCTU Blue Top Section */}
          <LinearGradient
            colors={['#081637', '#0A1F4D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="pt-8 pb-16 px-6 items-center"
          >
            {/* Avatar with gold gradient */}
            <View 
              className="w-28 h-28 rounded-full items-center justify-center border-4"
              style={[{ borderColor: '#F5B41C' }, styles.avatarShadow]}
            >
              <LinearGradient
                colors={['#F5B41C', '#D49A15']}
                className="w-full h-full rounded-full items-center justify-center"
              >
                <Text className="text-4xl font-bold text-primary">
                  {student?.avatarInitials}
                </Text>
              </LinearGradient>
            </View>
          </LinearGradient>
          
          {/* White Bottom Section */}
          <View className="px-6 pb-6 -mt-8">
            {/* Name Card */}
            <View className="bg-white rounded-xl p-5 items-center mb-4" style={styles.nameCard}>
              <Text className="text-2xl font-bold text-primary text-center mb-2">{student?.name}</Text>
              <View className="flex-row items-center gap-2">
                <View className="rounded-lg px-3 py-1.5" style={{ backgroundColor: '#E0E7FF' }}>
                  <Text className="text-xs font-bold tracking-wider" style={{ color: '#081637' }}>
                    ID: {student?.studentId}
                  </Text>
                </View>
                <View className="rounded-lg px-3 py-1.5" style={{ backgroundColor: '#FEF3C7' }}>
                  <Text className="text-xs font-bold" style={{ color: '#D97706' }}>Student</Text>
                </View>
              </View>
            </View>
            
            {/* Email Section */}
            <View className="rounded-xl px-4 py-3.5 flex-row items-center gap-3" style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }}>
              <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                <Mail size={20} color="#F5B41C" strokeWidth={2} />
              </View>
              <Text className="text-sm text-primary font-semibold flex-1" numberOfLines={1}>
                {student?.email}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Push Notifications */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Bell size={16} color="#081637" />
            <Text className="text-sm font-bold text-primary uppercase tracking-wider">
              Notifications
            </Text>
          </View>
          <View className="bg-white rounded-2xl overflow-hidden" style={styles.settingCard}>
            <SettingRow
              icon={<Bell size={22} color="#F5B41C" />}
              iconBg="#FEF3C7"
              title="Push Notifications"
              subtitle="Receive class reminders and updates"
              defaultChecked
            />
          </View>
        </View>

        {/* Device Info */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Smartphone size={16} color="#081637" />
            <Text className="text-sm font-bold text-primary uppercase tracking-wider">
              Device Information
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-4" style={styles.settingCard}>
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                <Smartphone size={22} color="#081637" />
              </View>
              <View className="flex-1">
                <Text className="text-base text-primary font-bold">Registered Device</Text>
                <Text className="text-sm text-on-surface-variant mt-0.5">Current device details</Text>
              </View>
            </View>
            <View className="bg-surface rounded-xl p-3 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-on-surface-variant font-medium">Device</Text>
                <Text className="text-xs text-primary font-bold">{Device.modelName || 'Unknown'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-on-surface-variant font-medium">OS</Text>
                <Text className="text-xs text-primary font-bold">{Platform.OS === 'ios' ? 'iOS' : 'Android'} {Device.osVersion}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-on-surface-variant font-medium">Brand</Text>
                <Text className="text-xs text-primary font-bold">{Device.brand || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Badge */}
        <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
            <Shield size={22} color="#081637" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-primary">Secure Account</Text>
            <Text className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Your data is encrypted and protected
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={() => setShowConfirm(true)}
          className="h-14 rounded-xl flex-row items-center justify-center gap-2 border-2 bg-white active:opacity-70 mt-4"
          style={[{ borderColor: '#DC2626' }, styles.logoutButtonMain]}
        >
          <LogOut size={22} color="#DC2626" strokeWidth={2} />
          <Text className="font-bold text-base" style={{ color: '#DC2626' }}>Log Out</Text>
        </Pressable>

        {/* Version */}
        <View className="items-center py-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Award size={14} color="#F5B41C" />
            <Text className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">
              GCTU Smart Attendance
            </Text>
          </View>
          <Text className="text-xs font-semibold text-on-surface-variant">
            Version 2.1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, iconBg, title, subtitle, defaultChecked = false }: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(`setting_${title}`);
        if (stored !== null) {
          setChecked(stored === 'true');
        }
      } catch (e) {
        console.error('Failed to load setting', e);
      }
    };
    loadState();
  }, [title]);

  const handleToggle = async (val: boolean) => {
    setChecked(val);
    try {
      await AsyncStorage.setItem(`setting_${title}`, val.toString());
    } catch (e) {
      console.error('Failed to save setting', e);
    }
  };

  return (
    <View className="p-4 flex-row justify-between items-center">
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-base text-primary font-bold">{title}</Text>
          <Text className="text-sm text-on-surface-variant mt-0.5">{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={checked}
        onValueChange={handleToggle}
        trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E2E8F0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  notificationButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  profileCard: {
    shadowColor: '#081637',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  nameCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarShadow: {
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  settingCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoutButton: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonMain: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
});
