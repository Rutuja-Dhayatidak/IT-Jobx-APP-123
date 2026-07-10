import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

interface NotificationProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Icons definitions
const MessageIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm0-3h12v2H6V6zm0 6h9v2H6v-2z" fill="#2563EB" />
  </Svg>
);

const BriefcaseIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="#2563EB" />
  </Svg>
);

const ApplyIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2zm-2 11l-3-3 1.41-1.41L12 14.17l4.59-4.59L18 11l-6 6z" fill="#2563EB" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#2563EB" />
  </Svg>
);

export default function Notification({ onBackPress, isDarkTheme = true }: NotificationProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const todayNotifications = [
    {
      title: 'You have a new message.',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      time: '1h',
      icon: <MessageIcon />,
    },
    {
      title: 'New Job Added by ZingCode.',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      time: '1h',
      icon: <BriefcaseIcon />,
    },
    {
      title: 'Successfully Apply for Job.',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
      time: '1h',
      icon: <ApplyIcon />,
    },
  ];

  const yesterdayNotifications = [
    {
      title: 'Your Profile Completed.',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      time: '1d',
      icon: <UserIcon />,
    },
    {
      title: 'New Job Added by ZingCode.',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      time: '1d',
      icon: <BriefcaseIcon />,
    },
    {
      title: 'You have a new message.',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      time: '1d',
      icon: <MessageIcon />,
    },
  ];

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
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>2 NEW</Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TODAY Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.sectionTitleColor }]}>TODAY</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {todayNotifications.map((noti, index) => (
          <View key={index} style={[styles.notiRow, { borderBottomColor: dynamicStyles.dividerColor }]}>
            <View style={[styles.iconWrapper, { backgroundColor: dynamicStyles.iconBg }]}>
              {noti.icon}
            </View>
            <View style={styles.contentWrapper}>
              <View style={styles.rowHeader}>
                <Text style={[styles.notiTitle, { color: dynamicStyles.textColor }]} numberOfLines={1}>{noti.title}</Text>
                <Text style={[styles.timeText, { color: dynamicStyles.labelColor }]}>{noti.time}</Text>
              </View>
              <Text style={[styles.notiDesc, { color: dynamicStyles.labelColor }]} numberOfLines={3}>{noti.desc}</Text>
            </View>
          </View>
        ))}

        {/* YESTERDAY Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.sectionTitleColor }]}>YESTERDAY</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {yesterdayNotifications.map((noti, index) => (
          <View key={index} style={[styles.notiRow, { borderBottomColor: dynamicStyles.dividerColor }]}>
            <View style={[styles.iconWrapper, { backgroundColor: dynamicStyles.iconBg }]}>
              {noti.icon}
            </View>
            <View style={styles.contentWrapper}>
              <View style={styles.rowHeader}>
                <Text style={[styles.notiTitle, { color: dynamicStyles.textColor }]} numberOfLines={1}>{noti.title}</Text>
                <Text style={[styles.timeText, { color: dynamicStyles.labelColor }]}>{noti.time}</Text>
              </View>
              <Text style={[styles.notiDesc, { color: dynamicStyles.labelColor }]} numberOfLines={3}>{noti.desc}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  notiTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
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
  iconBg: 'rgba(37, 99, 235, 0.1)',
  dividerColor: 'rgba(255, 255, 255, 0.05)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  sectionTitleColor: '#94A3B8',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  iconBg: '#EFF6FF',
  dividerColor: '#F1F5F9',
};
