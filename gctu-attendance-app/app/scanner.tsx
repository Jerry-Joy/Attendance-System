import { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { School, User, MapPin, Timer } from 'lucide-react-native';
import { useAppContext } from '@/src/contexts/AppContext';
import { useLiveSessions } from '@/src/contexts/LiveSessionContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { validateQRCode, getFriendlyErrorMessage, hasGPSData } from '@/src/utils/qr-validator';
import { api } from '@/src/lib/api';

const VIEWFINDER_SIZE = 280;

export default function Scanner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { liveSessions } = useLiveSessions();
  const scanAnim = useRef(new Animated.Value(0)).current;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: VIEWFINDER_SIZE - 4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-5">
        <Text className="text-white text-center mb-5 text-lg">We need your permission to access the camera</Text>
        <Pressable
          onPress={requestPermission}
          className="bg-primary px-6 py-3 rounded-lg active:opacity-80"
        >
          <Text className="text-white font-bold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Step 1: Validate QR code format using utility
    const validation = validateQRCode(data);
    
    if (!validation.valid) {
      const friendlyMessage = getFriendlyErrorMessage(validation.error || 'Unknown error');
      Alert.alert('Invalid QR Code', friendlyMessage, [
        { text: 'Retry', onPress: () => setScanned(false) }
      ]);
      return;
    }

    const qrData = validation.data!;
    const session = liveSessions.find((s: any) => s.courseCode === qrData.courseCode);

    try {
      // Step 2: Check if already marked attendance (API call)
      // console.log('🔍 Checking if already marked for course:', qrData.courseId);
      const checkResult = await api.checkAttendance(qrData.courseId);

      if (checkResult && checkResult.alreadyMarked) {
        Alert.alert(
          'Already Marked',
          `You have already marked attendance for ${qrData.courseCode}.`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
        );
        return;
      }

      // Step 3: Check if QR code has GPS data
      if (!hasGPSData(qrData)) {
        Alert.alert(
          'No GPS Required',
          'This session does not require GPS verification. Marking attendance...',
          [{ text: 'OK' }]
        );
        // Could directly mark attendance here if no GPS needed
        // For now, we'll still navigate but GPS verify will skip location check
      }

      // Step 4: Navigate to GPS Verify with validated QR payload
      // console.log('✅ QR validated, proceeding to GPS verify');
      router.replace({
        pathname: '/gps-verify',
        params: {
          token: qrData.token,
          courseId: qrData.courseId,
          courseCode: qrData.courseCode,
          courseName: qrData.courseName || session?.courseName || 'Unknown Course',
          venue: session?.venue || 'Unknown Venue',
          lat: qrData.lat?.toString() || '',
          lng: qrData.lng?.toString() || '',
          lecturerAccuracy: qrData.lecturerAccuracy?.toString() || '10',
          radius: qrData.radius?.toString() || '50'
        },
      });

    } catch (error: any) {
      console.error('❌ Scanner error:', error);
      Alert.alert(
        'Verification Error',
        error.message || 'Could not verify attendance status. Please try again.',
        [{ text: 'Retry', onPress: () => setScanned(false) }]
      );
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Real Camera Feed Background */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Header */}
      <View
        className="absolute left-0 right-0 z-50 flex-row justify-between items-center px-5 py-4"
        style={{ top: insets.top }}
      >
        <View className="flex-row items-center gap-2">
          <School size={24} color="#FFFFFF" />
          <Text className="text-xl font-bold text-white tracking-tight">GCTU Connect</Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-black/40 border border-white/20 items-center justify-center">
          <User size={18} color="#FFFFFF" />
        </View>
      </View>

      {/* Viewfinder area */}
      <View className="flex-1 items-center justify-center">
        {/* Top overlay */}
        <View className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: '50%', marginTop: -VIEWFINDER_SIZE / 2 }} />
        {/* Bottom overlay */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ height: '50%', marginBottom: -VIEWFINDER_SIZE / 2 }} />
        {/* Left overlay */}
        <View className="absolute left-0 bg-black/60" style={{ width: '50%', height: VIEWFINDER_SIZE, marginLeft: -VIEWFINDER_SIZE / 2 }} />
        {/* Right overlay */}
        <View className="absolute right-0 bg-black/60" style={{ width: '50%', height: VIEWFINDER_SIZE, marginRight: -VIEWFINDER_SIZE / 2 }} />

        {/* Viewfinder box */}
        <View style={{ width: VIEWFINDER_SIZE, height: VIEWFINDER_SIZE, position: 'relative' }}>
          {/* Corner brackets */}
          <View style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#F5B41C', borderTopLeftRadius: 8 }} />
          <View style={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#F5B41C', borderTopRightRadius: 8 }} />
          <View style={{ position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#F5B41C', borderBottomLeftRadius: 8 }} />
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#F5B41C', borderBottomRightRadius: 8 }} />

          {/* Animated scan line */}
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: '#F5B41C',
              transform: [{ translateY: scanAnim }],
            }}
          />

          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-white/30 text-xs text-center font-mono">
              Align QR Code{'\n'}within frame
            </Text>
          </View>
        </View>

        {/* Bottom section */}
        <View className="absolute bottom-0 left-0 right-0 px-5 pt-8 pb-8 items-center bg-transparent">
          <Text className="text-lg font-medium text-white mb-8 max-w-xs text-center drop-shadow-md">
            Scan the QR code displayed by your lecturer
          </Text>

          <View className="gap-2 w-full items-center max-w-xs">
            <View className="flex-row items-center justify-center gap-1.5 bg-black/60 border border-white/20 rounded-full px-4 py-2 w-full">
              <MapPin size={16} color="#F5B41C" />
              <Text className="text-xs font-semibold tracking-wider uppercase text-white">GPS will be verified</Text>
            </View>
            <View className="flex-row items-center justify-center gap-1.5 bg-black/60 border border-white/20 rounded-full px-4 py-2 w-full">
              <Timer size={16} color="#DAE1FF" />
              <Text className="text-xs font-semibold tracking-wider uppercase text-white">QR expires every 30s</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            className="mt-8 px-8 py-3 rounded-full bg-black/60 border border-white/30 active:opacity-70"
          >
            <Text className="text-white font-semibold text-sm">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}