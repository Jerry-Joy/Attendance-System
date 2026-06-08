import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, ShieldCheck, ChevronLeft } from 'lucide-react-native';

export default function Success() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ courseCode: string; courseName: string; venue: string }>();

  const courseCode = params.courseCode || 'CSCI 301';
  const courseName = params.courseName || 'Software Engineering';
  const venue = params.venue || 'Block C, Room 402';

  const mountAnim = useRef(new Animated.Value(0)).current;
  const pingAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(mountAnim, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pingAnim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pingAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const checkScale = mountAnim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
  const checkOpacity = mountAnim;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { timeStyle: 'short' });

  return (
    <View className="flex-1 bg-surface" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="flex-1 items-center justify-center px-5 w-full max-w-sm self-center">

        {/* Animated checkmark */}
        <Animated.View
          className="mb-8"
          style={{ opacity: checkOpacity, transform: [{ scale: checkScale }] }}
        >
          <View className="w-24 h-24 rounded-full bg-primary-container items-center justify-center">
            <Animated.View
              className="absolute inset-0 rounded-full border-2 border-primary-container opacity-20"
              style={{ transform: [{ scale: pingAnim }] }}
            />
            <CheckCircle2 size={48} color="#0D2A66" strokeWidth={2.5} fill="#DAE1FF" />
          </View>
        </Animated.View>

        {/* Title & badge */}
        <View className="items-center w-full mb-8">
          <Text className="text-3xl font-bold text-on-surface mb-4 tracking-tight text-center">
            Attendance Confirmed!
          </Text>
          <View className="flex-row items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant">
            <ShieldCheck size={16} color="#475569" />
            <Text className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">
              QR + GPS VERIFIED
            </Text>
          </View>
        </View>

        {/* Details card */}
        <View className="w-full bg-surface-container-lowest rounded-xl border-l-4 border-primary p-5 mb-8">
          <Text className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Course</Text>
          <Text className="text-xl font-bold text-primary mb-4 leading-tight">
            {courseCode}: {courseName}
          </Text>

          <View className="flex-row gap-4 border-t border-outline-variant pt-4">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Date</Text>
              <Text className="font-medium text-base text-on-surface">{dateStr}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Time</Text>
              <Text className="font-medium text-base text-on-surface">{timeStr}</Text>
            </View>
          </View>

          <View className="mt-4 pt-4 border-t border-outline-variant">
            <Text className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Venue</Text>
            <Text className="font-medium text-base text-on-surface">{venue}</Text>
          </View>
        </View>
      </View>

      {/* Footer actions */}
      <View className="px-5 gap-3" style={{ paddingBottom: insets.bottom }}>
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          className="w-full h-12 bg-primary rounded-lg flex-row items-center justify-center gap-2 active:opacity-80"
        >
          <ChevronLeft size={20} color="#FFFFFF" />
          <Text className="text-on-primary font-semibold">Back to Home</Text>
        </Pressable>
        <Pressable
          onPress={() => Alert.alert("View Syllabus Flow Not Implemented")}
          className="w-full h-12 rounded-lg items-center justify-center active:bg-surface-container"
        >
          <Text className="text-primary font-semibold">View Syllabus</Text>
        </Pressable>
      </View>
    </View>
  );
}
