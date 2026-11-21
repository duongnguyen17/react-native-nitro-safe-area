import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaMetrics } from '@2security/nitro-safe-area';

const transition = LinearTransition.duration(200);

export function DetailScreen() {
  const navigation = useNavigation();
  const metrics = useSafeAreaMetrics();

  return (
    <View className="flex-1 bg-slate-50">
      {/* 
        ⚡ Standard Uniwind safe area classes:
        - pt-safe-offset-4: Standard physical top inset (Status bar / Notch) + 16pt offset.
        - pb-safe-offset-6: Standard physical bottom inset (Home indicator) + 24pt offset.
        - px-safe-offset-4: Standard physical left/right insets + 16pt margins.
        Notice: No tab bar is mounted here, so standard safe-offset provides perfect spacing
        without any extraneous tab bar padding!
      */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-safe-offset-4 pb-safe-offset-6 px-safe-offset-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar / Back Button */}
        <Animated.View
          layout={transition}
          className="flex-row items-center justify-between mb-5"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center bg-white px-3.5 py-2 rounded-xl border border-slate-200 active:bg-slate-100 shadow-sm"
          >
            <Text className="text-sky-600 font-bold text-sm mr-1">←</Text>
            <Text className="text-slate-800 font-semibold text-sm">
              Back to Tabs
            </Text>
          </Pressable>

          <View className="bg-sky-100 px-3 py-1.5 rounded-full border border-sky-200">
            <Text className="text-sky-800 font-bold text-xs">Stack Screen</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View layout={transition} className="mb-4">
          <Text className="text-2xl font-black text-slate-900 tracking-tight">
            Standalone Stack Screen
          </Text>
          <Text className="text-slate-500 text-sm mt-1">
            Demonstrating default Uniwind{' '}
            <Text className="font-mono text-sky-600 font-bold">
              safe-offset
            </Text>{' '}
            utilities without a Tab Bar.
          </Text>
        </Animated.View>

        {/* Uniwind Comparison Badge Card */}
        <Animated.View
          layout={transition}
          className="bg-emerald-50 rounded-2xl p-4 mb-4 border border-emerald-200 shadow-sm"
        >
          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">🛡️</Text>
            <Text className="text-emerald-900 font-bold text-sm">
              Standard Uniwind <Text className="font-mono">safe-offset</Text>
            </Text>
          </View>
          <Text className="text-emerald-800 text-xs leading-relaxed">
            This screen uses{' '}
            <Text className="font-mono font-bold">pt-safe-offset-4</Text>,{' '}
            <Text className="font-mono font-bold">px-safe-offset-4</Text>, and{' '}
            <Text className="font-mono font-bold">pb-safe-offset-6</Text>.
            Because there is no Tab Bar in this Stack screen, Uniwind's standard
            physical insets fit like a glove!
          </Text>
        </Animated.View>

        {/* Live Metrics Comparison */}
        <Animated.View
          layout={transition}
          className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm"
        >
          <Text className="text-sky-600 font-bold text-xs uppercase tracking-wider mb-3">
            📊 Insets Breakdown for This Screen
          </Text>

          <View className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
            <Text className="text-slate-500 text-xs font-semibold mb-1">
              Active Classes Applied:
            </Text>
            <Text className="text-slate-800 font-mono text-xs">
              contentContainerClassName="pt-safe-offset-4 pb-safe-offset-6
              px-safe-offset-4"
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-slate-100">
            <Text className="text-slate-600 text-xs font-medium">
              Physical Window Insets (Used here):
            </Text>
            <Text className="text-slate-900 font-mono text-xs font-bold">
              Top: {metrics.insets.top.toFixed(1)}pt | Bottom:{' '}
              {metrics.insets.bottom.toFixed(1)}pt
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-slate-100">
            <Text className="text-slate-600 text-xs font-medium">
              Content Insets (Tab Screens):
            </Text>
            <Text className="text-slate-900 font-mono text-xs font-bold">
              Top: {metrics.contentInsets.top.toFixed(1)}pt | Bottom:{' '}
              {metrics.contentInsets.bottom.toFixed(1)}pt
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-slate-600 text-xs font-medium">
              Bottom Tab Bar Present?
            </Text>
            <Text className="text-rose-600 text-xs font-bold">
              ❌ No (Stack Level)
            </Text>
          </View>
        </Animated.View>

        {/* Architectural Explainer */}
        <Animated.View
          layout={transition}
          className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm"
        >
          <Text className="text-slate-900 font-bold text-sm mb-2">
            💡 Dual-Utility Philosophy
          </Text>
          <Text className="text-slate-600 text-xs leading-relaxed mb-3">
            •{' '}
            <Text className="font-bold text-sky-600">nitro-safe-offset-*</Text>:
            Use on screens inside bottom tabs or adaptive sidebars where
            navigation Chrome overlays content.
          </Text>
          <Text className="text-slate-600 text-xs leading-relaxed">
            • <Text className="font-bold text-emerald-600">safe-offset-*</Text>:
            Use on full-screen push destinations, modals, or media viewers where
            no tab bar or sidebar exists.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
