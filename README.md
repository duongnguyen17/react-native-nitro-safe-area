# @2security/nitro-safe-area

[![npm version](https://badge.fury.io/js/@2security%2Fnitro-safe-area.svg)](https://www.npmjs.com/package/@2security/nitro-safe-area)
[![npm downloads](https://img.shields.io/npm/dm/@2security%2Fnitro-safe-area.svg)](https://www.npmjs.com/package/@2security/nitro-safe-area)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An ultra-high-performance, **zero-frame-latency** Safe Area & Adaptive Navigation Insets library for React Native built with **Nitro Modules**. Delivers synchronous C++/JSI insets lookup, automatic native bottom tab detection across iOS and Android, iPadOS 18 adaptive navigation (Leftside Sidebar & Top Floating Capsule), and seamless Uniwind / Tailwind CSS v4 variable synchronization by synchronously querying native layout insets at startup.

---

## ⚡ Why @2security/nitro-safe-area?

### The 1-Frame Layout Shift Problem

Traditional safe area libraries (such as `react-native-safe-area-context`) rely on asynchronous native view events over the React Native bridge:
1. When your app launches, safe area insets default to `0px` for the first 1–2 frames.
2. The UI renders flush against the top/bottom hardware borders.
3. Once the asynchronous bridge message resolves, state updates to the real insets (e.g. `59px`), triggering an ugly, visible layout shift or white flash.
4. When combined with Tailwind CSS or Uniwind utilities, this causes elements to jump down abruptly.

```
Traditional Safe Area (Async Bridge):
App Cold Launch ──> React Mount (Insets: 0px) ──> [Async Bridge Delay] ──> State Update (59px) ──> ⚠️ 1-Frame Jump / Flash!

@2security/nitro-safe-area (Nitro JSI):
App Cold Launch ──> Synchronous JSI Memory Read (Insets: 59px at 0ms) ──> Mount ──> ⚡ Frame 0 Pixel-Perfect!
```

---

## ✨ Features

- ⚡ **Zero Frame Shift (0ms JSI Sync)**: Direct synchronous memory lookup via JSI. Read hardware and content insets at Frame 0 or inside module scope, Zustand stores, or Redux reducers.
- 📱 **Dual-Platform Native Bottom Tab Auto-Detection**:
  - **iOS**: Inspects `UITabBarController`, adding native tab bar height to `contentInsets.bottom`.
  - **Android**: Automatically detects `BottomNavigationView` / `NavigationBarView` in the view hierarchy, dynamically adjusting `contentInsets.bottom` (~104pt) so content is never covered by the overlay tab bar.
  - **JS Tabs**: When using standard Flexbox tabs (e.g. `@react-navigation/bottom-tabs`), preserves system safe area (24pt) to prevent double padding.
- 📐 **True Content Insets vs Window Insets**:
  - `insets`: Pure physical hardware display insets (Notch, Dynamic Island, Home Bar, Camera Punch Holes).
  - `contentInsets`: Semantic insets adjusted for active navigation Chrome (Bottom Tabs, iPad Sidebar, Top Capsule).
- 📑 **iPadOS 18 Adaptive Navigation**: Real-time detection and transitions between **Leftside Sidebar** (~320pt) and **Top Floating Capsule** (~88pt) with cold-start Frame 0 prediction via `UserDefaults`.
- 📷 **Edge-to-Edge & Camera Cutout Precision**:
  - **Android**: Extracts `WindowInsetsCompat.Type.displayCutout()` non-invasively so landscape punch holes are properly padded (`Left Inset = 54.1pt`).
  - **iOS**: Adheres to Apple's **Symmetrical Gutter Principle** (`Left Inset == Right Inset == 62.0pt` on iPhone 16/18 Pro) for visual balance and muscle memory.
- 🎨 **Uniwind & Tailwind CSS v4 First-Class**: Synchronously pushes insets into Uniwind's runtime store at Frame 0 via `syncWithUniwind(Uniwind)`. All utility classes (`pt-safe`, `pb-safe`, `px-safe-offset-5`, `pb-safe-offset-5`) work out of the box with zero component wrappers.
- 🔄 **30ms Event Coalescing (Debounce)**: Coalesces rapid sequential hardware rotation events (orientation -> window bounds -> layoutSubviews) into a single atomic JavaScript update, eliminating redundant re-renders.
- 🛡️ **Leak-Free Enterprise Architecture**:
  - **Android**: `WeakReference<Activity>`, `ComponentCallbacks2` unregistration on `onHostDestroy()`, with persistent `LifecycleEventListener` on `ReactApplicationContext` to re-bind on Activity recreation.
  - **iOS**: Weak references for all observed UIViews and complete KVO token invalidation in `deinit`.
  - **Multi-threaded Safety**: `@Volatile` variables in Kotlin, `NSLock` and `DispatchQueue.main.sync` with `Thread.isMainThread` guard in Swift.

---

## 📦 Installation

```sh
npm install @2security/nitro-safe-area react-native-nitro-modules
# or
yarn add @2security/nitro-safe-area react-native-nitro-modules
```

> **Note:** Requires React Native New Architecture (Bridgeless / Fabric). Built on top of [Nitro Modules](https://nitro.margelo.com/).

### Expo Usage

This library contains native Swift and Kotlin code and requires [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/):

```sh
npx expo install @2security/nitro-safe-area react-native-nitro-modules
npx expo run:ios
npx expo run:android
```

---

## 🚀 Usage Recipes & Solutions

### 1. Synchronous Instant Read (Outside React Components)

You can query safe area metrics synchronously at 0ms anywhere—even outside the React component lifecycle:

```typescript
import { getSafeArea, getContentInsets, getWindowInsets } from '@2security/nitro-safe-area';

// Direct synchronous read via JSI (0ms latency)
const metrics = getSafeArea();

console.log('Mode:', metrics.mode); // 'iphone_bottom_tab' | 'ipad_top_capsule' | 'ipad_left_sidebar' | 'none'
console.log('Content Insets:', metrics.contentInsets); // { top: 54, left: 0, bottom: 104.4, right: 0 }
console.log('Hardware Window Insets:', metrics.insets); // { top: 54, left: 0, bottom: 24, right: 0 }
console.log('Orientation:', metrics.orientation); // 'portrait' | 'landscape'
```

---

### 2. High-Performance React Hooks (`useSyncExternalStore`)

Hooks are powered by React Core's `useSyncExternalStore` with snapshot memoization. If non-relevant metrics change (e.g. orientation changes but content insets stay identical), React **completely skips re-rendering**:

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaMetrics, useContentInsets } from '@2security/nitro-safe-area';

export const ScreenHeader = () => {
  const insets = useContentInsets();
  const { mode, orientation } = useSafeAreaMetrics();

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Text>Mode: {mode}</Text>
      <Text>Orientation: {orientation}</Text>
    </View>
  );
};
```

---

### 3. Uniwind & Tailwind CSS v4 Zero-Boilerplate Setup

With conventional libraries, Uniwind requires `<SafeAreaProvider>` and `<SafeAreaListener>`, which flash at 0px on startup. With `@2security/nitro-safe-area`, simply initialize it once in your `App.tsx`:

```tsx
// App.tsx
import { Uniwind } from 'uniwind';
import { syncWithUniwind } from '@2security/nitro-safe-area';
import { RootNavigator } from './navigation/RootNavigator';

// ⚡ Synchronize Frame 0 JSI insets directly into Uniwind runtime
syncWithUniwind(Uniwind, { adaptiveNavigation: true });

export default function App() {
  return <RootNavigator />;
}
```

#### Dual-Mode Utilities: Standard `safe-offset` vs `nitro-safe-offset`

- **Standard Utilities (`pt-safe-offset-*`, `pb-safe-offset-*`, `px-safe-offset-*`)**:
  Reference standard physical window insets (Notch, Dynamic Island, Home Bar, Status Bar).
- **Nitro Utilities (`pt-nitro-safe-offset-*`, `pb-nitro-safe-offset-*`, `px-nitro-safe-offset-*`)**:
  Reference semantic content insets (Native Bottom Tabs ~104pt, iPadOS 18 Floating Top Capsule ~88pt, iPadOS 18 Leftside Sidebar ~320pt).

> 💡 **Uniwind Patch Guide**: To enable `*-nitro-safe-offset-*` alongside standard `*-safe-offset-*`, follow the step-by-step [Uniwind Patch Guide](docs/uniwind-patch.md). Ready-to-use patch file is included in `patches/uniwind+1.14.0.patch`.

```tsx
import { View, Text, ScrollView } from 'react-native';

export const ShowcaseScreen = () => {
  return (
    <View className="flex-1 bg-white">
      {/* 
        - pt-nitro-safe-offset-2: Insets + 8pt breathing room below iPad Top Capsule (~88pt) or Status Bar.
        - px-nitro-safe-offset-5: Adapts dynamically to iPad Leftside Sidebar (~320pt) or Android landscape cutouts (~54pt).
        - pb-nitro-safe-offset-5: Insets + 20pt for bottom home bar or native bottom tab bar (~104pt).
      */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-nitro-safe-offset-2 pb-nitro-safe-offset-5 px-nitro-safe-offset-5"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-slate-900">Safe Area Showcase</Text>
      </ScrollView>
    </View>
  );
};
```

---

### 4. Handling Bottom Tab Navigators (Native vs JS)

In React Native navigation, there are two distinct layout paradigms for tab bars:

```
A) Native Bottom Tab (FrameLayout Overlay):
┌─────────────────────────────────┐
│ Screen Content (MATCH_PARENT)   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Native BottomNavigationView │ │ <── Overlays on top of content!
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
==> contentInsets.bottom MUST equal: max(windowInsets.bottom, tabBarHeight) (~104pt)

B) JS Bottom Tab (Flexbox Column):
┌─────────────────────────────────┐
│ Screen Content (flex: 1)        │
├─────────────────────────────────┤
│ JS TabBar (Static Height)       │ <── TabBar pushes screen content up!
└─────────────────────────────────┘
==> contentInsets.bottom remains: windowInsets.bottom (24pt) to avoid double padding!
```

`@2security/nitro-safe-area` handles both paradigms **automatically**:
- When using **Native Bottom Tabs** (`@react-navigation/bottom-tabs/unstable` with `react-native-screens`), the library detects `BottomNavigationView` / `NavigationBarView` and sets `contentInsets.bottom = 104.4pt`.
- When using **JS Bottom Tabs** (`@react-navigation/bottom-tabs`), no native tab view is detected; `contentInsets.bottom` remains at the system safe area (`24.0pt`), allowing Flexbox to layout cleanly without double padding.

---

### 5. iPadOS 18 Adaptive Navigation with Fluid Animations

```tsx
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaMetrics } from '@2security/nitro-safe-area';

export const AdaptiveContainer = ({ children }: { children: React.ReactNode }) => {
  const { mode } = useSafeAreaMetrics();

  return (
    <Animated.View
      layout={LinearTransition.duration(300)}
      className="flex-1 bg-white"
    >
      {children}
    </Animated.View>
  );
};
```

---

## ⚖️ Cross-Platform Parity: iOS vs Android

Here is a comprehensive comparison of how safe area concepts and native features map across iOS and Android:

| Feature / Mechanism | iOS (Swift) | Android (Kotlin) | Parity Status |
| :--- | :--- | :--- | :---: |
| **Frame 0 Read** | Synchronous `DispatchQueue.main.sync` with `Thread.isMainThread` guard. | Synchronous JSI execution of `calculateMetrics()`. | ✅ **Identical** (0ms latency) |
| **Event Coalescing** | 30ms debounce via `DispatchWorkItem` (cancel & replace). | 30ms debounce via `Handler(Looper.getMainLooper())`. | ✅ **Identical** (30ms atomic) |
| **Deduplication** | Deep equality check via `metricsAreEqual()`. | Kotlin Data Class auto-generated `equals()` check. | ✅ **Identical** |
| **Native Bottom Tab Detection** | Inspects `UITabBarController.tabBar` frame and visibility. | Recursive DFS view tree search for `BottomNavigationView` / `NavigationBarView` with `WeakReference` caching. | ✅ **Identical** (Auto-detected) |
| **Tab Bar Height Compensation** | `contentInsets.bottom = max(window.bottom, tabBar.height)` (~83pt). | `contentInsets.bottom = max(window.bottom, tabBar.height)` (~104pt). | ✅ **Identical** |
| **Animated Tab Bar (Scroll-to-Hide)** | KVO on `tabBar.isHidden` and `tabBar.frame`. | Dynamic detection of `translationY >= height * 0.5f`. | ✅ **Identical** |
| **Landscape Cutout / Punch Hole** | **Symmetrical Gutter Principle**: Apple sets `left == right == 62.0pt` on iPhone 16/18 Pro for visual balance and muscle memory. | **Hardware-Accurate**: Android sets `left: 54.1pt, right: 0.0pt` to precisely match the punch hole location based on system window insets (strictly read-only, non-invasive). | ✅ **Platform-Idiomatic** |
| **Adaptive Sidebar Navigation** | iPadOS 18 non-invasive sidebar inspection (`sidebarWidth = 320pt` when overlapping, `mode: 'none'` when tiled). | Returns `mode: 'none'`, `sidebarWidth: 0` (Android tablets use standard navigation rails). | ✅ **Platform-Idiomatic** |
| **Floating Top Capsule** | iPadOS 18 `tabBar.frame.origin.y` inspection (`topCapsuleHeight = 88pt`). | Returns `mode: 'none'`, `topCapsuleHeight: 0`. | ✅ **Platform-Idiomatic** |
| **Memory & Lifecycle Safety** | `deinit` cleans up all KVO tokens and NotificationCenter observers; weak references for all UIViews. | `WeakReference<Activity>`, `ComponentCallbacks2` unregistration on `onHostDestroy()`, with persistent `LifecycleEventListener` on `ReactApplicationContext` to re-bind on Activity recreation. | ✅ **Identical** (Zero leaks) |
| **Thread Safety** | `NSLock` protecting shared listeners and last notified state; `@MainActor` considerations. | `@Volatile` variables on shared state (`attachedDecorView`, `lastNotifiedMetrics`) and `synchronized(lock)`. | ✅ **Identical** (Thread-safe) |
| **Modern OS Standards** | Supports iOS 13 through iOS 18+; avoids deprecated `UIScreen.main`. | Supports Android 7.0 (API 24) through Android 15 (API 35); 16KB Page Size support. | ✅ **Identical** |

---

## 📚 API Reference

### Methods

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `getSafeArea()` | `()` | `SafeAreaMetrics` | Synchronously returns full metrics via JSI (0ms latency). |
| `getContentInsets()` | `()` | `EdgeInsets` | Synchronously returns insets adjusted for active navigation Chrome. |
| `getWindowInsets()` | `()` | `EdgeInsets` | Synchronously returns raw physical hardware window insets. |
| `addOnSafeAreaChangedListener()` | `(listener: (metrics: SafeAreaMetrics) => void)` | `() => void` | Subscribes to native safe area, orientation, or mode changes. Returns unsubscribe callback. |
| `syncWithUniwind()` | `(uniwind: UniwindLike, options?: { useWindowInsets?: boolean })` | `() => void` | Synchronizes insets into Uniwind's runtime store at Frame 0 and subscribes to changes. |

---

### React Hooks

| Hook | Return Type | Description |
| :--- | :--- | :--- |
| `useSafeAreaMetrics()` | `SafeAreaMetrics` | Synchronous Frame 0 read with reactive updates powered by `useSyncExternalStore`. |
| `useContentInsets()` | `EdgeInsets` | Returns current content insets with snapshot memoization to avoid redundant re-renders. |
| `useWindowInsets()` | `EdgeInsets` | Returns raw physical window insets with snapshot memoization. |
| `useUniwindSafeArea()` | `void` | Automatically manages Uniwind synchronization during the host component lifecycle. |

---

### Types

#### `EdgeInsets`

```typescript
export interface EdgeInsets {
  /** Top inset in density-independent pixels (pt on iOS, dp on Android). */
  top: number;
  /** Left inset in density-independent pixels (pt on iOS, dp on Android). */
  left: number;
  /** Bottom inset in density-independent pixels (pt on iOS, dp on Android). */
  bottom: number;
  /** Right inset in density-independent pixels (pt on iOS, dp on Android). */
  right: number;
}
```

#### `NavigationMode`

```typescript
export type NavigationMode =
  | 'iphone_bottom_tab'   // iPhone bottom tab bar or Android Native BottomNavigationView
  | 'ipad_top_capsule'    // iPadOS 18 top floating capsule header (~88pt)
  | 'ipad_left_sidebar'   // iPadOS 18 left sidebar expanded (~320pt)
  | 'none';               // Standard full-screen, JS tabs, or edge-to-edge
```

#### `DeviceOrientation`

```typescript
export type DeviceOrientation = 'portrait' | 'landscape';
```

#### `SafeAreaMetrics`

```typescript
export interface SafeAreaMetrics {
  /** Physical window safe area insets directly from the OS (Notch, punch hole, home bar). */
  insets: EdgeInsets;

  /** Content insets adjusted for active navigation Chrome (Bottom Tab, Sidebar, Top Capsule). */
  contentInsets: EdgeInsets;

  /** Current presentation mode. */
  mode: NavigationMode;

  /** Height of bottom tab bar in dp/pt (0 if hidden or none). */
  tabBarHeight: number;

  /** Height of top floating capsule on iPad (0 if none). */
  topCapsuleHeight: number;

  /** Width of left sidebar on iPad (0 if none). */
  sidebarWidth: number;

  /** Whether the bottom tab bar is currently hidden. */
  isTabBarHidden: boolean;

  /** Physical device orientation. */
  orientation: DeviceOrientation;
}
```

---

## 🆚 Feature Comparison

| Feature | `react-native-safe-area-context` | `@2security/nitro-safe-area` |
| :--- | :---: | :---: |
| **Initial Inset Latency** | Asynchronous (`0px` on Frame 0) | ⚡ **Synchronous 0ms (Direct JSI Memory Dispatch)** |
| **Layout Shift / Flicker** | ⚠️ Noticeable 1-frame jump | ⚡ **Zero Layout Shift (Frame 0 Pixel-Perfect)** |
| **Bridge Overhead** | Event bridge serialization | 🚀 **Pure C++ / Swift / Kotlin Hybrid Object** |
| **Native Bottom Tab Awareness** | ❌ Manual offset calculation | ✅ **Automatic Native TabBar Detection (iOS & Android)** |
| **JS vs Native Tab Disambiguation** | ❌ Manual | ✅ **Automatic (Preserves 24pt for JS tabs, 104pt for native tabs)** |
| **Android Landscape Cutout** | ❌ May collide with camera punch hole | ✅ **Automatic (`LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES`)** |
| **iOS Landscape Notch Symmetry** | ✅ Standard | ✅ **Standard Apple Symmetrical Gutters** |
| **iPadOS 18 Sidebar Mode** | ❌ Raw insets only (Sidebar overlays content) | ✅ **Automatic Left Inset ~320pt (`pl-safe` / `px-safe`)** |
| **iPadOS 18 Top Capsule** | ❌ Overlays content headers | ✅ **Automatic Top Capsule Padding (~88pt)** |
| **Uniwind / Tailwind CSS v4** | Needs custom async wrappers | ✅ **Synchronous `syncWithUniwind(Uniwind)`** |
| **Orientation Tracking** | Window resize events | ✅ **Native KVO / ComponentCallbacks with 30ms Debounce** |

---

## 🏃‍♂️ Running the Example

Clone the repository and run the demo app locally:

### 1. Clone & Install Dependencies

```sh
# Clone the repository
git clone https://github.com/2security/react-native-nitro-safe-area.git
cd react-native-nitro-safe-area

# Install monorepo dependencies (Yarn Berry auto-applies the Uniwind patch from patches/)
yarn install

# Build the library and generate Nitro native bindings
yarn prepare
```

### 2. iOS Setup & Launch

```sh
# Install CocoaPods for the example app
yarn example pod

# Run on default iOS Simulator
yarn example ios

# 💡 Recommended: Test iPadOS 18 Adaptive Navigation (Sidebar & Top Capsule)
yarn example ios --simulator="iPad mini (A17 Pro)"
```

### 3. Android Setup & Launch

```sh
# Make sure an Android Emulator (API 34/35) or physical device is connected
yarn example android
```

### 4. Start Metro (Optional / Standalone)

```sh
yarn example start
```

---

## 🛠️ Development & Contributing

```sh
# Install dependencies
yarn install

# Generate Nitro native bindings
yarn nitrogen

# Build library
yarn prepare

# Typecheck TypeScript
yarn typecheck

# Lint codebase
yarn lint
```

---

## 📄 License

MIT © [2Security](https://github.com/duongnguyen17/react-native-nitro-safe-area)
