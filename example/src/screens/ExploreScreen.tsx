import { useSafeAreaMetrics } from '@2security/nitro-safe-area';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useRenderCount } from '../hooks/useRenderCount';

const transition = LinearTransition.duration(300);

export const ExploreScreen = () => {
  const metrics = useSafeAreaMetrics();
  const renderCount = useRenderCount();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const getModeLabel = () => {
    switch (metrics.mode) {
      case 'iphone_bottom_tab':
        return '📱 iPhone (Native Bottom Tab)';
      case 'ipad_top_capsule':
        return '💊 iPad (Floating Top Capsule)';
      case 'ipad_left_sidebar':
        return '📑 iPad (Leftside Sidebar)';
      default:
        return 'Standard Screen';
    }
  };

  const toggleCard = (index: number) => {
    setExpandedCard((prev) => (prev === index ? null : index));
  };

  return (
    <View className="flex-1 bg-white">
      {/* 
        ⚡ Powered by @2security/nitro-safe-area + Uniwind:
        - pt-safe-offset-10: Insets + 10pt offset for header breathing room.
        - px-safe-offset-5: Adapts to iPad Leftside Sidebar (320pt + 20pt) or standard margins (20pt).
        - pb-safe-offset-5: Insets + 20pt for bottom home bar or iPhone tab bar.
      */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-safe-offset-10 pb-safe-offset-5 px-safe-offset-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Real-time Nitro Safe Area Inspector Card */}
        <Animated.View
          layout={transition}
          className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200 shadow-sm"
        >
          {/* Header Row: Title & Status Badges */}
          <View className="flex-col gap-y-2 xl:flex-row xl:items-center xl:justify-between mb-3">
            <Text className="text-sky-600 font-bold text-xs uppercase tracking-wider">
              ⚡ Nitro Safe Area + Uniwind
            </Text>
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <View className="bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                <Text className="text-amber-800 text-[10px] font-bold">
                  Render #{renderCount}
                </Text>
              </View>
              <View className="bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <Text className="text-emerald-700 text-[10px] font-bold">
                  0ms JSI Sync
                </Text>
              </View>
            </View>
          </View>

          {/* Mode & Orientation */}
          <View className="flex-col gap-y-1 xl:flex-row xl:items-center xl:justify-between mb-3">
            <Text className="text-slate-800 font-semibold text-xs">
              Current Mode:{' '}
              <Text className="text-sky-600 font-bold">{getModeLabel()}</Text>
            </Text>
            <Text className="text-slate-500 text-xs">
              Orientation:{' '}
              <Text className="text-slate-900 font-mono font-bold">
                {metrics.orientation.toUpperCase()}
              </Text>
            </Text>
          </View>

          <View className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200">
            <View className="flex-row justify-between py-0.5">
              <Text className="text-slate-500 text-xs">Top Inset:</Text>
              <Text className="text-slate-800 font-mono font-bold text-xs">
                {metrics.contentInsets.top.toFixed(1)}pt
              </Text>
            </View>
            <View className="flex-row justify-between py-0.5">
              <Text className="text-slate-500 text-xs">Bottom Inset:</Text>
              <Text className="text-slate-800 font-mono font-bold text-xs">
                {metrics.contentInsets.bottom.toFixed(1)}pt
              </Text>
            </View>
            <View className="flex-row justify-between py-0.5">
              <Text className="text-slate-500 text-xs">Left Inset:</Text>
              <Text className="text-slate-800 font-mono font-bold text-xs">
                {metrics.contentInsets.left.toFixed(1)}pt
              </Text>
            </View>
            <View className="flex-row justify-between py-0.5">
              <Text className="text-slate-500 text-xs">Right Inset:</Text>
              <Text className="text-slate-800 font-mono font-bold text-xs">
                {metrics.contentInsets.right.toFixed(1)}pt
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Hero Title Section */}
        <Animated.View layout={transition} className="mb-6">
          <Text className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Safe Area Showcase
          </Text>
          <Text className="text-slate-500 text-sm mt-1">
            Demonstrating synchronous Frame 0 layout and iPadOS 18 adaptive
            navigation support.
          </Text>
        </Animated.View>

        {/* Feature Cards with Animated Layout */}
        <View className="gap-3">
          {/* Card 1 */}
          <Animated.View
            layout={transition}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleCard(1)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text className="text-slate-900 font-bold text-sm">
                  ⚡ Zero Frame Latency (0ms)
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  Eliminates 1-frame async layout shifts on cold launch.
                </Text>
              </View>
              <Text className="text-slate-400 text-sm font-bold">
                {expandedCard === 1 ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedCard === 1 && (
              <Animated.View
                layout={transition}
                className="mt-3 pt-3 border-t border-slate-100"
              >
                <Text className="text-slate-600 text-xs leading-5">
                  Unlike traditional async safe area providers that mount with
                  0px and re-render on frame 1, Nitro Safe Area queries UIKit
                  synchronously via JSI at Frame 0, completely removing visual
                  jumps and flickering.
                </Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* Card 2 */}
          <Animated.View
            layout={transition}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleCard(2)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text className="text-slate-900 font-bold text-sm">
                  📑 iPadOS 18 Adaptive Navigation
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  Inspects Leftside Sidebar (~320pt) vs Top Capsule (~88pt).
                </Text>
              </View>
              <Text className="text-slate-400 text-sm font-bold">
                {expandedCard === 2 ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedCard === 2 && (
              <Animated.View
                layout={transition}
                className="mt-3 pt-3 border-t border-slate-100"
              >
                <Text className="text-slate-600 text-xs leading-5">
                  Automatically tracks the native UITabBarController hierarchy
                  to detect whether iPadOS 18 renders a sidebar or a floating
                  top capsule, dynamically updating Uniwind CSS insets.
                </Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* Card 3 */}
          <Animated.View
            layout={transition}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleCard(3)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text className="text-slate-900 font-bold text-sm">
                  🎨 Seamless Uniwind Tailwind v4
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  Direct use of pt-safe, px-safe, and offset utilities.
                </Text>
              </View>
              <Text className="text-slate-400 text-sm font-bold">
                {expandedCard === 3 ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedCard === 3 && (
              <Animated.View
                layout={transition}
                className="mt-3 pt-3 border-t border-slate-100"
              >
                <Text className="text-slate-600 text-xs leading-5">
                  With{' '}
                  <Text className="font-mono text-sky-600">
                    syncWithUniwind(Uniwind)
                  </Text>
                  , safe area classes work out-of-the-box without wrapping
                  components in SafeAreaProvider or SafeAreaListener.
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};
