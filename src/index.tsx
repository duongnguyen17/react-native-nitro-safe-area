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
 * React hook that returns physical window insets.
 */
export function useWindowInsets(): EdgeInsets {
  return useSafeAreaMetrics().insets;
}
