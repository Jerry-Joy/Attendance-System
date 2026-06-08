import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Navigation, MapPin, Check, CircleSlash, ScanLine, AlertTriangle
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { useAppContext } from '@/src/contexts/AppContext';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  calculateDistance,
  calculateEffectiveRadius,
  isWithinGeofence,
  formatDistance,
  validateVenueGPS,
  getGeofenceStatusMessage
} from '@/src/utils/geofence';
import { api } from '@/src/lib/api';

export default function GPSVerify() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { student } = useAuth();
  const { markAttendance } = useAppContext();

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

        // Get actual location (High accuracy for precise geofence verification)
        // console.log('📍 Getting student location...');
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        if (!mounted) return;
        const studentAcc = location.coords.accuracy || 10;
        setAccuracy(Math.round(studentAcc));
        // console.log(`📍 Student accuracy: ±${Math.round(studentAcc)}m`);
        
        setStep(3); // Distance Calculation

        // Calculate Haversine Distance using utility
        const dist = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          venueLat!,
          venueLng!
        );
        setDistance(Math.round(dist));
        // console.log(`📏 Distance from venue: ${Math.round(dist)}m`);

        await new Promise(resolve => setTimeout(resolve, 1000)); // UI pacing
        if (!mounted) return;

        // Calculate Effective Radius using utility
        const effectiveRad = calculateEffectiveRadius(baseRadius, lecturerAcc, studentAcc);
        setEffectiveRadius(Math.round(effectiveRad));
        // console.log(`🎯 Effective geofence radius: ${Math.round(effectiveRad)}m`);

        // Check if within geofence using utility
        if (isWithinGeofence(dist, effectiveRad)) {
          // console.log('✅ Student is within geofence!');
          setStep(4); // Geofence Confirmed
          
          // Mark attendance via Context API
          setIsMarking(true);
          try {
            await markAttendance({
              token,
              courseId,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: studentAcc
            });
            // console.log('✅ Attendance marked successfully');
            
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
          // console.log('❌ Student is outside geofence');
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

  return (
    <View className="flex-1 bg-surface" style={{ paddingBottom: 24 }}>
      {/* Header */}
      <View
        className="bg-surface flex-row justify-between items-center px-5 py-4 border-b border-outline-variant"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            className="p-1 -ml-1 rounded-full active:bg-surface-container"
          >
            <ArrowLeft size={24} color="#081637" />
          </Pressable>
          <Text className="text-xl font-bold text-primary tracking-tight">GPS Verification</Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center border border-outline-variant">
          <Text className="text-xs font-bold text-primary">{student?.avatarInitials || 'JD'}</Text>
        </View>
      </View>

      <View className="flex-1 px-5 pt-8 items-center max-w-md w-full self-center">
        {/* Radar */}
        <View className="w-48 h-48 items-center justify-center mb-8">
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
                  borderWidth: 2,
                  borderColor: '#F5B41C',
                },
              ]}
            />
          ))}
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center z-10">
            <Navigation size={40} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </View>

        {/* Title */}
        <View className="text-center items-center mb-8">
          <Text className="text-2xl font-bold text-primary mb-1">
            {errorMsg ? 'Verification Failed' : 'Verifying Location'}
          </Text>
          <Text className="text-sm text-on-surface-variant text-center">
            {errorMsg || 'Please remain stationary while we confirm your geofence status.'}
          </Text>
        </View>

        {/* Venue card */}
        <View className={`w-full bg-surface-container-lowest rounded-xl p-4 border-l-4 mb-8 ${errorMsg ? 'border-error' : 'border-secondary-container'}`}>
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-lg font-bold text-primary">{venue}</Text>
              <Text className="text-sm text-on-surface-variant mt-0.5">{courseCode}</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full">
              <MapPin size={12} strokeWidth={3} color="#F5B41C" />
              <Text className="text-xs font-bold text-on-surface-variant tracking-wider">Geofenced</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-4 border-t border-outline-variant pt-3">
            <View className="flex-row items-center gap-1.5">
              <MapPin size={16} color="#475569" />
              <Text className="text-sm font-medium text-on-surface-variant">
                {effectiveRadius ? `Effective: ${formatDistance(effectiveRadius)}` : `Base: ${baseRadius}m`}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Navigation size={16} color="#475569" />
              <Text className="text-sm font-medium text-on-surface-variant">
                Acc: {accuracy ? `±${accuracy}m` : 'Measuring...'}
              </Text>
            </View>
          </View>
          {distance !== null && (
            <View className="mt-3 pt-3 border-t border-outline-variant">
              <Text className={`text-sm font-bold ${errorMsg ? 'text-error' : 'text-primary'}`}>
                📍 Distance: {formatDistance(distance)}
              </Text>
            </View>
          )}
        </View>

        {/* Step indicators or Error Retry */}
        {errorMsg ? (
          <View className="w-full gap-3">
            <View className="bg-error/10 border border-error rounded-xl p-4">
              <View className="flex-row items-start gap-2">
                <AlertTriangle size={20} color="#DC2626" />
                <Text className="flex-1 text-sm text-error font-medium">{errorMsg}</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleRetry}
                className="flex-1 bg-primary rounded-xl p-4 active:opacity-80"
              >
                <Text className="text-white font-bold text-center">Retry Scan</Text>
              </Pressable>
              <Pressable
                onPress={handleCancel}
                className="flex-1 bg-surface-container border border-outline-variant rounded-xl p-4 active:opacity-80"
              >
                <Text className="text-on-surface font-bold text-center">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="w-full bg-surface-container-lowest rounded-xl p-5 border border-outline-variant">
            <View style={{ gap: 0 }}>
              <StepRow active={step >= 1} loading={false} icon="check" label="QR Scanned" step={step} stepNum={1} />
              <View style={{ width: 2, height: 24, marginLeft: 15, backgroundColor: step >= 2 ? '#081637' : '#E2E8F0' }} />
              <StepRow active={step >= 2} loading={step === 2} icon={step > 2 ? 'check' : step === 2 ? 'loading' : 'map'} label="GPS Located" step={step} stepNum={2} />
              <View style={{ width: 2, height: 24, marginLeft: 15, backgroundColor: step >= 3 ? '#081637' : '#E2E8F0' }} />
              <StepRow active={step >= 3} loading={step === 3} icon={step > 3 ? 'check' : step === 3 ? 'loading' : 'slash'} label={distance !== null ? `Checking Geofence (${formatDistance(distance)})` : "Geofence Verification"} step={step} stepNum={3} />
              <View style={{ width: 2, height: 24, marginLeft: 15, backgroundColor: step >= 4 ? '#081637' : '#E2E8F0' }} />
              <StepRow active={step >= 4} loading={isMarking} icon={step >= 4 ? 'check' : 'scan'} label={isMarking ? "Marking Attendance..." : "Confirmed"} step={step} stepNum={4} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function StepRow({ active, loading, icon, label }: {
  active: boolean; loading: boolean; icon: string; label: string; step: number; stepNum: number;
}) {
  const bgColor = loading ? '#F5B41C' : active ? '#081637' : 'transparent';
  const borderColor = active || loading ? 'transparent' : '#E2E8F0';
  const iconColor = loading ? '#081637' : '#FFFFFF';
  const labelColor = active && !loading ? '#081637' : '#475569';

  const IconComp = icon === 'check' ? Check
    : icon === 'map' ? MapPin
    : icon === 'slash' ? CircleSlash
    : ScanLine;

  return (
    <View className="flex-row items-center gap-3" style={{ opacity: active ? 1 : 0.4 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: bgColor,
          borderWidth: 2,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <IconComp size={16} strokeWidth={3} color={iconColor} />
      </View>
      <Text style={{ fontSize: 14, fontWeight: '700', color: labelColor }}>{label}</Text>
    </View>
  );
}