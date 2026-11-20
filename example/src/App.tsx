import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';
import { getSafeArea, syncWithUniwind } from '@2security/nitro-safe-area';
import { BottomTabNavigator } from './navigation/BottomTabNavigator';

// ⚡ Frame 0 Synchronous Uniwind Safe Area Sync (0ms latency, zero layout shift)
syncWithUniwind(Uniwind);

const initial = getSafeArea();
const initialMetrics = {
  insets: initial.insets,
  frame: { x: 0, y: 0, width: 0, height: 0 },
};

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
