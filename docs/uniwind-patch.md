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
| **`*-header` / `*-header-offset-*`** | Native Stack Header Height (`metrics.headerHeight`) | Status bar + Navigation Bar combined height. Perfect for full-bleed transparent header screens. |
| **`*-nav-bar` / `*-nav-bar-offset-*`** | Navigation Bar Only (`metrics.navBarHeight`) | Standalone Navigation Bar height (44pt/54pt on iOS, 56dp on Android) excluding Status Bar. |

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

## 🧭 Native Stack Header Utilities (`*-header`, `*-nav-bar`)

When building full-bleed transparent header screens (`headerTransparent: true`) with `@react-navigation/native-stack`, content scrolls beneath the native header. Traditional approaches require passing `headerHeight` via context or state, causing 1–2 frame layout jumps.

The patch introduces native CSS environment variables and corresponding Tailwind CSS v4 classes:
- `env(nitro-header-height)`: Total header height (Status Bar + Navigation Bar).
- `env(nitro-nav-bar-height)`: Navigation Bar height only (44pt/54pt on iOS, 56dp on Android).
- `env(nitro-large-title-nav-bar-height)`: Large title Navigation Bar height.

### Combined Header Height (`pt-header`, `h-header`, `top-header`)
- **Padding**: `pt-header`, `pt-header-offset-*` (e.g. `pt-header-offset-4`), `pt-header-or-*`
- **Height / Min / Max**: `h-header`, `min-h-header`, `max-h-header`
- **Positioning**: `top-header`, `top-header-offset-*`
- **Margin**: `mt-header`, `mt-header-offset-*`

### Navigation Bar Only (`pt-nav-bar`, `h-nav-bar`, `top-nav-bar`)
- **Padding**: `pt-nav-bar`, `pt-nav-bar-offset-*`, `pt-nav-bar-or-*`
- **Height / Min / Max**: `h-nav-bar`, `min-h-nav-bar`, `max-h-nav-bar`
- **Positioning**: `top-nav-bar`, `top-nav-bar-offset-*`
- **Margin**: `mt-nav-bar`, `mt-nav-bar-offset-*`

> [!TIP]
> **iOS Best Practice for `headerTransparent: true`:**
> When using `headerTransparent: true`, UIKit renders an animated 1px hairline shadow (`_UIBarBackgroundShadowView`) by default during push transitions. To achieve a perfectly seamless and static transparent header, configure your screen options with:
> ```typescript
> options={{
>   headerTransparent: true,
>   headerShadowVisible: false, // 👈 Disables UIKit's hairline separator
> }}
> ```

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
// 3. Uniwind.updateNitroHeader(headerHeight, navBarHeight, largeTitleNavBarHeight) -> for *-header / *-nav-bar
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
