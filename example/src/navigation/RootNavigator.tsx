import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { DetailScreen } from '../screens/DetailScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Details: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    >
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen
        name="Details"
        component={DetailScreen}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          scrollEdgeEffects: { top: 'hidden' },
          headerTitle: 'Transparent Header Demo',
          headerTintColor: '#0284c7',
        }}
      />
    </Stack.Navigator>
  );
}
