# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
