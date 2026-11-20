import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaMetrics } from '@2security/nitro-safe-area';

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
    <View className="flex-1 bg-slate-900 pt-[--safe-native-top] pb-[--safe-native-bottom] pl-[--safe-native-left] pr-[--safe-native-right]">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Nitro Safe Area Inspector Card */}
        <View className="bg-slate-800/90 rounded-2xl p-4 my-3 border border-sky-500/30">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sky-400 font-bold text-base">
              ⚡ Nitro Safe Area Runtime
            </Text>
            <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
              <Text className="text-emerald-400 text-xs font-semibold">
                0ms Frame 0 Sync
              </Text>
            </View>
          </View>

          <Text className="text-white font-semibold text-sm mb-1">
            Mode: <Text className="text-amber-300 font-bold">{getModeLabel()}</Text>
          </Text>
          <Text className="text-slate-300 text-xs mb-3">
            Orientation: <Text className="text-cyan-300 uppercase font-mono">{metrics.orientation}</Text>
          </Text>

          {/* Active Inset Metrics Grid */}
          <View className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-700/50">
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">--safe-native-top:</Text>
              <Text className="text-sky-300 font-mono font-bold text-xs">
                {metrics.contentInsets.top.toFixed(1)}px
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">--safe-native-bottom:</Text>
              <Text className="text-sky-300 font-mono font-bold text-xs">
                {metrics.contentInsets.bottom.toFixed(1)}px
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">--safe-native-left:</Text>
              <Text className="text-sky-300 font-mono font-bold text-xs">
                {metrics.contentInsets.left.toFixed(1)}px
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">--safe-native-right:</Text>
              <Text className="text-sky-300 font-mono font-bold text-xs">
                {metrics.contentInsets.right.toFixed(1)}px
              </Text>
            </View>
          </View>
        </View>

        {/* Travelogi Branding Header */}
        <View className="mt-2 mb-6">
          <Text className="text-sky-400 text-3xl font-extrabold tracking-tight">
            Travelogi
          </Text>
          <Text className="text-slate-100 text-2xl font-bold mt-1">
            Cứ đi đi,
          </Text>
          <Text className="text-blue-500 text-2xl font-black">
            logi nàooo...
          </Text>
        </View>

        {/* AI Travel Agent Banner */}
        <View className="bg-blue-600 rounded-2xl p-4 mb-5 shadow-lg shadow-blue-500/20">
          <Text className="text-white text-lg font-bold">
            Travel Agent
          </Text>
          <Text className="text-blue-100 text-xs mt-1">
            Xây dựng chuyến đi hoàn hảo với các gợi ý địa điểm hấp dẫn.
          </Text>
        </View>

        {/* Service Cards Grid */}
        <Text className="text-slate-200 font-bold text-base mb-3">
          Dịch vụ du lịch
        </Text>
        <View className="flex-row flex-wrap gap-2.5 mb-6">
          {[
            { title: 'Máy bay', icon: '✈️', desc: 'Tìm chuyến bay rẻ' },
            { title: 'Tàu hoả', icon: '🚆', desc: 'Tìm vé tàu hoả' },
            { title: 'Xe khách', icon: '🚌', desc: 'Tìm vé xe khách' },
            { title: 'Khách sạn', icon: '🏨', desc: 'Phòng tốt giá tốt' },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/60 w-[48%] active:bg-slate-700"
            >
              <Text className="text-2xl mb-1">{item.icon}</Text>
              <Text className="text-white font-bold text-sm">{item.title}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hot Deals */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-200 font-bold text-base">
            Hot Deals 🔥
          </Text>
          <Text className="text-sky-400 text-xs font-semibold">
            Xem tất cả
          </Text>
        </View>

        <View className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <Text className="text-emerald-400 font-bold text-sm">
            Ưu đãi Quốc tế - Giảm đến 30%
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            Áp dụng cho đặt vé máy bay & phòng khách sạn quốc tế trong tuần này.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
