/**
 * Shared UI Components for Smart Attendance System
 * PrimaryButton, SecondaryButton, Card, InputField, StatusBadge, StatCard, Avatar, GPSStatusIndicator
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing, Typography, Shadows, TouchTarget } from '@/constants/Layout';

// ─── Primary Button ───
interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof FontAwesome.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ title, onPress, icon, loading, disabled, style }: ButtonProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.primaryButton,
        { backgroundColor: disabled ? theme.textTertiary : theme.primary },
        Shadows.md,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <FontAwesome name={icon} size={18} color="#fff" style={{ marginRight: 8 }} />}
          <Text style={[Typography.button, { color: '#fff' }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Secondary Button ───
export function SecondaryButton({ title, onPress, icon, loading, disabled, style }: ButtonProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.secondaryButton,
        { borderColor: theme.primary },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <FontAwesome name={icon} size={18} color={theme.primary} style={{ marginRight: 8 }} />}
          <Text style={[Typography.button, { color: theme.primary }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Destructive Button ───
export function DestructiveButton({ title, onPress, icon, style }: ButtonProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.secondaryButton,
        { borderColor: theme.error },
        style,
      ]}
    >
      <View style={styles.buttonContent}>
        {icon && <FontAwesome name={icon} size={18} color={theme.error} style={{ marginRight: 8 }} />}
        <Text style={[Typography.button, { color: theme.error }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Card ───
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  onPress?: () => void;
}

export function Card({ children, style, elevated, onPress }: CardProps) {
  const theme = useTheme();
  const cardStyle = [
    styles.card,
    { backgroundColor: theme.card, borderColor: theme.border },
    elevated ? Shadows.md : Shadows.sm,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

// ─── Input Field ───
interface InputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmitEditing?: () => void;
}

export function InputField({
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  onToggleSecure,
  keyboardType,
  autoCapitalize,
  returnKeyType,
  onSubmitEditing,
}: InputFieldProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.inputContainer,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {icon && (
        <FontAwesome
          name={icon}
          size={18}
          color={theme.textSecondary}
          style={{ marginRight: Spacing.sm }}
        />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'none'}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        style={[Typography.body, styles.inputText, { color: theme.text }]}
      />
      {onToggleSecure && (
        <TouchableOpacity onPress={onToggleSecure} style={styles.eyeButton}>
          <FontAwesome
            name={secureTextEntry ? 'eye' : 'eye-slash'}
            size={18}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Status Badge ───
interface StatusBadgeProps {
  label: string;
  variant: 'success' | 'error' | 'warning' | 'info' | 'neutral';
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  const theme = useTheme();
  const colorMap = {
    success: { bg: theme.success + '20', text: theme.success },
    error: { bg: theme.error + '20', text: theme.error },
    warning: { bg: theme.warning + '20', text: theme.warning },
    info: { bg: theme.primary + '20', text: theme.primary },
    neutral: { bg: theme.border, text: theme.textSecondary },
  };
  const colors = colorMap[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: colors.text }]} />
      <Text style={[Typography.caption, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

// ─── Stat Card ───
interface StatCardProps {
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color }: StatCardProps) {
  const theme = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.sm]}>
      <Text style={[Typography.h2, { color: color || theme.primary }]}>{value}</Text>
      <Text style={[Typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

// ─── Avatar ───
interface AvatarProps {
  initials: string;
  size?: number;
}

export function Avatar({ initials, size = 48 }: AvatarProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.primaryLight,
        },
      ]}
    >
      <Text
        style={{
          fontSize: size * 0.38,
          fontWeight: '700',
          color: theme.primary,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

// ─── Section Header ───
interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <Text style={[Typography.h3, { color: theme.text, marginBottom: Spacing.sm, marginTop: Spacing.lg }]}>
      {title}
    </Text>
  );
}

// ─── GPS Status Indicator ───
interface GPSStatusIndicatorProps {
  status: 'searching' | 'found' | 'verified' | 'outside';
}

export function GPSStatusIndicator({ status }: GPSStatusIndicatorProps) {
  const theme = useTheme();
  const config = {
    searching: { icon: 'location-arrow' as const, color: theme.warning, label: 'Locating...' },
    found: { icon: 'map-marker' as const, color: theme.info, label: 'Location Found' },
    verified: { icon: 'map-marker' as const, color: theme.success, label: 'Inside Geofence' },
    outside: { icon: 'map-marker' as const, color: theme.error, label: 'Outside Geofence' },
  };
  const { icon, color, label } = config[status];

  return (
    <View style={styles.gpsContainer}>
      <FontAwesome name={icon} size={16} color={color} />
      <Text style={[Typography.bodySmall, { color, marginLeft: Spacing.sm, fontWeight: '600' }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Geofence Badge ───
interface GeofenceBadgeProps {
  radius: number;
  isActive?: boolean;
}

export function GeofenceBadge({ radius, isActive = true }: GeofenceBadgeProps) {
  const theme = useTheme();
  const color = isActive ? theme.success : theme.textTertiary;
  return (
    <View style={[styles.geofenceBadge, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <FontAwesome name="map-marker" size={14} color={color} />
      <Text style={[Typography.bodySmall, { color, marginLeft: 6, fontWeight: '600' }]}>
        {radius}m Geofence {isActive ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  primaryButton: {
    height: TouchTarget.recommended,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  secondaryButton: {
    height: TouchTarget.minimum,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  inputContainer: {
    height: 52,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  inputText: {
    flex: 1,
  },
  eyeButton: {
    padding: Spacing.sm,
    minWidth: TouchTarget.minimum,
    minHeight: TouchTarget.minimum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  geofenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
