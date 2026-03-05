/**
 * Theme hook — returns current theme colors based on system preference.
 */
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export type ThemeColors = {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    surface: string;
    background: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    border: string;
    tabIconDefault: string;
    tabIconSelected: string;
    tint: string;
    card: string;
    overlay: string;
    statusBar: 'light' | 'dark';
};

export function useTheme(): ThemeColors {
    const scheme = useColorScheme();
    return scheme === 'dark' ? Colors.dark : Colors.light;
}

export function useThemeColor(colorName: keyof ThemeColors): string {
    const theme = useTheme();
    return theme[colorName];
}
