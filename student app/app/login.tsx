/**
 * Login Screen — Student authentication via real backend API.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { PrimaryButton, InputField } from '@/components/ui';
import { Typography, Spacing, BorderRadius } from '@/constants/Layout';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(student)/home');
    } catch (e: any) {
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
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
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={[styles.logoCircle, { backgroundColor: theme.primaryLight }]}>
              <FontAwesome name="check-circle" size={36} color={theme.primary} />
            </View>
            <Text style={[Typography.h1, { color: theme.text, marginTop: Spacing.md }]}>
              Welcome Back
            </Text>
            <Text style={[Typography.bodySmall, { color: theme.textSecondary, marginTop: Spacing.xs }]}>
              Sign in to mark attendance
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                <FontAwesome name="exclamation-circle" size={16} color="#EF4444" />
                <Text style={[Typography.bodySmall, { color: '#DC2626', marginLeft: 8, flex: 1 }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              icon="envelope"
              keyboardType="email-address"
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
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              icon="sign-in"
              disabled={loading || !email.trim() || !password}
              style={{ marginTop: Spacing.lg }}
            />

            {/* Info about GPS */}
            <View style={[styles.infoBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '30' }]}>
              <FontAwesome name="map-marker" size={16} color={theme.primary} />
              <Text style={[Typography.caption, { color: theme.primary, marginLeft: 8, flex: 1 }]}>
                This app uses GPS location to verify your presence during attendance sessions.
              </Text>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupLink}>
              <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={[Typography.bodySmall, { color: theme.primary, fontWeight: '600' }]}>
                  Create Account
                </Text>
              </TouchableOpacity>
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
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
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
});
