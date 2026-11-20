import { View, Text, ScrollView } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaMetrics, getSafeArea } from '@2security/nitro-safe-area';

const transition = LinearTransition.duration(350);

export const ProfileScreen = () => {
  const metrics = useSafeAreaMetrics();
  const initial = getSafeArea();

  return (
    <View className="flex-1 bg-white">
      {/* 
        ⚡ Powered by @2security/nitro-safe-area + Uniwind:
        - contentContainerClassName with pt-safe-offset-2, px-safe-offset-5, pb-safe-offset-5
        - Automatically synchronizes with Nitro JSI insets on Frame 0!
      */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-safe-offset-2 pb-safe-offset-5 px-safe-offset-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View layout={transition} className="items-center my-6">
          <View className="w-20 h-20 rounded-full bg-sky-100 border-2 border-sky-400 items-center justify-center mb-3">
            <Text className="text-3xl">👤</Text>
          </View>
          <Text className="text-slate-900 text-xl font-extrabold">
            Dương Nguyễn
          </Text>
          <Text className="text-slate-500 text-xs mt-0.5">
            2Security • Travel Pro Member
          </Text>
        </Animated.View>

        {/* Detailed Metrics Comparator Card */}
        <Animated.View
          layout={transition}
          className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200"
        >
          <Text className="text-sky-600 font-extrabold text-sm mb-3">
            📊 Insets Comparison (Raw OS vs Content Insets)
          </Text>

          <View className="bg-white p-3 rounded-xl border border-slate-200 mb-2.5">
            <Text className="text-amber-600 font-bold text-xs mb-1">
              Window Insets (Physical Screen):
            </Text>
            <Text className="text-slate-700 font-mono text-xs">
              Top: {metrics.insets.top.toFixed(1)}pt | Bottom: {metrics.insets.bottom.toFixed(1)}pt | Left: {metrics.insets.left.toFixed(1)}pt | Right: {metrics.insets.right.toFixed(1)}pt
            </Text>
          </View>

          <View className="bg-white p-3 rounded-xl border border-slate-200 mb-2.5">
            <Text className="text-emerald-600 font-bold text-xs mb-1">
              Content Insets (Adjusted for Tab/Sidebar/Capsule):
            </Text>
            <Text className="text-slate-700 font-mono text-xs">
              Top: {metrics.contentInsets.top.toFixed(1)}pt | Bottom: {metrics.contentInsets.bottom.toFixed(1)}pt | Left: {metrics.contentInsets.left.toFixed(1)}pt | Right: {metrics.contentInsets.right.toFixed(1)}pt
            </Text>
          </View>

          <View className="flex-row justify-between pt-2 border-t border-slate-200">
            <Text className="text-slate-500 text-xs">
              Frame 0 Mode: <Text className="font-bold text-slate-900">{initial.mode}</Text>
            </Text>
            <Text className="text-slate-500 text-xs">
              Sidebar Width: <Text className="font-bold text-slate-900">{metrics.sidebarWidth.toFixed(1)}pt</Text>
            </Text>
          </View>
        </Animated.View>

        {/* Navigation Mode Explanation Card */}
        <Animated.View
          layout={transition}
          className="bg-blue-50 rounded-2xl p-4 border border-blue-200"
        >
          <Text className="text-blue-800 font-extrabold text-xs mb-1.5">
            💡 iPadOS 18 Adaptive Navigation + Uniwind Architecture
          </Text>
          <Text className="text-blue-900 text-xs leading-4">
            Khi ở chế độ Leftside Sidebar, <Text className="font-bold">contentInsets.left</Text> trả về 320pt được đồng bộ trực tiếp vào Uniwind qua <Text className="font-bold">syncWithUniwind(Uniwind)</Text>. Lớp <Text className="font-bold">px-safe-offset-5</Text> tự động đẩy toàn bộ nội dung ra khỏi vùng sidebar. Khi thu gọn sang Top Capsule, view tự động tràn viền và <Text className="font-bold">LinearTransition</Text> làm chuyển động co giãn cực kỳ mượt mà!
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};
