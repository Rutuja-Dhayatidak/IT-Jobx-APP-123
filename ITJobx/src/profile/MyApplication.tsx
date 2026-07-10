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

interface MyApplicationProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Search Icon
const SearchIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#2563EB" />
  </Svg>
);

// Map Pin Icon
const PinIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" fill="#2563EB" />
  </Svg>
);

export default function MyApplication({ onBackPress, isDarkTheme = true }: MyApplicationProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const applications = [
    {
      role: 'React Developer',
      company: 'AmplifyAvenue',
      location: 'New York, USA',
      status: 'Sent',
      logoLetter: 'A.',
      logoColor: '#FBBF24',
      logoTextCol: '#1E293B',
      tags: ['Full-Time', 'Remote', 'Internship'],
    },
    {
      role: 'Graphics Designer',
      company: 'PixelPulse Tech',
      location: 'New York, USA',
      status: 'Accepted',
      logoLetter: 'P.',
      logoColor: '#1E293B',
      logoTextCol: '#FFFFFF',
      tags: ['Part-Time', 'Remote', 'Entry Level'],
    },
    {
      role: 'UI Designer',
      company: 'VelocityCraft',
      location: 'New York, USA',
      status: 'Rejected',
      logoLetter: 'V.',
      logoColor: '#F59E0B',
      logoTextCol: '#FFFFFF',
      tags: ['Part-Time', 'Remote', 'Entry Level'],
    },
    {
      role: 'Accountant',
      company: 'QubitLink Software',
      location: 'New York, USA',
      status: 'Pending',
      logoLetter: 'Q.',
      logoColor: '#1F2937',
      logoTextCol: '#FFFFFF',
      tags: ['Contract', 'On-Site', 'Associate'],
    },
    {
      role: 'UX Designer',
      company: 'TitanTech Labs',
      location: 'New York, USA',
      status: 'Accepted',
      logoLetter: 'T.',
      logoColor: '#1D4ED8',
      logoTextCol: '#FFFFFF',
      tags: ['Full-Time', 'Remote', 'Senior Level'],
    },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Accepted':
        return { bg: isDarkTheme ? 'rgba(16, 185, 129, 0.1)' : '#DCFCE7', text: '#10B981' };
      case 'Rejected':
        return { bg: isDarkTheme ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2', text: '#EF4444' };
      case 'Pending':
        return { bg: isDarkTheme ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7', text: '#F59E0B' };
      case 'Sent':
      default:
        return { bg: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : '#DBEAFE', text: '#2563EB' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBackPress}
          style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>My Application</Text>
        <TouchableOpacity style={[styles.searchButton, { borderColor: dynamicStyles.buttonBorder }]} activeOpacity={0.7}>
          <SearchIcon />
        </TouchableOpacity>
      </View>

      {/* Applications List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {applications.map((app, index) => {
          const statusStyle = getStatusStyles(app.status);
          return (
            <View key={index} style={[styles.card, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
              {/* Top Row with Logo and Info */}
              <View style={styles.cardHeader}>
                <View style={[styles.logoBox, { backgroundColor: app.logoColor }]}>
                  <Text style={[styles.logoText, { color: app.logoTextCol }]}>{app.logoLetter}</Text>
                </View>
                <View style={styles.roleContainer}>
                  <Text style={[styles.roleTitle, { color: dynamicStyles.textColor }]}>{app.role}</Text>
                  <Text style={[styles.companyText, { color: dynamicStyles.labelColor }]}>{app.company}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{app.status}</Text>
                </View>
              </View>

              {/* Location Row */}
              <View style={styles.locationRow}>
                <PinIcon />
                <Text style={[styles.locationText, { color: dynamicStyles.labelColor }]}>{app.location}</Text>
              </View>

              {/* Tags Row */}
              <View style={styles.tagsContainer}>
                {app.tags.map((tag) => (
                  <View key={tag} style={[styles.tagPill, { backgroundColor: dynamicStyles.tagBg }]}>
                    <Text style={[styles.tagText, { color: dynamicStyles.tagTextColor }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  searchButton: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingLeft: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  labelColor: '#94A3B8',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  tagBg: 'rgba(255, 255, 255, 0.05)',
  tagTextColor: '#FFFFFF',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  tagBg: '#F1F5F9',
  tagTextColor: '#64748B',
};
