import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaMetrics } from '@2security/nitro-safe-area';
import { useRenderCount } from '../hooks/useRenderCount';

export function FormSheetScreen() {
  const navigation = useNavigation();
  const metrics = useSafeAreaMetrics();
  const renderCount = useRenderCount();

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-safe-offset-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Modal Status Badges */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="bg-purple-100 px-3 py-1.5 rounded-full border border-purple-200">
            <Text className="text-purple-800 font-bold text-xs">
              📑 Native FormSheet Modal
            </Text>
          </View>
          <View className="bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
            <Text className="text-emerald-700 text-[10px] font-bold">
              Render #{renderCount}
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text className="text-2xl font-black text-slate-900 tracking-tight mb-1">
          FormSheet Isolation Demo
        </Text>
        <Text className="text-slate-500 text-xs mb-5 leading-relaxed">
          This screen is presented natively via{' '}
          <Text className="font-mono text-purple-600 font-bold">
            presentation: 'formSheet'
          </Text>
          . It verifies that modal sheets cannot corrupt or shift the underlying
          app's navigation stack header height or tab bar insets.
        </Text>

        {/* Defense Highlights Card */}
        <View className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-200 shadow-sm">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">🛡️</Text>
            <Text className="text-purple-900 font-bold text-sm">
              4-Layer Modal-Immune Defense
            </Text>
          </View>
          <Text className="text-purple-800 text-xs leading-relaxed mb-3">
            In UIKit, presenting a FormSheet / DatePicker creates a floating
            container. Without our 4-layer defense, the global navigation bar
            tracker would lock onto this sheet's bar, causing background screens
            to jump wildly.
          </Text>
          <View className="gap-2">
            <View className="bg-white p-2.5 rounded-xl border border-purple-100">
              <Text className="text-purple-900 font-bold text-xs">
                1. Base Stack Traversal
              </Text>
              <Text className="text-slate-600 text-[11px] mt-0.5">
                Ignores presentedViewController unless it's a full-window modal.
              </Text>
            </View>
            <View className="bg-white p-2.5 rounded-xl border border-purple-100">
              <Text className="text-purple-900 font-bold text-xs">
                2. Full-Width & Top-Anchoring Filter
              </Text>
              <Text className="text-slate-600 text-[11px] mt-0.5">
                Rejects floating / non-full-width navigation bars (iPad 540pt
                cards).
              </Text>
            </View>
            <View className="bg-white p-2.5 rounded-xl border border-purple-100">
              <Text className="text-purple-900 font-bold text-xs">
                3. Transition State Guard
              </Text>
              <Text className="text-slate-600 text-[11px] mt-0.5">
                Locks metrics during in-flight slide up/down sheet animations.
              </Text>
            </View>
          </View>
        </View>

        {/* Live Metrics Inside Modal */}
        <View className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200 shadow-sm">
          <Text className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">
            📊 Current Metrics Snapshot
          </Text>
          <View className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200">
            <View className="flex-row justify-between py-0.5">
              <Text className="text-slate-500 text-xs">Header Height:</Text>
              <Text className="text-slate-800 font-mono font-bold text-xs">
                {metrics.headerHeight.toFixed(0)}pt
              </Text>
            </View>
            <View className="flex-row justify-between py-0.5">
              <Text className="text-slate-500 text-xs">Nav Bar Height:</Text>
              <Text className="text-slate-800 font-mono font-bold text-xs">
                {metrics.navBarHeight.toFixed(0)}pt
              </Text>
            </View>
            <View className="flex-row justify-between py-0.5">
              <Text className="text-slate-500 text-xs">Bottom Inset:</Text>
              <Text className="text-slate-800 font-mono font-bold text-xs">
                {metrics.insets.bottom.toFixed(0)}pt
              </Text>
            </View>
            <View className="flex-row justify-between py-0.5">
              <Text className="text-slate-500 text-xs">Navigation Mode:</Text>
              <Text className="text-sky-600 font-mono font-bold text-xs">
                {metrics.mode}
              </Text>
            </View>
          </View>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          className="bg-slate-900 active:bg-slate-800 py-3 px-4 rounded-xl items-center justify-center shadow-sm"
        >
          <Text className="text-white font-bold text-sm">
            Close FormSheet Modal
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
