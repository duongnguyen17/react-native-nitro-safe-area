import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaMetrics } from '@2security/nitro-safe-area';

export function DetailScreen() {
  const navigation = useNavigation<any>();
  const metrics = useSafeAreaMetrics();

  return (
    <View className="flex-1 bg-slate-50">
      {/* 
        ⚡ Zero Layout Shift Native Header Utilities:
        - pt-header-offset-4: Total header height (Status bar + Navigation bar) + 16pt offset.
        - pb-safe-offset-6: Standard physical bottom inset (Home indicator) + 24pt offset.
        - px-safe-offset-4: Standard physical left/right insets + 16pt margins.
        Notice: With headerTransparent: true, pt-header-offset-4 guarantees 0ms synchronous
        placement below the native header at Frame 0!
      */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-header-offset-4 pb-safe-offset-6 px-safe-offset-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Frame 0 Badge */}
        <View className="flex-row mb-4">
          <View className="bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
            <Text className="text-emerald-800 font-bold text-xs">
              ⚡ 0ms Frame 0 Sync
            </Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-slate-900 tracking-tight">
            Transparent Stack Header
          </Text>
          <Text className="text-slate-500 text-sm mt-1">
            Using Uniwind{' '}
            <Text className="font-mono text-sky-600 font-bold">
              pt-header-offset-4
            </Text>{' '}
            with zero layout shift under{' '}
            <Text className="font-mono font-semibold">
              headerTransparent: true
            </Text>
            .
          </Text>
        </View>

        {/* Header Height Zero-Shift Card */}
        <View className="bg-sky-50 rounded-2xl p-4 mb-4 border border-sky-200 shadow-sm">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">🎯</Text>
            <Text className="text-sky-900 font-bold text-sm">
              Tailwind <Text className="font-mono">pt-header-offset-*</Text>
            </Text>
          </View>
          <Text className="text-sky-800 text-xs leading-relaxed">
            This screen uses{' '}
            <Text className="font-mono font-bold">pt-header-offset-4</Text>. The
            content is automatically offset by exactly{' '}
            <Text className="font-mono font-bold">
              {metrics.headerHeight.toFixed(0)}pt + 16pt ={' '}
              {(metrics.headerHeight + 16).toFixed(0)}pt
            </Text>{' '}
            at Frame 0 directly via C++ JSI without waiting for any React hooks!
          </Text>
        </View>

        {/* Live Metrics Breakdown */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <Text className="text-sky-600 font-bold text-xs uppercase tracking-wider mb-3">
            📊 Native Header Metrics Breakdown
          </Text>

          <View className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
            <Text className="text-slate-500 text-xs font-semibold mb-1">
              Active Container Classes:
            </Text>
            <Text className="text-slate-800 font-mono text-xs">
              contentContainerClassName="pt-header-offset-4 pb-safe-offset-6
              px-safe-offset-4"
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-slate-100">
            <Text className="text-slate-600 text-xs font-medium">
              Top Safe Area Inset (Status Bar):
            </Text>
            <Text className="text-slate-900 font-mono text-xs font-bold">
              {metrics.insets.top.toFixed(1)} pt
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-slate-100">
            <Text className="text-slate-600 text-xs font-medium">
              Navigation Bar Height (navBarHeight):
            </Text>
            <Text className="text-slate-900 font-mono text-xs font-bold">
              {metrics.navBarHeight.toFixed(1)} pt
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-slate-100">
            <Text className="text-slate-600 text-xs font-medium">
              Total Header Height (headerHeight):
            </Text>
            <Text className="text-sky-600 font-mono text-xs font-bold">
              {metrics.headerHeight.toFixed(1)} pt
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-slate-600 text-xs font-medium">
              Large Title Bar Height:
            </Text>
            <Text className="text-slate-900 font-mono text-xs font-bold">
              {metrics.largeTitleNavBarHeight.toFixed(1)} pt
            </Text>
          </View>
        </View>

        {/* Visual Ruler Demonstration */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <Text className="text-slate-900 font-bold text-sm mb-2">
            📏 Visual Utility Demonstration
          </Text>
          <Text className="text-slate-500 text-xs mb-3">
            The boxes below use the new Tailwind utility classes directly in
            CSS:
          </Text>

          {/* Box using h-nav-bar */}
          <View className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-slate-600 text-xs font-mono font-bold">
                h-nav-bar ({metrics.navBarHeight.toFixed(0)}pt)
              </Text>
              <Text className="text-indigo-600 text-xs font-medium">
                Navigation Bar Only
              </Text>
            </View>
            <View className="h-nav-bar bg-indigo-100 rounded-xl border border-indigo-300 items-center justify-center">
              <Text className="text-indigo-800 text-xs font-bold font-mono">
                className="h-nav-bar"
              </Text>
            </View>
          </View>

          {/* Box using h-header */}
          <View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-slate-600 text-xs font-mono font-bold">
                h-header ({metrics.headerHeight.toFixed(0)}pt)
              </Text>
              <Text className="text-sky-600 text-xs font-medium">
                Status Bar + Nav Bar
              </Text>
            </View>
            <View className="h-header bg-sky-100 rounded-xl border border-sky-300 items-center justify-center">
              <Text className="text-sky-800 text-xs font-bold font-mono">
                className="h-header"
              </Text>
            </View>
          </View>
        </View>

        {/* Test FormSheet Modal Over Transparent Header */}
        <View className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-200 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">🛡️</Text>
              <Text className="text-purple-950 font-bold text-sm">
                Modal-Immune Defense Test
              </Text>
            </View>
            <View className="bg-purple-200/70 px-2 py-0.5 rounded-md">
              <Text className="text-purple-900 text-[10px] font-bold">
                Zero Shift
              </Text>
            </View>
          </View>
          <Text className="text-purple-800 text-xs mb-3 leading-relaxed">
            Open a native FormSheet modal over this screen. Notice that during
            and after modal presentation, this screen's transparent header
            height ({metrics.headerHeight.toFixed(0)}pt) stays 100% frozen!
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FormSheet')}
            className="bg-purple-600 active:bg-purple-700 py-2.5 px-4 rounded-xl items-center flex-row justify-center shadow-sm"
          >
            <Text className="text-white font-bold text-sm mr-1">
              Open FormSheet Over Header
            </Text>
            <Text className="text-white font-bold text-sm">→</Text>
          </TouchableOpacity>
        </View>

        {/* Available Tailwind Classes Reference */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <Text className="text-slate-900 font-bold text-sm mb-2">
            ✨ Available Header Utilities
          </Text>
          <View className="gap-2">
            <View className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Text className="font-mono text-xs font-bold text-sky-700">
                pt-header / pt-header-offset-*
              </Text>
              <Text className="text-slate-600 text-xs mt-0.5">
                Padding top matching total header height (insets.top +
                navBarHeight).
              </Text>
            </View>
            <View className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Text className="font-mono text-xs font-bold text-sky-700">
                h-header / min-h-header / top-header
              </Text>
              <Text className="text-slate-600 text-xs mt-0.5">
                Height and positioning for custom full-bleed headers or sticky
                overlays.
              </Text>
            </View>
            <View className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Text className="font-mono text-xs font-bold text-indigo-700">
                pt-nav-bar / pt-nav-bar-offset-* / h-nav-bar
              </Text>
              <Text className="text-slate-600 text-xs mt-0.5">
                Height and padding matching only the native Navigation Bar
                (44pt/32pt/50pt/56dp).
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
