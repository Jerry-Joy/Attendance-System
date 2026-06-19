import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, ShieldCheck, Home, Calendar, Clock, MapPin, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Success() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ courseCode: string; courseName: string; venue: string }>();

  const courseCode = params.courseCode || 'CSCI 301';
  const courseName = params.courseName || 'Software Engineering';
  const venue = params.venue || 'Block C, Room 402';

  const mountAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const ping1 = useRef(new Animated.Value(0)).current;
  const ping2 = useRef(new Animated.Value(0)).current;
  const ping3 = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Mount animation
    Animated.timing(mountAnim, { 
      toValue: 1, 
      duration: 400, 
      useNativeDriver: true 
    }).start();

    // Check icon pop animation
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Ping animations
    const createPing = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );

    Animated.parallel([
      createPing(ping1, 0),
      createPing(ping2, 600),
      createPing(ping3, 1200),
    ]).start();

    // Sparkle animations
    const sparkleAnim = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );

    Animated.parallel([
      sparkleAnim(sparkle1, 300),
      sparkleAnim(sparkle2, 900),
    ]).start();
  }, []);

  const pingStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
  });

  const sparkleOpacity = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { timeStyle: 'short' });

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center px-5 w-full max-w-md self-center">

        {/* Animated Success Icon with Pings */}
        <View className="mb-8 items-center">
          {/* Ping rings */}
          {[ping1, ping2, ping3].map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                pingStyle(anim),
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

          {/* Success check circle */}
          <Animated.View
            style={{
              opacity: mountAnim,
              transform: [{ scale: checkScale }],
            }}
          >
            <LinearGradient
              colors={['#16A34A', '#15803D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successCircle}
            >
              <CheckCircle2 size={56} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Sparkles */}
          <Animated.View
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              opacity: sparkleOpacity(sparkle1),
            }}
          >
            <Sparkles size={24} color="#F5B41C" fill="#F5B41C" />
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              bottom: -10,
              left: -10,
              opacity: sparkleOpacity(sparkle2),
            }}
          >
            <Sparkles size={20} color="#F5B41C" fill="#F5B41C" />
          </Animated.View>
        </View>

        {/* Title & Subtitle */}
        <Animated.View 
          className="items-center w-full mb-6"
          style={{ opacity: mountAnim }}
        >
          <Text className="text-3xl font-bold text-primary mb-2 tracking-tight text-center">
            Attendance Confirmed!
          </Text>
          <Text className="text-base text-on-surface-variant text-center mb-4 px-4">
            Your presence has been successfully recorded
          </Text>
          
          {/* Verification Badge */}
          <View className="flex-row items-center gap-2 bg-green-50 px-4 py-2 rounded-full border-2 border-green-200">
            <ShieldCheck size={18} color="#16A34A" strokeWidth={2.5} />
            <Text className="text-green-700 font-bold text-sm uppercase tracking-wider">
              QR + GPS VERIFIED
            </Text>
          </View>
        </Animated.View>

        {/* Course Details Card */}
        <Animated.View 
          className="w-full mb-6"
          style={{ opacity: mountAnim }}
        >
          <View className="bg-white rounded-2xl p-5 border-2 border-outline" style={styles.detailsCard}>
            {/* Course Header */}
            <View className="mb-4 pb-4 border-b-2 border-outline">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#F5B41C20' }}>
                  <Text className="text-lg">📚</Text>
                </View>
                <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F5B41C' }}>
                  Course
                </Text>
              </View>
              <Text className="text-xl font-bold text-primary leading-tight">
                {courseCode}
              </Text>
              <Text className="text-base text-on-surface-variant mt-1">
                {courseName}
              </Text>
            </View>

            {/* Session Details Grid */}
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                  <Calendar size={20} color="#081637" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</Text>
                  <Text className="text-base font-bold text-primary">{dateStr}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                  <Clock size={20} color="#081637" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Time</Text>
                  <Text className="text-base font-bold text-primary">{timeStr}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                  <MapPin size={20} color="#081637" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Venue</Text>
                  <Text className="text-base font-bold text-primary">{venue}</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View 
          className="w-full bg-green-50 rounded-xl p-4 border border-green-200"
          style={{ opacity: mountAnim }}
        >
          <Text className="text-sm text-green-800 text-center leading-5">
            ✓ Your attendance record is now saved and will appear in your history.
          </Text>
        </Animated.View>
      </View>

      {/* Footer Button */}
      <View className="px-5 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          className="active:opacity-90"
        >
          <LinearGradient
            colors={['#081637', '#0A1F4D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.homeButton, { height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
          >
            <Home size={22} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-white font-bold text-base">Back to Home</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  detailsCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 6,
    borderLeftColor: '#F5B41C',
  },
  homeButton: {
    shadowColor: '#081637',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
