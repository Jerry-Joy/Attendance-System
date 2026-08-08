import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react-native';
import { useAppContext } from '@/src/contexts/AppContext';

export default function CourseDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courses } = useAppContext();

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <Text className="text-on-surface text-lg font-bold">Course not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Parse schedule if available
  let day = 'Not Scheduled';
  let time = 'TBA';
  if (course.schedule) {
    const parts = course.schedule.split(',');
    if (parts.length >= 2) {
      day = parts[0].trim();
      time = parts[1].trim();
    }
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 pb-4 border-b border-outline-variant"
        style={{ paddingTop: insets.top + 16, backgroundColor: '#081637' }}
      >
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-80"
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-bold text-lg flex-1 text-center mr-10">{course.code}</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, gap: 24 }}>
        {/* Course Title Area */}
        <View className="items-center mt-4 mb-2">
          <View className="w-20 h-20 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <BookOpen size={40} color="#081637" />
          </View>
          <Text className="text-2xl font-bold text-primary text-center mb-2">{course.name}</Text>
          <Text className="text-base text-on-surface-variant font-medium">Lecturer: {course.lecturer}</Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-4">
          <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.card}>
            <Text className="text-sm text-on-surface-variant font-bold mb-1">Enrolled</Text>
            <View className="flex-row items-center gap-2">
              <Users size={18} color="#081637" />
              <Text className="text-xl font-bold text-primary">{course.studentCount}</Text>
            </View>
          </View>
          
          {course.attendanceRate !== undefined && (
            <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.card}>
              <Text className="text-sm text-on-surface-variant font-bold mb-1">Attendance</Text>
              <Text className="text-xl font-bold" style={{ color: course.attendanceRate >= 75 ? '#10B981' : course.attendanceRate >= 50 ? '#F59E0B' : '#EF4444' }}>
                {course.attendanceRate}%
              </Text>
            </View>
          )}
        </View>

        {/* Schedule & Info */}
        <View className="bg-white rounded-2xl p-5 gap-5" style={styles.card}>
          <Text className="text-lg font-bold text-primary mb-1">Course Information</Text>
          
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Calendar size={20} color="#081637" />
            </View>
            <View>
              <Text className="text-xs text-on-surface-variant font-bold uppercase">Day</Text>
              <Text className="text-base font-medium text-primary mt-0.5">{day}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Clock size={20} color="#081637" />
            </View>
            <View>
              <Text className="text-xs text-on-surface-variant font-bold uppercase">Time</Text>
              <Text className="text-base font-medium text-primary mt-0.5">{time}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <MapPin size={20} color="#081637" />
            </View>
            <View>
              <Text className="text-xs text-on-surface-variant font-bold uppercase">Join Code</Text>
              <Text className="text-base font-medium text-primary mt-0.5 tracking-wider">{course.joinCode}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  }
});
