import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';
import { getInitialMetrics, syncWithUniwind } from '@2security/nitro-safe-area';
import { BottomTabNavigator } from './navigation/BottomTabNavigator';

// ⚡ Frame 0 Synchronous Uniwind Safe Area Sync (0ms latency, zero layout shift)
syncWithUniwind(Uniwind, { adaptiveNavigation: true });

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={getInitialMetrics()}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
