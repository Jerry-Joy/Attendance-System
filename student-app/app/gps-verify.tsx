import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Navigation, MapPin, Check, CircleSlash, ScanLine, AlertTriangle, Target
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAppContext } from '@/src/contexts/AppContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import {
  calculateDistance,
  calculateEffectiveRadius,
  isWithinGeofence,
  formatDistance,
  validateVenueGPS,
  getGeofenceStatusMessage
} from '@/src/utils/geofence';

export default function GPSVerify() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { student } = useAuth();
  const { markAttendance } = useAppContext();
  const { addNotification } = useNotifications();

  // Params passed from Scanner
  const params = useLocalSearchParams<{
    token: string; courseId: string; courseCode: string; courseName: string; venue: string;
    lat: string; lng: string; lecturerAccuracy: string; radius: string;
  }>();

  const token = params.token || '';
  const courseId = params.courseId || '';
  const courseCode = params.courseCode || 'CSCI 301';
  const courseName = params.courseName || 'Software Engineering';
  const venue = params.venue || 'Main Auditorium';

  // Venue Coordinates
  const venueLat = params.lat ? parseFloat(params.lat) : undefined;
  const venueLng = params.lng ? parseFloat(params.lng) : undefined;
  const lecturerAcc = params.lecturerAccuracy ? parseFloat(params.lecturerAccuracy) : 15.5;
  const baseRadius = params.radius ? parseFloat(params.radius) : 50;

  const [step, setStep] = useState(1);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [effectiveRadius, setEffectiveRadius] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  // Radar pulse animations
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 2500, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    Animated.parallel([anim(pulse1, 0), anim(pulse2, 800), anim(pulse3, 1600)]).start();
  }, []);

  // Animate progress bar smoothly
  useEffect(() => {
    let targetProgress = 0;
    if (step === 1) targetProgress = 0.25;
    else if (step === 2) targetProgress = 0.5;
    else if (step === 3) targetProgress = 0.75;
    else if (step === 4) targetProgress = 1;

    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const pulseStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.15, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
  });

  useEffect(() => {
    let mounted = true;

    const verifyLocation = async () => {
      try {
        if (!mounted) return;

        // Step 1: Validate venue GPS data
        const venueValidation = validateVenueGPS({
          lat: venueLat,
          lng: venueLng,
          lecturerAccuracy: lecturerAcc,
          radius: baseRadius
        });

        if (!venueValidation.valid) {
          setErrorMsg(venueValidation.error || 'Invalid venue GPS data');
          return;
        }

        // Step 1 is already active (QR Scanned). Wait a moment then move to Step 2.
        await new Promise(resolve => setTimeout(resolve, 800));
        if (!mounted) return;
        setStep(2);

        // Request permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied. Please enable location access to mark attendance.');
          return;
        }

        // Get actual location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        if (!mounted) return;
        const studentAcc = location.coords.accuracy || 10;
        setAccuracy(Math.round(studentAcc));
        
        setStep(3); // Distance Calculation

        // Calculate Haversine Distance
        const dist = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          venueLat!,
          venueLng!
        );
        setDistance(Math.round(dist));

        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!mounted) return;

        // Calculate Effective Radius
        const effectiveRad = calculateEffectiveRadius(baseRadius, lecturerAcc, studentAcc);
        setEffectiveRadius(Math.round(effectiveRad));

        // Check if within geofence
        if (isWithinGeofence(dist, effectiveRad)) {
          setStep(4); // Geofence Confirmed
          
          // Mark attendance
          setIsMarking(true);
          try {
            await markAttendance({
              token,
              courseId,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: studentAcc
            });
            
            // Add success notification
            addNotification({
              type: 'attendance_success',
              title: 'Attendance Marked!',
              message: `Your attendance for ${courseName} has been successfully recorded`,
              courseCode,
              courseName,
              actionable: false
            });
            
            setTimeout(() => {
              if (!mounted) return;
              router.replace({
                pathname: '/attendance-confirmed',
                params: { courseCode, courseName, venue },
              });
            }, 1000);
          } catch (markError: any) {
            console.error('❌ Failed to mark attendance:', markError);
            setErrorMsg(markError.message || 'Failed to mark attendance. Please try again.');
          } finally {
            setIsMarking(false);
          }
        } else {
          const statusMessage = getGeofenceStatusMessage(dist, effectiveRad);
          setErrorMsg(statusMessage);
        }

      } catch (error: any) {
        console.error('❌ GPS Verification Error:', error);
        setErrorMsg(error.message || 'Could not verify your location. Please try again.');
      }
    };

    verifyLocation();

    return () => { mounted = false; };
  }, []);

  const handleRetry = () => {
    router.replace('/scanner');
  };

  const handleCancel = () => {
    router.replace('/(tabs)/home');
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 px-5 pt-6 items-center justify-center max-w-md w-full self-center">
        {/* Animated Radar Pulse */}
        <View className="w-48 h-48 items-center justify-center mb-6" style={styles.radarContainer}>
          {[pulse1, pulse2, pulse3].map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                pulseStyle(anim),
                {
                  position: 'absolute',
                  width: 192,
                  height: 192,
                  borderRadius: 96,
                  borderWidth: 3,
                  borderColor: '#F5B41C',
                },
              ]}
            />
          ))}
          <LinearGradient
            colors={['#F5B41C', '#D49A15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.radarCenter}
          >
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <Navigation size={36} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </LinearGradient>
        </View>

        {/* Status Title */}
        <View className="text-center items-center mb-4">
          <Text className="text-2xl font-bold text-primary mb-1">
            {errorMsg ? 'Verification Failed' : 'Verifying Location'}
          </Text>
          <Text className="text-sm text-on-surface-variant text-center px-4">
            {errorMsg || 'Please remain stationary while we confirm your geofence status.'}
          </Text>
        </View>

        {/* Enhanced Venue Card */}
        <View className="w-full bg-white rounded-2xl p-5 mb-4" style={styles.venueCard}>
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
                  <MapPin size={18} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-primary">{venue}</Text>
                  <Text className="text-xs font-bold tracking-wider mt-0.5" style={{ color: '#F5B41C' }}>
                    {courseCode}
                  </Text>
                </View>
              </View>
            </View>
            <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: errorMsg ? '#FEE2E2' : '#ECFDF5' }}>
              <Text className="text-xs font-bold tracking-wider" style={{ color: errorMsg ? '#DC2626' : '#16A34A' }}>
                {errorMsg ? 'OUT OF RANGE' : 'GEOFENCED'}
              </Text>
            </View>
          </View>

          {/* Metrics Grid */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-surface rounded-xl p-3 border-2 border-outline">
              <View className="flex-row items-center gap-2 mb-1">
                <Target size={14} color="#F5B41C" strokeWidth={2.5} />
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Radius</Text>
              </View>
              <Text className="text-base font-bold text-primary">
                {effectiveRadius ? formatDistance(effectiveRadius) : `${baseRadius}m`}
              </Text>
              <Text className="text-xs text-on-surface-variant mt-0.5">
                {effectiveRadius ? 'Effective' : 'Base'}
              </Text>
            </View>

            <View className="flex-1 bg-surface rounded-xl p-3 border-2 border-outline">
              <View className="flex-row items-center gap-2 mb-1">
                <Navigation size={14} color="#F5B41C" strokeWidth={2.5} />
                <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Accuracy</Text>
              </View>
              <Text className="text-base font-bold text-primary">
                {accuracy ? `±${accuracy}m` : '...'}
              </Text>
              <Text className="text-xs text-on-surface-variant mt-0.5">Your GPS</Text>
            </View>
          </View>

          {/* Distance Display */}
          {distance !== null && (
            <View className={`rounded-xl p-3 border-2 ${errorMsg ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${errorMsg ? 'bg-red-100' : 'bg-green-100'}`}>
                    <MapPin size={16} color={errorMsg ? '#DC2626' : '#16A34A'} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Distance</Text>
                    <Text className={`text-lg font-bold ${errorMsg ? 'text-red-700' : 'text-green-700'}`}>
                      {formatDistance(distance)}
                    </Text>
                  </View>
                </View>
                {!errorMsg && effectiveRadius && (
                  <View className="bg-green-600 px-3 py-1.5 rounded-full">
                    <Text className="text-xs font-bold text-white">WITHIN RANGE</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Verification Progress with Dots */}
        {errorMsg ? (
          <View className="w-full gap-3">
            <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-4" style={styles.errorCard}>
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
                  <AlertTriangle size={20} color="#DC2626" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-red-900 mb-1">Location Verification Failed</Text>
                  <Text className="text-sm text-red-700 leading-5">{errorMsg}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable onPress={handleRetry} className="flex-1 active:opacity-90">
                <LinearGradient
                  colors={['#F5B41C', '#D49A15']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.button, { height: 54, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
                >
                  <ScanLine size={20} color="#081637" strokeWidth={2.5} />
                  <Text className="text-primary font-bold text-base">Retry Scan</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={handleCancel}
                className="px-6 border-2 border-outline rounded-xl items-center justify-center active:opacity-70"
                style={{ height: 54 }}
              >
                <Text className="text-on-surface font-bold text-base">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="w-full bg-white rounded-2xl p-5 border-2 border-outline" style={styles.stepsCard}>
            <View className="flex-row items-center gap-2 mb-4 pb-3 border-b border-outline-variant">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#F5B41C20' }}>
                <Check size={16} color="#F5B41C" strokeWidth={3} />
              </View>
              <Text className="text-sm font-bold text-primary">Verification Progress</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth }
                ]}
              />
            </View>

            {/* Progress Dots */}
            <View className="flex-row justify-between mt-4">
              <StepDot 
                active={step >= 1} 
                completed={step > 1}
                label="QR Scanned"
                icon="check"
              />
              <StepDot 
                active={step >= 2}
                completed={step > 2}
                label="GPS Located"
                icon="map"
                loading={step === 2}
              />
              <StepDot 
                active={step >= 3}
                completed={step > 3}
                label="Geofence"
                icon="target"
                loading={step === 3}
              />
              <StepDot 
                active={step >= 4}
                completed={false}
                label="Confirmed"
                icon="scan"
                loading={isMarking}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function StepDot({ active, completed, label, icon, loading }: {
  active: boolean; completed: boolean; label: string; icon: string; loading?: boolean;
}) {
  const bgColor = completed ? '#16A34A' : loading ? '#F5B41C' : active ? '#F5B41C' : '#F5F5F5';
  const iconColor = (completed || loading || active) ? '#FFFFFF' : '#94A3B8';

  const IconComp = icon === 'check' || completed ? Check
    : icon === 'map' ? MapPin
    : icon === 'target' ? Target
    : ScanLine;

  return (
    <View className="items-center flex-1">
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: (completed || loading || active) ? 0 : 2,
          borderColor: '#E2E8F0',
          marginBottom: 6,
          shadowColor: completed ? '#16A34A' : loading ? '#F5B41C' : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: (completed || loading) ? 4 : 0,
        }}
      >
        <IconComp size={16} strokeWidth={2.5} color={iconColor} />
      </View>
      <Text 
        style={{ 
          fontSize: 11, 
          fontWeight: '700', 
          color: active ? '#081637' : '#94A3B8',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  radarContainer: {
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  radarCenter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  venueCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 6,
    borderLeftColor: '#F5B41C',
  },
  errorCard: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  stepsCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F5B41C',
    borderRadius: 3,
  },
  button: {
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
});
