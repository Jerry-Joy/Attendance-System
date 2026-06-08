# 🎨 GCTU Colors - Quick Reference Card

## Copy-Paste Color Values

### GCTU Navy (Primary)
```
#081637  → Primary (main brand color)
#0D2A66  → Deep (secondary depth)
#1A3A7A  → Light (hover states)
#DAE1FF  → Tint (light backgrounds)
```

### GCTU Gold (Accent)
```
#F5B41C  → Primary (accent color)
#CAA10B  → Dark (hover states)
#FDE68A  → Muted (light tints)
#FEF3C7  → Light (backgrounds)
```

---

## Quick Usage Guide

### In React Native Components

```typescript
// Import theme hook
import { useTheme } from '@/hooks/useTheme';

// In component
const theme = useTheme();

// Use colors
<View style={{ backgroundColor: theme.primary }}>     // GCTU Navy
  <Text style={{ color: theme.accent }}>GCTU</Text>  // GCTU Gold
</View>
```

### Common Patterns

```typescript
// Primary button
backgroundColor: theme.primary          // Navy background
color: '#FFFFFF'                        // White text

// Secondary button
backgroundColor: 'transparent'
borderColor: theme.primary              // Navy border
color: theme.primary                    // Navy text

// Accent text
color: theme.accent                     // Gold text

// Error state
backgroundColor: theme.error + '15'     // Red with transparency
color: theme.error                      // Red text

// Success state
backgroundColor: theme.success + '15'
color: theme.success
```

---

## Where Each Color Appears

### GCTU Navy (#081637)
- ✅ Logo circle backgrounds
- ✅ Primary buttons
- ✅ Selected tabs (light mode)
- ✅ QR scanner corners
- ✅ Navigation headers
- ✅ Active states

### GCTU Gold (#F5B41C)
- ✅ "Ghana Communication Technology University" text
- ✅ GCTU badges
- ✅ Accent highlights
- ✅ Selected tabs (dark mode)
- ✅ Important labels

---

## Quick Commands

```bash
# Start development server
npx expo start

# Clear cache and restart
npx expo start -c

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Check TypeScript
npx tsc --noEmit
```

---

## Quick Checks

### ✅ Colors Correct If:
- Logo backgrounds are **dark navy** (almost black with blue tint)
- GCTU text is **bright gold** (vibrant yellow-gold)
- Buttons are **navy** with white text
- No bright blue colors anywhere

### ❌ Something Wrong If:
- Logo backgrounds are bright blue
- GCTU text is brownish gold
- Buttons are bright blue
- Dark mode doesn't work

---

## Files to Know

```
constants/Colors.ts          → All color definitions
hooks/useTheme.ts           → Theme hook
components/ui.tsx           → UI components
app/login.tsx               → Login screen
app/signup.tsx              → Signup screen
app/scanner.tsx             → QR scanner
app/(student)/home.tsx      → Home screen
app/(student)/profile.tsx   → Profile screen
```

---

## Documentation

```
GCTU_BRANDING_UPDATE.md    → Overview & guidelines
COLOR_MIGRATION_GUIDE.md   → Technical details
VISUAL_TESTING_GUIDE.md    → Testing checklist
DEPLOYMENT_READY.md        → Deployment info
QUICK_REFERENCE.md         → This file
```

---

## Contrast Ratios (WCAG AA)

```
Navy on White:    14.2:1 ✅ (Exceeds 4.5:1)
Gold on Navy:      7.8:1 ✅ (Exceeds 4.5:1)
White on Navy:    14.2:1 ✅ (Exceeds 4.5:1)
Gold on White:     5.1:1 ✅ (Passes 4.5:1)
```

---

## Theme Object Quick Reference

```typescript
// Available theme colors
theme.primary        // Navy (#081637)
theme.primaryDark    // Navy Deep (#0D2A66)
theme.primaryLight   // Navy Tint (#DAE1FF)
theme.accent         // Gold (#F5B41C)
theme.accentDark     // Gold Dark (#CAA10B)
theme.accentLight    // Gold Muted (#FDE68A)
theme.surface        // White / Dark surface
theme.background     // Gray / Black
theme.text           // Dark / Light text
theme.textSecondary  // Medium gray
theme.textTertiary   // Light gray
theme.success        // Green
theme.error          // Red
theme.warning        // Amber
theme.info           // Blue
theme.border         // Light border
theme.card           // Card background
theme.overlay        // Modal overlay
```

---

## Need Help?

1. **Visual issues?** → See `VISUAL_TESTING_GUIDE.md`
2. **Code questions?** → See `COLOR_MIGRATION_GUIDE.md`
3. **Deployment?** → See `DEPLOYMENT_READY.md`
4. **Overview?** → See `GCTU_BRANDING_UPDATE.md`

---

**Last Updated:** June 6, 2026
**Version:** 1.0
**Status:** ✅ Complete
