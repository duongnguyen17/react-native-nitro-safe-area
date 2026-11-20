import { useCallback } from 'react';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { ExploreScreen } from '../screens/ExploreScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type RootTabParamList = {
  Explore: undefined;
  Profile: undefined;
};

const Tabs = createNativeBottomTabNavigator<RootTabParamList>();

export const BottomTabNavigator = () => {
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
      name: focused ? ('gearshape.fill' as const) : ('gearshape' as const),
    }),
    []
  );

  return (
    <Tabs.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarLabelVisibilityMode: 'labeled',
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#64748b',
        tabBarControllerMode: 'tabSidebar',
      }}
    >
      <Tabs.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Showcase',
          tabBarIcon: renderExploreTabIcon,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Diagnostics',
          tabBarIcon: renderProfileTabIcon,
        }}
      />
    </Tabs.Navigator>
  );
};
