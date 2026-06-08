# Visual Testing Guide - GCTU Brand Colors

## Quick Visual Verification Checklist

Use this guide to quickly verify that all GCTU brand colors are displaying correctly in the mobile app.

---

## 🎨 Color Reference Card

Keep this handy while testing:

```
┌─────────────────────────────────────────────────────────────┐
│  GCTU NAVY (#081637)  │  GCTU GOLD (#F5B41C)                │
│  ███████████████████  │  ███████████████████                │
│  Primary Color        │  Accent Color                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Screen-by-Screen Testing

### 1. Login Screen (`/login`)

**What to Check:**
- [ ] Logo circle background is **GCTU Navy** (#081637)
- [ ] "GHANA COMMUNICATION TECHNOLOGY UNIVERSITY" text is **GCTU Gold** (#F5B41C)
- [ ] "Sign In" button is **GCTU Navy** background with white text
- [ ] "Forgot Password?" link is **GCTU Navy** text
- [ ] Error box (if any) has red background with red text
- [ ] Info box has light navy background with navy text

**Expected Look:**
```
┌─────────────────────────────────────┐
│                                     │
│        [NAVY CIRCLE]                │
│          🎓 Logo                    │
│                                     │
│    GHANA COMMUNICATION...           │ ← GOLD text
│                                     │
│    GCTU Smart Attendance            │
│    Sign in to mark attendance       │
│                                     │
│    ┌─────────────────────────┐     │
│    │ Email                   │     │
│    └─────────────────────────┘     │
│    ┌─────────────────────────┐     │
│    │ Password                │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │
│    │   Sign In   NAVY BG     │     │ ← NAVY button
│    └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

---

### 2. Signup Screen (`/signup`)

**What to Check:**
- [ ] Logo circle background is **GCTU Navy**
- [ ] "GHANA COMMUNICATION TECHNOLOGY UNIVERSITY" text is **GCTU Gold**
- [ ] Step indicators (1, 2) are **GCTU Navy** when active
- [ ] "Continue" button is **GCTU Navy** background
- [ ] "Create Account" button is **GCTU Navy** background
- [ ] Password strength bar shows correct colors:
  - Too short/Weak: Red
  - Fair: Amber
  - Good: Blue
  - Strong: Green
- [ ] Error messages have red background

**Expected Look:**
```
┌─────────────────────────────────────┐
│        [NAVY CIRCLE]                │
│          🎓 Logo                    │
│    GHANA COMMUNICATION...           │ ← GOLD text
│                                     │
│    Create Account                   │
│                                     │
│    (1)─────────(2)                  │ ← NAVY when active
│  Personal    Credentials            │
│                                     │
│    [Form Fields]                    │
│                                     │
│    ┌─────────────────────────┐     │
│    │   Continue   NAVY BG    │     │
│    └─────────────────────────┘     │
└─────────────────────────────────────┘
```

---

### 3. QR Scanner Screen (`/scanner`)

**What to Check:**
- [ ] QR frame corner markers are **GCTU Navy** (#081637)
- [ ] All 4 corners show navy color
- [ ] "Scan QR Code" header text is white
- [ ] Success message icon is green
- [ ] Error icon (if any) is red
- [ ] GPS info icons at bottom are **GCTU Navy**

**Expected Look:**
```
┌─────────────────────────────────────┐
│  Cancel    Scan QR Code             │
│                                     │
│         ┏━━━━━━━━━┓                 │ ← NAVY corners
│         ┃         ┃                 │
│         ┃ [SCAN]  ┃                 │
│         ┃  AREA   ┃                 │
│         ┗━━━━━━━━━┛                 │
│                                     │
│    🔍 Point camera at QR code      │
│                                     │
│    📍 GPS location will be verified │ ← NAVY icon
│    🔒 QR codes expire every 30s    │ ← NAVY icon
└─────────────────────────────────────┘
```

---

### 4. Home Screen (`/(student)/home`)

**What to Check:**
- [ ] GCTU badge text is **GCTU Gold**
- [ ] Active session cards have proper theming
- [ ] "Scan QR Code" button is **GCTU Navy** background
- [ ] Course cards use theme colors
- [ ] Navigation tabs show **GCTU Navy** when selected (light mode)
- [ ] Navigation tabs show **GCTU Gold** when selected (dark mode)

**Expected Look:**
```
┌─────────────────────────────────────┐
│  Welcome back, Student Name         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🎓                            │ │
│  │ GHANA COMMUNICATION...        │ │ ← GOLD text
│  │ TECHNOLOGY UNIVERSITY         │ │
│  └───────────────────────────────┘ │
│                                     │
│  Active Sessions                    │
│  ┌───────────────────────────────┐ │
│  │ Course Name                   │ │
│  │ Live Now                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────┐       │
│  │ Scan QR Code  NAVY BG   │       │ ← NAVY button
│  └─────────────────────────┘       │
└─────────────────────────────────────┘
```

---

### 5. Profile Screen (`/(student)/profile`)

**What to Check:**
- [ ] "GHANA COMMUNICATION TECHNOLOGY UNIVERSITY" text is **GCTU Gold**
- [ ] Stats cards use theme colors
- [ ] Logout button uses theme error color (red)
- [ ] Navigation shows **GCTU Navy** for selected tab (light mode)

**Expected Look:**
```
┌─────────────────────────────────────┐
│  Profile                            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         [Avatar]              │ │
│  │      Student Name             │ │
│  │      student@gctu.edu.gh      │ │
│  └───────────────────────────────┘ │
│                                     │
│  Stats Cards                        │
│                                     │
│  QR + GPS Geofencing + Blockchain   │
│  GHANA COMMUNICATION...             │ ← GOLD text
│  TECHNOLOGY UNIVERSITY              │
│                                     │
│  ┌─────────────────────────┐       │
│  │ Logout     RED          │       │
│  └─────────────────────────┘       │
└─────────────────────────────────────┘
```

---

## 🌓 Dark Mode Testing

### Dark Mode Color Expectations

**Switch to Dark Mode and verify:**

- [ ] Primary actions use **light navy tint** (#DAE1FF)
- [ ] Accents still use **GCTU Gold** (#F5B41C)
- [ ] Backgrounds are navy-tinted dark surfaces
- [ ] Selected tabs show **GCTU Gold**
- [ ] Text is light colored and readable
- [ ] Cards have navy-tinted dark backgrounds

**Dark Mode Colors:**
```
Primary:      #DAE1FF (Light Navy Tint)
Accent:       #F5B41C (Gold - same as light)
Background:   #000000 (Black)
Surface:      #0A0F1E (Navy-tinted dark)
Card:         #0F1729 (Navy-tinted dark)
Selected Tab: #F5B41C (Gold)
```

---

## 🎯 Component-Level Checks

### Buttons

**Primary Button:**
- [ ] Background: GCTU Navy
- [ ] Text: White
- [ ] Icon: White
- [ ] Hover/Press: Slightly darker

**Secondary Button:**
- [ ] Background: Transparent
- [ ] Border: GCTU Navy
- [ ] Text: GCTU Navy
- [ ] Icon: GCTU Navy

### Status Badges

- [ ] Success: Green background with green dot
- [ ] Error: Red background with red dot
- [ ] Warning: Amber background with amber dot
- [ ] Info: Navy background with navy dot

### Navigation Tabs

**Light Mode:**
- [ ] Unselected: Gray
- [ ] Selected: GCTU Navy

**Dark Mode:**
- [ ] Unselected: Gray
- [ ] Selected: GCTU Gold

---

## 🔍 Detailed Color Spot Checks

### Spot Check 1: Login Logo Circle
```
Navigate to: /login
Look at: Logo circle background
Expected: Dark navy blue (#081637)
NOT: Light blue or any other blue
```

### Spot Check 2: University Text
```
Navigate to: Any auth screen
Look at: "GHANA COMMUNICATION TECHNOLOGY UNIVERSITY"
Expected: Gold/yellow color (#F5B41C)
NOT: Different shade of gold (#C5960C)
```

### Spot Check 3: QR Scanner Corners
```
Navigate to: /scanner
Look at: Four corner markers on scan frame
Expected: Navy blue (#081637)
NOT: Bright blue (#1565C0)
```

### Spot Check 4: Primary Buttons
```
Navigate to: Any screen with buttons
Look at: Primary action buttons (Sign In, Continue, etc.)
Expected: Navy background (#081637) with white text
NOT: Blue background
```

### Spot Check 5: Selected Tab
```
Navigate to: Any screen with bottom tabs
Look at: Currently selected tab
Expected Light Mode: Navy (#081637)
Expected Dark Mode: Gold (#F5B41C)
```

---

## 📸 Screenshot Comparison

### Before (Old Blue)
- Logo circle: Generic navy (#003366)
- Buttons: Bright blue (#1565C0)
- Selected tabs: Blue
- GCTU text: Old gold (#C5960C)

### After (GCTU Brand)
- Logo circle: GCTU Navy (#081637) ✓
- Buttons: GCTU Navy (#081637) ✓
- Selected tabs: GCTU Navy (light) / Gold (dark) ✓
- GCTU text: GCTU Gold (#F5B41C) ✓

---

## ⚠️ Common Issues to Watch For

### Issue 1: Wrong Blue Shade
**Symptom:** Buttons/logo look bright blue instead of dark navy
**Expected:** Dark navy (#081637), almost black with blue tint
**If wrong:** Theme system might not be loaded

### Issue 2: Wrong Gold Shade
**Symptom:** GCTU text looks brownish instead of golden
**Expected:** Bright gold (#F5B41C), vibrant yellow-gold
**If wrong:** Old color might still be cached

### Issue 3: No Color in Dark Mode
**Symptom:** Everything looks gray in dark mode
**Expected:** Navy-tinted surfaces, gold accents visible
**If wrong:** Dark theme might not be properly configured

### Issue 4: White Corners on Scanner
**Symptom:** QR scanner corners are white or transparent
**Expected:** Navy blue (#081637)
**If wrong:** Dynamic theming might not be applied

---

## ✅ Final Verification Checklist

### Overall Branding
- [ ] App feels cohesive with GCTU branding
- [ ] Navy and gold colors are prominent
- [ ] No bright blue colors anywhere
- [ ] No old brownish gold anywhere

### Light Mode
- [ ] Primary buttons are navy
- [ ] GCTU text is gold
- [ ] Selected tabs are navy
- [ ] Logo background is navy

### Dark Mode
- [ ] Primary buttons are light navy
- [ ] GCTU text is still gold
- [ ] Selected tabs are gold
- [ ] Backgrounds are navy-tinted dark

### Accessibility
- [ ] All text is readable
- [ ] Color contrast is sufficient
- [ ] No strain on eyes
- [ ] Dark mode is comfortable

---

## 🚀 Quick Test Script

**5-Minute Verification:**

1. **Launch app** → Check splash screen colors
2. **Login screen** → Verify navy logo + gold text
3. **Toggle dark mode** → Check color adaptation
4. **Signup screen** → Verify step indicators navy
5. **Scanner** → Check navy corners on QR frame
6. **Home** → Verify gold GCTU badge
7. **Profile** → Verify gold university text
8. **Tabs** → Check selected tab colors (navy/gold)

**Expected Time:** 5-10 minutes
**Result:** All GCTU brand colors visible and consistent

---

## 📋 Sign-Off Checklist

Once all checks pass:

- [ ] All screens use GCTU Navy (#081637)
- [ ] All screens use GCTU Gold (#F5B41C)
- [ ] No generic blue colors remain
- [ ] Dark mode works correctly
- [ ] Light mode works correctly
- [ ] Tabs show correct colors
- [ ] Buttons show correct colors
- [ ] Text is readable everywhere
- [ ] App matches web lecturer app branding
- [ ] Screenshots/recordings captured (optional)

---

**Testing Date:** _______________
**Tested By:** _______________
**Platform:** iOS ☐ Android ☐ Both ☐
**Result:** Pass ☐ Fail ☐ Needs Review ☐

---

## 📞 Need Help?

If colors don't look right:

1. **Clear cache:** Delete app and reinstall
2. **Check theme:** Verify device is not in high contrast mode
3. **Restart:** Force close and reopen app
4. **Review docs:** Check `GCTU_BRANDING_UPDATE.md`
5. **Check code:** Verify `constants/Colors.ts` has correct values

---

**Document Version:** 1.0
**Last Updated:** June 6, 2026
**Status:** Ready for Testing ✅
