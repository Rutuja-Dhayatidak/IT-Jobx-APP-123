import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Image,
  Linking,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BottomNavigation from '../components/BottomNavigation';
import FadeInView from '../components/FadeInView';
import SuggestedJobsSection from '../components/home/SuggestedJobsSection';
import { getSuggestedJobs, SuggestedJob } from '../services/suggestedJobsApi';
import { viewProfileService } from '../services/viewProfile';

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
  hasUnreadNotifications?: boolean;
  onSearch?: (query: string) => void;
  onLocationPress?: () => void;
  onLocationChange?: (location: string) => void;
  savedJobs?: any[];
  onToggleSave?: (job: any) => void;
}

const GoogleLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const MicrosoftLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 23 23">
    <Path fill="#F25022" d="M1 1h10v10H1z" />
    <Path fill="#7FBA00" d="M12 1h10v10H12z" />
    <Path fill="#00A4EF" d="M1 12h10v10H1z" />
    <Path fill="#FFB900" d="M12 12h10v10H12z" />
  </Svg>
);

const AmazonLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 256 256">
    <Path d="M117.3 186.7c-21.7 0-38.3-15-38.3-42.3c0-30 20.7-41.5 53.6-41.5h24.8v10.5c0 14-4 29.5-22.3 29.5c-9.6 0-16-4.5-16-12c0-8.5 7.4-12.8 20.2-12.8h11.2v-5.4H129c-16 0-24 5.3-24 16.5c0 10.3 7 15.3 17 15.3c15 0 22-9.6 24.8-19.2v24.8c-7.3 10-18.4 16.6-29.5 16.6zm72-88v88h-32.3v-10c-7.3 10-18.4 15.6-30.7 15.6c-26.6 0-46.7-18.5-46.7-48.4c0-31 23-48.4 67-48.4H189V84c0-12.5-6.7-22-23.7-22c-12 0-24.8 5-32.3 10.5l-10-23.8c11-9 28.3-14.7 49-14.7c39 0 49.3 22 49.3 54.3v70.8z" fill="#000" />
    <Path d="M42.3 223c52 30.6 122.5 30.6 174 0c5.3-3.2 1.4-9.3-4.5-6.6c-47 21-118 21-165 0c-6-2.7-9.8 3.4-4.5 6.6z" fill="#FF9900" />
    <Path d="M219.7 206.5c-4.2-4.5-19.4 1.7-27.4 6.2c-2.3 1.3-1.8 3.5.7 4c8.4 2 20.5 2.7 23.6-1.5c3.2-4.3-.2-15.6-4.5-21c-1.6-2.1-3.6-.9-3 1.2c2.2 7.7-.6 19.3-3 22.3c-2.4 3 6.3-3.5 13.6-11.2z" fill="#FF9900" />
  </Svg>
);

const IbmLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path d="M2 4h4v2H2V4zm6 0h2v2H8V4zm4 0h6v2h-6V4zm8 0h2v2h-2V4zM2 7h4v2H2V7zm6 0h2v2H8V7zm4 0h6v2h-6V7zm8 0h2v2h-2V7zM2 10h4v2H2v-2zm6 0h2v2H8v-2zm4 0h6v2h-6v-2zm8 0h2v2h-2v-2zM2 13h4v2H2v-2zm6 0h2v2H8v-2zm4 0h6v2h-6v-2zm8 0h2v2h-2v-2zM2 16h4v2H2v-2zm6 0h2v2H8v-2zm4 0h6v2h-6v-2zm8 0h2v2h-2v-2z" fill="#0F62FE" />
  </Svg>
);

const CiscoLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path d="M4 11h1v2H4zm2-2h1v6H6zm2-2h1v10H8zm2-2h1v14H10zm2 0h1v14H12zm2-2h1v14H14zm2 2h1v10H16zm2 2h1v6H18zm2 2h1v2H20z" fill="#049FD9" />
  </Svg>
);

const CodeIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="#FFFFFF" />
  </Svg>
);

const PaintbrushIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#FFFFFF" />
  </Svg>
);

const BugIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z" fill="#FFFFFF" />
  </Svg>
);

const ChartIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13H19v6h-2.8z" fill="#FFFFFF" />
  </Svg>
);

const MegaphoneIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1l3 3V5l-3 3h-1zm7.5 4c0-1.8-1.2-3.3-2.8-3.8v7.6c1.6-.5 2.8-2 2.8-3.8zM4 9h4v6H4V9z" fill="#FFFFFF" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#FFFFFF" />
  </Svg>
);

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
  hasUnreadNotifications = false,
  onSearch,
  onLocationPress,
  onLocationChange,
  savedJobs = [],
  onToggleSave,
}: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [customLocation, setCustomLocation] = useState(userLocation || '');
  const [suggestedList, setSuggestedList] = useState<SuggestedJob[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(true);
  const [suggestedError, setSuggestedError] = useState<string | null>(null);

  const [candidateName, setCandidateName] = useState('Rutuja');
  const [profileImage, setProfileImage] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  const fetchSuggested = async () => {
    try {
      setLoadingSuggested(true);
      setSuggestedError(null);
      const res = await getSuggestedJobs();
      if (res && res.success) {
        setSuggestedList(res.jobs || []);
      } else {
        setSuggestedError(res.message || 'Failed to load suggestions');
      }
    } catch (err: any) {
      setSuggestedError(err.message || 'Failed to fetch suggested jobs');
    } finally {
      setLoadingSuggested(false);
    }
  };

  useEffect(() => {
    fetchSuggested();

    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed) {
            let fullName = parsed.name || '';
            if (!fullName && parsed.firstName) {
              fullName = parsed.firstName + (parsed.lastName ? ' ' + parsed.lastName : '');
            }
            if (fullName) {
              setCandidateName(fullName);
            }
          }
        }

        const profileRes = await viewProfileService.getProfile();
        if (profileRes && profileRes.success && profileRes.profile) {
          const u = profileRes.profile.userId;
          if (u) {
            let fullName = '';
            if (u.firstName) {
              fullName += u.firstName;
            }
            if (u.lastName) {
              fullName += (fullName ? ' ' : '') + u.lastName;
            }
            if (fullName) {
              setCandidateName(fullName);
            }
          }
          if (profileRes.profile.profileImage) {
            setProfileImage(profileRes.profile.profileImage);
          }
        }
      } catch (err) {
        console.error('Error loading user in Home:', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    setCustomLocation(userLocation || '');
  }, [userLocation]);

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

  // Dummy top companies data
  const topCompanies = [
    {
      id: '1',
      name: 'Google',
      openings: 12,
      logoColor: '#4285F4',
      logoComponent: <GoogleLogo />
    },
    {
      id: '2',
      name: 'Microsoft',
      openings: 8,
      logoColor: '#F25022',
      logoComponent: <MicrosoftLogo />
    },
    {
      id: '3',
      name: 'Amazon',
      openings: 10,
      logoColor: '#FF9900',
      logoComponent: <AmazonLogo />
    },
    {
      id: '4',
      name: 'IBM',
      openings: 6,
      logoColor: '#0F62FE',
      logoComponent: <IbmLogo />
    },
    {
      id: '5',
      name: 'Cisco',
      openings: 5,
      logoColor: '#049FD9',
      logoComponent: <CiscoLogo />
    }
  ];

  // Dummy job categories data
  const jobCategories = [
    {
      id: 'c1',
      name: 'Software\nDevelopment',
      icon: <CodeIcon />,
      bgColor: '#6366F1'
    },
    {
      id: 'c2',
      name: 'UI/UX\nDesign',
      icon: <PaintbrushIcon />,
      bgColor: '#EC4899'
    },
    {
      id: 'c3',
      name: 'Testing &\nQA',
      icon: <BugIcon />,
      bgColor: '#10B981'
    },
    {
      id: 'c4',
      name: 'Data\nScience',
      icon: <ChartIcon />,
      bgColor: '#F59E0B'
    },
    {
      id: 'c5',
      name: 'Digital\nMarketing',
      icon: <MegaphoneIcon />,
      bgColor: '#3B82F6'
    },
    {
      id: 'c6',
      name: 'HR &\nRecruitment',
      icon: <UserIcon />,
      bgColor: '#8B5CF6'
    },
    {
      id: 'c7',
      name: 'Full Stack\nDeveloper',
      icon: <CodeIcon />,
      bgColor: '#F43F5E'
    }
  ];

  // Dummy career tips & resources data
  const careerResources = [
    {
      id: 'cr1',
      title: 'How to prepare for a\ntechnical interview',
      image: require('../assets/technical_interview.png'),
      readTime: '5 min read',
      url: 'https://youtu.be/eyI5WkbSckI?si=KYXUwdb_eBA45RYS'
    },
    {
      id: 'cr2',
      title: 'Tips to build a\nstrong resume',
      image: require('../assets/resume_building.png'),
      readTime: '6 min read',
      url: 'https://youtu.be/qhocVNbvNHs?si=qN3adsvn-nX5Dqnh'
    },
    {
      id: 'cr3',
      title: 'Top in-demand skills\nin 2026',
      image: require('../assets/indemand_skills.png'),
      readTime: '4 min read',
      url: 'https://youtu.be/xhN8f3YIty0?si=82r5KSv1auVnJoMn'
    }
  ];

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={isDarkTheme ? '#0B0F19' : '#F8FAFC'} />
      <FadeInView style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Blue/Themed Header Section */}
          <Animated.View style={[styles.headerSection, { backgroundColor: isDarkTheme ? '#0F172A' : '#1E3A8A', opacity: fadeAnim, transform: [{ translateY: translateYHeader }] }]}>
            <View style={styles.headerTopRow}>
              {/* Left Column: Greeting, Title, Subtitle */}
              <View style={styles.greetingCol}>
                <Text style={[styles.greetingText, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                  {getGreeting()}, {candidateName} 👋
                </Text>
                <Text style={[styles.mainTitle, { color: '#FFFFFF' }]}>
                  Find <Text style={{ color: '#FBBF24', fontWeight: '800' }}>IT</Text> Jobs
                </Text>
                <Text style={[styles.subtitleText, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                  Discover jobs that match your skills
                </Text>
              </View>

              {/* Right Column: Notification Bell & Profile Avatar */}
              <View style={styles.headerRightCol}>
                {/* Notification Bell */}
                <TouchableOpacity
                  style={[styles.notificationButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                  onPress={onNotificationPress}
                  activeOpacity={0.7}
                >
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
                    <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1-1.5-1s-1.5.17-1.5 1v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </Svg>
                  {hasUnreadNotifications && <View style={[styles.notificationDot, { backgroundColor: '#EF4444' }]} />}
                </TouchableOpacity>

                {/* Profile Image Avatar */}
                <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8} style={[styles.avatarWrapper, { borderColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                  ) : (
                    <View style={[styles.avatarInner, { backgroundColor: '#FFFFFF' }]}>
                      <Text style={[styles.avatarInitials, { color: '#1E3A8A' }]}>{candidateName.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Search & Filter Row */}
            <View style={styles.searchFilterContainer}>
              <View style={styles.searchBarRow}>
                {/* Search Input */}
                <View style={[styles.searchBar, { backgroundColor: isDarkTheme ? '#1E293B' : '#FFFFFF', borderColor: isDarkTheme ? '#334155' : '#E2E8F0' }, searchQuery.trim().length === 0 && { marginRight: 12 }]}>
                  <TouchableOpacity onPress={() => onSearch && onSearch(searchQuery)} activeOpacity={0.7} style={{ padding: 4 }}>
                    <Text style={styles.searchIcon}>🔍</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.searchInput, { paddingLeft: 4, color: isDarkTheme ? '#F8FAFC' : '#0F172A' }]}
                    placeholder="Search for your dream job..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                    onSubmitEditing={() => onSearch && onSearch(searchQuery)}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} style={{ padding: 8 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Show filter button on the right of search bar ONLY if not typing */}
                {searchQuery.trim().length === 0 && (
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
                )}
              </View>

              {/* If user is typing, show location bar and filter button in the second row */}
              {searchQuery.trim().length > 0 && (
                <View style={styles.secondFilterRow}>
                  <View style={styles.locationSelectorBar}>
                    <View style={styles.locationPinIconWrapper}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="#F59E0B">
                        <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </Svg>
                    </View>
                    <TextInput
                      style={styles.locationSelectorBarInput}
                      placeholder="Enter location manually..."
                      placeholderTextColor="#94A3B8"
                      value={customLocation}
                      onChangeText={(text) => {
                        setCustomLocation(text);
                        onLocationChange && onLocationChange(text);
                      }}
                    />
                    <TouchableOpacity onPress={onLocationPress} activeOpacity={0.7} style={{ padding: 4 }}>
                      <Text style={styles.locationSelectorArrow}>⏷</Text>
                    </TouchableOpacity>
                  </View>

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
              )}
            </View>
          </Animated.View>

          {/* Suggested Jobs Section */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYContent }] }}>
            <SuggestedJobsSection
              jobs={suggestedList}
              loading={loadingSuggested}
              error={suggestedError}
              onRetry={fetchSuggested}
              onJobPress={(job) => onJobPress && onJobPress(job)}
              onApplyPress={(job) => onJobPress && onJobPress(job)}
              onSavePress={(job) => onToggleSave && onToggleSave(job)}
              savedJobIds={savedJobs.map(j => j._id || j.id)}
              onExploreAllPress={() => onNavigateToTab && onNavigateToTab('portfolio')}
              onUpdateProfilePress={() => onNavigateToTab && onNavigateToTab('profile')}
              isDarkTheme={isDarkTheme} // Pass proper dark theme flag
            />
          </Animated.View>

          {/* Top Companies Hiring Section */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYContent }], marginTop: 12, marginBottom: 12 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Top Companies Hiring</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {topCompanies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={[styles.companyCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.companyCardContent}>
                    <View style={styles.companyCardLogoWrapper}>
                      {company.logoComponent}
                    </View>
                    <Text style={[styles.companyCardName, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                      {company.name}
                    </Text>
                    <Text style={styles.companyOpenings}>
                      {company.openings} Openings
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Browse Jobs by Category Section */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYContent }], marginTop: 12, marginBottom: 12 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Browse Jobs by Category</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {/* Render categories in columns of 2 cards each to match the 2-row mockup grid */}
              {Array.from({ length: Math.ceil(jobCategories.length / 2) }).map((_, colIndex) => {
                const item1 = jobCategories[colIndex * 2];
                const item2 = jobCategories[colIndex * 2 + 1];

                return (
                  <View key={`col-${colIndex}`} style={styles.categoryColumn}>
                    {item1 && (
                      <TouchableOpacity
                        style={[styles.categoryCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          const query = item1.name.replace('\n', ' ');
                          onSearch && onSearch(query);
                        }}
                      >
                        <View style={[styles.categoryIconWrapper, { backgroundColor: item1.bgColor }]}>
                          {item1.icon}
                        </View>
                        <Text style={[styles.categoryCardName, { color: dynamicStyles.textColor }]} numberOfLines={2}>
                          {item1.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item2 && (
                      <TouchableOpacity
                        style={[styles.categoryCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          const query = item2.name.replace('\n', ' ');
                          onSearch && onSearch(query);
                        }}
                      >
                        <View style={[styles.categoryIconWrapper, { backgroundColor: item2.bgColor }]}>
                          {item2.icon}
                        </View>
                        <Text style={[styles.categoryCardName, { color: dynamicStyles.textColor }]} numberOfLines={2}>
                          {item2.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
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

          {/* Career Tips & Resources Section */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYRecent }], marginTop: 12, marginBottom: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Career Tips & Resources</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {careerResources.map((resource: any) => (
                <TouchableOpacity
                  key={resource.id}
                  style={[styles.resourceCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    if (resource.url) {
                      Linking.openURL(resource.url).catch((err) =>
                        console.error('An error occurred opening video link:', err)
                      );
                    }
                  }}
                >
                  <Image source={resource.image} style={styles.resourceImage} resizeMode="cover" />
                  <View style={styles.resourceDetails}>
                    <Text style={[styles.resourceTitle, { color: dynamicStyles.textColor }]} numberOfLines={2}>
                      {resource.title}
                    </Text>
                    <Text style={styles.resourceReadTime}>
                      {resource.readTime}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingCol: {
    flex: 1,
    paddingRight: 12,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    marginLeft: 12,
    overflow: 'hidden',
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
  searchFilterContainer: {
    width: '100%',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  locationSelectorBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  locationPinIconWrapper: {
    marginRight: 10,
  },
  locationSelectorBarText: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
  },
  locationSelectorBarInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    paddingVertical: 4,
  },
  locationSelectorArrow: {
    color: '#64748B',
    fontSize: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
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
  companyCard: {
    width: 120,
    height: 145,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  companyCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  companyCardLogoWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyCardName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  companyOpenings: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  categoryColumn: {
    flexDirection: 'column',
  },
  categoryCard: {
    width: 205,
    height: 78,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryCardName: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  resourceCard: {
    width: 220,
    height: 215,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  resourceImage: {
    width: '100%',
    height: 125,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  resourceDetails: {
    padding: 12,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 18,
    marginBottom: 6,
  },
  resourceReadTime: {
    fontSize: 11,
    color: '#94A3B8',
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
