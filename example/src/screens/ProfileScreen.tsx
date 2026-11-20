import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaMetrics, getSafeArea } from '@2security/nitro-safe-area';

export const ProfileScreen = () => {
  const metrics = useSafeAreaMetrics();
  const initial = getSafeArea();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        paddingBottom: metrics.contentInsets.bottom,
        paddingLeft: metrics.contentInsets.left,
        paddingRight: metrics.contentInsets.right,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: metrics.contentInsets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#e0f2fe',
              borderWidth: 2,
              borderColor: '#38bdf8',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={{ color: '#0f172a', fontSize: 20, fontWeight: '800' }}>
            Dương Nguyễn
          </Text>
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
            2Security • Travel Pro Member
          </Text>
        </View>

        {/* Detailed Metrics Comparator Card */}
        <View
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
        >
          <Text style={{ color: '#0284c7', fontWeight: '800', fontSize: 14, marginBottom: 12 }}>
            📊 Insets Comparison (Raw OS vs Content Insets)
          </Text>

          <View style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 }}>
            <Text style={{ color: '#d97706', fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
              Window Insets (Physical Screen):
            </Text>
            <Text style={{ color: '#334155', fontFamily: 'Courier', fontSize: 12 }}>
              Top: {metrics.insets.top.toFixed(1)}pt | Bottom: {metrics.insets.bottom.toFixed(1)}pt | Left: {metrics.insets.left.toFixed(1)}pt | Right: {metrics.insets.right.toFixed(1)}pt
            </Text>
          </View>

          <View style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 }}>
            <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
              Content Insets (Adjusted for Tab/Sidebar/Capsule):
            </Text>
            <Text style={{ color: '#334155', fontFamily: 'Courier', fontSize: 12 }}>
              Top: {metrics.contentInsets.top.toFixed(1)}pt | Bottom: {metrics.contentInsets.bottom.toFixed(1)}pt | Left: {metrics.contentInsets.left.toFixed(1)}pt | Right: {metrics.contentInsets.right.toFixed(1)}pt
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
            <Text style={{ color: '#64748b', fontSize: 12 }}>
              Frame 0 Mode: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{initial.mode}</Text>
            </Text>
            <Text style={{ color: '#64748b', fontSize: 12 }}>
              Sidebar Width: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{metrics.sidebarWidth.toFixed(1)}pt</Text>
            </Text>
          </View>
        </View>

        {/* Navigation Mode Explanation Card */}
        <View
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: '#bfdbfe',
          }}
        >
          <Text style={{ color: '#1e40af', fontWeight: '800', fontSize: 13, marginBottom: 6 }}>
            💡 iPadOS 18 Tiled Sidebar Architecture
          </Text>
          <Text style={{ color: '#1e3a8a', fontSize: 12, lineHeight: 18 }}>
            Khi ở chế độ iPad nằm ngang với Leftside Sidebar, UITabBarController được cấu hình <Text style={{ fontWeight: '700' }}>sidebar.preferredLayout = .tile</Text>.
            Điều này làm view controller tự động <Text style={{ fontWeight: '700' }}>co lại (shrink)</Text> sang cạnh phải của Sidebar thay vì bị Sidebar đè lên.
            Content Inset Left chỉ cần giữ ở mức 0px.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
