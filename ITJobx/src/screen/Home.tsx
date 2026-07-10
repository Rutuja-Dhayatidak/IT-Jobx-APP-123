import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BottomNavigation from '../components/BottomNavigation';
import FadeInView from '../components/FadeInView';

const { width } = Dimensions.get('window');

interface HomeProps {
  onNotificationPress?: () => void;
  onFilterPress?: () => void;
  onJobPress?: (job: any) => void;
  onSeeAllSuggested?: () => void;
  onSeeAllRecent?: () => void;
  onProfilePress?: () => void;
  onNavigateToTab?: (tab: 'home' | 'portfolio' | 'saved' | 'chat' | 'profile') => void;
  isDarkTheme?: boolean;
  userLocation?: string;
}

export default function Home({
  onNotificationPress,
  onFilterPress,
  onJobPress,
  onSeeAllSuggested,
  onSeeAllRecent,
  onProfilePress,
  onNavigateToTab,
  isDarkTheme = true,
  userLocation,
}: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'saved' | 'chat' | 'profile'>('home');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYHeader = useRef(new Animated.Value(-40)).current;
  const translateYContent = useRef(new Animated.Value(30)).current;
  const translateYRecent = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    translateYHeader.setValue(-40);
    translateYContent.setValue(30);
    translateYRecent.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateYHeader, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(translateYContent, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(translateYRecent, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYHeader, translateYContent, translateYRecent]);

  // Dummy categories
  const categories = ['All', 'Accountant', 'BDM', 'Content Writer', 'Developer', 'Designer'];

  // Dummy suggested jobs data
  const suggestedJobs = [
    {
      id: '1',
      title: 'UI Designer',
      company: 'BrioSoft Solutions',
      logo: 'B.',
      logoBg: '#2563EB',
      location: 'New York, USA',
      type: 'Full-Time',
      workplace: 'Remote',
      experience: 'Internship',
      salary: '$42k - $48k',
      applicants: 322,
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'PixelPoint Inc',
      logo: 'P.',
      logoBg: '#1E293B',
      location: 'San Francisco, USA',
      type: 'Part-Time',
      workplace: 'Hybrid',
      experience: 'Associate',
      salary: '$60k - $75k',
      applicants: 122,
    },
  ];

  // Dummy recent jobs data
  const recentJobs = [
    {
      id: 'r1',
      title: 'React Developer',
      company: 'AmplifyAvenue',
      logo: 'A.',
      logoBg: '#F59E0B',
      location: 'New York, USA',
      type: 'Contract',
      workplace: 'Remote',
      experience: 'Mid-Senior Level',
      salary: '$50 - $70/hr',
    },
    {
      id: 'r2',
      title: 'Finance Executive',
      company: 'CapitalFlow Co',
      logo: 'C.',
      logoBg: '#10B981',
      location: 'Chicago, USA',
      type: 'Full-Time',
      workplace: 'On-site',
      experience: 'Entry Level',
      salary: '$50k - $62k',
    },
  ];

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <FadeInView style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Blue Header Section */}
        <Animated.View style={[styles.headerSection, { opacity: fadeAnim, transform: [{ translateY: translateYHeader }] }]}>
          <View style={styles.headerTopRow}>
            {/* Location Selector */}
            <TouchableOpacity style={styles.locationContainer} activeOpacity={0.7}>
              <View style={styles.locationIconWrapper}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="#F59E0B">
                  <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </Svg>
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Location</Text>
                <View style={styles.locationValueRow}>
                  <Text style={styles.locationValue}>{userLocation || 'New York, USA'}</Text>
                  <Text style={styles.arrowDown}>⏷</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Notification Badge */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
                <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1-1.5-1s-1.5.17-1.5 1v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </Svg>
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Search & Filter Row */}
          <View style={styles.searchFilterRow}>
            {/* Search Input */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Yellow Filter Button */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={onFilterPress}
              activeOpacity={0.8}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                  fill="#0F172A"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Suggested Jobs Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYContent }] }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Suggested Jobs</Text>
            <TouchableOpacity onPress={onSeeAllSuggested} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {suggestedJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={[styles.jobCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
                onPress={() => onJobPress && onJobPress(job)}
                activeOpacity={0.9}
              >
                <View style={styles.jobCardHeader}>
                  <View style={[styles.companyLogo, { backgroundColor: job.logoBg }]}>
                    <Text style={styles.companyLogoText}>{job.logo}</Text>
                  </View>
                  <View style={styles.jobTitleWrapper}>
                    <Text style={[styles.jobTitle, { color: dynamicStyles.textColor }]}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.company}</Text>
                  </View>
                  <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="#2563EB">
                      <Path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <View style={styles.locationRow}>
                  <Text style={styles.locationPin}>📍</Text>
                  <Text style={styles.cardLocationText}>{job.location}</Text>
                </View>

                <View style={styles.tagsContainer}>
                  <View style={[styles.tagBadge, { backgroundColor: dynamicStyles.tagBg }]}>
                    <Text style={[styles.tagText, { color: dynamicStyles.tagTextColor }]}>{job.type}</Text>
                  </View>
                  <View style={[styles.tagBadge, { backgroundColor: dynamicStyles.tagBg }]}>
                    <Text style={[styles.tagText, { color: dynamicStyles.tagTextColor }]}>{job.workplace}</Text>
                  </View>
                  <View style={[styles.tagBadge, { backgroundColor: dynamicStyles.tagBg }]}>
                    <Text style={[styles.tagText, { color: dynamicStyles.tagTextColor }]}>{job.experience}</Text>
                  </View>
                </View>

                <View style={styles.jobCardFooter}>
                  <View style={styles.applicantsWrapper}>
                    <View style={styles.avatarStack}>
                      <View style={[styles.miniAvatar, { backgroundColor: '#F43F5E', zIndex: 3, borderColor: dynamicStyles.avatarBorder }]} />
                      <View style={[styles.miniAvatar, { backgroundColor: '#3B82F6', zIndex: 2, marginLeft: -8, borderColor: dynamicStyles.avatarBorder }]} />
                      <View style={[styles.miniAvatar, { backgroundColor: '#10B981', zIndex: 1, marginLeft: -8, borderColor: dynamicStyles.avatarBorder }]} />
                    </View>
                    <Text style={styles.applicantsText}>{job.applicants} Applicants</Text>
                  </View>
                  <Text style={styles.salaryText}>
                    {job.salary}
                    <Text style={styles.salaryUnit}>/month</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Recent Jobs Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYRecent }] }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Recent Jobs</Text>
            <TouchableOpacity onPress={onSeeAllRecent} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Category Pill Selectors */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    { backgroundColor: dynamicStyles.pillBg, borderColor: dynamicStyles.pillBorder },
                    isActive && styles.categoryPillActive,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      { color: dynamicStyles.pillText },
                      isActive && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Recent Jobs List */}
          <View style={styles.recentJobsContainer}>
            {recentJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={[styles.recentJobCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
                onPress={() => onJobPress && onJobPress(job)}
                activeOpacity={0.9}
              >
                <View style={styles.recentJobHeader}>
                  <View style={[styles.recentCompanyLogo, { backgroundColor: job.logoBg }]}>
                    <Text style={styles.recentCompanyLogoText}>{job.logo}</Text>
                  </View>
                  <View style={styles.recentJobInfo}>
                    <Text style={[styles.recentJobTitle, { color: dynamicStyles.textColor }]}>{job.title}</Text>
                    <Text style={styles.recentCompanyName}>{job.company}</Text>
                  </View>
                  <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#2563EB">
                      <Path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentTagsContainer}>
                  <View style={[styles.recentTagBadge, { backgroundColor: dynamicStyles.tagBg }]}>
                    <Text style={[styles.recentTagText, { color: dynamicStyles.tagTextColor }]}>{job.type}</Text>
                  </View>
                  <View style={[styles.recentTagBadge, { backgroundColor: dynamicStyles.tagBg }]}>
                    <Text style={[styles.recentTagText, { color: dynamicStyles.tagTextColor }]}>{job.workplace}</Text>
                  </View>
                  <View style={[styles.recentTagBadge, { backgroundColor: dynamicStyles.tagBg }]}>
                    <Text style={[styles.recentTagText, { color: dynamicStyles.tagTextColor }]}>{job.experience}</Text>
                  </View>
                </View>

                <View style={styles.recentJobFooter}>
                  <Text style={styles.recentLocation}>📍 {job.location}</Text>
                  <Text style={styles.recentSalary}>{job.salary}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Safe spacing for bottom navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#1E3A8A',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 36,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 12,
  },
  locationLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  locationValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  arrowDown: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 6,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: '#FBBF24',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  horizontalScroll: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  jobCard: {
    width: width * 0.72,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  jobTitleWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 13,
    color: '#94A3B8',
  },
  bookmarkButton: {
    padding: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationPin: {
    fontSize: 14,
    marginRight: 6,
  },
  cardLocationText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tagBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  jobCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicantsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  applicantsText: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 8,
  },
  salaryText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 15,
  },
  salaryUnit: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'normal',
  },
  categoriesContainer: {
    paddingLeft: 24,
    paddingRight: 12,
    marginBottom: 20,
  },
  categoryPill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  recentJobsContainer: {
    paddingHorizontal: 24,
  },
  recentJobCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  recentJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentCompanyLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentCompanyLogoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recentJobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentJobTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  recentCompanyName: {
    fontSize: 12,
    color: '#94A3B8',
  },
  recentTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    gap: 6,
  },
  recentTagBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  recentTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  recentJobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentLocation: {
    color: '#94A3B8',
    fontSize: 13,
  },
  recentSalary: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  tagBg: 'rgba(255, 255, 255, 0.06)',
  tagTextColor: '#FFFFFF',
  avatarBorder: '#131A2E',
  pillBg: '#131A2E',
  pillBorder: 'rgba(255, 255, 255, 0.05)',
  pillText: '#94A3B8',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  tagBg: 'rgba(15, 23, 42, 0.05)',
  tagTextColor: '#0F172A',
  avatarBorder: '#FFFFFF',
  pillBg: '#FFFFFF',
  pillBorder: '#E2E8F0',
  pillText: '#64748B',
};
