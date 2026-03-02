/**
 * Scanner Screen — QR Code scanning for attendance
 * Simulates camera-based QR scanning, then navigates to GPS verification.
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography, BorderRadius } from '@/constants/Layout';
import { PrimaryButton, SecondaryButton } from '@/components/ui';

export default function ScannerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scanLine = useRef(new Animated.Value(0)).current;

  // Animated scan line
  useEffect(() => {
    if (scanning) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLine, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanLine, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [scanning]);

  // Simulate QR code detection after 3 seconds
  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        setScanning(false);
        setScanResult('CSC401-SESSION-20260219-QR7X9K');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  // Navigate to GPS verification after QR success
  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        router.replace('/gps-verify');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  const translateY = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <SecondaryButton
          title="Cancel"
          onPress={() => router.back()}
          style={{ borderColor: '#fff', paddingHorizontal: 16 }}
        />
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerArea}>
        <View style={styles.scanFrame}>
          {/* Corner markers */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Scan line */}
          {scanning && (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY }] },
              ]}
            />
          )}

          {/* Success overlay */}
          {scanResult && (
            <View style={styles.successOverlay}>
              <FontAwesome name="check-circle" size={64} color="#4ADE80" />
            </View>
          )}
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusArea}>
        {scanning ? (
          <>
            <FontAwesome name="qrcode" size={24} color="#fff" />
            <Text style={styles.statusText}>
              Point your camera at the QR code displayed by your lecturer
            </Text>
          </>
        ) : (
          <>
            <FontAwesome name="check-circle" size={24} color="#4ADE80" />
            <Text style={[styles.statusText, { color: '#4ADE80' }]}>
              QR Code Scanned — Verifying GPS Location...
            </Text>
          </>
        )}
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.infoRow}>
          <FontAwesome name="map-marker" size={16} color={theme.primary} />
          <Text style={styles.infoText}>
            GPS location will be verified after scanning
          </Text>
        </View>
        <View style={styles.infoRow}>
          <FontAwesome name="lock" size={16} color={theme.primary} />
          <Text style={styles.infoText}>
            QR codes expire every 30 seconds
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.h3,
    color: '#fff',
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#1565C0',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#1565C0',
    top: 10,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  statusArea: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  statusText: {
    ...Typography.body,
    color: '#fff',
    textAlign: 'center',
  },
  bottomInfo: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
  },
});
