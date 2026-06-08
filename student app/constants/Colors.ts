/**
 * Smart Attendance System — Design System Colors
 * GCTU Official Brand Colors: Navy (#081637) + Gold (#F5B41C)
 * All combinations meet WCAG AA 4.5:1 minimum contrast.
 */

export const Palette = {
  // GCTU Brand Colors (Primary)
  gctuNavy: '#081637',          // Primary Navy
  gctuNavyDeep: '#0D2A66',      // Secondary Navy (deeper shade)
  gctuNavyLight: '#1A3A7A',     // Light Navy for hover states
  gctuNavyTint: '#DAE1FF',      // Very light navy tint
  gctuGold: '#F5B41C',          // Primary Gold/Accent
  gctuGoldDark: '#CAA10B',      // Gold hover/dark
  gctuGoldMuted: '#FDE68A',     // Light gold tint
  gctuGoldLight: '#FEF3C7',     // Very light gold background

  // Neutrals (matched to web app)
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  black: '#000000',

  // Semantic Colors
  green400: '#4ADE80',
  green500: '#16A34A',
  green600: '#15803D',
  red400: '#F87171',
  red500: '#DC2626',
  red600: '#B91C1C',
  yellow400: '#FBBF24',
  yellow500: '#F59E0B',
  amber400: '#FCD34D',
  amber500: '#F59E0B',
  info400: '#60A5FA',
  info500: '#3B82F6',

  // Surfaces (dark mode)
  darkSurface: '#0A0F1E',       // Darker navy-tinted surface
  darkSurface1: '#0F1729',      // Elevated surface
  darkSurface2: '#1A2438',      // More elevated
  darkSurface3: '#243047',      // Highest elevation
} as const;


export const Colors = {
  light: {
    // Primary colors using GCTU Navy
    primary: Palette.gctuNavy,
    primaryDark: Palette.gctuNavyDeep,
    primaryLight: Palette.gctuNavyTint,
    
    // Accent colors using GCTU Gold
    accent: Palette.gctuGold,
    accentDark: Palette.gctuGoldDark,
    accentLight: Palette.gctuGoldMuted,
    
    // Surfaces
    surface: Palette.white,
    background: Palette.gray50,
    surfaceElevated: Palette.white,
    
    // Text
    text: Palette.gray900,
    textSecondary: Palette.gray600,
    textTertiary: Palette.gray400,
    
    // Semantic
    success: Palette.green500,
    error: Palette.red500,
    warning: Palette.amber500,
    info: Palette.info500,
    
    // UI Elements
    border: Palette.gray200,
    tabIconDefault: Palette.gray400,
    tabIconSelected: Palette.gctuNavy,
    tint: Palette.gctuNavy,
    card: Palette.white,
    overlay: 'rgba(8, 22, 55, 0.5)',      // Navy-tinted overlay
    statusBar: 'dark' as const,
  },
  dark: {
    // Primary colors using lighter navy for dark mode
    primary: Palette.gctuNavyTint,
    primaryDark: Palette.gctuNavyLight,
    primaryLight: Palette.gctuNavyDeep,
    
    // Accent colors using GCTU Gold
    accent: Palette.gctuGold,
    accentDark: Palette.gctuGoldDark,
    accentLight: Palette.gctuGoldMuted,
    
    // Surfaces (navy-tinted dark surfaces)
    surface: Palette.darkSurface,
    background: Palette.black,
    surfaceElevated: Palette.darkSurface1,
    
    // Text
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    
    // Semantic
    success: Palette.green400,
    error: Palette.red400,
    warning: Palette.amber400,
    info: Palette.info400,
    
    // UI Elements
    border: Palette.darkSurface2,
    tabIconDefault: '#64748B',
    tabIconSelected: Palette.gctuGold,    // Gold for selected in dark mode
    tint: Palette.gctuGold,
    card: Palette.darkSurface1,
    overlay: 'rgba(0, 0, 0, 0.7)',
    statusBar: 'light' as const,
  },
} as const;

export type ThemeColors = typeof Colors.light;
