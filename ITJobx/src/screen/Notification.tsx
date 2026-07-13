import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FadeInView from '../components/FadeInView';
import { apiRequest } from '../services/api';

interface NotificationProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Icons definitions
const SuccessIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10B981" />
  </Svg>
);

const AlertIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#EF4444" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm-5-7h-4v4h4v-4z" fill="#8B5CF6" />
  </Svg>
);

const InfoIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#F59E0B" />
  </Svg>
);

export default function Notification({ onBackPress, isDarkTheme = true }: NotificationProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/notifications', { method: 'GET' });
      if (data && data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await apiRequest('/notifications/unread-count', { method: 'GET' });
      if (data && data.success) {
        setUnreadCount(data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const data = await apiRequest('/notifications/read-all', { method: 'POST' });
      if (data && data.success) {
        fetchNotifications();
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const data = await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      if (data && data.success) {
        setNotifications(prev => prev.map(noti => noti._id === id ? { ...noti, isRead: true } : noti));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'proposal_accepted':
      case 'contract_signed':
      case 'job_published':
        return {
          bg: isDarkTheme ? 'rgba(16, 185, 129, 0.12)' : '#E6F4EA',
          icon: <SuccessIcon />
        };
      case 'proposal_rejected':
      case 'job_rejected':
      case 'job_on_hold':
      case 'job_sent_back':
        return {
          bg: isDarkTheme ? 'rgba(239, 68, 68, 0.12)' : '#FCE8E6',
          icon: <AlertIcon />
        };
      case 'demo_scheduled':
        return {
          bg: isDarkTheme ? 'rgba(139, 92, 246, 0.12)' : '#F3E8FF',
          icon: <CalendarIcon />
        };
      case 'change_request':
      case 'new_application':
      case 'new_lead':
      default:
        return {
          bg: isDarkTheme ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
          icon: <InfoIcon />
        };
    }
  };

  const { today, yesterday, earlier } = (() => {
    const todayList: any[] = [];
    const yesterdayList: any[] = [];
    const earlierList: any[] = [];

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(0, 0, 0, 0);

    notifications.forEach(noti => {
      const notiDate = new Date(noti.createdAt);
      if (notiDate >= todayDate) {
        todayList.push(noti);
      } else if (notiDate >= yesterdayDate) {
        yesterdayList.push(noti);
      } else {
        earlierList.push(noti);
      }
    });

    return { today: todayList, yesterday: yesterdayList, earlier: earlierList };
  })();

  const renderNotificationItem = (noti: any) => {
    const config = getNotificationColors(noti.type);
    return (
      <TouchableOpacity
        key={noti._id}
        style={[
          styles.notiRow,
          {
            backgroundColor: dynamicStyles.cardBg,
            borderColor: noti.isRead ? dynamicStyles.cardBorder : '#2563EB',
            shadowColor: isDarkTheme ? '#000000' : '#E2E8F0',
          },
          !noti.isRead && styles.unreadNotiRow
        ]}
        onPress={() => !noti.isRead && handleMarkAsRead(noti._id)}
        activeOpacity={0.9}
      >
        <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>
          {config.icon}
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.rowHeader}>
            <View style={styles.titleContainerRow}>
              {!noti.isRead && <View style={styles.blueDot} />}
              <Text style={[styles.notiTitle, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                {noti.title}
              </Text>
            </View>
            <Text style={[styles.timeText, { color: dynamicStyles.labelColor }]}>
              {getTimeAgo(noti.createdAt)}
            </Text>
          </View>
          <Text style={[styles.notiDesc, { color: dynamicStyles.labelColor }]} numberOfLines={3}>
            {noti.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      <FadeInView style={{ flex: 1 }}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBackPress}
          style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Notification</Text>
          {unreadCount > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{unreadCount} NEW</Text>
            </View>
          )}
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Text style={{ color: dynamicStyles.labelColor, fontSize: 16, textAlign: 'center' }}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* TODAY Section */}
          {today.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.sectionTitleColor }]}>TODAY</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleMarkAllAsRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
          )}
          {today.map(renderNotificationItem)}

          {/* YESTERDAY Section */}
          {yesterday.length > 0 && (
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.sectionTitleColor }]}>YESTERDAY</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleMarkAllAsRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
          )}
          {yesterday.map(renderNotificationItem)}

          {/* EARLIER Section */}
          {earlier.length > 0 && (
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.sectionTitleColor }]}>EARLIER</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleMarkAllAsRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
          )}
          {earlier.map(renderNotificationItem)}
          
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  markAllText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  notiRow: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadNotiRow: {
    borderWidth: 1.5,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentWrapper: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },
  notiTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notiDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  labelColor: '#94A3B8',
  sectionTitleColor: '#64748B',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  dividerColor: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.04)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  sectionTitleColor: '#94A3B8',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  dividerColor: '#F1F5F9',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
};
