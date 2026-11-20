import { useEffect, useState } from 'react';
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

/**
 * React hook that initializes synchronously with current native metrics on Frame 0,
 * and updates reactively on orientation or navigation mode changes.
 */
export function useSafeAreaMetrics(): SafeAreaMetrics {
  const [metrics, setMetrics] = useState<SafeAreaMetrics>(() => getSafeArea());

  useEffect(() => {
    return addOnSafeAreaChangedListener((nextMetrics) => {
      setMetrics(nextMetrics);
    });
  }, []);

  return metrics;
}

/**
 * React hook that returns content insets (accounting for bottom tab bar, iPad sidebar, or floating capsule).
 */
export function useContentInsets(): EdgeInsets {
  return useSafeAreaMetrics().contentInsets;
}

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

  // Reactive listener for native changes (rotation, iPad sidebar toggle, etc.)
  return addOnSafeAreaChangedListener((metrics) => {
    const next = options?.useWindowInsets
      ? metrics.insets
      : metrics.contentInsets;
    uniwind.updateInsets(next);
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

/**
 * React hook that returns physical window insets.
 */
export function useWindowInsets(): EdgeInsets {
  return useSafeAreaMetrics().insets;
}
