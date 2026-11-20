import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaMetrics } from '@2security/nitro-safe-area';

const transition = LinearTransition.duration(350);

export const ExploreScreen = () => {
  const metrics = useSafeAreaMetrics();

  const getModeLabel = () => {
    switch (metrics.mode) {
      case 'iphone_bottom_tab':
        return '📱 iPhone (Native Bottom Tab)';
      case 'ipad_top_capsule':
        return '💊 iPad (Floating Top Capsule)';
      case 'ipad_left_sidebar':
        return '📑 iPad (Leftside Sidebar)';
      default:
        return 'Normal / Hidden';
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* 
        ⚡ Powered by @2security/nitro-safe-area + Uniwind:
        - pt-safe-offset-2: In Top Capsule mode, pads 88px + 8px so list items start below floating bar,
          while root View extends edge-to-edge behind the blur.
        - px-safe-offset-5: In Leftside Sidebar mode, pads 320px + 20px so content is smoothly pushed out.
        - pb-safe-offset-5: Adapts to bottom home bar or iPhone bottom tab.
      */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-safe-offset-2 pb-safe-offset-5 px-safe-offset-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Live Nitro Safe Area Inspector Card */}
        <Animated.View
          layout={transition}
          className="bg-slate-100 rounded-2xl p-3.5 mb-4 border border-slate-200"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sky-600 font-bold text-xs">
              ⚡ Nitro Safe Area + Uniwind Runtime
            </Text>
            <View className="bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
              <Text className="text-green-700 text-[10px] font-bold">
                0ms Frame 0 Sync
              </Text>
            </View>
          </View>

          <Text className="text-slate-800 font-semibold text-xs mb-1">
            Mode: <Text className="text-sky-600 font-bold">{getModeLabel()}</Text>
          </Text>
          <Text className="text-slate-500 text-xs mb-2">
            Orientation:{' '}
            <Text className="text-slate-900 font-mono font-bold">
              {metrics.orientation.toUpperCase()}
            </Text>
          </Text>

          {/* Active Inset Metrics Grid */}
          <View className="flex-row flex-wrap bg-white p-2.5 rounded-xl border border-slate-300">
            <View className="w-1/2 py-0.5">
              <Text className="text-slate-500 text-[11px]">pt-safe (top):</Text>
              <Text className="text-slate-900 font-bold text-xs">
                {metrics.contentInsets.top.toFixed(1)}px
              </Text>
            </View>
            <View className="w-1/2 py-0.5">
              <Text className="text-slate-500 text-[11px]">pb-safe (bottom):</Text>
              <Text className="text-slate-900 font-bold text-xs">
                {metrics.contentInsets.bottom.toFixed(1)}px
              </Text>
            </View>
            <View className="w-1/2 py-0.5">
              <Text className="text-slate-500 text-[11px]">pl-safe (left sidebar):</Text>
              <Text className="text-slate-900 font-bold text-xs">
                {metrics.contentInsets.left.toFixed(1)}px
              </Text>
            </View>
            <View className="w-1/2 py-0.5">
              <Text className="text-slate-500 text-[11px]">pr-safe (right):</Text>
              <Text className="text-slate-900 font-bold text-xs">
                {metrics.contentInsets.right.toFixed(1)}px
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Travelogi Branding Header */}
        <Animated.View layout={transition} className="mb-5">
          <View className="flex-row items-center mb-1.5">
            <View className="w-8 h-8 rounded-full border-2 border-blue-600 items-center justify-center mr-2">
              <View className="w-3.5 h-0.5 bg-blue-600 rotate-45" />
            </View>
            <Text className="text-blue-900 text-2xl font-black tracking-tight">
              Travelogi
            </Text>
          </View>
          <Text className="text-slate-900 text-2xl font-extrabold">
            Cứ đi đi,
          </Text>
          <Text className="text-blue-600 text-2xl font-black">
            logi nàooo...
          </Text>
        </Animated.View>

        {/* AI Travel Agent Banner */}
        <Animated.View
          layout={transition}
          className="bg-blue-600 rounded-2xl p-4 mb-5 shadow-lg shadow-blue-500/25"
        >
          <View className="flex-row items-center mb-1">
            <View className="w-7 h-7 rounded-full bg-white/20 items-center justify-center mr-2">
              <Text className="text-white text-sm">🧭</Text>
            </View>
            <Text className="text-white text-base font-extrabold">
              Travel Agent
            </Text>
          </View>
          <Text className="text-blue-100 text-xs leading-4">
            Xây dựng chuyến đi hoàn hảo với các gợi ý địa điểm hấp dẫn.
          </Text>
        </Animated.View>

        {/* 4 Service Cards Grid */}
        <Animated.View layout={transition} className="flex-row flex-wrap gap-2.5 mb-3">
          {[
            { icon: '✈️', title: 'Máy bay', desc: 'Tìm chuyến bay và theo dõi biểu đồ g...' },
            { icon: '🚆', title: 'Tàu hoả', desc: 'Tìm vé tàu hoả và theo dõi biểu đồ g...' },
            { icon: '🚌', title: 'Xe khách', desc: 'Tìm chuyến xe khách và so sánh...' },
            { icon: '🏨', title: 'Khách sạn', desc: 'Tìm kiếm và lựa chọn phòng khác...' },
          ].map((item, idx) => (
            <Animated.View
              key={idx}
              layout={transition}
              className="flex-1 min-w-[45%]"
            >
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm"
              >
                <Text className="text-2xl mb-2">{item.icon}</Text>
                <Text className="text-slate-900 font-bold text-sm mb-0.5">
                  {item.title}
                </Text>
                <Text className="text-slate-500 text-xs" numberOfLines={1}>
                  {item.desc}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* So Sánh Card */}
        <Animated.View layout={transition}>
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center bg-white rounded-2xl p-3.5 mb-5 border border-slate-200 shadow-sm"
          >
            <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center mr-2.5">
              <Text className="text-base">⇄</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold text-sm">
                So sánh
              </Text>
              <Text className="text-slate-500 text-xs">
                So sánh giá giữa các phương tiện.
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Hot Deals Section */}
        <Animated.View layout={transition}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-900 font-extrabold text-base">
              Hot Deals 🔥
            </Text>
            <Text className="text-blue-600 font-semibold text-xs">
              Xem tất cả
            </Text>
          </View>

          {/* Hot Deals Cards */}
          <View className="flex-row gap-2.5">
            <Animated.View
              layout={transition}
              className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-200"
            >
              <View className="h-16 bg-green-700 rounded-lg items-center justify-center mb-2">
                <Text className="text-2xl">🌍</Text>
              </View>
              <Text className="text-slate-900 font-bold text-xs mb-1" numberOfLines={2}>
                Ưu đãi Quốc tế – Giảm đến 30%
              </Text>
              <Text className="text-amber-600 text-[10px] font-bold">
                AGODA • Chỉ trên app
              </Text>
            </Animated.View>

            <Animated.View
              layout={transition}
              className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-200"
            >
              <View className="h-16 bg-orange-700 rounded-lg items-center justify-center mb-2">
                <Text className="text-2xl">🏯</Text>
              </View>
              <Text className="text-slate-900 font-bold text-xs mb-1" numberOfLines={2}>
                Các hoạt động toàn cầu - Giảm 10%
              </Text>
              <Text className="text-blue-600 text-[10px] font-bold">
                AGODA • Đặt tour
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};
