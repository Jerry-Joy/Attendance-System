/**
 * Login Screen — Shared for Student and Lecturer.
 * Role toggle at top, Student ID/Lecturer ID input.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { PrimaryButton, InputField } from '@/components/ui';
import { Typography, Spacing, BorderRadius } from '@/constants/Layout';
import { UserRole } from '@/constants/MockData';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    login(role);
    if (role === 'student') {
      router.replace('/(student)/home');
    } else {
      router.replace('/(lecturer)/courses');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          {/* Role Toggle */}
          <View style={[styles.roleToggle, { backgroundColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setRole('student')}
              style={[
                styles.roleTab,
                role === 'student' && { backgroundColor: theme.primary },
              ]}
            >
              <FontAwesome
                name="graduation-cap"
                size={16}
                color={role === 'student' ? '#fff' : theme.textSecondary}
              />
              <Text
                style={[
                  Typography.bodySmall,
                  { color: role === 'student' ? '#fff' : theme.textSecondary, marginLeft: 6 },
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRole('lecturer')}
              style={[
                styles.roleTab,
                role === 'lecturer' && { backgroundColor: theme.primary },
              ]}
            >
              <FontAwesome
                name="briefcase"
                size={16}
                color={role === 'lecturer' ? '#fff' : theme.textSecondary}
              />
              <Text
                style={[
                  Typography.bodySmall,
                  { color: role === 'lecturer' ? '#fff' : theme.textSecondary, marginLeft: 6 },
                ]}
              >
                Lecturer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={[styles.logoCircle, { backgroundColor: theme.primaryLight }]}>
              <FontAwesome name="check-circle" size={36} color={theme.primary} />
            </View>
            <Text style={[Typography.h1, { color: theme.text, marginTop: Spacing.md }]}>
              Welcome Back
            </Text>
            <Text style={[Typography.bodySmall, { color: theme.textSecondary, marginTop: Spacing.xs }]}>
              {role === 'student' ? 'Sign in to mark attendance' : 'Sign in to manage sessions'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              value={userId}
              onChangeText={setUserId}
              placeholder={role === 'student' ? 'Student ID' : 'Lecturer ID'}
              icon="user"
              autoCapitalize="none"
              returnKeyType="next"
            />
            <View style={{ height: Spacing.md }} />
            <InputField
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              icon="lock"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword(!showPassword)}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity style={styles.forgotLink}>
              <Text style={[Typography.bodySmall, { color: theme.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              icon="sign-in"
              style={{ marginTop: Spacing.lg }}
            />

            {/* Info about GPS */}
            <View style={[styles.infoBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '30' }]}>
              <FontAwesome name="map-marker" size={16} color={theme.primary} />
              <Text style={[Typography.caption, { color: theme.primary, marginLeft: 8, flex: 1 }]}>
                This app uses GPS location to verify your presence during attendance sessions.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  roleToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {},
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
