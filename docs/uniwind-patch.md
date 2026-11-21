# Uniwind Patch: Native Navigation & Content Safe Area Insets

This document explains how to patch [Uniwind](https://github.com/uniwind/uniwind) to support native navigation content insets via new `nitro-safe-*` utilities, while keeping Uniwind's standard `safe-*` utilities intact for physical display insets.

---

## 🎯 Motivation

In standard Uniwind, safe area utilities (`safe`, `safe-offset-*`, `safe-or-*`) map to physical display safe area insets (status bar, notch, Dynamic Island, home indicator) via CSS environment variables `env(safe-area-inset-*)`:

- `pt-safe-offset-2`: `env(safe-area-inset-top) + 8px`
- `pb-safe-offset-5`: `env(safe-area-inset-bottom) + 20px`

However, in modern production apps:
1. **iOS / Android Native Bottom Tabs** overlay screen content, requiring ~83pt (iOS) or ~104pt (Android) bottom clearance.
2. **iPadOS 18 Adaptive Navigation** mounts a floating top capsule (~88pt) in portrait or an overlapping left sidebar (~320pt) in landscape.

If we overwrite Uniwind's standard `updateInsets()` with navigation content insets, developers lose access to standard physical window insets.

### The Solution: `nitro-safe-offset`

By applying this patch, Uniwind gains dedicated utilities powered by `env(nitro-safe-area-inset-*)` and `Uniwind.updateNitroInsets()`:

| Utility Class Family | Insets Source | Target Use Cases |
| :--- | :--- | :--- |
| **`*-safe` / `*-safe-offset-*`** | Physical Window Insets (`metrics.insets`) | Default Uniwind setup: status bar, notch, Dynamic Island, home indicator. |
| **`*-nitro-safe` / `*-nitro-safe-offset-*`** | Semantic Content Insets (`metrics.contentInsets`) | Powered by `@2security/nitro-safe-area`: native bottom tabs, iPadOS 18 top capsule & left sidebar. |

---

## 🚀 Available Utilities

The patch adds full Tailwind CSS v4 utilities mirroring all standard safe area utilities:

### Padding & Margins
- `pt-nitro-safe-offset-*`, `pb-nitro-safe-offset-*`, `pl-nitro-safe-offset-*`, `pr-nitro-safe-offset-*`
- `px-nitro-safe-offset-*`, `py-nitro-safe-offset-*`, `p-nitro-safe-offset-*`
- `mt-nitro-safe-offset-*`, `mb-nitro-safe-offset-*`, `ml-nitro-safe-offset-*`, `mr-nitro-safe-offset-*`
- `mx-nitro-safe-offset-*`, `my-nitro-safe-offset-*`, `m-nitro-safe-offset-*`

### Positioning & Sizes
- `top-nitro-safe-offset-*`, `bottom-nitro-safe-offset-*`, `left-nitro-safe-offset-*`, `right-nitro-safe-offset-*`
- `inset-nitro-safe-offset-*`, `inset-x-nitro-safe-offset-*`, `inset-y-nitro-safe-offset-*`
- `h-screen-nitro-safe`: `calc(100vh - (env(nitro-safe-area-inset-top) + env(nitro-safe-area-inset-bottom)))`

### Boundary Variants (`*-or-*`)
- `*-nitro-safe-or-*` (e.g. `pt-nitro-safe-or-4`, `pb-nitro-safe-or-6`): Resolves to `max(env(nitro-safe-area-inset-*), spacing)`.

---

## 📦 How to Apply the Patch

The patch file is provided in this repository under:
- `patches/uniwind+1.14.0.patch`

Choose the setup matching your package manager:

### Option 1: Yarn Berry (v2, v3, v4)

In your `package.json`:

```json
{
  "dependencies": {
    "uniwind": "patch:uniwind@npm%3A1.14.0#./patches/uniwind+1.14.0.patch"
  }
}
```

Then run:
```sh
yarn install
```

---

### Option 2: `patch-package` (npm, Yarn Classic v1)

1. Install `patch-package`:
```sh
npm install --save-dev patch-package postinstall-postinstall
# or
yarn add -D patch-package postinstall-postinstall
```

2. Copy `patches/uniwind+1.14.0.patch` into your project's root `patches/` folder:
```sh
mkdir -p patches
cp node_modules/@2security/nitro-safe-area/patches/uniwind+1.14.0.patch patches/
```

3. Add `postinstall` script to `package.json`:
```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

4. Run:
```sh
npx patch-package
```

---

### Option 3: pnpm (v7.4+)

In your root `package.json`:

```json
{
  "pnpm": {
    "patchedDependencies": {
      "uniwind@1.14.0": "patches/uniwind+1.14.0.patch"
    }
  }
}
```

Then run:
```sh
pnpm install
```

---

## 💻 Code Example

Initialize `@2security/nitro-safe-area` in your `App.tsx`:

```tsx
// App.tsx
import { Uniwind } from 'uniwind';
import { syncWithUniwind, getInitialMetrics } from '@2security/nitro-safe-area';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// ⚡ Synchronize Frame 0 insets directly into Uniwind runtime
// When patched, syncWithUniwind automatically updates:
// 1. Uniwind.updateNitroInsets(metrics.contentInsets) -> for *-nitro-safe-*
// 2. Uniwind.updateInsets(metrics.insets) -> for standard *-safe-*
syncWithUniwind(Uniwind, { adaptiveNavigation: true });

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={getInitialMetrics()}>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
```

In your screens:

```tsx
import { ScrollView, View, Text } from 'react-native';

export function Screen() {
  return (
    <View className="flex-1 bg-white">
      {/* 
        - pt-nitro-safe-offset-2: Insets + 8pt offset below navigation capsule or status bar.
        - px-nitro-safe-offset-5: Expands cleanly when iPad sidebar opens (320pt) or landscape cutout (54pt).
        - pb-nitro-safe-offset-5: Insets + 20pt for bottom home indicator or native bottom tab bar.
      */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-nitro-safe-offset-2 pb-nitro-safe-offset-5 px-nitro-safe-offset-5"
      >
        <Text className="text-xl font-bold">Hello World</Text>
      </ScrollView>
    </View>
  );
}
```

---

## 🛡️ Backward Compatibility

`syncWithUniwind` detects whether the Uniwind patch is applied at runtime:
- **If patched** (`Uniwind.updateNitroInsets` exists): Synchronizes both `contentInsets` (to `updateNitroInsets`) and `insets` (to `updateInsets`).
- **If unpatched**: Falls back gracefully to `Uniwind.updateInsets(metrics.contentInsets)` (or `metrics.insets` if `useWindowInsets: true`).
