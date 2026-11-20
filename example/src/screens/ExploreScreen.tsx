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
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: metrics.contentInsets.top + 8,
          paddingBottom: metrics.contentInsets.bottom + 20,
          paddingLeft: metrics.contentInsets.left + 20,
          paddingRight: metrics.contentInsets.right + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Nitro Safe Area Inspector Card */}
        <View
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text style={{ color: '#0284c7', fontWeight: '700', fontSize: 13 }}>
              ⚡ Nitro Safe Area Runtime
            </Text>
            <View
              style={{
                backgroundColor: '#dcfce7',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#86efac',
              }}
            >
              <Text style={{ color: '#15803d', fontSize: 10, fontWeight: '700' }}>
                0ms Frame 0 Sync
              </Text>
            </View>
          </View>

          <Text style={{ color: '#1e293b', fontWeight: '600', fontSize: 13, marginBottom: 4 }}>
            Mode: <Text style={{ color: '#0284c7', fontWeight: '700' }}>{getModeLabel()}</Text>
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>
            Orientation:{' '}
            <Text style={{ color: '#0f172a', fontFamily: 'Courier', fontWeight: '700' }}>
              {metrics.orientation.toUpperCase()}
            </Text>
          </Text>

          {/* Active Inset Metrics Grid */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              backgroundColor: '#ffffff',
              padding: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#cbd5e1',
            }}
          >
            <View style={{ width: '50%', paddingVertical: 2 }}>
              <Text style={{ color: '#64748b', fontSize: 11 }}>--safe-native-top:</Text>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 12 }}>
                {metrics.contentInsets.top.toFixed(1)}px
              </Text>
            </View>
            <View style={{ width: '50%', paddingVertical: 2 }}>
              <Text style={{ color: '#64748b', fontSize: 11 }}>--safe-native-bottom:</Text>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 12 }}>
                {metrics.contentInsets.bottom.toFixed(1)}px
              </Text>
            </View>
            <View style={{ width: '50%', paddingVertical: 2 }}>
              <Text style={{ color: '#64748b', fontSize: 11 }}>--safe-native-left (pl-safe):</Text>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 12 }}>
                {metrics.contentInsets.left.toFixed(1)}px
              </Text>
            </View>
            <View style={{ width: '50%', paddingVertical: 2 }}>
              <Text style={{ color: '#64748b', fontSize: 11 }}>--safe-native-right:</Text>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 12 }}>
                {metrics.contentInsets.right.toFixed(1)}px
              </Text>
            </View>
          </View>
        </View>

        {/* Travelogi Branding Header */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 2.5,
                borderColor: '#2563eb',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <View
                style={{
                  width: 14,
                  height: 2.5,
                  backgroundColor: '#2563eb',
                  transform: [{ rotate: '45deg' }],
                }}
              />
            </View>
            <Text style={{ color: '#1e3a8a', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 }}>
              Travelogi
            </Text>
          </View>
          <Text style={{ color: '#0f172a', fontSize: 24, fontWeight: '800' }}>
            Cứ đi đi,
          </Text>
          <Text style={{ color: '#2563eb', fontSize: 24, fontWeight: '900' }}>
            logi nàooo...
          </Text>
        </View>

        {/* AI Travel Agent Banner */}
        <View
          style={{
            backgroundColor: '#2563eb',
            borderRadius: 18,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14 }}>🧭</Text>
            </View>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '800' }}>
              Travel Agent
            </Text>
          </View>
          <Text style={{ color: '#dbeafe', fontSize: 12, lineHeight: 17 }}>
            Xây dựng chuyến đi hoàn hảo với các gợi ý địa điểm hấp dẫn.
          </Text>
        </View>

        {/* 4 Service Cards Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          {[
            { icon: '✈️', title: 'Máy bay', desc: 'Tìm chuyến bay và theo dõi biểu đồ g...' },
            { icon: '🚆', title: 'Tàu hoả', desc: 'Tìm vé tàu hoả và theo dõi biểu đồ g...' },
            { icon: '🚌', title: 'Xe khách', desc: 'Tìm chuyến xe khách và so sánh...' },
            { icon: '🏨', title: 'Khách sạn', desc: 'Tìm kiếm và lựa chọn phòng khác...' },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              style={{
                flex: 1,
                minWidth: '45%',
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</Text>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14, marginBottom: 2 }}>
                {item.title}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 11 }} numberOfLines={1}>
                {item.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* So Sánh Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#eff6ff',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 16 }}>⇄</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }}>
              So sánh
            </Text>
            <Text style={{ color: '#64748b', fontSize: 11 }}>
              So sánh giá giữa các phương tiện.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Hot Deals Section */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>
            Hot Deals 🔥
          </Text>
          <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 12 }}>
            Xem tất cả
          </Text>
        </View>

        {/* Hot Deals Cards */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#f8fafc',
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <View
              style={{
                height: 70,
                backgroundColor: '#15803d',
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 28 }}>🌍</Text>
            </View>
            <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 12, marginBottom: 4 }} numberOfLines={2}>
              Ưu đãi Quốc tế – Giảm đến 30%
            </Text>
            <Text style={{ color: '#d97706', fontSize: 10, fontWeight: '700' }}>
              AGODA • Chỉ trên app
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: '#f8fafc',
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <View
              style={{
                height: 70,
                backgroundColor: '#c2410c',
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 28 }}>🏯</Text>
            </View>
            <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 12, marginBottom: 4 }} numberOfLines={2}>
              Các hoạt động toàn cầu - Giảm 10%
            </Text>
            <Text style={{ color: '#2563eb', fontSize: 10, fontWeight: '700' }}>
              AGODA • Đặt tour
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
