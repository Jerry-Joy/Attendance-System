import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Both fields are required');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
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
          <View className="items-center mb-10">
            <View className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-lg items-center justify-center mb-6 border-2 border-secondary/30" style={styles.logoShadow}>
              <Image source={require('@/assets/images/gctu-crest.png')} style={{ width: 96, height: 96 }} resizeMode="contain" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-4xl font-bold text-white tracking-tight">Welcome Back</Text>
              <View className="flex-row items-center gap-2">
                <Sparkles size={16} color="#F5B41C" />
                <Text className="text-base text-white/80 font-medium">GCTU Smart Attendance</Text>
              </View>
              <Text className="text-sm text-white/60 mt-2">Sign in to mark your attendance</Text>
            </View>
          </View>

          {/* Login Card */}
          <View className="bg-white rounded-3xl p-6" style={styles.card}>
            {!!error && (
              <View className="bg-red-50 border border-red-200 rounded-xl mb-5 px-4 py-3">
                <Text className="text-red-700 text-sm text-center font-semibold">{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-xs font-bold tracking-wider text-primary mb-2 uppercase">
                Student Email
              </Text>
              <View className="flex-row items-center border-2 border-outline rounded-xl px-4 py-3.5 bg-surface" style={styles.input}>
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Mail size={20} color="#081637" strokeWidth={2} />
                </View>
                <TextInput
                  className="flex-1 text-base text-primary font-medium"
                  placeholder="yourindex@gctu.edu.gh"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-3">
              <Text className="text-xs font-bold tracking-wider text-primary mb-2 uppercase">
                Password
              </Text>
              <View className="flex-row items-center border-2 border-outline rounded-xl px-4 py-3.5 bg-surface" style={styles.input}>
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Lock size={20} color="#081637" strokeWidth={2} />
                </View>
                <TextInput
                  className="flex-1 text-base text-primary font-medium"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} className="ml-2">
                  {showPassword
                    ? <EyeOff size={22} color="#64748B" />
                    : <Eye size={22} color="#64748B" />
                  }
                </Pressable>
              </View>
              <Pressable className="items-end mt-3" onPress={() => Alert.alert("Feature Coming Soon", "Password recovery will be available in the next update.")}>
                <Text className="text-sm font-semibold" style={{ color: '#F5B41C' }}>Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Sign In Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="mt-6 active:opacity-90"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <LinearGradient
                colors={['#F5B41C', '#D49A15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, { height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
              >
                <Text className="text-primary font-bold text-base mr-2">
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
                {!loading && <ArrowRight size={20} color="#081637" strokeWidth={2.5} />}
              </LinearGradient>
            </Pressable>

            {/* Security Badge */}
            <View className="flex-row items-center justify-center gap-2 mt-6 bg-surface-container px-4 py-3 rounded-xl">
              <Shield size={16} color="#16A34A" />
              <Text className="text-xs text-on-surface-variant font-semibold">
                Secure encrypted connection
              </Text>
            </View>
          </View>

          {/* Sign Up Link */}
          <View className="mt-8 items-center">
            <Text className="text-sm text-white/80">
              New student?{' '}
              <Text
                className="font-bold"
                style={{ color: '#F5B41C' }}
                onPress={() => router.push('/signup')}
              >
                Create Account
              </Text>
            </Text>
          </View>

          {/* Footer */}
          <View className="flex-1 justify-end pt-8">
            <Text className="text-xs text-white/50 text-center uppercase tracking-widest">
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
