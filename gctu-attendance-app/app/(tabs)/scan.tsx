import { View, Text, Pressable, ScrollView, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { QrCode, MapPin, CheckCircle, ArrowRight, Camera, Sparkles, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

export default function ScanTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the main icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-36, 36],
  });

  return (
    <View className="flex-1 bg-surface">
      {/* Gradient Header */}
      <LinearGradient
        colors={['#081637', '#0A1F4D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View className="items-center px-5 pb-5">
          <Text className="text-xs text-white/70 font-medium tracking-wide uppercase">GCTU Connect</Text>
          <Text className="text-2xl font-bold text-white tracking-tight mt-1">Mark Attendance</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingTop: 24,
          paddingBottom: 100,
          gap: 20,
        }}
      >
        {/* Animated QR Icon with scan line effect */}
        <View className="items-center">
          <Animated.View 
            style={[
              styles.qrContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <LinearGradient
              colors={['#081637', '#0A1F4D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.qrGradient}
            >
              <View className="relative" style={{ width: 72, height: 72 }}>
                <QrCode size={72} strokeWidth={2} color="#FFFFFF" />
                {/* Animated scan line effect */}
                <Animated.View 
                  style={{
                    position: 'absolute',
                    left: -10,
                    right: -10,
                    height: 2,
                    backgroundColor: '#F5B41C',
                    top: '50%',
                    transform: [{ translateY: scanLineTranslateY }],
                    shadowColor: '#F5B41C',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  {/* Glow effect */}
                  <View 
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: 8,
                      top: -3,
                      backgroundColor: '#F5B41C',
                      opacity: 0.3,
                      shadowColor: '#F5B41C',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 12,
                    }}
                  />
                </Animated.View>
              </View>
            </LinearGradient>
            
            {/* Pulsing ring */}
            <View style={styles.pulseRing1} />
            <View style={styles.pulseRing2} />
          </Animated.View>
        </View>

        {/* Title and description */}
        <View className="items-center px-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Sparkles size={20} color="#F5B41C" />
            <Text className="text-3xl font-bold text-primary tracking-tight text-center">
              Scan to Check In
            </Text>
          </View>
          <Text className="text-base text-on-surface-variant text-center leading-relaxed">
            Scan the dynamic QR code displayed by your lecturer to securely mark your attendance.
          </Text>
        </View>

        {/* Main Scan Button */}
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
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <Camera size={24} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text className="text-white text-xl font-bold flex-1">Open QR Scanner</Text>
              <ArrowRight size={24} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* How it works card */}
        <View 
          className="w-full bg-white rounded-2xl p-5"
          style={styles.howItWorksCard}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <Shield size={18} color="#081637" />
            <Text className="text-sm font-bold tracking-widest text-primary uppercase">
              Secure 3-Step Process
            </Text>
          </View>

          <View className="gap-4">
            <StepRow
              num={1}
              title="Scan QR Code"
              subtitle="Point your camera at the lecturer's screen"
              icon={<Camera size={16} color="#081637" />}
              color="#081637"
            />
            <View className="h-px bg-outline-variant ml-14" />
            <StepRow
              num={2}
              title="GPS Verification"
              subtitle="Location verified against venue coordinates"
              icon={<MapPin size={16} color="#F5B41C" />}
              color="#F5B41C"
            />
            <View className="h-px bg-outline-variant ml-14" />
            <StepRow
              num={3}
              title="Attendance Confirmed"
              subtitle="You are marked present for this session"
              icon={<CheckCircle size={16} color="#16A34A" />}
              color="#16A34A"
            />
          </View>
        </View>

        {/* Status Cards */}
        <View className="flex-row gap-3">
          <View 
            className="flex-1 px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#16A34A20' }}
          >
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#16A34A' }} />
              <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: '#15803D' }}>
                GPS Ready
              </Text>
            </View>
          </View>
          <View 
            className="flex-1 px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B20' }}
          >
            <View className="flex-row items-center gap-2">
              <Shield size={12} color="#D97706" />
              <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D97706' }}>
                Secure Mode
              </Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View 
          className="bg-primary/5 border border-primary/20 rounded-xl p-4"
        >
          <Text className="text-xs text-on-surface-variant leading-relaxed text-center">
            <Text className="font-bold text-primary">Note:</Text> QR codes expire every 30 seconds for security. 
            Make sure you're within the lecture venue for GPS verification to succeed.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StepRow({ num, title, subtitle, icon, color }: {
  num: number; 
  title: string; 
  subtitle: string; 
  icon?: React.ReactNode;
  color: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View 
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text className="text-white text-base font-bold">{num}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-base font-bold text-primary">{title}</Text>
          {icon}
        </View>
        <Text className="text-sm text-on-surface-variant leading-relaxed">{subtitle}</Text>
      </View>
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
  qrContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  qrGradient: {
    width: 140,
    height: 140,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#081637',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  pulseRing1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#F5B41C',
    opacity: 0.3,
  },
  pulseRing2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#F5B41C',
    opacity: 0.15,
  },
  scanButton: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  howItWorksCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});
