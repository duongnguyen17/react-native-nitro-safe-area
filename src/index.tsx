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
 * The NitroSafeArea Hybrid Object instance backed by C++/JSI.
 */
export const NitroSafeArea =
  NitroModules.createHybridObject<NitroSafeAreaSpec>('NitroSafeArea');

/**
 * Synchronous query for current safe area and navigation metrics (0ms latency, zero layout shift).
 */
export function getSafeArea(): SafeAreaMetrics {
  return NitroSafeArea.getSafeArea();
}

/**
 * Synchronous query for content insets adjusted for TabBar, iPad sidebar, or top capsule.
 */
export function getContentInsets(): EdgeInsets {
  return NitroSafeArea.getSafeArea().contentInsets;
}

/**
 * Synchronous query for raw window insets directly from the OS.
 */
export function getWindowInsets(): EdgeInsets {
  return NitroSafeArea.getSafeArea().insets;
}

/**
 * Registers a native callback for safe area and navigation mode changes.
 * Returns an unregister function.
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

let cachedMetrics: SafeAreaMetrics | null = null;
let cachedContentInsets: EdgeInsets | null = null;
let cachedWindowInsets: EdgeInsets | null = null;
const hookListeners = new Set<() => void>();
let nativeSubscription: (() => void) | null = null;

function getMetricsSnapshot(): SafeAreaMetrics {
  if (!cachedMetrics) {
    cachedMetrics = getSafeArea();
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
    nativeSubscription = addOnSafeAreaChangedListener((nextMetrics) => {
      cachedMetrics = nextMetrics;
      hookListeners.forEach((listener) => listener());
    });
  }

  return () => {
    hookListeners.delete(onStoreChange);
    if (hookListeners.size === 0 && nativeSubscription) {
      nativeSubscription();
      nativeSubscription = null;
    }
  };
}

/**
 * React hook that initializes synchronously with current native metrics on Frame 0,
 * and updates reactively on orientation or navigation mode changes without tearing.
 */
export function useSafeAreaMetrics(): SafeAreaMetrics {
  return useSyncExternalStore(
    subscribeToMetrics,
    getMetricsSnapshot,
    getMetricsSnapshot
  );
}

/**
 * React hook that returns content insets (accounting for bottom tab bar, iPad sidebar, or floating capsule).
 * Memoized snapshot prevents unnecessary re-renders when content insets have not changed.
 */
export function useContentInsets(): EdgeInsets {
  return useSyncExternalStore(
    subscribeToMetrics,
    getContentInsetsSnapshot,
    getContentInsetsSnapshot
  );
}

/**
 * React hook that returns physical window insets.
 * Memoized snapshot prevents unnecessary re-renders when physical insets have not changed.
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
 * Minimal Uniwind interface for safe area synchronization.
 */
export interface UniwindLike {
  updateInsets: (insets: EdgeInsets) => void;
  updateCSSVariables?: (theme: any, variables: any) => void;
}

/**
 * Synchronizes @2security/nitro-safe-area with Uniwind at 0ms.
 * - Immediately updates Uniwind insets synchronously at Frame 0 (zero layout shift).
 * - Subscribes to native orientation and iPadOS 18 adaptive navigation mode changes
 *   (Leftside Sidebar ↔ Top Floating Capsule) and automatically propagates them to Uniwind.
 * - Powers Uniwind's built-in `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, `px-safe`, `p-safe`,
 *   `pt-safe-or-*`, and `pb-safe-offset-*` out of the box with zero boilerplate.
 *
 * @param uniwind The Uniwind instance imported from 'uniwind'.
 * @param options Optional configuration (e.g. sync physical windowInsets instead of contentInsets).
 * @returns Unsubscribe function to tear down the listener.
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
 * React hook that registers Uniwind synchronization during component lifecycle.
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
