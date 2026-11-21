import type { HybridObject } from 'react-native-nitro-modules';

/**
 * Represents 4-side edge insets in density-independent pixels (dp/pt).
 */
export interface EdgeInsets {
  /** Top inset in density-independent pixels (points on iOS, dp on Android). */
  top: number;
  /** Left inset in density-independent pixels (points on iOS, dp on Android). */
  left: number;
  /** Bottom inset in density-independent pixels (points on iOS, dp on Android). */
  bottom: number;
  /** Right inset in density-independent pixels (points on iOS, dp on Android). */
  right: number;
}

/**
 * Navigation UI display mode detected from the native UIKit / Android view hierarchy.
 *
 * - `'iphone_bottom_tab'`: Native bottom tab bar on iPhone (or Android navigation bar).
 * - `'ipad_top_capsule'`: iPadOS 18 floating top capsule tab bar (~88pt).
 * - `'ipad_left_sidebar'`: iPadOS 18 native left sidebar navigation (~320pt).
 * - `'none'`: Standard edge-to-edge view without native tab bar/sidebar.
 */
export type NavigationMode =
  'iphone_bottom_tab' | 'ipad_top_capsule' | 'ipad_left_sidebar' | 'none';

/**
 * Physical device orientation detected from native window metrics.
 *
 * - `'portrait'`: Height is greater than or equal to width.
 * - `'landscape'`: Width is greater than height.
 */
export type DeviceOrientation = 'portrait' | 'landscape';

/**
 * Complete metrics bundle capturing safe area insets and adaptive navigation state.
 */
export interface SafeAreaMetrics {
  /**
   * Physical window safe area insets directly from the OS (status bar, home indicator, cutouts).
   * Does NOT include native tab bar or sidebar dimensions.
   */
  insets: EdgeInsets;

  /**
   * Content insets adjusted for active native navigation Chrome (Tab Bar, iPad Sidebar, or Top Capsule).
   * - On iPhone: `bottom` includes the native bottom tab bar height (~83pt).
   * - On iPad (Top Capsule): `top` includes the floating capsule height (~88pt).
   * - On iPad (Left Sidebar): `left` includes the left sidebar width (~320pt).
   */
  contentInsets: EdgeInsets;

  /**
   * Current navigation UI mode detected from the view hierarchy.
   */
  mode: NavigationMode;

  /**
   * Native bottom tab bar height on iPhone (0 if hidden or not present).
   */
  tabBarHeight: number;

  /**
   * Top floating capsule tab bar height on iPadOS 18 (0 if not present).
   */
  topCapsuleHeight: number;

  /**
   * Left sidebar width on iPadOS 18 (0 if collapsed or not present).
   */
  sidebarWidth: number;

  /**
   * Whether the native UITabBar / sidebar is currently hidden.
   */
  isTabBarHidden: boolean;

  /**
   * Current physical screen orientation (`'portrait'` | `'landscape'`).
   */
  orientation: DeviceOrientation;
}

/**
 * Nitro Hybrid Object specification for native safe area and adaptive navigation inspection.
 */
export interface NitroSafeArea extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  /**
   * Synchronously queries current `SafeAreaMetrics` directly from Native via JSI.
   *
   * @remarks
   * Executes in 0ms synchronously without crossing asynchronous bridge serialization.
   * Eliminates the 1-frame async layout shift (0px -> real insets) on cold launch.
   *
   * @returns The latest snapshot of safe area insets and navigation metrics.
   */
  getSafeArea(): SafeAreaMetrics;

  /**
   * Registers a native listener for safe area, orientation, and navigation mode changes.
   *
   * @param listener Callback invoked whenever insets, orientation, or navigation mode changes.
   * @returns Unsubscribe function to tear down the native listener.
   */
  addOnSafeAreaChangedListener(
    listener: (metrics: SafeAreaMetrics) => void
  ): () => void;
}
