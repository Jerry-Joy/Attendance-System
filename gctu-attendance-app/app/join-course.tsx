import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Key, Search, School, Users, User, LogIn, CheckCircle2, Info,
} from 'lucide-react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAppContext } from '@/src/contexts/AppContext';
import { useLiveSessions } from '@/src/contexts/LiveSessionContext';

type FlowState = 'ENTRY' | 'PREVIEW' | 'SUCCESS';

export default function JoinCourse() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { student } = useAuth();
  const { previewCourse, joinCourse } = useAppContext();
  const { rejoinCourseRooms } = useLiveSessions();

  const [state, setState] = useState<FlowState>('ENTRY');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

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
      setState('SUCCESS');
    } catch (err: any) {
      alert(err.message || 'Failed to join course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {state !== 'SUCCESS' && (
        <View
          className="flex-row justify-between items-center px-5 py-4 bg-primary"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.back()}
              className="p-1 -ml-1 rounded-full active:opacity-70"
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </Pressable>
            <Text className="text-xl font-bold text-white tracking-tight">Join Course</Text>
          </View>
          <View className="w-9 h-9 rounded-full bg-secondary items-center justify-center">
            <Text className="text-xs font-bold text-primary">{student?.avatarInitials}</Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-sm self-center">
          {/* Progress dots */}
          {state !== 'SUCCESS' && (
            <View className="flex-row justify-center gap-3 mb-8">
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  className="h-2 rounded-full"
                  style={{
                    width: (i === 0 && (state === 'ENTRY' || state === 'PREVIEW')) ||
                           (i === 1 && state === 'PREVIEW') ? 24 : 8,
                    backgroundColor:
                      (i === 0 && (state === 'ENTRY' || state === 'PREVIEW')) ||
                      (i === 1 && state === 'PREVIEW')
                        ? '#081637' : '#CBD5E1',
                  }}
                />
              ))}
            </View>
          )}

          {/* Card with white background and shadow */}
          <View 
            className="bg-white rounded-2xl p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >

            {/* ENTRY */}
            {state === 'ENTRY' && (
              <View className="gap-6">
                <View className="items-center">
                  <View 
                    className="w-20 h-20 rounded-2xl bg-primary items-center justify-center mb-4"
                    style={{
                      shadowColor: '#081637',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 3,
                    }}
                  >
                    <Key size={40} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <Text className="text-2xl font-bold text-primary mb-2 text-center">Enter Course Code</Text>
                  <Text className="text-sm text-on-surface-variant text-center">
                    Provide the 6-character code given by your lecturer
                  </Text>
                </View>

                <View>
                  <TextInput
                    value={code}
                    onChangeText={handleInput}
                    maxLength={10}
                    placeholder="e.g. IT271-6H4G"
                    placeholderTextColor="#94a3b8"
                    className="text-3xl font-bold text-center text-primary tracking-widest border-b-4 py-4"
                    style={{ borderBottomColor: error ? '#DC2626' : code ? '#081637' : '#E2E8F0' }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  {error && (
                    <Text className="text-error text-sm font-bold text-center mt-3">
                      Please enter a valid code
                    </Text>
                  )}
                </View>

                <Pressable
                  onPress={handleFind}
                  disabled={loading}
                  className="h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2 active:opacity-90"
                  style={{ 
                    opacity: loading ? 0.7 : 1,
                    shadowColor: '#081637',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" size="small" />
                    : <>
                        <Search size={20} color="#FFFFFF" strokeWidth={2.5} />
                        <Text className="text-white font-bold text-base">Find Course</Text>
                      </>
                  }
                </Pressable>
              </View>
            )}

            {/* PREVIEW */}
            {state === 'PREVIEW' && (
              <View className="gap-6">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary mb-2 text-center">Confirm Details</Text>
                  <Text className="text-sm text-on-surface-variant text-center">Is this the correct course?</Text>
                </View>

                <View 
                  className="bg-surface-container rounded-2xl p-5 border-l-4"
                  style={{ 
                    borderLeftColor: '#F5B41C',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="bg-secondary px-3 py-1.5 rounded-lg">
                      <Text className="text-primary font-bold text-sm tracking-widest">{code}</Text>
                    </View>
                    <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center">
                      <School size={20} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text className="text-xl font-bold text-primary mb-4">{previewData?.name || 'Course Name'}</Text>

                  <View className="gap-4 border-t border-outline-variant pt-4">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-xl bg-surface-container-high items-center justify-center">
                        <User size={18} color="#475569" />
                      </View>
                      <View>
                        <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Lecturer</Text>
                        <Text className="text-base font-bold text-primary">
                          {previewData?.lecturer || 'Unknown Lecturer'}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-xl bg-surface-container-high items-center justify-center">
                        <Users size={18} color="#475569" />
                      </View>
                      <View>
                        <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Enrollment</Text>
                        <Text className="text-base font-bold text-primary">
                          {previewData?.studentCount ?? 0} students enrolled
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setState('ENTRY')}
                    className="flex-1 h-12 border-2 border-outline-variant rounded-xl items-center justify-center active:opacity-70"
                  >
                    <Text className="font-bold text-sm text-primary">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleConfirm}
                    disabled={loading}
                    className="flex-[2] h-12 bg-secondary rounded-xl items-center justify-center flex-row gap-2 active:opacity-90"
                    style={{ 
                      opacity: loading ? 0.7 : 1,
                      shadowColor: '#F5B41C',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 3,
                    }}
                  >
                    {loading
                      ? <ActivityIndicator color="#081637" size="small" />
                      : <>
                          <Text className="text-primary font-bold text-base">Confirm & Join</Text>
                          <LogIn size={20} color="#081637" strokeWidth={2.5} />
                        </>
                    }
                  </Pressable>
                </View>
              </View>
            )}

            {/* SUCCESS */}
            {state === 'SUCCESS' && (
              <View className="items-center gap-6 py-4">
                <View 
                  className="w-28 h-28 rounded-full bg-success-container items-center justify-center"
                  style={{
                    shadowColor: '#16A34A',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <CheckCircle2 size={56} color="#16A34A" strokeWidth={2.5} />
                </View>

                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary mb-2 text-center">Course Joined!</Text>
                  <Text className="text-base text-on-surface-variant text-center px-2">
                    You have successfully enrolled in {previewData?.name ? <Text className="font-bold text-primary">{previewData.name}</Text> : 'this course'}
                  </Text>
                </View>

                <View className="w-full bg-surface-container rounded-xl p-4 flex-row items-start gap-3 border border-outline-variant">
                  <Info size={20} color="#3B82F6" />
                  <Text className="text-sm text-on-surface font-semibold flex-1">
                    You will now receive notifications and attendance alerts for this course
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.replace('/(tabs)/home')}
                  className="w-full h-14 bg-primary rounded-xl items-center justify-center active:opacity-90"
                  style={{
                    shadowColor: '#081637',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <Text className="text-white font-bold text-base">Back to Dashboard</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
