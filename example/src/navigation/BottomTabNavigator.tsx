import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { ExploreScreen } from '../screens/ExploreScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { renderNativeTabSafeAreaLayout } from './native-tab-safe-area-listener';

export type RootTabParamList = {
  Explore: undefined;
  Profile: undefined;
};

const Tabs = createNativeBottomTabNavigator<RootTabParamList>();

export const BottomTabNavigator = () => {
  const { width } = useWindowDimensions();

  // On iPad Landscape or wide screen (>= 1024px), use native Leftside Sidebar!
  // On Portrait or iPhone, use standard TabBar (which renders as top floating capsule on iPad, or bottom tab on iPhone).
  const isSidebar = width >= 1024;

  const renderExploreTabIcon = useCallback(
    ({ focused }: { focused: boolean }) => ({
      type: 'sfSymbol' as const,
      name: focused ? ('house.fill' as const) : ('house' as const),
    }),
    []
  );

  const renderProfileTabIcon = useCallback(
    ({ focused }: { focused: boolean }) => ({
      type: 'sfSymbol' as const,
      name: focused
        ? ('person.crop.circle.fill' as const)
        : ('person.crop.circle' as const),
    }),
    []
  );

  return (
    <Tabs.Navigator
      backBehavior="history"
      screenLayout={renderNativeTabSafeAreaLayout}
      screenOptions={{
        headerShown: false,
        tabBarLabelVisibilityMode: 'labeled',
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0f172a',
        },
        tabBarControllerMode: isSidebar ? 'tabSidebar' : 'tabBar',
      }}
    >
      <Tabs.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Khám phá',
          tabBarIcon: renderExploreTabIcon,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân',
          tabBarIcon: renderProfileTabIcon,
        }}
      />
    </Tabs.Navigator>
  );
};
