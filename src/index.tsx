import { useEffect, useSyncExternalStore } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import type {
  NitroSafeArea as NitroSafeAreaSpec,
  SafeAreaMetrics,
  EdgeInsets,
  NavigationMode,
  DeviceOrientation,
} from './NitroSafeArea.nitro';

export type {
  NitroSafeAreaSpec,
  SafeAreaMetrics,
  EdgeInsets,
  NavigationMode,
  DeviceOrientation,
};

/**
 * Direct reference to the native `NitroSafeArea` Hybrid Object instance backed by C++/JSI.
 *
 * @remarks
 * This singleton instance connects directly to the underlying Swift (iOS) and Kotlin (Android)
 * native implementations without crossing the asynchronous React Native bridge.
 */
export const NitroSafeArea =
  NitroModules.createHybridObject<NitroSafeAreaSpec>('NitroSafeArea');

/**
 * Synchronously queries the current safe area insets and adaptive navigation metrics directly from Native.
 *
 * @remarks
 * **Performance**: Executes synchronously in 0ms via JSI. Unlike traditional safe area libraries that
 * start with 0px and re-render on frame 1, `getSafeArea()` can be called at Frame 0 during initial render
 * or outside of React components (e.g., in module scope, Zustand stores, Redux reducers).
 *
 * @returns A {@link SafeAreaMetrics} object containing physical insets, content insets, navigation mode, and orientation.
 *
 * @example
 * ```ts
 * import { getSafeArea } from '@2security/nitro-safe-area';
 *
 * // Synchronous read at module evaluation time
 * const initial = getSafeArea();
 * console.log('Top Inset:', initial.contentInsets.top);
 * console.log('Current Mode:', initial.mode); // 'iphone_bottom_tab' | 'ipad_top_capsule' | 'ipad_left_sidebar'
 * ```
 */
export function getSafeArea(): SafeAreaMetrics {
  return NitroSafeArea.getSafeArea();
}

/**
 * Synchronously queries the content insets adjusted for active native navigation Chrome.
 *
 * @remarks
 * Adjusts for:
 * - **iPhone**: Native bottom tab bar (~83pt).
 * - **iPadOS 18 (Sidebar)**: Left sidebar overlay width (~320pt).
 * - **iPadOS 18 (Capsule)**: Floating top capsule tab bar (~88pt).
 * - **Android**: Edge-to-edge system bars and cutouts.
 *
 * @returns An {@link EdgeInsets} object representing `{ top, left, bottom, right }`.
 *
 * @example
 * ```ts
 * import { getContentInsets } from '@2security/nitro-safe-area';
 *
 * const insets = getContentInsets();
 * const style = {
 *   paddingTop: insets.top,
 *   paddingLeft: insets.left,
 *   paddingBottom: insets.bottom,
 * };
 * ```
 */
export function getContentInsets(): EdgeInsets {
  return NitroSafeArea.getSafeArea().contentInsets;
}

/**
 * Synchronously queries the physical window safe area insets directly from the OS.
 *
 * @remarks
 * Returns raw physical display cutouts (status bar, dynamic island, notch, and home indicator).
 * Does **not** include app navigation components such as tab bars or sidebars.
 *
 * @returns An {@link EdgeInsets} object representing `{ top, left, bottom, right }`.
 *
 * @example
 * ```ts
 * import { getWindowInsets } from '@2security/nitro-safe-area';
 *
 * const windowInsets = getWindowInsets();
 * console.log('Physical Status Bar / Notch:', windowInsets.top);
 * console.log('Physical Home Bar:', windowInsets.bottom);
 * ```
 */
export function getWindowInsets(): EdgeInsets {
  return NitroSafeArea.getSafeArea().insets;
}

/**
 * Registers a native callback invoked whenever safe area insets, device orientation,
 * or navigation mode (tab bar / sidebar) changes.
 *
 * @remarks
 * On iOS, this observes `UIWindow.safeAreaInsets`, `bounds`, `UITabBarController.sidebar`,
 * and device rotation. Events with identical metrics are automatically deduplicated at the
 * native layer to prevent redundant JavaScript executions.
 *
 * @param listener Callback function receiving the updated {@link SafeAreaMetrics}.
 * @returns An unsubscribe function to remove the listener and clean up native observers.
 *
 * @example
 * ```ts
 * import { addOnSafeAreaChangedListener } from '@2security/nitro-safe-area';
 *
 * const unsubscribe = addOnSafeAreaChangedListener((metrics) => {
 *   console.log('Safe area changed:', metrics.contentInsets);
 *   console.log('Mode:', metrics.mode);
 * });
 *
 * // Clean up when no longer needed
 * unsubscribe();
 * ```
 */
export function addOnSafeAreaChangedListener(
  listener: (metrics: SafeAreaMetrics) => void
): () => void {
  return NitroSafeArea.addOnSafeAreaChangedListener(listener);
}

// =============================================================================
// High-Performance React Store (useSyncExternalStore)
// =============================================================================

function areInsetsEqual(a: EdgeInsets, b: EdgeInsets): boolean {
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.bottom === b.bottom &&
    a.right === b.right
  );
}

function areMetricsEqual(a: SafeAreaMetrics, b: SafeAreaMetrics): boolean {
  return (
    a.orientation === b.orientation &&
    a.mode === b.mode &&
    a.tabBarHeight === b.tabBarHeight &&
    a.sidebarWidth === b.sidebarWidth &&
    a.topCapsuleHeight === b.topCapsuleHeight &&
    a.isTabBarHidden === b.isTabBarHidden &&
    areInsetsEqual(a.insets, b.insets) &&
    areInsetsEqual(a.contentInsets, b.contentInsets)
  );
}

let cachedMetrics: SafeAreaMetrics | null = null;
let cachedContentInsets: EdgeInsets | null = null;
let cachedWindowInsets: EdgeInsets | null = null;
const hookListeners = new Set<() => void>();
let nativeSubscription: (() => void) | null = null;

function getMetricsSnapshot(): SafeAreaMetrics {
  if (!nativeSubscription || !cachedMetrics) {
    const next = getSafeArea();
    if (!cachedMetrics || !areMetricsEqual(cachedMetrics, next)) {
      cachedMetrics = next;
    }
  }
  return cachedMetrics;
}

function getContentInsetsSnapshot(): EdgeInsets {
  const next = getMetricsSnapshot().contentInsets;
  if (!cachedContentInsets || !areInsetsEqual(cachedContentInsets, next)) {
    cachedContentInsets = next;
  }
  return cachedContentInsets;
}

function getWindowInsetsSnapshot(): EdgeInsets {
  const next = getMetricsSnapshot().insets;
  if (!cachedWindowInsets || !areInsetsEqual(cachedWindowInsets, next)) {
    cachedWindowInsets = next;
  }
  return cachedWindowInsets;
}

function subscribeToMetrics(onStoreChange: () => void): () => void {
  hookListeners.add(onStoreChange);

  if (!nativeSubscription) {
    cachedMetrics = getMetricsSnapshot();
    nativeSubscription = addOnSafeAreaChangedListener((nextMetrics) => {
      if (!cachedMetrics || !areMetricsEqual(cachedMetrics, nextMetrics)) {
        cachedMetrics = nextMetrics;
        hookListeners.forEach((listener) => listener());
      }
    });
  }

  return () => {
    hookListeners.delete(onStoreChange);
    if (hookListeners.size === 0) {
      if (nativeSubscription) {
        nativeSubscription();
        nativeSubscription = null;
      }
      cachedMetrics = null;
      cachedContentInsets = null;
      cachedWindowInsets = null;
    }
  };
}

/**
 * React hook that returns the complete {@link SafeAreaMetrics} with zero-frame latency and zero visual tearing.
 *
 * @remarks
 * **Architecture**: Powered by React Core's `useSyncExternalStore`.
 * - **Frame 0 Read**: Returns the exact native metrics synchronously on the very first render pass (0ms).
 * - **Zero Tearing**: Guarantees visual consistency across concurrent rendering.
 * - **Single Native Subscription**: A shared singleton native listener is used regardless of how many
 *   components consume this hook.
 *
 * @returns The current {@link SafeAreaMetrics} object.
 *
 * @example
 * ```tsx
 * import { useSafeAreaMetrics } from '@2security/nitro-safe-area';
 * import { View, Text } from 'react-native';
 *
 * export const Header = () => {
 *   const metrics = useSafeAreaMetrics();
 *
 *   return (
 *     <View style={{ paddingTop: metrics.contentInsets.top }}>
 *       <Text>Mode: {metrics.mode}</Text>
 *       <Text>Orientation: {metrics.orientation}</Text>
 *     </View>
 *   );
 * };
 * ```
 */
export function useSafeAreaMetrics(): SafeAreaMetrics {
  return useSyncExternalStore(
    subscribeToMetrics,
    getMetricsSnapshot,
    getMetricsSnapshot
  );
}

/**
 * React hook that returns the content insets adjusted for active native navigation Chrome
 * (TabBar, iPad sidebar, or floating capsule).
 *
 * @remarks
 * **Performance Optimization**: Employs snapshot memoization. If other metrics (such as device orientation
 * or tab bar hidden state) change but `contentInsets` remain identical, this hook returns the same object
 * reference. React will **completely skip re-rendering** the calling component.
 *
 * @returns An {@link EdgeInsets} object representing `{ top, left, bottom, right }`.
 *
 * @example
 * ```tsx
 * import { useContentInsets } from '@2security/nitro-safe-area';
 * import { View, ScrollView } from 'react-native';
 *
 * export const ScreenContainer = ({ children }) => {
 *   const insets = useContentInsets();
 *
 *   return (
 *     <ScrollView
 *       contentContainerStyle={{
 *         paddingTop: insets.top,
 *         paddingLeft: insets.left,
 *         paddingBottom: insets.bottom,
 *       }}
 *     >
 *       {children}
 *     </ScrollView>
 *   );
 * };
 * ```
 */
export function useContentInsets(): EdgeInsets {
  return useSyncExternalStore(
    subscribeToMetrics,
    getContentInsetsSnapshot,
    getContentInsetsSnapshot
  );
}

/**
 * React hook that returns the physical window safe area insets directly from the OS.
 *
 * @remarks
 * **Performance Optimization**: Employs snapshot memoization to prevent unnecessary component re-renders
 * when physical insets remain unchanged.
 *
 * @returns An {@link EdgeInsets} object representing `{ top, left, bottom, right }`.
 *
 * @example
 * ```tsx
 * import { useWindowInsets } from '@2security/nitro-safe-area';
 * import { View } from 'react-native';
 *
 * export const FloatingOverlay = () => {
 *   const insets = useWindowInsets();
 *
 *   return (
 *     <View style={{ position: 'absolute', top: insets.top + 10, right: 16 }}>
 *       { ... }
 *     </View>
 *   );
 * };
 * ```
 */
export function useWindowInsets(): EdgeInsets {
  return useSyncExternalStore(
    subscribeToMetrics,
    getWindowInsetsSnapshot,
    getWindowInsetsSnapshot
  );
}

// =============================================================================
// Uniwind Tailwind v4 Integration
// =============================================================================

/**
 * Minimal interface definition for Uniwind runtime compatibility.
 */
export interface UniwindLike {
  /** Updates the runtime insets in Uniwind's style store. */
  updateInsets: (insets: EdgeInsets) => void;
  /** Optional theme CSS variables update handler. */
  updateCSSVariables?: (theme: any, variables: any) => void;
}

/**
 * Synchronizes `@2security/nitro-safe-area` directly with Uniwind's Tailwind CSS v4 runtime engine.
 *
 * @remarks
 * **Why use this?**
 * - **Replaces Uniwind Pro Native Insets**: Uniwind Free normally requires wrapping your tree with
 *   `<SafeAreaProvider>` and `<SafeAreaListener>` from `react-native-safe-area-context`, which causes a
 *   noticeable 1-frame async layout jump on startup. `syncWithUniwind` feeds JSI insets synchronously at Frame 0 (0ms).
 * - **Zero Boilerplate**: Call it once in `App.tsx` (before or inside root). All Tailwind safe area classes
 *   work out of the box without any React wrapper components:
 *   - Padding: `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, `px-safe`, `p-safe`
 *   - Compound: `pt-safe-offset-10`, `px-safe-offset-5`, `pt-safe-or-4`
 *   - Margins & Insets: `mt-safe`, `inset-safe`, `top-safe`
 * - **iPadOS 18 Adaptive Navigation**: In Leftside Sidebar mode, `contentInsets.left` (320pt) automatically
 *   pushes content out via `px-safe` / `pl-safe`. In Top Capsule mode, `contentInsets.top` (88pt) pads list headers.
 * - **Smart Deduplication**: Only notifies Uniwind if insets actually change, avoiding redundant CSS variable recompilations.
 *
 * @param uniwind The `Uniwind` instance imported from `'uniwind'`.
 * @param options Optional configuration. Set `useWindowInsets: true` to sync raw physical window insets instead of content insets.
 * @returns An unsubscribe function to tear down the listener when no longer needed.
 *
 * @example
 * ```tsx
 * // App.tsx
 * import { Uniwind } from 'uniwind';
 * import { syncWithUniwind } from '@2security/nitro-safe-area';
 *
 * // ⚡ Synchronize Frame 0 insets directly into Uniwind runtime
 * syncWithUniwind(Uniwind);
 *
 * export default function App() {
 *   return (
 *     // Use Tailwind safe area classes anywhere with ZERO wrappers!
 *     <View className="flex-1 pt-safe-offset-10 px-safe-offset-5 pb-safe">
 *       <Text className="text-xl font-bold">Hello Tailwind v4!</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function syncWithUniwind(
  uniwind: UniwindLike,
  options?: { useWindowInsets?: boolean }
): () => void {
  const getInsets = () =>
    options?.useWindowInsets ? getWindowInsets() : getContentInsets();

  // Frame 0 synchronous update — zero flash / zero layout shift!
  const initial = getInsets();
  uniwind.updateInsets(initial);
  let lastInsets = initial;

  // Reactive listener for native changes (rotation, iPad sidebar toggle, etc.)
  return addOnSafeAreaChangedListener((metrics) => {
    const next = options?.useWindowInsets
      ? metrics.insets
      : metrics.contentInsets;
    if (!areInsetsEqual(lastInsets, next)) {
      lastInsets = next;
      uniwind.updateInsets(next);
    }
  });
}

/**
 * React hook that registers Uniwind safe area synchronization for the lifetime of the host component.
 *
 * @remarks
 * Useful when you prefer managing Uniwind synchronization inside a React component tree rather than
 * at the top-level module scope of `App.tsx`.
 *
 * @param uniwind The `Uniwind` instance imported from `'uniwind'`.
 * @param options Optional configuration. Set `useWindowInsets: true` to sync raw physical window insets.
 *
 * @example
 * ```tsx
 * import { Uniwind } from 'uniwind';
 * import { useUniwindSafeArea } from '@2security/nitro-safe-area';
 *
 * export function RootNavigator() {
 *   useUniwindSafeArea(Uniwind);
 *
 *   return <NavigationContainer>{ ... }</NavigationContainer>;
 * }
 * ```
 */
export function useUniwindSafeArea(
  uniwind: UniwindLike,
  options?: { useWindowInsets?: boolean }
): void {
  const shouldSyncWindowInsets = options?.useWindowInsets;
  useEffect(() => {
    return syncWithUniwind(uniwind, {
      useWindowInsets: shouldSyncWindowInsets,
    });
  }, [uniwind, shouldSyncWindowInsets]);
}
