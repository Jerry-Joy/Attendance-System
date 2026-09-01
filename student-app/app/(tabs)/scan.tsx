import { View, Text, Pressable, ScrollView, Animated, StyleSheet, Easing, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { QrCode, MapPin, CheckCircle, ArrowRight, Camera, Shield, Sparkles, Focus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

const VIEWFINDER_BOX_SIZE = 160;

export default function ScanTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animation values
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Smooth laser sweep up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweepAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Subtle pulse for the central emblem
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Ambient glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Subtle corner breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cornerAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const laserTranslateY = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-VIEWFINDER_BOX_SIZE / 2 + 10, VIEWFINDER_BOX_SIZE / 2 - 10],
  });

  const cornerScale = cornerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  return (
    <View className="flex-1 bg-surface">
      {/* Gradient Header */}
      <LinearGradient
        colors={['#081637', '#0A1F4D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 14 }]}
      >
        <View className="items-center px-5 pb-4">
          <Text className="text-2xl font-bold text-white tracking-tight">Mark Attendance</Text>
          <Text className="text-xs text-white/70 font-medium mt-0.5">Dynamic QR & GPS Verification</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingTop: 20,
          paddingBottom: 140,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Futuristic Optic HUD Viewfinder Card (Tappable) */}
        <Pressable
          onPress={() => router.push('/scanner')}
          className="active:opacity-95"
        >
          <View className="bg-slate-900 rounded-3xl p-6 items-center overflow-hidden border border-slate-800" style={styles.hudCard}>
            {/* Background ambient lighting */}
            <Animated.View
              style={[
                styles.ambientGlow,
                { opacity: glowAnim }
              ]}
            />

            {/* Top HUD Badge */}
            <View className="flex-row items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full mb-6">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                Camera Viewfinder Ready
              </Text>
            </View>

            {/* Central Holographic Viewfinder Box */}
            <Animated.View
              style={[
                styles.viewfinderBox,
                { transform: [{ scale: cornerScale }] }
              ]}
            >
              {/* Gold HUD Corners */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              {/* Central Glowing Smart Matrix Core */}
              <Animated.View
                style={[
                  styles.coreEmblem,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <LinearGradient
                  colors={['#0A1F4D', '#081637']}
                  className="w-20 h-20 rounded-2xl items-center justify-center border border-amber-500/30"
                  style={styles.emblemShadow}
                >
                  <QrCode size={42} color="#F5B41C" strokeWidth={2} />
                </LinearGradient>
              </Animated.View>

              {/* Sweeping Soft Laser Light Beam */}
              <Animated.View
                style={[
                  styles.laserBeamContainer,
                  { transform: [{ translateY: laserTranslateY }] }
                ]}
              >
                {/* Radiant Beam Aura */}
                <LinearGradient
                  colors={['rgba(245, 180, 28, 0)', 'rgba(245, 180, 28, 0.4)', 'rgba(245, 180, 28, 0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.laserAura}
                />
                {/* Sharp Core Beam Line */}
                <View style={styles.laserLine} />
              </Animated.View>
            </Animated.View>

            {/* Tap Hint */}
            <View className="flex-row items-center gap-1.5 mt-5">
              <Focus size={14} color="#94A3B8" />
              <Text className="text-xs text-slate-400 font-semibold tracking-wide">
                Tap anywhere on viewfinder to scan
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Title and Description */}
        <View className="items-center px-4">
          <Text className="text-2xl font-bold text-primary tracking-tight text-center">
            Scan to Check In
          </Text>
          <Text className="text-sm text-on-surface-variant text-center leading-relaxed mt-1">
            Point your camera at the dynamic QR code displayed on your lecturer's screen.
          </Text>
        </View>

        {/* Main Scan CTA Button */}
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
              <Text className="text-white text-lg font-bold flex-1">Open Camera Scanner</Text>
              <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* How It Works Card */}
        <View 
          className="w-full bg-white rounded-2xl p-5 border border-slate-100"
          style={styles.howItWorksCard}
        >
          <View className="flex-row items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Shield size={18} color="#081637" />
            <Text className="text-xs font-bold tracking-widest text-primary uppercase">
              Secure 3-Step Verification
            </Text>
          </View>

          <View className="gap-4">
            <StepRow
              num={1}
              title="Scan Dynamic QR"
              subtitle="Rotates every 30s to prevent forwarded screenshot fraud"
              icon={<Camera size={16} color="#081637" />}
              color="#081637"
            />
            <View className="h-px bg-slate-100 ml-14" />
            <StepRow
              num={2}
              title="GPS Geofence Check"
              subtitle="Verifies device proximity to the physical classroom venue"
              icon={<MapPin size={16} color="#F5B41C" />}
              color="#F5B41C"
            />
            <View className="h-px bg-slate-100 ml-14" />
            <StepRow
              num={3}
              title="Attendance Confirmed"
              subtitle="Tamper-proof record anchored for academic credits"
              icon={<CheckCircle size={16} color="#16A34A" />}
              color="#16A34A"
            />
          </View>
        </View>

        {/* Quick Badges */}
        <View className="flex-row gap-3">
          <View 
            className="flex-1 px-4 py-3 rounded-xl flex-row items-center gap-2"
            style={{ backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#10B98120' }}
          >
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <Text className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              GPS Ready
            </Text>
          </View>
          <View 
            className="flex-1 px-4 py-3 rounded-xl flex-row items-center gap-2"
            style={{ backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B20' }}
          >
            <Shield size={14} color="#D97706" />
            <Text className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Anti-Spoof Active
            </Text>
          </View>
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
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text className="text-white text-base font-bold">{num}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text className="text-sm font-bold text-primary">{title}</Text>
        </View>
        <Text className="text-xs text-on-surface-variant leading-relaxed">{subtitle}</Text>
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
  hudCard: {
    shadowColor: '#081637',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(245, 180, 28, 0.12)',
    top: '30%',
  },
  viewfinderBox: {
    width: VIEWFINDER_BOX_SIZE,
    height: VIEWFINDER_BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coreEmblem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemShadow: {
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#F5B41C',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  laserBeamContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  laserAura: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 24,
  },
  laserLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#F5B41C',
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButton: {
    borderRadius: 16,
    padding: 18,
    shadowColor: '#F5B41C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  howItWorksCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
});
