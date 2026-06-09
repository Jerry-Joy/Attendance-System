import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowRight, CreditCard, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', studentId: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getStrength = (pass: string) => {
    if (!pass) return { label: 'Empty', color: '#94a3b8', score: 0 };
    if (pass.length < 6) return { label: 'Too short', color: '#ba1a1a', score: 0 };

    let complexity = 0;
    if (/[a-z]/.test(pass)) complexity++;
    if (/[A-Z]/.test(pass)) complexity++;
    if (/[0-9]/.test(pass)) complexity++;
    if (/[^a-zA-Z0-9]/.test(pass)) complexity++;

    if (complexity <= 1) return { label: 'Weak', color: '#ba1a1a', score: 1 };
    if (complexity === 2) return { label: 'Fair', color: '#F5B41C', score: 2 };
    if (complexity === 3) return { label: 'Good', color: '#22c55e', score: 3 };
    return { label: 'Strong', color: '#15803d', score: 4 }; // Max 4 levels
  };

  const strength = getStrength(formData.password);

  const handleNext = () => {
    // Validate Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Validate Student ID (e.g. 421XXXXXXX - 10 digits starting with 421)
    const idRegex = /^421\d{7}$/;
    if (!idRegex.test(formData.studentId.trim())) {
      Alert.alert("Invalid Student ID", "Student ID must start with 421 and be exactly 10 digits long.");
      return;
    }

    if (formData.fullName && formData.email && formData.studentId) setStep(2);
  };

  const handleSubmit = async () => {
    if (formData.password.length < 6 || formData.password !== formData.confirmPassword) return;

    Alert.alert(
      "Confirm Registration",
      "Are you sure you want to register?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            setError('');
            setLoading(true);
            try {
              // Create a clean payload and trim whitespace to prevent backend validation errors
              const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                studentId: formData.studentId.trim(),
                password: formData.password
              };
              await signup(payload);
              router.replace('/(tabs)/home');
            } catch (e: any) {
              setError(e.message || 'Signup failed. Please check your details and try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const strengthBarColor = (idx: number) => {
    if (strength.score >= idx + 1) return strength.color;
    return '#E2E8F0';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient
        colors={['#081637', '#0A1F4D', '#081637']}
        locations={[0, 0.5, 1]}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with GCTU Crest */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-lg items-center justify-center mb-5 border-2 border-secondary/30" style={styles.logoShadow}>
              <Image source={require('@/assets/images/gctu-crest.png')} style={{ width: 84, height: 84 }} resizeMode="contain" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold text-white tracking-tight">Join GCTU</Text>
              <Text className="text-base text-white/80 font-medium">Smart Attendance System</Text>
              <Text className="text-sm text-white/60 mt-1">Create your student account</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: '#F5B41C' }}>
                Step {step} of 2
              </Text>
              <Text className="text-xs text-white/70 font-medium">
                {step === 1 ? 'Personal Info' : 'Security Setup'}
              </Text>
            </View>
            <View className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <LinearGradient
                colors={['#F5B41C', '#D49A15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: step === 1 ? '50%' : '100%', borderRadius: 9999 }}
              />
            </View>
          </View>

          {/* Card */}
          <View className="bg-white rounded-3xl p-6" style={styles.card}>
            {!!error && (
              <View className="bg-red-50 border border-red-200 rounded-xl mb-5 px-4 py-3">
                <Text className="text-red-700 text-sm text-center font-semibold">{error}</Text>
              </View>
            )}

            {step === 1 && (
              <View className="gap-5">
                {/* Full Name */}
                <View>
                  <Text className="text-xs font-bold tracking-wider text-primary mb-2 uppercase">
                    Full Name
                  </Text>
                  <View className="flex-row items-center border-2 border-outline rounded-xl px-4 py-3.5 bg-surface" style={styles.input}>
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <User size={20} color="#081637" strokeWidth={2} />
                    </View>
                    <TextInput
                      className="flex-1 text-base text-primary font-medium"
                      placeholder="e.g. Kwame Mensah"
                      placeholderTextColor="#94a3b8"
                      value={formData.fullName}
                      onChangeText={(v: string) => setFormData({ ...formData, fullName: v })}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* University Email */}
                <View>
                  <Text className="text-xs font-bold tracking-wider text-primary mb-2 uppercase">
                    University Email
                  </Text>
                  <View className="flex-row items-center border-2 border-outline rounded-xl px-4 py-3.5 bg-surface" style={styles.input}>
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <Mail size={20} color="#081637" strokeWidth={2} />
                    </View>
                    <TextInput
                      className="flex-1 text-base text-primary font-medium"
                      placeholder="yourindex@gctu.edu.gh"
                      placeholderTextColor="#94a3b8"
                      value={formData.email}
                      onChangeText={(v: string) => setFormData({ ...formData, email: v })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Student ID */}
                <View>
                  <Text className="text-xs font-bold tracking-wider text-primary mb-2 uppercase">
                    Student ID Number
                  </Text>
                  <View className="flex-row items-center border-2 border-outline rounded-xl px-4 py-3.5 bg-surface" style={styles.input}>
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <CreditCard size={20} color="#081637" strokeWidth={2} />
                    </View>
                    <TextInput
                      className="flex-1 text-base text-primary font-medium"
                      placeholder="e.g. 4210000001"
                      placeholderTextColor="#94a3b8"
                      value={formData.studentId}
                      onChangeText={(v: string) => setFormData({ ...formData, studentId: v })}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Continue Button */}
                <Pressable
                  onPress={handleNext}
                  disabled={!formData.fullName || !formData.email || !formData.studentId}
                  className="mt-4 active:opacity-90"
                  style={{ opacity: (!formData.fullName || !formData.email || !formData.studentId) ? 0.5 : 1 }}
                >
                  <LinearGradient
                    colors={['#F5B41C', '#D49A15']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, { height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                  >
                    <Text className="text-primary font-bold text-base mr-2">Continue</Text>
                    <ArrowRight size={20} color="#081637" strokeWidth={2.5} />
                  </LinearGradient>
                </Pressable>

                {/* Login Link */}
                <Text className="text-center text-sm text-on-surface-variant mt-2">
                  Already have an account?{' '}
                  <Text className="font-bold" style={{ color: '#F5B41C' }} onPress={() => router.push('/login')}>
                    Log in
                  </Text>
                </Text>
              </View>
            )}

            {step === 2 && (
              <View className="gap-5">
                {/* Password */}
                <View>
                  <Text className="text-xs font-bold tracking-wider text-primary mb-2 uppercase">
                    Create Password
                  </Text>
                  <View className="flex-row items-center border-2 border-outline rounded-xl px-4 py-3.5 bg-surface" style={styles.input}>
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <Lock size={20} color="#081637" strokeWidth={2} />
                    </View>
                    <TextInput
                      className="flex-1 text-base text-primary font-medium"
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      value={formData.password}
                      onChangeText={(v) => setFormData({ ...formData, password: v })}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} className="ml-2">
                      {showPassword
                        ? <EyeOff size={22} color="#64748B" />
                        : <Eye size={22} color="#64748B" />
                      }
                    </Pressable>
                  </View>
                  {/* Strength bars */}
                  <View className="flex-row items-center gap-2 mt-2">
                    <View className="flex-1 flex-row gap-1">
                      {[0, 1, 2].map(i => (
                        <View key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: strengthBarColor(i) }} />
                      ))}
                    </View>
                    <Text className="text-xs font-bold w-16 text-right" style={{ color: strength.color }}>
                      {strength.label}
                    </Text>
                  </View>
                </View>

                {/* Confirm Password */}
                <View>
                  <Text className="text-xs font-bold tracking-wider text-primary mb-2 uppercase">
                    Confirm Password
                  </Text>
                  <View className="flex-row items-center border-2 border-outline rounded-xl px-4 py-3.5 bg-surface" style={styles.input}>
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                      <Lock size={20} color="#081637" strokeWidth={2} />
                    </View>
                    <TextInput
                      className="flex-1 text-base text-primary font-medium"
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      value={formData.confirmPassword}
                      onChangeText={(v) => setFormData({ ...formData, confirmPassword: v })}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                  {formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0 && (
                    <Text className="text-xs font-semibold" style={{ color: '#ba1a1a', marginTop: 4 }}>
                      Passwords do not match
                    </Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-4">
                  <Pressable
                    onPress={() => setStep(1)}
                    className="flex-1 border-2 border-outline rounded-xl items-center justify-center active:opacity-70"
                    style={{ height: 56 }}
                  >
                    <Text className="font-bold text-base text-primary">Back</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={formData.password.length < 6 || formData.password !== formData.confirmPassword || loading}
                    className="flex-[2] active:opacity-90"
                    style={{ opacity: (formData.password.length < 6 || formData.password !== formData.confirmPassword || loading) ? 0.5 : 1 }}
                  >
                    <LinearGradient
                      colors={['#16A34A', '#15803D']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.button, { height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                    >
                      <Text className="text-white font-bold text-base mr-2">
                        {loading ? 'Creating...' : 'Create Account'}
                      </Text>
                      {!loading && <CheckCircle size={20} color="#FFFFFF" strokeWidth={2.5} />}
                    </LinearGradient>
                  </Pressable>
                </View>

                {/* Security Badge */}
                <View className="flex-row items-center justify-center gap-2 mt-2 bg-surface-container px-4 py-3 rounded-xl">
                  <Shield size={16} color="#16A34A" />
                  <Text className="text-xs text-on-surface-variant font-semibold">
                    Secure encrypted connection
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="flex-1 justify-end pt-6">
            <Text className="text-xs text-white/50 text-center mt-4">
              By creating an account, you agree to GCTU's Academic Policies.
            </Text>
            <Text className="text-xs text-white/40 text-center mt-4 uppercase tracking-widest">
              Ghana Communication Technology University
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logoShadow: {
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  input: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  button: {
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
});
