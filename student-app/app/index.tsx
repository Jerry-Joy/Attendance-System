import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Splash() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the crest
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loading dots animation
    const animateDots = () => {
      Animated.loop(
        Animated.stagger(200, [
          Animated.sequence([
            Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };
    animateDots();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? '/(tabs)/home' : '/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  return (
    <LinearGradient
      colors={['#081637', '#0A1F4D', '#081637']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Decorative circles */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />
      <View style={[styles.decorCircle, styles.decorCircle3]} />

      <View style={styles.content}>
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
            gap: 32,
          }}
        >
          {/* Logo container with glow effect */}
          <Animated.View 
            style={{ transform: [{ scale: pulseAnim }] }}
          >
            {/* Outer glow */}
            <View style={styles.glowOuter} />
            
            {/* Logo circle */}
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Image 
                  source={require('@/assets/images/gctu-crest.png')} 
                  style={styles.crestImage} 
                  resizeMode="contain" 
                />
              </View>
            </View>
          </Animated.View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.gctuText}>GCTU</Text>
            <View style={styles.divider} />
            <Text style={styles.smartAttendanceText}>Smart Attendance</Text>
            <Text style={styles.universityText}>
              Ghana Communication Technology University
            </Text>
          </View>
        </Animated.View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
          <Text style={styles.loadingText}>Initializing System</Text>
        </View>
      </View>

      {/* Bottom accent line */}
      <View style={styles.bottomAccent} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  decorCircle1: {
    top: 80,
    right: -80,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(245, 180, 28, 0.1)',
  },
  decorCircle2: {
    bottom: -40,
    left: -80,
    width: 240,
    height: 240,
    backgroundColor: 'rgba(245, 180, 28, 0.05)',
  },
  decorCircle3: {
    top: '33%',
    left: -40,
    width: 128,
    height: 128,
    borderWidth: 2,
    borderColor: 'rgba(245, 180, 28, 0.2)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  glowOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 180, 28, 0.2)',
    opacity: 0.5,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 180, 28, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoInner: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestImage: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  gctuText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  divider: {
    height: 4,
    width: 64,
    backgroundColor: '#F5B41C',
    borderRadius: 2,
  },
  smartAttendanceText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  universityText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    gap: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5B41C',
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  bottomAccent: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(245, 180, 28, 0.5)',
  },
});
