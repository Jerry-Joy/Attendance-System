import { useState, useCallback, useRef, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl, Image, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { School, Library, QrCode, BookMarked, Terminal, Database, Calculator, Plus, TrendingUp, Calendar, Clock, Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAppContext } from '@/src/contexts/AppContext';
import { useLiveSessions } from '@/src/contexts/LiveSessionContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { computeGreeting } from '@/src/utils/greetingHelper';

const COURSE_ICONS = [Database, Terminal, Calculator];

export default function Home() {
  const router = useRouter();
  const { student, refreshProfile } = useAuth();
  const { courses, fetchCourses } = useAppContext();
  const { liveSessions, refresh: refreshLiveSessions } = useLiveSessions();
  const { unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for live dot
  useEffect(() => {
    if (liveSessions.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [liveSessions.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshProfile?.(),
        fetchCourses?.(),
        refreshLiveSessions?.()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile, fetchCourses, refreshLiveSessions]);

  // Calculate overall attendance
  // const overallAttendance = courses.length > 0
  //   ? Math.round(courses.reduce((sum, c) => sum + (c.attendanceRate || 0), 0) / courses.length)
  //   : 0;

  return (
    <View className="flex-1 bg-surface">
      {/* Compact Header with Gradient */}
      <LinearGradient
        colors={['#081637', '#0A1F4D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        {/* Top Bar */}
        <View className="flex-row justify-between items-center px-5 pb-3">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-white/10 items-center justify-center border border-secondary/30">
              <Image source={require('@/assets/images/gctu-crest.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
            </View>
            <View>
              <Text className="text-xs text-white/70 font-medium">{computeGreeting()}</Text>
              <Text className="text-base font-bold text-white tracking-tight">
                {student?.name.split(' ')[0] || student?.name}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-80 border border-white/20"
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

        {/* Compact Stats Bar */}
        <View className="flex-row mx-5 mb-4 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20" style={styles.statsBar}>
          <View className="flex-1 items-center">
            <Text className="text-white/60 text-xs font-medium">Courses</Text>
            <Text className="text-white text-xl font-bold mt-0.5">{courses.length}</Text>
          </View>
          <View className="w-px bg-white/20" />
          <View className="flex-1 items-center">
            <Text className="text-white/60 text-xs font-medium">Live Now</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Animated.View style={{ opacity: pulseAnim }}>
                <View className="w-1.5 h-1.5 rounded-full bg-secondary" />
              </Animated.View>
              <Text className="text-secondary text-xl font-bold">{liveSessions.length}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 20 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#081637']} 
            tintColor="#081637"
            progressViewOffset={-20}
          />
        }
      >
        {/* Quick Action - Scan QR */}
        <Pressable
          onPress={() => router.push('/scanner')}
          className="active:opacity-90"
        >
          <LinearGradient
            colors={['#F5B41C', '#D49A15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanButton}
          >
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
                <QrCode size={28} strokeWidth={2} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-bold tracking-tight">Scan QR Code</Text>
                <Text className="text-white/80 text-sm font-medium">Mark your attendance now</Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                <Text className="text-white text-lg">→</Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Live Sessions */}
        {liveSessions.length > 0 && (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Animated.View 
                  className="w-2 h-2 rounded-full"
                  style={{ opacity: pulseAnim, backgroundColor: '#16A34A' }}
                />
                <Text className="text-lg font-bold text-primary">Live Sessions</Text>
                <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#DCFCE7' }}>
                  <Text className="text-xs font-bold" style={{ color: '#15803D' }}>{liveSessions.length}</Text>
                </View>
              </View>
            </View>

            {liveSessions.map((session) => (
              <View
                key={session.sessionId}
                className="bg-white rounded-2xl overflow-hidden"
                style={styles.liveCard}
              >
                {/* Muted green accent bar */}
                <View className="h-1.5" style={{ backgroundColor: '#16A34A' }} />
                
                <View className="p-5 gap-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: '#DCFCE7' }}>
                          <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: '#15803D' }}>● Live Now</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Clock size={12} color="#64748B" />
                          <Text className="text-xs text-on-surface-variant font-medium">{session.duration}m</Text>
                        </View>
                      </View>
                      <Text className="text-xl font-bold text-primary leading-tight">{session.courseName}</Text>
                      <Text className="text-sm text-on-surface-variant mt-1 font-medium">
                        {session.courseCode} • {session.venue}
                      </Text>
                    </View>
                    <View className="items-end px-3 py-2 rounded-xl" style={{ backgroundColor: '#F0F9FF' }}>
                      <Text className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Started</Text>
                      <Text className="text-lg font-bold text-primary">
                        {new Date(session.startedAt).toLocaleTimeString([], { timeStyle: 'short' })}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => session.alreadyMarked ? null : router.push('/scanner')}
                    disabled={session.alreadyMarked}
                    className="flex-row justify-center items-center gap-2 py-3.5 rounded-xl active:opacity-80"
                    style={{
                      backgroundColor: session.alreadyMarked ? '#F1F5F9' : '#16A34A',
                    }}
                  >
                    <BookMarked size={20} color={session.alreadyMarked ? '#64748B' : '#FFFFFF'} />
                    <Text
                      className="font-bold text-sm tracking-wide"
                      style={{ color: session.alreadyMarked ? '#64748B' : '#FFFFFF' }}
                    >
                      {session.alreadyMarked ? 'Attendance Marked ✓' : 'Mark Attendance Now'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* My Courses */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-primary">My Courses</Text>
            <Pressable
              onPress={() => router.push('/join-course')}
              className="flex-row items-center gap-1.5 bg-primary px-4 py-2.5 rounded-xl active:opacity-80"
              style={styles.joinButton}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-white font-bold text-sm">Join Course</Text>
            </Pressable>
          </View>

          {courses.map((course, idx) => {
            const Icon = COURSE_ICONS[idx % COURSE_ICONS.length];
            const attendanceColor = 
              (course.attendanceRate || 0) >= 75 ? '#10B981' : 
              (course.attendanceRate || 0) >= 50 ? '#F59E0B' : 
              '#EF4444';
            
            return (
              <View
                key={course.id}
                className="bg-white rounded-2xl p-4 flex-row justify-between items-center"
                style={styles.courseCard}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <LinearGradient
                    colors={['#081637', '#0A1F4D']}
                    className="w-12 h-12 rounded-xl items-center justify-center"
                  >
                    <Icon size={22} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary" numberOfLines={1}>{course.name}</Text>
                    <Text className="text-sm text-on-surface-variant font-medium mt-0.5">{course.code}</Text>
                    <Text className="text-xs text-on-surface-variant mt-1" numberOfLines={1}>{course.lecturer}</Text>
                  </View>
                </View>
                {course.attendanceRate !== undefined && (
                  <View className="items-center bg-surface-container px-3 py-2 rounded-xl ml-2">
                    <TrendingUp size={14} color={attendanceColor} />
                    <Text className="text-xl font-bold mt-1" style={{ color: attendanceColor }}>
                      {course.attendanceRate}%
                    </Text>
                    <Text className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      Rate
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {courses.length === 0 && (
            <View className="bg-surface-container rounded-2xl p-8 items-center gap-3">
              <School size={48} color="#94A3B8" strokeWidth={1.5} />
              <Text className="text-on-surface-variant text-center font-medium">No courses yet</Text>
              <Pressable
                onPress={() => router.push('/join-course')}
                className="bg-primary px-5 py-2.5 rounded-xl active:opacity-80 mt-2"
              >
                <Text className="text-white font-bold text-sm">Join Your First Course</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Bottom spacing for tab bar */}
        <View className="h-4" />
      </ScrollView>
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
  statsBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  scanButton: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  liveCard: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  joinButton: {
    shadowColor: '#081637',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  courseCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});
