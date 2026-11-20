import { Text, View, StyleSheet } from 'react-native';
import {
  useSafeAreaMetrics,
  useContentInsets,
  getSafeArea,
} from '@2security/nitro-safe-area';

// Synchronous check at bundle evaluation
const initialMetrics = getSafeArea();

export default function App() {
  const metrics = useSafeAreaMetrics();
  const contentInsets = useContentInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: contentInsets.top,
          paddingBottom: contentInsets.bottom,
          paddingLeft: contentInsets.left,
          paddingRight: contentInsets.right,
        },
      ]}
    >
      <Text style={styles.title}>⚡ @2security/nitro-safe-area</Text>
      <Text style={styles.subTitle}>Mode: {metrics.mode}</Text>
      <Text style={styles.text}>Orientation: {metrics.orientation}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Content Insets (Zero Shift):</Text>
        <Text style={styles.code}>
          Top: {contentInsets.top.toFixed(1)}pt | Bottom:{' '}
          {contentInsets.bottom.toFixed(1)}pt
        </Text>
        <Text style={styles.code}>
          Left: {contentInsets.left.toFixed(1)}pt | Right:{' '}
          {contentInsets.right.toFixed(1)}pt
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Initial Metrics (Frame 0):</Text>
        <Text style={styles.code}>
          Initial Mode: {initialMetrics.mode} | TabBar Height:{' '}
          {initialMetrics.tabBarHeight}pt
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 6,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#a5f3fc',
  },
});
