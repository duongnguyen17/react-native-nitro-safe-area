# @2security/nitro-safe-area

<p align="center">
  <img src="https://img.shields.io/npm/v/@2security/nitro-safe-area?style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/badge/React%20Native-0.88+-blue.svg?style=flat-square" alt="React Native 0.88+" />
  <img src="https://img.shields.io/badge/Nitro%20Modules-0.37+-purple.svg?style=flat-square" alt="Nitro Modules" />
  <img src="https://img.shields.io/badge/iPadOS%2018-Supported-brightgreen.svg?style=flat-square" alt="iPadOS 18 Supported" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />
</p>

⚡ **Zero-latency synchronous Safe Area & Native Tab/Sidebar insets for React Native via Nitro Modules.**

Eliminates initial render layout shifts ("UI renders at 0 then jumps down"), delivers instant Frame 0 evaluation, and provides native awareness for **iPhone Native Bottom Tabs** as well as **iPadOS 18+ Adaptive Navigation** (dynamic **Leftside Sidebar** vs. **Top Floating Capsule**).

---

## 🎯 The Problem

In traditional React Native safe area solutions (like `react-native-safe-area-context`):
1. **Asynchronous Initial Insets**: On initial mount, insets evaluate to `0px` because native views need to attach and fire an asynchronous event over the bridge.
2. **Layout Shift / Content Jump**: UI renders at the very top/bottom of the screen for 1–2 frames, and then abruptly shifts down or up once the event arrives.
3. **iPadOS 18 Dual Mode Chaos**: On iPadOS 18+, the native tab bar isn't just at the bottom. It dynamically toggles between a **Leftside Sidebar** (requiring left safe area padding) and a **Top Floating Capsule** (overlaying the top header, requiring top padding). Standard libraries only report raw physical window insets.

## 💡 The Solution

`@2security/nitro-safe-area` leverages **Nitro Modules** (JSI + C++/Swift/Kotlin) to:
- ⚡ **Synchronously query native insets at 0ms** on the JS thread without waiting for React mounting or component render passes.
- 📱 **Detect Native Navigation**: Automatically computes `contentInsets` accounting for native `UITabBarController`, bottom tabs, iPadOS 18 sidebar expansion, and floating capsule height.
- 🔄 **Reactive Native Listeners**: Zero-overhead native event subscriptions for device rotation and iPad Stage Manager / Split View resizing.
- 🎨 **Instant Uniwind / Tailwind Integration**: Directly initialize CSS variables (`--safe-native-top`, `--safe-native-bottom`, `--safe-native-left`) with exact values at bundle evaluation time.

---

## 📦 Installation

```sh
yarn add @2security/nitro-safe-area react-native-nitro-modules
# or
npm install @2security/nitro-safe-area react-native-nitro-modules
```

> **Note**: Requires React Native New Architecture with Bridgeless Mode enabled.

---

## 🚀 Quick Usage

### 1. Synchronous Instant Insets (Zero Layout Shift)

```typescript
import { getSafeArea, getContentInsets, getWindowInsets } from '@2security/nitro-safe-area';

// Returns synchronously in 0ms (even at module evaluation time!)
const metrics = getSafeArea();

console.log(metrics.mode); // 'iphone_bottom_tab' | 'ipad_top_capsule' | 'ipad_left_sidebar' | 'none'
console.log(metrics.contentInsets); // { top: 59, left: 0, bottom: 83, right: 0 }
console.log(metrics.insets); // Raw physical OS window insets
```

### 2. React Hooks (Frame 0 Synchronous + Reactive Updates)

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaMetrics, useContentInsets } from '@2security/nitro-safe-area';

export const MyScreen = () => {
  // Initializes synchronously with exact native values on Frame 0!
  const contentInsets = useContentInsets();
  const { mode, orientation } = useSafeAreaMetrics();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: contentInsets.top,
        paddingBottom: contentInsets.bottom,
        paddingLeft: contentInsets.left,
        paddingRight: contentInsets.right,
      }}
    >
      <Text>Mode: {mode}</Text>
      <Text>Orientation: {orientation}</Text>
    </View>
  );
};
```

### 3. Uniwind / Tailwind Initial Insets Fix

Eliminate initial flash when using Tailwind safe area utilities:

```tsx
import React, { useState } from 'react';
import { getContentInsets, addOnSafeAreaChangedListener } from '@2security/nitro-safe-area';
import { ScopedVariables } from 'uniwind';

export const NativeTabSafeAreaProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with exact native insets on Frame 0!
  const [insets, setInsets] = useState(() => getContentInsets());

  React.useEffect(() => {
    return addOnSafeAreaChangedListener((metrics) => {
      setInsets(metrics.contentInsets);
    });
  }, []);

  return (
    <ScopedVariables
      variables={{
        '--safe-native-top': insets.top,
        '--safe-native-bottom': insets.bottom,
        '--safe-native-left': insets.left,
        '--safe-native-right': insets.right,
      }}
    >
      {children}
    </ScopedVariables>
  );
};
```

---

## 📊 API Reference

### Methods

| Function | Return Type | Description |
| :--- | :--- | :--- |
| `getSafeArea()` | `SafeAreaMetrics` | Synchronously returns full safe area & navigation metrics (0ms). |
| `getContentInsets()` | `EdgeInsets` | Synchronously returns insets adjusted for TabBar, iPad sidebar, or capsule. |
| `getWindowInsets()` | `EdgeInsets` | Synchronously returns physical screen window insets. |
| `addOnSafeAreaChangedListener(callback)` | `() => void` | Listens for rotation, sidebar toggle, or inset changes. Returns unregister fn. |

### Types

```typescript
export interface EdgeInsets {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export type NavigationMode =
  | 'iphone_bottom_tab'
  | 'ipad_top_capsule'
  | 'ipad_left_sidebar'
  | 'none';

export type DeviceOrientation = 'portrait' | 'landscape';

export interface SafeAreaMetrics {
  insets: EdgeInsets;          // Physical window insets
  contentInsets: EdgeInsets;   // Content insets adjusted for TabBar/Sidebar/Capsule
  mode: NavigationMode;        // Current navigation presentation mode
  tabBarHeight: number;        // Height of bottom tab bar (0 if hidden/none)
  topCapsuleHeight: number;    // Height of top floating capsule on iPad
  sidebarWidth: number;        // Width of left sidebar on iPad
  isTabBarHidden: boolean;     // Whether tab bar is hidden
  orientation: DeviceOrientation;
}
```

---

## 🛠️ Comparison

| Feature | `react-native-safe-area-context` | `@2security/nitro-safe-area` |
| :--- | :---: | :---: |
| **Initial Mount Insets** | Asynchronous (`0px` on Frame 0) | **Synchronous 0ms (Exact values on Frame 0)** |
| **Layout Shift / Flash** | ⚠️ Yes (content jumps down) | ⚡ **Zero Layout Shift** |
| **Bridge Overhead** | Event Bridge / VDOM Hook cycle | 🚀 **Pure JSI C++ Memory Binding** |
| **Native Bottom Tab Awareness** | Manual offset calculation | ✅ **Automatic Native TabBar Detection** |
| **iPadOS 18 Sidebar Mode** | ❌ Raw insets only | ✅ **Automatic Left Sidebar Width Insets** |
| **iPadOS 18 Top Capsule** | ❌ Overlays content | ✅ **Automatic Top Capsule Padding** |

---

## 📄 License

MIT © [2Security](https://github.com/duongnguyen17)
