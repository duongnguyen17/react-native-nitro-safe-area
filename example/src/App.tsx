import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getSafeArea } from '@2security/nitro-safe-area';
import { BottomTabNavigator } from './navigation/BottomTabNavigator';

// Query exact native insets synchronously at bundle load time (0ms)
const initial = getSafeArea();
const initialMetrics = {
  insets: initial.insets,
  frame: { x: 0, y: 0, width: 0, height: 0 },
};

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
