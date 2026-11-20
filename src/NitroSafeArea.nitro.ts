import type { HybridObject } from 'react-native-nitro-modules';

export interface EdgeInsets {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export type NavigationMode =
  'iphone_bottom_tab' | 'ipad_top_capsule' | 'ipad_left_sidebar' | 'none';

export type DeviceOrientation = 'portrait' | 'landscape';

export interface SafeAreaMetrics {
  /** Physical window safe area insets directly from the OS */
  insets: EdgeInsets;
  /** Content insets factoring in TabBar, iPad sidebar, or floating top capsule */
  contentInsets: EdgeInsets;
  /** Current navigation UI mode */
  mode: NavigationMode;
  /** Bottom tab bar height on iPhone (0 if hidden or not present) */
  tabBarHeight: number;
  /** Top floating capsule tab bar height on iPad (0 if not present) */
  topCapsuleHeight: number;
  /** Left sidebar width on iPad (0 if collapsed or not present) */
  sidebarWidth: number;
  /** Whether the native tab bar / sidebar is currently hidden */
  isTabBarHidden: boolean;
  /** Device orientation */
  orientation: DeviceOrientation;
}

export interface NitroSafeArea extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  /**
   * Synchronously queries current SafeAreaMetrics directly from Native (0ms latency, zero layout shift).
   */
  getSafeArea(): SafeAreaMetrics;

  /**
   * Registers a native listener for safe area, orientation, and tab bar/sidebar mode changes.
   */
  addOnSafeAreaChangedListener(
    listener: (metrics: SafeAreaMetrics) => void
  ): () => void;
}
