# Splash Screen Fix for GCTU Attendance App

## Issue
The GCTU crest was not showing on the splash screen.

## Root Cause
The `expo-splash-screen` package was not installed, which is required to properly display the splash screen configured in `app.json`.

## Changes Made

### 1. Added expo-splash-screen package
- Added `expo-splash-screen` to `package.json` dependencies

### 2. Updated app/_layout.tsx
- Imported `expo-splash-screen` module
- Called `SplashScreen.preventAutoHideAsync()` to keep splash visible during app initialization
- Added `useEffect` hook to hide splash screen after 1 second with smooth transition

### 3. Updated app.json
- Added `expo-splash-screen` to the plugins array

## Installation Steps

Run these commands in the `gctu-attendance-app` directory:

```bash
# Install the new dependency
npm install

# Clear the Expo cache and rebuild
npx expo start -c
```

## For Android/iOS Native Builds

If you're building native apps, you'll need to rebuild:

```bash
# For Android
npx expo prebuild --clean
npx expo run:android

# For iOS
npx expo prebuild --clean
npx expo run:ios
```

## Splash Screen Configuration

The splash screen is configured in `app.json`:
- **Image**: `./assets/images/gctu-crest.png`
- **Background Color**: `#081637` (GCTU dark blue)
- **Resize Mode**: `contain` (maintains aspect ratio)

## Testing
1. Close the app completely
2. Restart Expo dev server: `npx expo start -c`
3. Open the app - you should now see the GCTU crest on a dark blue background

## Troubleshooting

If the splash screen still doesn't show:
1. Make sure `assets/images/gctu-crest.png` exists and is not corrupted
2. Clear Expo cache: `npx expo start -c`
3. Clear Metro bundler cache: `rm -rf node_modules/.cache`
4. Restart the development server
5. For production builds, rebuild the native app with prebuild
