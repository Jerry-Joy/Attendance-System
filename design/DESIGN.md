---
name: Academic Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76767f'
  outline-variant: '#c6c6cf'
  surface-tint: '#515d82'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0c1a3b'
  on-primary-container: '#7783aa'
  inverse-primary: '#b9c5ef'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#fdbb25'
  on-secondary-container: '#6c4d00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001849'
  on-tertiary-container: '#6b82c3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b9c5ef'
  on-primary-fixed: '#0c1a3b'
  on-primary-fixed-variant: '#3a4669'
  secondary-fixed: '#ffdea6'
  secondary-fixed-dim: '#fdbb25'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#dae1ff'
  tertiary-fixed-dim: '#b3c5ff'
  on-tertiary-fixed: '#001849'
  on-tertiary-fixed-variant: '#2c4481'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.08em
  stat-value:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for the GCTU Smart Attendance System, targeting an academic environment that demands both institutional authority and modern efficiency. The brand personality is **Professional, Systematic, and Trustworthy**, ensuring that lecturers and administrators feel a sense of data integrity and reliability.

The design style is **Corporate / Modern** with a focus on data density and high-contrast navigation. It utilizes a structural "Command Center" approach where the dark sidebar provides a grounded anchor for the information-rich content area. Visual hierarchy is established through clear typographic weighting and the strategic use of Gold to highlight critical actions, ensuring the interface remains functional during the fast-paced nature of classroom management.

## Colors

The palette is rooted in GCTU’s institutional identity. 

- **Navy Blue (#081637)** is the primary structural color, used for the sidebar, header text, and high-level navigation to project authority.
- **Secondary Blue (#0D2A66)** provides depth within the navigation and serves as a subtle background for secondary UI elements.
- **Gold (#F5B41C)** is reserved strictly for Primary Call-to-Actions (CTAs), key metrics, and brand accents, ensuring they stand out against the blue and white backdrop.
- **Background (#FFFFFF)** and a light neutral wash (#F8FAFC) maintain a clean, airy workspace for data-heavy tables and charts.

## Typography

This design system uses a tri-font strategy to balance modernity with technical precision. 

**Hanken Grotesk** is used for headlines and primary metrics; its sharp, contemporary geometry reflects a forward-thinking university. **Inter** handles the bulk of body text and interface elements, providing exceptional legibility in data-dense environments. **JetBrains Mono** is utilized for metadata, blockchain IDs, and system statuses, emphasizing the technical "Smart" nature of the attendance system. 

For mobile, `headline-lg` scales down to 24px (`headline-md` equivalent) to prevent title wrapping on small screens.

## Layout & Spacing

The system employs a **Fixed Grid** on desktop (12 columns) and a **Fluid Grid** on mobile. The sidebar is fixed at 260px, while the main content area utilizes a responsive container with a maximum width of 1440px to ensure data visualizations remain readable on ultra-wide monitors.

A 4px baseline grid ensures vertical rhythm. Data cards and tables use "Comfortable" padding (24px) on desktop, which compacts to "Dense" (16px) on mobile. Tables use a strict row-based layout with horizontal dividers to manage complex information without visual clutter.

## Elevation & Depth

This design system avoids heavy skeuomorphism in favor of **Tonal Layers** and crisp, low-opacity shadows. 

1.  **Level 0 (Base):** Background color (#FFFFFF/Neutral).
2.  **Level 1 (Cards):** Surface color with a 1px border (#E2E8F0) and a very soft ambient shadow (0px 4px 12px rgba(8, 22, 55, 0.05)).
3.  **Level 2 (Modals/Popovers):** Surface color with a more pronounced shadow (0px 12px 24px rgba(8, 22, 55, 0.12)) to lift the element above the interface.

Navigation elements (sidebar) use color-based depth (Navy Blue) rather than shadows to define their boundaries.

## Shapes

The shape language is **Soft**, using a 4px (0.25rem) base radius. This provides a professional, "software-tool" feel that is more approachable than sharp corners but more serious than highly rounded "consumer" apps. 

- **Small Components (Buttons, Inputs):** 4px.
- **Medium Components (Cards, Modals):** 8px.
- **Navigation Indicators:** 4px or pill-shaped for active states.

## Components

### Buttons
- **Primary:** Gold (#F5B41C) background, Navy Blue (#081637) text. Use Hanken Grotesk Bold. Hover state shifts to Dark Gold (#CAA10B).
- **Secondary:** Navy Blue background, White text.
- **Ghost:** Transparent background, Navy Blue border and text.

### Inputs
- Backgrounds are slightly tinted (#F8FAFC) with a 1px border (#CBD5E1). 
- On focus, the border transitions to Primary Navy with a 2px outer glow.
- Labels use the `label-caps` style for clear field identification.

### Metrics & Cards
- Large "Stat Value" typography for primary numbers.
- Integrated icons in the top right of cards, using semi-transparent Navy or Gold backgrounds.
- Attendance progress bars use Success Green (#10B981) or Error Red (#EF4444) based on thresholds.

### Data Tables
- Row headers use `label-caps` typography with a light Navy tint (#F1F5F9).
- Alternate rows have no striping; use thin 1px dividers to maintain a minimalist aesthetic.
- Status chips (e.g., "Online", "Synced") use pill shapes with high-contrast text and low-opacity background fills.