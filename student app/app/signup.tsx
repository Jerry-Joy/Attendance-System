/**
 * Sign Up Screen — Student account creation.
 * Two-step form: Personal Info → Credentials.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { PrimaryButton, InputField } from '@/components/ui';
import { Typography, Spacing, BorderRadius } from '@/constants/Layout';

type Step = 1 | 2;

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signup } = useAuth();

  const [step, setStep] = useState<Step>(1);

  // Step 1 fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');

  // Step 2 fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isStep1Valid = fullName.trim() && email.trim() && studentId.trim();
  const passwordsMatch = password === confirmPassword;
  const isStep2Valid = password.length >= 6 && passwordsMatch;

  const getPasswordStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
    if (password.length < 6) return { label: 'Too short', color: '#EF4444', width: '25%' };
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 1) return { label: 'Weak', color: '#EF4444', width: '33%' };
    if (score <= 2) return { label: 'Fair', color: '#F59E0B', width: '50%' };
    if (score === 3) return { label: 'Good', color: '#3B82F6', width: '75%' };
    return { label: 'Strong', color: '#10B981', width: '100%' };
  };

  const handleNext = () => {
    setError('');
    if (!isStep1Valid) {
      setError('Please fill in all fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setStep(2);
  };

  const handleSignUp = async () => {
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signup({ fullName: fullName.trim(), email: email.trim(), studentId: studentId.trim(), password });
      router.replace('/(student)/home');
    } catch (e: any) {
      setError(e.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

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
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <View style={styles.logoSection}>
            <View style={[styles.logoCircle, { backgroundColor: theme.primaryLight }]}>
              <FontAwesome name="user-plus" size={32} color={theme.primary} />
            </View>
            <Text style={[Typography.h1, { color: theme.text, marginTop: Spacing.md }]}>
              Create Account
            </Text>
            <Text style={[Typography.bodySmall, { color: theme.textSecondary, marginTop: Spacing.xs }]}>
              {step === 1 ? 'Enter your personal information' : 'Set up your password'}
            </Text>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepRow}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  { backgroundColor: theme.primary },
                ]}
              >
                {step === 2 ? (
                  <FontAwesome name="check" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepNumber}>1</Text>
                )}
              </View>
              <Text style={[Typography.caption, { color: theme.primary, marginTop: 4 }]}>
                Personal Info
              </Text>
            </View>

            <View
              style={[
                styles.stepLine,
                { backgroundColor: step === 2 ? theme.primary : theme.border },
              ]}
            />

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: step === 2 ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.stepNumber, { color: step === 2 ? '#fff' : theme.textTertiary }]}>
                  2
                </Text>
              </View>
              <Text
                style={[
                  Typography.caption,
                  { color: step === 2 ? theme.primary : theme.textTertiary, marginTop: 4 },
                ]}
              >
                Credentials
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Error Message */}
        {error ? (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
          >
            <FontAwesome name="exclamation-circle" size={16} color="#EF4444" />
            <Text style={[Typography.bodySmall, { color: '#DC2626', marginLeft: 8, flex: 1 }]}>
              {error}
            </Text>
          </Animated.View>
        ) : null}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.form}>
            <InputField
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              icon="user"
              autoCapitalize="words"
              returnKeyType="next"
            />
            <View style={{ height: Spacing.md }} />
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
              value={studentId}
              onChangeText={setStudentId}
              placeholder="Student ID"
              icon="id-card"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />

            <PrimaryButton
              title="Continue"
              onPress={handleNext}
              icon="arrow-right"
              style={{ marginTop: Spacing.xl }}
            />
          </Animated.View>
        )}

        {/* Step 2: Credentials */}
        {step === 2 && (
          <Animated.View entering={FadeInRight.duration(400)} style={styles.form}>
            <InputField
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              icon="lock"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword(!showPassword)}
              returnKeyType="next"
            />

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthSection}>
                <View style={[styles.strengthTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.strengthBar,
                      { backgroundColor: strength.color, width: strength.width as any },
                    ]}
                  />
                </View>
                <Text style={[Typography.caption, { color: strength.color, marginTop: 4 }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            <View style={{ height: Spacing.md }} />
            <InputField
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              icon="lock"
              secureTextEntry={!showConfirm}
              onToggleSecure={() => setShowConfirm(!showConfirm)}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />

            {/* Mismatch warning */}
            {confirmPassword.length > 0 && !passwordsMatch && (
              <Text style={[Typography.caption, { color: '#EF4444', marginTop: 4 }]}>
                Passwords do not match
              </Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => { setStep(1); setError(''); }}
                style={[styles.backButton, { borderColor: theme.border }]}
              >
                <FontAwesome name="arrow-left" size={16} color={theme.textSecondary} />
                <Text style={[Typography.body, { color: theme.textSecondary, marginLeft: 8 }]}>
                  Back
                </Text>
              </TouchableOpacity>

              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <PrimaryButton
                  title={loading ? 'Creating...' : 'Create Account'}
                  onPress={handleSignUp}
                  icon="check"
                  disabled={loading}
                />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Link to Login */}
        <View style={styles.footerLink}>
          <Text style={[Typography.bodySmall, { color: theme.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={[Typography.bodySmall, { color: theme.primary, fontWeight: '600' }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepLine: {
    width: 60,
    height: 2,
    marginHorizontal: Spacing.md,
    borderRadius: 1,
  },
  form: {
    marginTop: Spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  strengthSection: {
    marginTop: 8,
  },
  strengthTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
});
