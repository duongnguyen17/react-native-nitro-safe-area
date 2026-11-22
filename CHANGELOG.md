# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-11-22

### 🛡️ Fixed & Hardened
- **Modal-Immune Safe Area & Header Isolation (iOS & iPadOS)**:
  - Implemented 4-layer modal defense engine in `ios/NitroSafeArea.swift` protecting against `presentation: 'formSheet'`, `pageSheet`, `popover`, date pickers, alerts, and custom modal dialogs.
  - Isolated `findBaseNavigationController` and `getBaseTopViewController` to traverse only the core application hierarchy, ignoring presented view controllers unless they are full-screen modals.
  - Added strict geometric validation filters (`isFullWidth` and `isAnchoredAtTop`) to reject floating and non-anchored modal navigation bars (e.g., iPad 540pt cards or iPhone sliding sheets).
  - Added transition state guard (`!isBeingPresented && !isBeingDismissed`) preventing fluctuating header height metrics during modal animations.
  - Fixed `isModalPresentedOverTabs` so non-fullscreen modal sheets do not falsely collapse native bottom tabs or iPad top capsule navigation insets.
- **iPadOS 18 Adaptive Top Capsule Stability**:
  - Replaced `nav.visibleViewController` with `nav.topViewController` across all hierarchy traversals so floating modals never hijack the TabBar Controller reference.
  - Locked iPadOS 18 collapsed sidebar mode to `.ipadTopCapsule`, removing the legacy fallback that falsely classified the bottom-anchored UIKit tab bar frame as `.iphoneBottomTab`.
  - Bound top capsule height directly to `tabVC.selectedViewController?.view.safeAreaInsets.top` with safe `windowInsets.top + 64.0pt` fallback, eliminating the 64pt background shift caused by modal view controllers reporting 0pt top safe area insets.

### 🚀 Demo
- Added native `FormSheet` demo screen (`FormSheetScreen.tsx`) in the example app to demonstrate safe area isolation under `presentation: 'formSheet'` with custom detents and live metric inspection.

## [0.1.1] - 2026-11-21

### 🚀 Added
- **🧭 Native Stack Header & Navigation Bar Synchronization**:
  - Synchronous Frame 0 pre-computation and live runtime tracking of Native Navigation Bar and Header heights across iOS and Android.
  - Added new fields to `SafeAreaMetrics`: `headerHeight`, `navBarHeight`, and `largeTitleNavBarHeight`.
  - Added synchronous JSI getters: `getHeaderHeight()`, `getNavBarHeight()`, `getLargeTitleNavBarHeight()`.
  - Added React hooks powered by `useSyncExternalStore`: `useHeaderHeight()`, `useNavBarHeight()`, `useLargeTitleNavBarHeight()`.

- **🎨 Uniwind & Tailwind CSS v4 Header Utilities**:
  - Synchronous push into Uniwind via `Uniwind.updateNitroHeader(headerHeight, navBarHeight, largeTitleNavBarHeight)` and CSS environment variables:
    - `env(nitro-header-height)`
    - `env(nitro-nav-bar-height)`
    - `env(nitro-large-title-nav-bar-height)`
  - Full family of Tailwind CSS v4 utility classes:
    - **Header utilities**: `pt-header`, `pt-header-offset-*`, `pt-header-or-*`, `h-header`, `min-h-header`, `max-h-header`, `top-header`, `mt-header`.
    - **Navigation Bar utilities**: `pt-nav-bar`, `pt-nav-bar-offset-*`, `pt-nav-bar-or-*`, `h-nav-bar`, `min-h-nav-bar`, `max-h-nav-bar`, `top-nav-bar`, `mt-nav-bar`.
    - **Large Title utilities**: `pt-large-title-nav-bar`, `h-large-title-nav-bar`, `top-large-title-nav-bar`.

### ⚡ Changed & Fixed
- **iOS (`ios/NitroSafeArea.swift`)**:
  - **Runtime Live Measurement**: Inspects `UINavigationBar` when active and computes exact bottom edge via `bar.convert(bar.bounds, to: window).maxY`, ensuring pixel-perfect alignment.
  - **Landscape Modern iPhone (Dynamic Island) Ground-Truth**: Fixed content overlap in landscape orientation where `windowInsets.top == 0.0pt`. UIKit on modern iOS enforces a 24.0pt top padding (`_minimumTopPaddingWithTraitCollection:parentView:`), resulting in an actual header bottom edge of 78.0pt ($24.0\text{pt} + 54.0\text{pt}$). Added `intrinsicTopOffset: 24.0pt` Frame 0 pre-computation for modern iPhones in landscape.
  - Support for legacy iPhone portrait (44pt) / landscape (32pt) and iPadOS (50pt) navigation bar metrics.
- **Android (`android/.../NitroSafeArea.kt`)**:
  - Non-invasive resolution of `?attr/actionBarSize` via Android Theme attributes (56dp portrait, 48dp landscape, 64dp tablet), pre-computing `headerHeight = topDp + navBarHeight` at Frame 0.
- **Demo & Documentation**:
  - Updated example app with full-bleed transparent header demo under `headerTransparent: true` and `headerShadowVisible: false`.
  - Updated `README.md` and `docs/uniwind-patch.md` with complete header utility reference.

## [0.1.0] - 2026-11-21

### 🚀 Initial Release

The ultra-high-performance, zero-frame-latency Safe Area & Adaptive Navigation Insets library for React Native built with **Nitro Modules**.

#### Key Capabilities
- **⚡ Zero-Latency Synchronous JSI Insets**: Direct memory read of hardware and content safe area insets at Frame 0, completely eliminating the 1-2 frame cold launch layout shift/flash common in asynchronous bridge libraries.
- **📱 Dual-Platform Native Bottom Tab Auto-Detection**:
  - **iOS**: Real-time inspection of `UITabBarController.tabBar` frame and visibility, adjusting `contentInsets.bottom` (~83pt).
  - **Android**: Automatic view hierarchy search for `BottomNavigationView` / `NavigationBarView`, dynamically compensating `contentInsets.bottom` (~104pt).
  - **JS Tabs**: Seamlessly preserves system safe area (24pt) when using standard Flexbox tabs (e.g. `@react-navigation/bottom-tabs`) to prevent double padding.
- **📐 Dual-Insets Architecture**:
  - `insets`: Physical hardware display insets (Notch, Dynamic Island, Home Bar, Camera Punch Holes).
  - `contentInsets`: Semantic insets adjusted for active navigation Chrome (Bottom Tabs, iPad Sidebar, Top Capsule).
- **📑 iPadOS 18 Adaptive Navigation**:
  - Full support for **Top Floating Capsule** (~88pt) in portrait and **Leftside Sidebar** (~320pt) in landscape.
  - Native JSI pre-seeding (`setAdaptiveNavigationEnabled`) to ensure zero-shift cold launch layout before React Navigation mounts.
- **📷 Camera Cutouts & Symmetrical Gutters**:
  - **Android**: Hardware-accurate landscape display cutout detection via `WindowInsetsCompat.Type.displayCutout()`.
  - **iOS**: Adherence to Apple's **Symmetrical Gutter Principle** on iPhone Pro devices.
- **🎨 Uniwind & Tailwind CSS v4 Dual-Mode Integration**:
  - Synchronous Frame 0 push into Uniwind runtime via `syncWithUniwind(Uniwind)`.
  - Dual-mode utility classes:
    - Standard utilities (`pt-safe-offset-*`, `pb-safe-offset-*`, `px-safe-offset-*`) for physical window insets.
    - Nitro utilities (`pt-nitro-safe-offset-*`, `pb-nitro-safe-offset-*`, `px-nitro-safe-offset-*`) for navigation content insets.
  - Included production-ready patch file for Uniwind (`patches/uniwind+1.14.0.patch`).
- **🔄 30ms Event Coalescing**:
  - Atomic debouncing for rapid hardware orientation, window bounds, and layout changes, preventing redundant React renders.
- **🛡️ Enterprise Memory & Thread Safety**:
  - Zero memory leaks with `WeakReference` on Android and complete KVO token teardown in Swift `deinit`.
  - Thread-safe native locking with `NSLock` on iOS and `@Volatile` / synchronization on Android.
