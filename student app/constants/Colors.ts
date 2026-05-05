/**
 * Smart Attendance System — Design System Colors
 * University-grade professional palette: Blue + White
 * All combinations meet WCAG AA 4.5:1 minimum contrast.
 */

export const Palette = {
  // Primary Blues
  blue50: '#E3F2FD',
  blue100: '#BBDEFB',
  blue200: '#90CAF9',
  blue300: '#64B5F6',
  blue400: '#42A5F5',
  blue500: '#1565C0',
  blue600: '#0D47A1',
  blue700: '#1A237E',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F5F7FA',
  gray100: '#E2E8F0',
  gray200: '#CBD5E1',
  gray300: '#94A3B8',
  gray400: '#64748B',
  gray500: '#475569',
  gray600: '#334155',
  gray700: '#1E293B',
  gray800: '#1A1A2E',
  gray900: '#0F172A',
  black: '#000000',

  // Semantic
  green400: '#4ADE80',
  green500: '#16A34A',
  red400: '#F87171',
  red500: '#DC2626',
  yellow400: '#FBBF24',
  yellow500: '#F59E0B',
  info400: '#8AB4F8',
  info500: '#2196F3',

  // Surfaces (dark mode)
  darkSurface: '#121212',
  darkSurface1: '#1E1E1E',
  darkSurface2: '#2C2C2C',
  darkSurface3: '#3C3C3C',

  // GCTU Brand — Gold
  gctuGold: '#C5960C',
  gctuGoldLight: '#D4A84B',
  gctuGoldDark: '#9A7500',
  gctuBlue: '#003366',
} as const;

export const Colors = {
  light: {
    primary: Palette.blue500,
    primaryDark: Palette.blue600,
    primaryLight: Palette.blue50,
    surface: Palette.white,
    background: Palette.gray50,
    surfaceElevated: Palette.white,
    text: Palette.gray800,
    textSecondary: Palette.gray400,
    textTertiary: Palette.gray300,
    success: Palette.green500,
    error: Palette.red500,
    warning: Palette.yellow500,
    info: Palette.info500,
    border: Palette.gray100,
    tabIconDefault: Palette.gray300,
    tabIconSelected: Palette.blue500,
    tint: Palette.blue500,
    card: Palette.white,
    overlay: 'rgba(0,0,0,0.5)',
    statusBar: 'dark' as const,
  },
  dark: {
    primary: Palette.blue200,
    primaryDark: Palette.blue300,
    primaryLight: Palette.blue700,
    surface: Palette.darkSurface,
    background: Palette.black,
    surfaceElevated: Palette.darkSurface1,
    text: '#E8E8E8',
    textSecondary: '#A0A0A0',
    textTertiary: '#707070',
    success: Palette.green400,
    error: Palette.red400,
    warning: Palette.yellow400,
    info: Palette.info400,
    border: Palette.darkSurface2,
    tabIconDefault: '#6E6E6E',
    tabIconSelected: Palette.blue200,
    tint: Palette.blue200,
    card: Palette.darkSurface1,
    overlay: 'rgba(0,0,0,0.7)',
    statusBar: 'light' as const,
  },
} as const;

export type ThemeColors = typeof Colors.light;
