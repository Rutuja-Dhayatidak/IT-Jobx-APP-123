import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import BottomNavigation from '../components/BottomNavigation';
import FadeInView from '../components/FadeInView';

interface FindJobProps {
  onBackPress?: () => void;
  onNavigateToTab?: (tab: 'home' | 'portfolio' | 'saved' | 'chat' | 'profile') => void;
  onFilterPress?: () => void;
  onJobPress?: (job: any) => void;
  isDarkTheme?: boolean;
  initialTab?: 'available' | 'saved' | 'hire';
}

// Custom SVG Icons
const FigmaIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C9.24 2 7 4.24 7 7c0 1.63.78 3.08 2 4-.78.43-1.42.99-1.88 1.69C6.44 13.6 6 14.76 6 16c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.24-.44-2.4-1.12-3.31C15.34 11.78 16 10.43 16 9c0-2.76-2.24-5-5-5h1zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-3 8c0-1.66 1.34-3 3-3s3 1.34 3 3v2h-6v-2zm3 7c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3v1c0 1.1-.9 2-2 2h-1z" fill="#F24E1E" />
    <Circle cx="12" cy="16" r="3" fill="#1ABC9C" />
    <Path d="M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z" fill="#A259FF" />
    <Path d="M12 2c1.66 0 3 1.34 3 3s-1.34 3-3 3V2z" fill="#FF7262" />
    <Path d="M12 8c1.66 0 3 1.34 3 3s-1.34 3-3 3V8z" fill="#1ABC9C" />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.17-4.52z" fill="#EA4335" />
  </Svg>
);

const AmazonIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15.9 13.9c-.8.6-1.9 1-3.2 1-2.4 0-3.9-1.4-3.9-3.7 0-2.5 1.9-3.8 4.6-3.8.9 0 1.8.2 2.5.5v.7c0 1.9-.9 3.5-2.5 4.3-.8.4-1.7.5-2.4.3.4.5 1 .7 1.8.7 1 0 1.9-.4 2.5-1.1l.6.4zm-1.8-4.5c-.5-.2-1.1-.3-1.7-.3-1.7 0-2.6.7-2.6 2.1 0 1.2.7 1.9 1.9 1.9.9 0 1.7-.4 2.1-1.1v-2.6z" fill="#000000" />
    <Path d="M6 19c3.5 2 8.5 2 12 0" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
    <Path d="M18 19l-1-1.5m1 1.5l-1.8.2" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const SlidersIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" fill="#FFFFFF" />
  </Svg>
);

const BookmarkIcon = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
      fill={active ? '#2563EB' : 'none'}
      stroke={active ? '#2563EB' : '#94A3B8'}
      strokeWidth="2"
    />
  </Svg>
);

export default function FindJob({ onBackPress, onNavigateToTab, onFilterPress, onJobPress, isDarkTheme = true, initialTab = 'available' }: FindJobProps) {
  const [activeTab, setActiveTab] = useState<'available' | 'saved' | 'hire'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const jobsData = [
    {
      id: '1',
      company: 'Figma',
      location: 'San Francisco, USA',
      role: 'React Developer',
      salary: '$150/m',
      time: '3 Days Ago',
      applicants: '70 Applicants',
      logo: <FigmaIcon />,
      tags: ['Full Time', 'Remote', 'Mid-Senior Level'],
      badge: '98% Match',
      badgeBg: 'rgba(37, 99, 235, 0.1)',
      badgeColor: '#2563EB',
      saved: false,
    },
    {
      id: '2',
      company: 'Google',
      location: 'California, USA',
      role: 'UI/UX Designer',
      salary: '$300/m',
      time: '5 Days Ago',
      applicants: '1k Applicants',
      logo: <GoogleIcon />,
      tags: ['Full Time', 'Remote', 'Internship'],
      badge: 'Hot Job',
      badgeBg: 'rgba(245, 158, 11, 0.1)',
      badgeColor: '#F59E0B',
      saved: false,
    },
    {
      id: '3',
      company: 'Amazon',
      location: 'Washington, USA',
      role: 'UI Designer',
      salary: '$700/m',
      time: '7 Days Ago',
      applicants: '2k Applicants',
      logo: <AmazonIcon />,
      tags: ['Full Time', 'Remote', 'Entry Level'],
      badge: 'Urgent',
      badgeBg: 'rgba(239, 68, 68, 0.1)',
      badgeColor: '#EF4444',
      saved: true,
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
        <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Jobs</Text>
        
        {/* Styled Profile Initials Avatar for balance */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>M</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search & Filter Row */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: dynamicStyles.textColor }]}
              placeholder="Search For Jobs"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
            onPress={onFilterPress}
          >
            <SlidersIcon />
          </TouchableOpacity>
        </View>

        {/* Premium Capsule Segment Tabs Row */}
        <View style={[styles.tabsWrapper, { backgroundColor: dynamicStyles.tabsBg }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'available' && [styles.activeTabItem, { backgroundColor: dynamicStyles.activeTabBg }]]}
            onPress={() => setActiveTab('available')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'available' ? { color: '#2563EB', fontWeight: 'bold' } : { color: dynamicStyles.labelColor }]}>
              Available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'saved' && [styles.activeTabItem, { backgroundColor: dynamicStyles.activeTabBg }]]}
            onPress={() => setActiveTab('saved')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'saved' ? { color: '#2563EB', fontWeight: 'bold' } : { color: dynamicStyles.labelColor }]}>
              Saved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'hire' && [styles.activeTabItem, { backgroundColor: dynamicStyles.activeTabBg }]]}
            onPress={() => setActiveTab('hire')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'hire' ? { color: '#2563EB', fontWeight: 'bold' } : { color: dynamicStyles.labelColor }]}>
              Hire
            </Text>
          </TouchableOpacity>
        </View>

        {/* Jobs List */}
        <View style={styles.jobsList}>
          {jobsData.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={[
                styles.jobCard,
                {
                  backgroundColor: dynamicStyles.cardBg,
                  borderColor: dynamicStyles.cardBorder,
                  shadowColor: isDarkTheme ? '#000000' : '#64748B',
                },
              ]}
              onPress={() => onJobPress && onJobPress(job)}
              activeOpacity={0.9}
            >
              {/* Card Top Details */}
              <View style={styles.cardHeader}>
                <View style={[styles.logoWrapper, { backgroundColor: isDarkTheme ? '#1E293B' : '#F8FAFC', borderColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                  {job.logo}
                </View>
                <View style={styles.companyDetails}>
                  <Text style={[styles.companyName, { color: dynamicStyles.textColor }]}>{job.company}</Text>
                  <Text style={styles.locationText}>📍 {job.location}</Text>
                </View>

                {/* Match/Urgent Badge + Bookmark */}
                <View style={styles.badgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: job.badgeBg }]}>
                    <Text style={[styles.statusBadgeText, { color: job.badgeColor }]}>{job.badge}</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.7} style={styles.bookmarkButton}>
                    <BookmarkIcon active={job.saved} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Role & Salary */}
              <View style={styles.roleRow}>
                <Text style={[styles.roleTitle, { color: dynamicStyles.textColor }]}>{job.role}</Text>
                <Text style={styles.salaryText}>{job.salary}<Text style={styles.salaryPeriod}>/m</Text></Text>
              </View>

              {/* Metadata Subtext */}
              <View style={styles.subtextRow}>
                <Text style={styles.timeText}>📅 {job.time}</Text>
                <Text style={styles.applicantsText}>👥 {job.applicants}</Text>
              </View>

              {/* Tags Row */}
              <View style={styles.tagsContainer}>
                {job.tags.map((tag, i) => (
                  <View key={i} style={[styles.tagPill, { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}>
                    <Text style={[styles.tagText, { color: isDarkTheme ? '#94A3B8' : '#475569' }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 110 }} />
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
    marginBottom: 10,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2563EB', // Premium royal blue filter icon background
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsWrapper: {
    flexDirection: 'row',
    marginHorizontal: 24,
    padding: 6,
    borderRadius: 30,
    marginBottom: 24,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  jobsList: {
    paddingHorizontal: 24,
  },
  jobCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  locationText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  bookmarkButton: {
    padding: 4,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  salaryText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#22C55E', // Green salary
  },
  salaryPeriod: {
    fontSize: 12,
    color: '#94A3B8',
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 14,
  },
  applicantsText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
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
  tabsBg: '#131A2E',
  dividerColor: 'rgba(255, 255, 255, 0.05)',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  activeTabBg: '#1E293B',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  tabsBg: '#EFF2F6',
  dividerColor: '#F1F5F9',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  activeTabBg: '#FFFFFF',
};
