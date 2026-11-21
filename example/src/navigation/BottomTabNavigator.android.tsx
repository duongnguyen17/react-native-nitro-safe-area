import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { useSafeAreaMetrics } from '@2security/nitro-safe-area';
import { Image, StyleSheet, View } from 'react-native';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ExploreScreen } from '../screens/ExploreScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

/**
 * 🛠️ CHẾ ĐỘ BOTTOM TAB TRÊN ANDROID:
 *
 * - 'navigation' (Mặc định):
 *   Dùng JS Tab Navigator (`@react-navigation/bottom-tabs`).
 *   Giao diện Material 3 Expressive tùy biến cao cấp, active pill capsule mềm mại,
 *   tự động co giãn theo safe area insets và breakpoint tablet.
 *
 * - 'native':
 *   Dùng Native Tab Navigator (`@react-navigation/bottom-tabs/unstable`).
 *   Render trực tiếp thành Android native `BottomNavigationView` từ react-native-screens.
 *   Hỗ trợ icon image native, active indicator native từ Android OS.
 */
export type AndroidTabMode = 'navigation' | 'native';
export const ANDROID_TAB_MODE: AndroidTabMode = 'native' as AndroidTabMode;

export type RootTabParamList = {
  Explore: undefined;
  Profile: undefined;
};

const homeIcon = require('../assets/tab_home.png');
const homeFillIcon = require('../assets/tab_home_fill.png');
const gearIcon = require('../assets/tab_gear.png');
const gearFillIcon = require('../assets/tab_gear_fill.png');

// =============================================================================
// 1. Navigation Bottom Tab (@react-navigation/bottom-tabs) - Material 3 Style
// =============================================================================
const JSNavTabs = createBottomTabNavigator<RootTabParamList>();

const NavigationShowcaseIcon = ({ focused }: { focused: boolean }) => {
  const tint = focused ? '#0284c7' : '#64748b';
  return (
    <View style={[styles.pill, focused && styles.pillActive]}>
      <Image
        source={focused ? homeFillIcon : homeIcon}
        style={[styles.icon, { tintColor: tint }]}
        resizeMode="contain"
      />
    </View>
  );
};

const NavigationDiagnosticsIcon = ({ focused }: { focused: boolean }) => {
  const tint = focused ? '#0284c7' : '#64748b';
  return (
    <View style={[styles.pill, focused && styles.pillActive]}>
      <Image
        source={focused ? gearFillIcon : gearIcon}
        style={[styles.icon, { tintColor: tint }]}
        resizeMode="contain"
      />
    </View>
  );
};

const JSBottomTabNavigator = () => {
  const metrics = useSafeAreaMetrics();
  const isSidebar = useBreakpoint('2xl');
  const bottomInset = metrics.contentInsets.bottom;
  const tabHeight = 68 + (bottomInset > 0 ? bottomInset : 8);

  return (
    <JSNavTabs.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarPosition: isSidebar ? 'left' : 'bottom',
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: -2,
        },
        tabBarStyle: {
          height: isSidebar ? undefined : tabHeight,
          width: isSidebar ? 96 : undefined,
          paddingTop: 8,
          paddingBottom: isSidebar ? 8 : bottomInset > 0 ? bottomInset : 8,
          backgroundColor: '#ffffff',
          borderTopWidth: isSidebar ? 0 : 1,
          borderTopColor: '#f1f5f9',
          borderRightWidth: isSidebar ? 1 : 0,
          borderRightColor: '#f1f5f9',
          elevation: 10,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
      }}
    >
      <JSNavTabs.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Showcase',
          tabBarIcon: NavigationShowcaseIcon,
        }}
      />
      <JSNavTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Diagnostics',
          tabBarIcon: NavigationDiagnosticsIcon,
        }}
      />
    </JSNavTabs.Navigator>
  );
};

// =============================================================================
// 2. Native Bottom Tab (@react-navigation/bottom-tabs/unstable) - Android Native
// =============================================================================
const NativeTabs = createNativeBottomTabNavigator<RootTabParamList>();

const NativeBottomTabNavigator = () => {
  return (
    <NativeTabs.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarLabelVisibilityMode: 'labeled',
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#64748b',
        tabBarActiveIndicatorColor: '#e0f2fe',
        tabBarActiveIndicatorEnabled: true,
      }}
    >
      <NativeTabs.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Showcase',
          tabBarIcon: ({ focused }) => ({
            type: 'image',
            source: focused ? homeFillIcon : homeIcon,
          }),
        }}
      />
      <NativeTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Diagnostics',
          tabBarIcon: ({ focused }) => ({
            type: 'image',
            source: focused ? gearFillIcon : gearIcon,
          }),
        }}
      />
    </NativeTabs.Navigator>
  );
};

// =============================================================================
// Export BottomTabNavigator
// =============================================================================
export const BottomTabNavigator = () => {
  if (ANDROID_TAB_MODE === 'native') {
    return <NativeBottomTabNavigator />;
  }
  return <JSBottomTabNavigator />;
};

const styles = StyleSheet.create({
  pill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  pillActive: {
    backgroundColor: '#e0f2fe',
  },
  icon: {
    width: 22,
    height: 22,
  },
});
