import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaMetrics, getSafeArea } from '@2security/nitro-safe-area';

export const ProfileScreen = () => {
  const metrics = useSafeAreaMetrics();
  const initial = getSafeArea();

  return (
    <View className="flex-1 bg-slate-900 pt-[--safe-native-top] pb-[--safe-native-bottom] pl-[--safe-native-left] pr-[--safe-native-right]">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="items-center my-6">
          <View className="w-20 h-20 rounded-full bg-sky-500/20 border-2 border-sky-400 items-center justify-center mb-3">
            <Text className="text-3xl">👤</Text>
          </View>
          <Text className="text-white text-xl font-bold">Dương Nguyễn</Text>
          <Text className="text-slate-400 text-xs">2Security • Travel Pro Member</Text>
        </View>

        {/* Detailed Metrics Comparator Card */}
        <View className="bg-slate-800 rounded-2xl p-4 mb-4 border border-slate-700">
          <Text className="text-sky-400 font-bold text-sm mb-3">
            📊 Insets Comparison (Raw OS vs Content Insets)
          </Text>

          <View className="bg-slate-950/70 p-3 rounded-xl mb-3">
            <Text className="text-amber-300 font-semibold text-xs mb-1">
              Window Insets (Physical Screen):
            </Text>
            <Text className="text-slate-300 font-mono text-xs">
              Top: {metrics.insets.top.toFixed(1)}pt | Bottom: {metrics.insets.bottom.toFixed(1)}pt | Left: {metrics.insets.left.toFixed(1)}pt | Right: {metrics.insets.right.toFixed(1)}pt
            </Text>
          </View>

          <View className="bg-slate-950/70 p-3 rounded-xl mb-3">
            <Text className="text-emerald-300 font-semibold text-xs mb-1">
              Content Insets (Accounting for Tab / Sidebar / Capsule):
            </Text>
            <Text className="text-slate-300 font-mono text-xs">
              Top: {metrics.contentInsets.top.toFixed(1)}pt | Bottom: {metrics.contentInsets.bottom.toFixed(1)}pt | Left: {metrics.contentInsets.left.toFixed(1)}pt | Right: {metrics.contentInsets.right.toFixed(1)}pt
            </Text>
          </View>

          <View className="flex-row justify-between text-xs text-slate-400 pt-1 border-t border-slate-700">
            <Text className="text-slate-400 text-xs">Initial Frame 0 Mode: {initial.mode}</Text>
            <Text className="text-slate-400 text-xs">Sidebar: {metrics.sidebarWidth.toFixed(1)}pt</Text>
          </View>
        </View>

        {/* Device Orientation Awareness */}
        <View className="bg-slate-800 rounded-2xl p-4 mb-4 border border-slate-700">
          <Text className="text-white font-bold text-sm mb-2">
            🔄 Rotation & Adaptive Layout Test
          </Text>
          <Text className="text-slate-300 text-xs leading-5">
            Xoay thiết bị ngang / dọc (Portrait ⇄ Landscape) hoặc co dãn kích thước cửa sổ Split View trên iPad để kiểm tra:
          </Text>
          <View className="mt-2 pl-2">
            <Text className="text-sky-300 text-xs">• Native listener cập nhật CSS variables tức thì.</Text>
            <Text className="text-sky-300 text-xs">• iPad tự động đổi chế độ Sidebar ⇄ Capsule nổi.</Text>
            <Text className="text-sky-300 text-xs">• Không xảy ra hiện tượng chớp nháy hay giật layout.</Text>
          </View>
        </View>

        {/* Dummy Settings Options */}
        {[
          { title: 'Chuyến đi đã lưu', icon: '🔖' },
          { title: 'Cài đặt giao diện & thông báo', icon: '⚙️' },
          { title: 'Trợ giúp & Phản hồi', icon: '💬' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            className="flex-row items-center justify-between bg-slate-800/60 p-4 rounded-xl mb-2.5 border border-slate-700/40"
          >
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">{item.icon}</Text>
              <Text className="text-white text-sm font-semibold">{item.title}</Text>
            </View>
            <Text className="text-slate-500 text-lg">›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
