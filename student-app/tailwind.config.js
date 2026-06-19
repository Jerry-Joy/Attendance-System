/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── GCTU Official Brand Colors ──
        'gctu-navy': '#081637',
        'gctu-navy-deep': '#0D2A66',
        'gctu-navy-light': '#1A3A7A',
        'gctu-navy-tint': '#DAE1FF',
        'gctu-gold': '#F5B41C',
        'gctu-gold-dark': '#CAA10B',
        'gctu-gold-muted': '#FDE68A',
        'gctu-gold-light': '#FEF3C7',
        
        // ── Material Design 3 Color Tokens (GCTU Branded) ──
        primary: '#081637',              // GCTU Navy
        'on-primary': '#FFFFFF',
        'primary-container': '#0D2A66',  // GCTU Navy Deep
        'on-primary-container': '#B9C5EF',
        'primary-fixed': '#DAE1FF',      // GCTU Navy Tint
        'on-primary-fixed': '#0C1A3B',
        'primary-fixed-dim': '#B9C5EF',
        'on-primary-fixed-variant': '#3A4669',
        
        secondary: '#F5B41C',            // GCTU Gold
        'on-secondary': '#081637',       // GCTU Navy on Gold
        'secondary-container': '#F5B41C',
        'on-secondary-container': '#3D2900',
        'secondary-fixed': '#FDE68A',    // GCTU Gold Muted
        'on-secondary-fixed': '#271900',
        'secondary-fixed-dim': '#F5B41C',
        'on-secondary-fixed-variant': '#5e4200',
        
        tertiary: '#0D2A66',             // GCTU Navy Deep
        'on-tertiary': '#FFFFFF',
        'tertiary-container': '#001849',
        'on-tertiary-container': '#6b82c3',
        'tertiary-fixed': '#DAE1FF',
        'tertiary-fixed-dim': '#B3C5FF',
        
        error: '#DC2626',
        'on-error': '#ffffff',
        'error-container': '#FEE2E2',
        'on-error-container': '#93000a',
        
        success: '#16A34A',
        'on-success': '#ffffff',
        'success-container': '#D1FAE5',
        'on-success-container': '#14532D',
        
        warning: '#F59E0B',
        'on-warning': '#ffffff',
        'warning-container': '#FEF3C7',
        'on-warning-container': '#78350F',
        
        info: '#3B82F6',
        'on-info': '#ffffff',
        'info-container': '#DBEAFE',
        'on-info-container': '#1E3A8A',
        
        // ── Surface & Background ──
        background: '#FFFFFF',
        'on-background': '#0F172A',
        surface: '#F8FAFC',
        'on-surface': '#0F172A',
        'surface-variant': '#E2E8F0',
        'on-surface-variant': '#475569',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F8FAFC',
        'surface-container': '#F1F5F9',
        'surface-container-high': '#E2E8F0',
        'surface-container-highest': '#CBD5E1',
        'surface-dim': '#CBD5E1',
        'surface-bright': '#FFFFFF',
        
        'inverse-surface': '#1E293B',
        'inverse-on-surface': '#F8FAFC',
        'inverse-primary': '#B9C5EF',
        
        outline: '#475569',
        'outline-variant': '#E2E8F0',
        
        // ── Convenience Aliases ──
        navy: '#081637',
        gold: '#F5B41C',
      },
    },
  },
  plugins: [],
};
