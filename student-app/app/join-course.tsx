import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Key, Search, School, Users, User, LogIn, CheckCircle2, Info, Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAppContext } from '@/src/contexts/AppContext';
import { useLiveSessions } from '@/src/contexts/LiveSessionContext';
import { useNotifications } from '@/src/contexts/NotificationContext';

type FlowState = 'ENTRY' | 'PREVIEW' | 'SUCCESS';

export default function JoinCourse() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { student } = useAuth();
  const { previewCourse, joinCourse } = useAppContext();
  const { rejoinCourseRooms } = useLiveSessions();
  const { addNotification } = useNotifications();

  const [state, setState] = useState<FlowState>('ENTRY');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successPing = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    if (state === 'SUCCESS') {
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        delay: 200,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(successPing, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(successPing, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [state]);

  const pingStyle = {
    opacity: successPing.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] }),
    transform: [{ scale: successPing.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
  };

  const handleInput = (text: string) => {
    setCode(text.toUpperCase().replace(/\s/g, '').substring(0, 10));
    setError(false);
  };

  const handleFind = async () => {
    if (code.length < 4) { 
      setError(true); 
      return; 
    }
    
    setLoading(true);
    setError(false);
    
    try {
      const result = await previewCourse(code);
      
      if (result.alreadyEnrolled) {
        alert('You are already enrolled in this course');
        setLoading(false);
        return;
      }
      
      setPreviewData(result.course);
      setState('PREVIEW');
    } catch (err: any) {
      setError(true);
      alert(err.message || 'Course not found');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await joinCourse(code);
      // Rejoin WebSocket course rooms to receive notifications for new course
      await rejoinCourseRooms();
      
      // Add success notification
      addNotification({
        type: 'course_joined',
        title: 'Course Joined Successfully!',
        message: `You have successfully joined ${previewData?.name || 'the course'}`,
        courseCode: previewData?.code || code,
        courseName: previewData?.name || '',
        actionable: false
      });
      
      setState('SUCCESS');
    } catch (err: any) {
      alert(err.message || 'Failed to join course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Gradient Header */}
      {state !== 'SUCCESS' && (
        <LinearGradient
          colors={['#081637', '#0A1F4D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row justify-between items-center px-5 py-4">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
              >
                <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
              <View>
                <Text className="text-xl font-bold text-white tracking-tight">Join Course</Text>
                <Text className="text-xs text-white/70 font-medium mt-0.5">Enroll in a new course</Text>
              </View>
            </View>
            <View className="w-11 h-11 rounded-full bg-white/10 items-center justify-center border-2 border-secondary/30">
              <Text className="text-sm font-bold text-white">{student?.avatarInitials || 'JD'}</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          className="w-full max-w-md self-center"
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          {/* Progress dots */}
          {state !== 'SUCCESS' && (
            <View className="flex-row justify-center gap-2 mb-8">
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  className="h-2 rounded-full"
                  style={{
                    width: (i === 0 && (state === 'ENTRY' || state === 'PREVIEW')) ||
                           (i === 1 && state === 'PREVIEW') ? 32 : 8,
                    backgroundColor:
                      (i === 0 && (state === 'ENTRY' || state === 'PREVIEW')) ||
                      (i === 1 && state === 'PREVIEW')
                        ? '#F5B41C' : '#E2E8F0',
                  }}
                />
              ))}
            </View>
          )}

          {/* Card with white background and shadow */}
          <View className="bg-white rounded-2xl p-6" style={styles.card}>

            {/* ENTRY */}
            {state === 'ENTRY' && (
              <View className="gap-6">
                <View className="items-center">
                  <LinearGradient
                    colors={['#F5B41C', '#D49A15']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconCircle}
                  >
                    <Key size={40} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                  <Text className="text-2xl font-bold text-primary mb-2 text-center mt-4">Enter Course Code</Text>
                  <Text className="text-sm text-on-surface-variant text-center px-4">
                    Provide the code given by your lecturer to join the course
                  </Text>
                </View>

                <View>
                  <TextInput
                    value={code}
                    onChangeText={handleInput}
                    maxLength={10}
                    placeholder="e.g. IT271A"
                    placeholderTextColor="#94a3b8"
                    className="text-3xl font-bold text-center text-primary tracking-widest py-4 rounded-xl"
                    style={[
                      styles.codeInput,
                      { borderColor: error ? '#DC2626' : code ? '#F5B41C' : '#E2E8F0' }
                    ]}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  {error && (
                    <View className="bg-red-50 rounded-lg p-3 mt-3 border border-red-200">
                      <Text className="text-red-700 text-sm font-bold text-center">
                        Please enter a valid course code
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={handleFind}
                  disabled={loading || !code}
                  className="active:opacity-90"
                  style={{ opacity: loading || !code ? 0.5 : 1 }}
                >
                  <LinearGradient
                    colors={['#081637', '#0A1F4D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, { height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Search size={22} color="#FFFFFF" strokeWidth={2.5} />
                        <Text className="text-white font-bold text-base">Find Course</Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            )}

            {/* PREVIEW */}
            {state === 'PREVIEW' && (
              <View className="gap-6">
                <View className="items-center">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Sparkles size={20} color="#F5B41C" fill="#F5B41C" />
                    <Text className="text-2xl font-bold text-primary text-center">Confirm Details</Text>
                    <Sparkles size={20} color="#F5B41C" fill="#F5B41C" />
                  </View>
                  <Text className="text-sm text-on-surface-variant text-center">Is this the correct course?</Text>
                </View>

                <View className="bg-white rounded-2xl p-5" style={styles.previewCard}>
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5B41C20' }}>
                      <Text className="font-bold text-base tracking-widest" style={{ color: '#F5B41C' }}>{code}</Text>
                    </View>
                    <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center">
                      <School size={24} color="#FFFFFF" strokeWidth={2} />
                    </View>
                  </View>
                  
                  <Text className="text-xl font-bold text-primary mb-5 leading-tight">
                    {previewData?.name || 'Course Name'}
                  </Text>

                  <View className="gap-4 border-t-2 border-outline pt-4">
                    <View className="flex-row items-center gap-3">
                      <View className="w-11 h-11 rounded-xl bg-surface items-center justify-center">
                        <User size={20} color="#081637" strokeWidth={2} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Lecturer</Text>
                        <Text className="text-base font-bold text-primary mt-0.5">
                          {previewData?.lecturer || 'Unknown Lecturer'}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <View className="w-11 h-11 rounded-xl bg-surface items-center justify-center">
                        <Users size={20} color="#081637" strokeWidth={2} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Enrollment</Text>
                        <Text className="text-base font-bold text-primary mt-0.5">
                          {previewData?.studentCount ?? 0} students enrolled
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setState('ENTRY')}
                    className="px-6 h-14 border-2 border-outline rounded-xl items-center justify-center active:opacity-70"
                  >
                    <Text className="font-bold text-base text-primary">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleConfirm}
                    disabled={loading}
                    className="flex-1 active:opacity-90"
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    <LinearGradient
                      colors={['#F5B41C', '#D49A15']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.button, { height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
                    >
                      {loading ? (
                        <ActivityIndicator color="#081637" size="small" />
                      ) : (
                        <>
                          <Text className="text-primary font-bold text-base">Confirm & Join</Text>
                          <LogIn size={20} color="#081637" strokeWidth={2.5} />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            )}

            {/* SUCCESS */}
            {state === 'SUCCESS' && (
              <View className="items-center gap-6 py-4">
                {/* Success Icon with Ping */}
                <View className="relative items-center justify-center">
                  {/* Ping rings */}
                  {[1, 2, 3].map((_, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        pingStyle,
                        {
                          position: 'absolute',
                          width: 140,
                          height: 140,
                          borderRadius: 70,
                          borderWidth: 3,
                          borderColor: '#16A34A',
                        },
                      ]}
                    />
                  ))}
                  
                  <Animated.View style={{ transform: [{ scale: successScale }] }}>
                    <LinearGradient
                      colors={['#16A34A', '#15803D']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.successCircle}
                    >
                      <CheckCircle2 size={56} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
                    </LinearGradient>
                  </Animated.View>
                </View>

                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary mb-2 text-center">Course Joined!</Text>
                  <Text className="text-base text-on-surface-variant text-center px-4">
                    You have successfully enrolled in{' '}
                    {previewData?.name && (
                      <Text className="font-bold text-primary">{previewData.name}</Text>
                    )}
                  </Text>
                </View>

                <View className="w-full bg-blue-50 rounded-xl p-4 flex-row items-start gap-3 border-2 border-blue-200">
                  <Info size={20} color="#3B82F6" strokeWidth={2.5} />
                  <Text className="text-sm text-blue-900 font-semibold flex-1 leading-5">
                    You will now receive notifications and attendance alerts for this course
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.replace('/(tabs)/home')}
                  className="w-full active:opacity-90"
                >
                  <LinearGradient
                    colors={['#081637', '#0A1F4D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }]}
                  >
                    <Text className="text-white font-bold text-base">Back to Dashboard</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  codeInput: {
    borderWidth: 3,
    backgroundColor: '#F8FAFC',
  },
  previewCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#F5B41C',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  button: {
    shadowColor: '#081637',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
