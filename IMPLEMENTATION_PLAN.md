# Implementation Plan: Map Features for Start Session & Session Summary

## Overview

Two features to add interactive maps to the lecturer web app:

1. **Start Session page** — Show the lecturer's live GPS position on a map with an animated geofence circle that responds to the radius slider.
2. **Session Summary page** — Make the GPS status column clickable; clicking opens a modal with a map showing the student's location at check-in time relative to the session geofence.

**Map library:** [React Leaflet](https://react-leaflet.js.org/) + [Leaflet](https://leafletjs.com/) — free, no API key, uses OpenStreetMap tiles.

---

## Feature 1: Interactive Map on Start Session Page

### What changes

**File: `lecturer-app/package.json`**
- Install `leaflet`, `react-leaflet`, and `@types/leaflet`

**File: `lecturer-app/src/pages/CreateSession.tsx`**
- Replace the static "Location Coordinates" text input with an interactive map panel
- The map auto-centers on the lecturer's GPS coordinates once locked
- A `Circle` overlay renders the geofence radius around the lecturer's pin
- When the radius slider value changes, the circle smoothly animates to the new size (CSS transition on the circle radius)
- While GPS is acquiring, show a loading/skeleton state in the map area
- On GPS error, show the error message inside the map area with a retry button

### Layout change

Current layout: left panel (info) + right panel (form with 2 columns).

New layout: The right form panel becomes a **3-row layout**:
1. **Row 1 (top):** Course selection + Session length (side by side, same as current)
2. **Row 2 (middle):** Interactive map taking full width, ~300px height, showing lecturer pin + animated geofence circle. Below the map: the radius slider (so the lecturer sees the circle react as they drag)
3. **Row 3 (bottom):** Attendance checks + action buttons

### Map component

Create: `lecturer-app/src/components/GeofenceMap.tsx`

Props:
```ts
interface GeofenceMapProps {
  latitude: number | null;
  longitude: number | null;
  radius: number;           // in meters
  gpsStatus: 'idle' | 'acquiring' | 'locked' | 'error';
  gpsError?: string | null;
  onRetry?: () => void;
}
```

Behavior:
- When `gpsStatus` is `'acquiring'`: show a pulsing skeleton/placeholder with "Acquiring GPS..." text
- When `gpsStatus` is `'locked'`: render the Leaflet map centered on `[latitude, longitude]` with:
  - A marker pin for the lecturer's position
  - A `Circle` component with `radius` prop (meters), styled with a semi-transparent fill (using the project's gold `#F5B41C` color) and a dashed border
  - The circle transitions smoothly when `radius` changes (Leaflet's `Circle` supports `setRadius()` — we animate via `useEffect` with requestAnimationFrame or CSS transition)
- When `gpsStatus` is `'error'`: show error message + retry button inside the map area
- Map is non-interactive for pan/zoom by default (locked to lecturer position), but could allow zoom

### Leaflet CSS

Import Leaflet's CSS in the component or in `main.tsx`:
```ts
import 'leaflet/dist/leaflet.css';
```

Fix the default marker icon issue (Leaflet + bundlers) by setting the icon explicitly.

---

## Feature 2: Student Location Modal on Session Summary Page

### Backend changes (required first)

The student's raw GPS coordinates are currently **discarded** after computing the haversine distance. We need to persist them.

#### Step 2a: Prisma schema migration

**File: `backend/prisma/schema.prisma`**

Add three fields to the `Attendance` model:
```prisma
model Attendance {
  // ... existing fields ...
  studentLatitude  Float?
  studentLongitude Float?
  studentAccuracy  Float?
}
```

Run: `npx prisma migrate dev --name add-student-location-to-attendance`

#### Step 2b: Backend attendance service

**File: `backend/src/attendance/attendance.service.ts`**

In the `mark()` method, update the `prisma.attendance.create()` call to include:
```ts
studentLatitude: dto.latitude,
studentLongitude: dto.longitude,
studentAccuracy: dto.accuracy,
```

The DTO (`mark-attendance.dto.ts`) already accepts `latitude`, `longitude`, and `accuracy` — no DTO changes needed.

#### Step 2c: Backend API response

Ensure the attendance query endpoints (used by Session Summary) include the new fields in their `select`/response. Check:
- `getSessionAttendance()` or equivalent method that returns attendance records for a session
- Make sure `studentLatitude`, `studentLongitude`, and `distance` are returned

### Frontend changes

#### Step 2d: Update types

**File: `lecturer-app/src/types/index.ts`**

Add to `AttendingStudent`:
```ts
export interface AttendingStudent {
  // ... existing fields ...
  studentLatitude?: number | null;
  studentLongitude?: number | null;
  distance?: number | null;
}
```

#### Step 2e: Update API mapper

**File: `lecturer-app/src/lib/api.ts`**

Update `mapAttendance()` to include:
```ts
studentLatitude: a.studentLatitude ?? null,
studentLongitude: a.studentLongitude ?? null,
distance: a.distance ?? null,
```

Also update the `BackendAttendanceRecord` type to include `studentLatitude`, `studentLongitude`, and `studentAccuracy`.

#### Step 2f: Student Location Modal component

Create: `lecturer-app/src/components/StudentLocationModal.tsx`

Props:
```ts
interface StudentLocationModalProps {
  open: boolean;
  onClose: () => void;
  student: AttendingStudent;
  sessionLatitude: number;
  sessionLongitude: number;
  geofenceRadius: number;
}
```

UI:
- A centered modal overlay with backdrop blur
- Header: student name + index number
- Map (same Leaflet setup) showing:
  - **Lecturer/session pin** (gold `#F5B41C`) at session coordinates
  - **Geofence circle** (semi-transparent gold) at session coordinates with the session's radius
  - **Student pin** (different color — navy `#1a2332` or green) at the student's lat/lng
  - A line or visual indicator of distance between the two points
- Below the map: metadata row showing distance (from `distance` field), time of check-in, and GPS verified status
- Close button (X) in the top-right corner
- Click outside to dismiss

#### Step 2g: Update Session Summary page

**File: `lecturer-app/src/pages/SessionSummary.tsx`**

Changes to the attendance log table:
- The Status column currently shows "QR + GPS" text. Change to a clickable **"GPS" badge/button** styled as a pill
- On click, open `StudentLocationModal` with that student's data
- Need to pass `sessionLatitude`, `sessionLongitude`, and `geofenceRadius` from the session data to the modal — these are already available in the session/summary state
- If a student has no stored coordinates (records from before the migration), the GPS badge shows as non-clickable/disabled with a tooltip "Location data not available"

### Session data for the modal

The modal needs the session's lat/lng and geofence radius. Check that these are available in the `SessionSummary` page state. Currently `SessionSummaryType` has `geofenceRadius` but may not have `latitude`/`longitude`. If missing:

**File: `lecturer-app/src/types/index.ts`**

Add to `SessionSummaryType`:
```ts
latitude?: number;
longitude?: number;
```

And ensure the backend returns these when fetching session details.

---

## Implementation Order

| Step | Description | Files touched |
|------|-------------|--------------|
| 1 | Install `leaflet`, `react-leaflet`, `@types/leaflet` | `lecturer-app/package.json` |
| 2 | Create `GeofenceMap` component | `lecturer-app/src/components/GeofenceMap.tsx` |
| 3 | Redesign `CreateSession` page to embed the map | `lecturer-app/src/pages/CreateSession.tsx` |
| 4 | Test Feature 1 in browser | — |
| 5 | Add student location fields to Prisma schema + migrate | `backend/prisma/schema.prisma` |
| 6 | Update backend service to persist student lat/lng | `backend/src/attendance/attendance.service.ts` |
| 7 | Ensure backend API returns student coordinates | Backend attendance controller/service |
| 8 | Update frontend types + API mapper | `lecturer-app/src/types/index.ts`, `lecturer-app/src/lib/api.ts` |
| 9 | Create `StudentLocationModal` component | `lecturer-app/src/components/StudentLocationModal.tsx` |
| 10 | Update `SessionSummary` page with clickable GPS badge + modal | `lecturer-app/src/pages/SessionSummary.tsx` |
| 11 | Test Feature 2 end-to-end | — |

---

## Dependencies

- **leaflet** ~1.9 — map rendering engine
- **react-leaflet** ~4.2 — React bindings for Leaflet
- **@types/leaflet** — TypeScript definitions

No paid API keys required. OpenStreetMap tiles are free for reasonable usage.

---

## Notes

- The `motion` library (Framer Motion) is already installed and can be used for modal enter/exit animations and any supplementary UI animations
- The project's color scheme: navy `#081637` / `#1a2332`, gold `#F5B41C`, used consistently
- Existing GPS capture logic in `CreateSession` remains unchanged — we're only adding the map visualization on top of it
- Old attendance records (before migration) will have `null` for `studentLatitude`/`studentLongitude` — the modal handles this gracefully by showing a disabled state
