# Water Reminder App - UI/UX Design Specification

**Date:** 2026-04-28
**Status:** Approved
**Target Device:** iPhone 14 Pro (393×852px) as primary

---

## Overview

A water reminder application with focus on mobile portrait mode interaction efficiency. The design uses a "liquid glass" visual style with water level visualization as the primary progress indicator. The cup count and add button are visually centered on the screen.

---

## Unified Design Language

All devices and layouts share the same visual design language:

### Liquid Glass Effect

All containers, cards, and panels use the liquid glass effect:

```css
background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%);
backdrop-filter: blur(20px);
border: 1px solid rgba(0,0,0,0.06);
box-shadow: 0 4px 20px rgba(0,0,0,0.1);
```

### Self-Glow Buttons

Primary action buttons have a self-glow effect:

```css
box-shadow: 0 0 24px rgba(0,102,255,0.5);
```

### Color Palette

| Element | Color |
|---------|-------|
| Primary accent | `#0066ff` |
| Water gradient top | `rgba(77, 166, 255, 0.5)` |
| Water gradient mid | `rgba(0, 102, 204, 0.6)` |
| Water gradient bottom | `rgba(0, 61, 122, 0.7)` |
| Success indicator | `#4caf50` |
| Secondary text | `#666` |
| Tertiary text | `#999` |

### Typography

- **Font:** 梦源黑体 (Dream Source Han Sans)
- **Main number:** font-weight: 200 (ultra-light)

---

## Unified Interaction Logic

### Tab Bar Behavior

- **Always centered** regardless of side buttons
- Side buttons use `position: absolute` to avoid affecting Tab bar position
- On page switch: Tab bar transforms to back button (300ms ease-out animation)

### Menu Button States

| Button | Normal State | Expanded State |
|--------|--------------|----------------|
| View button (日/周/月) | Shows current view text | Shows × (close icon) with glow |
| Menu button (•••) | Shows three vertical dots | Shows × (close icon) with glow |

**Interaction flow:**
1. User taps button → popup appears above button
2. Button transforms to × with self-glow effect
3. User taps × or outside popup → popup dismisses
4. Button returns to normal state

### Add Water Animation

- Number bounce: 0.3s spring animation
- Water level rise: 1.2s ease-out
- Ripple effect: 2s ease-out

### Split Layout Rules (Width ≥ 600px)

- **Left 50%:** Main card (water level + add button), always visible
- **Right 50%:** Function panel (History/Settings/Statistics)
- **On secondary page:** Left card becomes semi-transparent (opacity: 0.7)
- **Tab behavior:** Tab bar replaced by back button in function panel

---

## Dynamic Calculations

| Property | Formula |
|----------|---------|
| Water level height | `(currentCups / targetCups) × containerHeight` |
| Tab bar width | `min(screenWidth × 0.4, 160px)` |
| Button spacing | `screenWidth × 0.05` |
| Font scaling | `baseSize × (screenWidth / 393)` |

---

## Mobile Portrait Mode (Primary)

### Navigation Structure

**Two-tab navigation:**
- 主页 (Home) - Water level display + add button
- 历史 (History) - Daily records with date navigation

**Bottom bar layout:**
- **Tab bar** - Always centered horizontally
- **View switching button** (left) - 日/周/月 toggle, only visible on History tab
- **Menu button** (right) - Three vertical dots, popup shows 设置/关于

### Main Page (主页)

```
┌─────────────────────────┐
│                         │
│   ~~~~~~ water ~~~~~~   │
│   ~~~~~~ level ~~~~~~   │
│                         │
│        5 / 8杯          │  ← Vertically centered
│          [+]            │  ← Below number
│                         │
│                         │
│  [日] [主页|历史] [•••] │  ← Tab centered, buttons on sides
└─────────────────────────┘
```

**Elements:**
- Cup count and add button: **Visually centered** on screen
- Large number display: `font-size: 64px; font-weight: 200`
- Add button: 64px diameter circle with self-glow effect
- Water level: `(currentCups / targetCups) × 100%` height, gradient fill with wave SVG
- Bottom bar: Tab bar centered, view button on left (hidden on main page), menu button on right

### History Page (历史)

```
┌─────────────────────────┐
│   [<]  4月17日  [>]     │
│                         │
│   09:30      +1杯       │
│   11:45      +1杯       │
│   14:20      +1杯       │
│   16:05      +1杯       │
│                         │
│                         │
│  [日] [主页|历史] [•••] │
└─────────────────────────┘
```

**Elements:**
- Date navigation: Left/right arrows with current date
- Record list: Time + amount
- View switching button visible (日/周/月)
- Tab bar remains centered

### View Switching Popup

When tapping the view button (日):
- Popup appears above the button
- Options: 日视图, 周视图, 月视图
- Selected option highlighted with blue background
- Size: ~100×120px
- View button transforms to × (close)

### Menu Popup

When tapping the menu button (•••):
- Popup appears above the button, aligned right
- Options: 设置, 关于
- Menu button transforms to × (close)
- Tapping outside dismisses the popup

---

## Watch UI (Apple Watch: 368×448px)

### Round Watch (184×184px display area)

- Circular display with liquid glass background
- Number: `font-size: 28px`
- Add button: 36px diameter
- Navigation: Swipe left/right to access menu
- Menu button: Three horizontal dots at top-right

### Square Watch (184×224px)

- Display with 16px border-radius
- Liquid glass background
- Number: `font-size: 24px`
- Add button: 32px diameter
- Menu button: Top-right corner, transforms to × when expanded

---

## Mobile Landscape Mode (932×430px)

**Layout:** Two equal-width columns (50/50 split)

- **Left:** Main card (water level + add button) with liquid glass effect
- **Right:** History panel with liquid glass effect + Tab bar
- **Tab bar:** Centered in right panel, menu button on right side

**Advantage:** Both progress and history visible simultaneously

---

## Foldable/Tablet (iPad Mini: 744×1133px)

**Layout:** Two equal-width columns (50/50 split)

- **Left:** Main card (water level + add button) with liquid glass effect
- **Right:** Function panel (history/settings/stats) with liquid glass effect + Tab bar

**Tab bar:** Three tabs - 主页, 历史, 统计

---

## Component Specifications

| Component | Phone Portrait | Phone Landscape | Tablet |
|-----------|----------------|-----------------|--------|
| Main number | 64px | 48px | 96px |
| Add button | 64px diameter | 48px diameter | 96px diameter |
| Tab bar | 120×40px | 100×32px | 180×48px |
| View/Menu buttons | 44px diameter | 36px diameter | 56px diameter |
| Tab bar position | Bottom 24px | Bottom 16px | Bottom 24px |

---

## Animation Specifications

| Animation | Duration | Easing |
|-----------|----------|--------|
| Water level rise | 1.2s | ease-out |
| Number bounce | 0.3s | spring |
| Tab switch | 0.2s | ease-out |
| Ripple effect | 2s | ease-out |
| Tab → Back button | 0.3s | ease-out |

---

## Screen Safe Areas

| Device | Top Safe Area | Bottom Safe Area | Left/Right |
|--------|---------------|------------------|------------|
| iPhone 14 Pro | 47px (notch) | 34px (home indicator) | 0px |
| iPhone SE | 20px | 0px | 0px |
| iPad Mini | 20px | 20px | 24px |
| Android | 24px (status bar) | 0px | 0px |

**Implementation:**
- Use CSS `env(safe-area-inset-*)` for dynamic safe area handling
- Tab bar and buttons should respect bottom safe area
- Content should not be obscured by notch or home indicator

---

## Verification

1. Run `pnpm dev` to start development server
2. Test on mobile viewport (393×852px)
3. Verify:
   - All containers use liquid glass effect
   - Cup count and add button are visually centered
   - Tab bar remains centered when buttons appear/disappear
   - View button only shows on History tab
   - Menu popup appears on right side
   - Menu buttons transform to × when popup is open
   - Water level animates on add
   - Date navigation works in History
   - Split layout works on landscape and tablet

---

## Widget Design (小组件)

### Widget Sizes

| Size | Dimensions | Main Number | Add Button | Features |
|------|------------|-------------|------------|----------|
| Small (2×2) | 140×140px | 36px | None | Water level + count |
| Medium (2×4) | 140×280px | 48px | 40px diameter | Water level + count + add |
| Large (4×4) | 280×280px | 56px | 48px diameter | Water level + count + add + progress bar |
| Dynamic Island | 200×44px (expanded) | 14px | 28px diameter | Compact inline display |

### Widget Visual Design

All widgets use the same liquid glass effect:

```css
background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%);
backdrop-filter: blur(20px);
border: 1px solid rgba(0,0,0,0.06);
box-shadow: 0 4px 20px rgba(0,0,0,0.1);
```

### Widget Interactions

| Action | Behavior |
|--------|----------|
| Tap widget | Open main app |
| Tap + button | Add one cup directly (no app open) |
| Long press widget | Enter edit mode, adjust target |
| Water animation | Smooth rise (1.2s ease-out) |
| Goal reached | Celebration animation |

### Dynamic Island States

- **Collapsed:** 44×44px circular icon with water drop
- **Expanded:** 200×44px showing count and quick add button
- **Transition:** Smooth expand/collapse animation (300ms)

---

## Files to Modify

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main component with navigation state |
| `src/index.css` | Liquid glass styles, animations |
| `src/components/WaterLevel.tsx` | Water visualization component |
| `src/components/BottomBar.tsx` | Tab bar + view/menu buttons |
| `src/components/HistoryPage.tsx` | History with date navigation |
| `src/components/SettingsPage.tsx` | Settings page |
| `src/widgets/` | Widget components for iOS/Android |
