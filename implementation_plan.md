# GCTU Branding Integration — Smart Attendance System

Rebrand both the **lecturer web app** and **student mobile app** from a generic "Smart Attendance System" to be clearly identified as a GCTU (Ghana Communication Technology University) product, using GCTU's official **Blue & Gold** brand colors and institutional identity.

## Summary of Current State

Both apps currently display:
- Generic "Smart Attendance System" titles with no university affiliation
- A legacy "CORE-SCAN v1.0.0" label in the lecturer settings
- "SmartAttend v1.0.0" in the student profile
- Generic blue checkmark icons as logos
- Generic `smart-attendance` naming in app.json
- No GCTU crest, motto, colors, or institutional text anywhere

## Proposed Changes

The GCTU brand colors are **Blue** (depth, intelligence) and **Gold** (knowledge, innovation). The current blue palette already aligns well. We'll introduce **Gold** as an accent to distinguish the system as GCTU's own.

> [!IMPORTANT]
> **GCTU Logo/Crest**: Since we don't have access to the official GCTU crest image file, I'll use a text-based approach for the logo (the university name styled with an academic shield icon). If you have a GCTU crest PNG/SVG, let me know and I can embed it instead.

---

### Lecturer Web App (Vite + React + Tailwind)

#### [MODIFY] [index.html](file:///c:/Users/jerry/Desktop/Attendance%20system/lecturer-app/index.html)
- Change page title from `Smart Attendance System` → `GCTU Smart Attendance System`
- Add meta description referencing GCTU

#### [MODIFY] [Login.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/lecturer-app/src/pages/Login.tsx)
- Replace generic blue checkmark icon with a **GCTU-branded header**: university crest/shield icon + "Ghana Communication Technology University" text
- Add GCTU Gold accent color to the icon area
- Change subtitle from "Smart Attendance System" → "GCTU Smart Attendance System"
- Add tagline: "Faculty of Computing & Information Systems"
- Add small footer text: "© 2026 Ghana Communication Technology University"

#### [MODIFY] [Register.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/lecturer-app/src/pages/Register.tsx)
- Same GCTU-branded header as Login page
- Change title from "Smart Attendance System" → "GCTU Smart Attendance System"
- Add "Faculty of Computing & Information Systems" subtitle
- Change placeholder for department to GCTU-relevant department (e.g., "Information Technology")
- Change placeholder for staff ID to GCTU format (e.g., "GCTU-2024-XXX")

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/lecturer-app/src/components/Sidebar.tsx)
- Replace the logo area: Add a GCTU shield/crest icon with gold accent
- Change text from "Smart Attendance System" → **"GCTU"** as the primary brand + "Smart Attendance" as subtitle
- Add university gold accent color to the sidebar logo area
- Update the hardcoded mock user from "Dr. Julian Vance / Staff: #7721" to GCTU-contextual defaults

#### [MODIFY] [Topnav.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/lecturer-app/src/components/Topnav.tsx)
- No major changes, but update the status badge area to show "GCTU Network: Online" instead of just "System Status: Online"

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/lecturer-app/src/pages/Dashboard.tsx)
- Add GCTU welcome message: "GCTU Attendance Dashboard" or "Ghana Communication Technology University" as a subtle label
- Keep "F26 Term" label (relevant to GCTU's semester system)

#### [MODIFY] [Settings.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/lecturer-app/src/pages/Settings.tsx)
- Replace "CORE-SCAN v1.0.0" → "GCTU Smart Attendance v1.0.0"
- Add "Ghana Communication Technology University" institutional text

#### [MODIFY] [index.css](file:///c:/Users/jerry/Desktop/Attendance%20system/lecturer-app/src/index.css)
- Add GCTU Gold as a CSS custom property (`--color-gctu-gold`) for use across the app
- Value: `#C5960C` (deep gold) / `#D4A84B` (lighter gold accent)

---

### Student Mobile App (Expo/React Native)

#### [MODIFY] [app.json](file:///c:/Users/jerry/Desktop/Attendance%20system/student%20app/app.json)
- Change `name` from `smart-attendance` → `GCTU Attendance`
- Update permission descriptions to reference "GCTU Smart Attendance" instead of "Smart Attendance"

#### [MODIFY] [index.tsx (splash)](file:///c:/Users/jerry/Desktop/Attendance%20system/student%20app/app/index.tsx)
- Replace generic splash with GCTU-branded splash:
  - Title: "GCTU" (large) + "Smart Attendance" (subtitle)
  - Tagline: "Ghana Communication Technology University"
  - Sub-tagline: "QR Code + GPS Geofencing + Blockchain"
  - Use GCTU gold accent for the icon circle
  - Replace generic checkmark with a university shield icon

#### [MODIFY] [login.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/student%20app/app/login.tsx)
- Replace generic logo circle with GCTU-branded header:
  - GCTU shield icon with gold accent
  - "Ghana Communication Technology University" institutional name
  - "GCTU Smart Attendance" as the system name
- Update sign-in subtitle text

#### [MODIFY] [signup.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/student%20app/app/signup.tsx)
- Same GCTU-branded header as login
- Update Student ID placeholder to GCTU format (e.g., "421XXXXXXX")

#### [MODIFY] [home.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/student%20app/app/(student)/home.tsx)
- Add a subtle GCTU institutional badge/ribbon at the top of the home screen
- Small "GCTU" text or badge near the header to reinforce branding

#### [MODIFY] [profile.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/student%20app/app/(student)/profile.tsx)
- Replace "SmartAttend v1.0.0 • QR + GPS Geofencing" → "GCTU Smart Attendance v1.0.0 • QR + GPS + Blockchain"
- Add "Ghana Communication Technology University" institutional footer

#### [MODIFY] [Colors.ts](file:///c:/Users/jerry/Desktop/Attendance%20system/student%20app/constants/Colors.ts)
- Add GCTU Gold palette entries (`gctuGold`, `gctuGoldLight`, `gctuGoldDark`)
- These will be used for accent elements across the student app

#### [MODIFY] [scanner.tsx](file:///c:/Users/jerry/Desktop/Attendance%20system/student%20app/app/scanner.tsx)
- Update error message from "This QR code is not from Smart Attendance" → "This QR code is not from GCTU Smart Attendance"

---

## Visual Identity Guide (Applied Across Both Apps)

| Element | Before | After |
|---------|--------|-------|
| App Title | "Smart Attendance System" | "GCTU Smart Attendance System" |
| Institution Name | _(none)_ | "Ghana Communication Technology University" |
| Faculty Reference | _(none)_ | "Faculty of Computing & Information Systems" |
| Logo Icon | Generic blue checkmark | University shield icon + gold accent |
| Accent Color | Blue only | Blue (primary) + Gold (accent/highlights) |
| Version String | "CORE-SCAN v1.0.0" / "SmartAttend v1.0.0" | "GCTU Smart Attendance v1.0.0" |
| Student ID Format | Generic | GCTU format (421XXXXXXX) |
| Staff ID Format | Generic (CS-101) | GCTU format (GCTU-2024-XXX) |

---

## Open Questions

> [!IMPORTANT]
> **Do you have a GCTU crest/logo image file (PNG or SVG)?** If yes, I can embed the actual university crest in both apps. If not, I'll use a styled university shield icon (🏛️/graduation-cap) with "GCTU" text as the logo representation.

> [!NOTE]
> The color changes are **additive** — I'm keeping the existing blue palette and adding gold as an accent. This means the overall dark/light theme system you have will remain intact, with gold highlights for GCTU-specific branding elements only.

## Verification Plan

### Manual Verification
- Run the lecturer app with `npm run dev` and visually verify:
  - Login, Register pages show GCTU branding
  - Sidebar displays GCTU logo area
  - Dashboard and Settings show institutional identity
- Check the student app source changes for correct GCTU references
- Ensure no "CORE-SCAN" or generic "Smart Attendance System" (without GCTU) text remains
