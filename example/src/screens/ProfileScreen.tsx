import { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaMetrics, getSafeArea } from '@2security/nitro-safe-area';

const transition = LinearTransition.duration(300);

export const ProfileScreen = () => {
  const metrics = useSafeAreaMetrics();
  const initial = getSafeArea();
  const [autoSync, setAutoSync] = useState(true);
  const [debugLogs, setDebugLogs] = useState(false);

  return (
    <View className="flex-1 bg-white">
      {/* 
        ⚡ Powered by @2security/nitro-safe-area + Uniwind:
        - pt-safe-offset-2: Insets + 8pt offset for clean header breathing room below navigation bar/capsule.
        - px-safe-offset-5: Adapts to iPad Leftside Sidebar (320pt + 20pt) or standard margins (20pt).
        - pb-safe-offset-5: Insets + 20pt for bottom home bar or iPhone tab bar.
      */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-safe-offset-2 pb-safe-offset-5 px-safe-offset-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View layout={transition} className="items-center my-5">
          <View className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 items-center justify-center mb-2">
            <Text className="text-2xl">⚙️</Text>
          </View>
          <Text className="text-slate-900 text-lg font-bold">
            Diagnostics & Settings
          </Text>
          <Text className="text-slate-400 text-xs">
            @2security/nitro-safe-area
          </Text>
        </Animated.View>

        {/* Insets Detailed Comparison Card */}
        <Animated.View
          layout={transition}
          className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm"
        >
          <Text className="text-sky-600 font-bold text-xs uppercase tracking-wider mb-3">
            📊 Insets Comparison (Window vs Content)
          </Text>

          <View className="bg-white p-3 rounded-xl border border-slate-200 mb-2.5">
            <Text className="text-amber-600 font-bold text-xs mb-1">
              Window Insets (Physical Display):
            </Text>
            <Text className="text-slate-700 font-mono text-xs">
              Top: {metrics.insets.top.toFixed(1)}pt | Bottom:{' '}
              {metrics.insets.bottom.toFixed(1)}pt | Left:{' '}
              {metrics.insets.left.toFixed(1)}pt | Right:{' '}
              {metrics.insets.right.toFixed(1)}pt
            </Text>
          </View>

          <View className="bg-white p-3 rounded-xl border border-slate-200 mb-2.5">
            <Text className="text-emerald-600 font-bold text-xs mb-1">
              Content Insets (Adjusted for Tab/Sidebar/Capsule):
            </Text>
            <Text className="text-slate-700 font-mono text-xs">
              Top: {metrics.contentInsets.top.toFixed(1)}pt | Bottom:{' '}
              {metrics.contentInsets.bottom.toFixed(1)}pt | Left:{' '}
              {metrics.contentInsets.left.toFixed(1)}pt | Right:{' '}
              {metrics.contentInsets.right.toFixed(1)}pt
            </Text>
          </View>

          <View className="bg-white p-3 rounded-xl border border-slate-200">
            <Text className="text-sky-600 font-bold text-xs mb-1">
              Initial Cold Start Snapshot:
            </Text>
            <Text className="text-slate-500 font-mono text-xs">
              Top: {initial.contentInsets.top.toFixed(1)}pt | Left:{' '}
              {initial.contentInsets.left.toFixed(1)}pt | Mode: {initial.mode}
            </Text>
          </View>
        </Animated.View>

        {/* Configuration Options */}
        <Animated.View
          layout={transition}
          className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm gap-4"
        >
          <Text className="text-slate-800 font-bold text-xs uppercase tracking-wider">
            Configuration
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-slate-800 text-sm font-semibold">
                Auto Sync Uniwind Runtime
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                Automatically pushes insets to Uniwind store via JSI listener.
              </Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
            />
          </View>

          <View className="h-[1px] bg-slate-100" />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-slate-800 text-sm font-semibold">
                Debug Console Logging
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                Output safe area change events to native console.
              </Text>
            </View>
            <Switch
              value={debugLogs}
              onValueChange={setDebugLogs}
              trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
            />
          </View>
        </Animated.View>

        {/* Build & Environment Info */}
        <Animated.View
          layout={transition}
          className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
        >
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Environment
          </Text>
          <View className="flex-row justify-between py-1 border-b border-slate-200">
            <Text className="text-slate-500 text-xs">Library</Text>
            <Text className="text-slate-800 font-mono text-xs">
              @2security/nitro-safe-area
            </Text>
          </View>
          <View className="flex-row justify-between py-1 border-b border-slate-200">
            <Text className="text-slate-500 text-xs">Engine</Text>
            <Text className="text-slate-800 font-mono text-xs">
              Nitro Modules (JSI / C++)
            </Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-slate-500 text-xs">Styling</Text>
            <Text className="text-slate-800 font-mono text-xs">
              Uniwind (Tailwind CSS v4)
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};
