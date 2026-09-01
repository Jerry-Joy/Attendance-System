import { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, Alert, StyleSheet, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Flashlight, FlashlightOff, MapPin, Timer, Sparkles, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/src/contexts/AppContext';
import { useLiveSessions } from '@/src/contexts/LiveSessionContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { validateQRCode, getFriendlyErrorMessage, hasGPSData } from '@/src/utils/qr-validator';
import { api } from '@/src/lib/api';

const VIEWFINDER_SIZE = 260;

export default function Scanner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { liveSessions } = useLiveSessions();
  const scanAnim = useRef(new Animated.Value(0)).current;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  const laserTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, VIEWFINDER_SIZE - 10],
  });

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-6">
        <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center mb-6 border border-white/20">
          <Shield size={36} color="#F5B41C" />
        </View>
        <Text className="text-white text-center text-xl font-bold mb-2">Camera Permission Needed</Text>
        <Text className="text-white/70 text-center mb-8 text-sm leading-relaxed max-w-xs">
          To scan your class attendance QR code and verify your presence, please allow camera access.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="active:opacity-90 w-full max-w-xs"
        >
          <LinearGradient
            colors={['#F5B41C', '#D49A15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-4 rounded-xl items-center"
          >
            <Text className="text-primary font-bold text-base">Allow Camera Access</Text>
          </LinearGradient>
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
      }

      // Step 4: Navigate to GPS Verify with validated QR payload
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

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Real Camera Feed Background */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Top Header Overlay */}
      <View
        className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-6 z-20"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Pressable
          onPress={handleClose}
          className="w-11 h-11 rounded-full bg-black/60 items-center justify-center border border-white/20 active:opacity-70"
        >
          <X size={22} color="#FFFFFF" />
        </Pressable>

        <View className="items-center bg-black/60 px-4 py-2 rounded-full border border-white/20">
          <Text className="text-white font-bold text-sm tracking-wide">Scan Attendance QR</Text>
        </View>

        <Pressable
          onPress={() => setTorchOn(!torchOn)}
          className={`w-11 h-11 rounded-full items-center justify-center border active:opacity-70 ${
            torchOn ? 'bg-amber-400 border-amber-300' : 'bg-black/60 border-white/20'
          }`}
        >
          {torchOn ? (
            <FlashlightOff size={20} color="#081637" />
          ) : (
            <Flashlight size={20} color="#FFFFFF" />
          )}
        </Pressable>
      </View>

      {/* Viewfinder Overlay Mask */}
      <View className="flex-1 items-center justify-center">
        {/* Dark Vignette Mask Around Viewfinder */}
        <View className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: '50%', marginTop: -VIEWFINDER_SIZE / 2 }} />
        <View className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ height: '50%', marginBottom: -VIEWFINDER_SIZE / 2 }} />
        <View className="absolute left-0 bg-black/60" style={{ width: '50%', height: VIEWFINDER_SIZE, marginLeft: -VIEWFINDER_SIZE / 2 }} />
        <View className="absolute right-0 bg-black/60" style={{ width: '50%', height: VIEWFINDER_SIZE, marginRight: -VIEWFINDER_SIZE / 2 }} />

        {/* Viewfinder Box */}
        <View style={[styles.viewfinderBox, { width: VIEWFINDER_SIZE, height: VIEWFINDER_SIZE }]}>
          {/* Glowing HUD Corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Sweeping Radiant Laser Beam */}
          <Animated.View
            style={[
              styles.laserBeam,
              { transform: [{ translateY: laserTranslateY }] }
            ]}
          >
            <LinearGradient
              colors={['rgba(245, 180, 28, 0)', 'rgba(245, 180, 28, 0.4)', 'rgba(245, 180, 28, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.laserAura}
            />
            <View style={styles.laserCoreLine} />
          </Animated.View>

          {/* Center alignment guide */}
          <View className="absolute inset-0 items-center justify-center pointer-events-none">
            <Text className="text-white/40 text-[11px] text-center font-mono tracking-widest uppercase">
              Align QR Code
            </Text>
          </View>
        </View>

        {/* Bottom Instruction Section */}
        <View
          className="absolute bottom-0 left-0 right-0 px-6 items-center"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <Text className="text-base font-semibold text-white mb-6 text-center drop-shadow-md">
            Point camera at the QR code on the projector screen
          </Text>

          {/* Security Badges */}
          <View className="gap-2.5 w-full items-center max-w-xs">
            <View className="flex-row items-center justify-center gap-2 bg-black/70 border border-white/20 rounded-full px-4 py-2.5 w-full backdrop-blur-md">
              <MapPin size={15} color="#F5B41C" strokeWidth={2.5} />
              <Text className="text-xs font-semibold tracking-wider uppercase text-white">GPS Geofence Verified</Text>
            </View>
            <View className="flex-row items-center justify-center gap-2 bg-black/70 border border-white/20 rounded-full px-4 py-2.5 w-full backdrop-blur-md">
              <Timer size={15} color="#38BDF8" strokeWidth={2.5} />
              <Text className="text-xs font-semibold tracking-wider uppercase text-white">Dynamic 30s QR Code</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewfinderBox: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#F5B41C',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  laserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laserAura: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
  },
  laserCoreLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#F5B41C',
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
});