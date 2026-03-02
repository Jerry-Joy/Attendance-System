/**
 * Smart Attendance System — Layout & Spacing Tokens
 */
import { Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
} as const;

export const Typography = {
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 34,
    },
    h2: {
        fontSize: 22,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 24,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 22,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 20,
    },
} as const;

export const TouchTarget = {
    minimum: 48,
    recommended: 56,
    spacing: 8,
} as const;

export const Shadows = {
    sm: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
        },
        android: {
            elevation: 2,
        },
    }),
    md: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
        },
        android: {
            elevation: 4,
        },
    }),
    lg: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
        },
        android: {
            elevation: 8,
        },
    }),
} as const;

export const Screen = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    padding: Spacing.lg,
} as const;
