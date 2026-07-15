import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { authService } from '../services/authService';
import { viewProfileService } from '../services/viewProfile';
import { apiRequest } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pick, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import Svg, { Path, Circle } from 'react-native-svg';
import BottomNavigation from '../components/BottomNavigation';
import FadeInView from '../components/FadeInView';
import AvatarPreviewModal from '../components/AvatarPreviewModal';

interface MyProfileProps {
  onBackPress?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onSettingsPress?: () => void;
  isDarkTheme?: boolean;
  onNavigateTo?: (screen: any) => void;
  onLogout?: () => void;
}

// Inline SVGs for all option items to avoid dependency issues
const ChevronIcon = ({ isDark }: { isDark: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill={isDark ? '#64748B' : '#94A3B8'} />
  </Svg>
);

const UserOutlineIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={color} />
  </Svg>
);

const AnalyticsIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-5h2v5zm4 0h-2V9h2v8zm4 0h-2v-3h2v3z" fill={color} />
  </Svg>
);

const DocumentIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill={color} />
  </Svg>
);

const StatusIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill={color} />
  </Svg>
);

const SettingsIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill={color} />
  </Svg>
);

const GlobeIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.33-.14 2 0 .67.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a8.03 8.03 0 0 1 3.79-3.56A15.65 15.65 0 0 0 7.91 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.26 14h-4.52c-.08-.66-.14-1.33-.14-2 0-.67.06-1.34.14-2h4.52c.08.66.14 1.33.14 2 0 .67-.06 1.34-.14 2zm.82 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zm1.54-5.56c.08-.66.14-1.33.14-2 0-.67-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" fill={color} />
  </Svg>
);

const HelpIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm1 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" fill={color} />
  </Svg>
);

const LockIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill={color} />
  </Svg>
);

const InviteIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={color} />
  </Svg>
);

const LogoutIcon = ({ color = '#EF4444' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill={color} />
  </Svg>
);

export default function MyProfile({ onBackPress, onNavigateToTab, onSettingsPress, isDarkTheme = true, onNavigateTo, onLogout }: MyProfileProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Stats and details states for mockup layout
  const [profileData, setProfileData] = useState<any>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  const loadProfile = async () => {
    try {
      const data = await viewProfileService.getProfile();
      let userId = '';
      if (data && data.success) {
        setProfile(data.profile.userId);
        setProfileImage(data.profile.profileImage || '');
        setCompletionPercentage(data.completionPercentage || 0);
        setProfileData(data.profile);
        userId = data.profile.userId?._id || data.profile.userId?.id || '';
      }

      // Fetch applications count
      const appsRes = await apiRequest('/applications/my-applications', { method: 'GET' });
      if (appsRes && appsRes.success) {
        setApplicationsCount(appsRes.applications?.length || 0);
      }

      // Fetch saved jobs count from local cache storage
      const key = userId ? `savedJobs_${userId}` : 'savedJobs_guest';
      const savedStr = await AsyncStorage.getItem(key);
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        setSavedJobsCount(parsed.length || 0);
      } else {
        setSavedJobsCount(0);
      }
    } catch (err) {
      console.error('Failed to load profile details in MyProfile:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const getProfileStrength = (percent: number) => {
    if (percent < 50) return 'Average';
    if (percent < 80) return 'Good';
    return 'Excellent';
  };
  const profileStrength = getProfileStrength(completionPercentage);

  const handleAvatarDelete = async () => {
    try {
      setUploadingImage(true);
      const res = await viewProfileService.updateProfile({ profileImage: "" });
      if (res && res.success) {
        setProfileImage('');
        await loadProfile();
        Alert.alert('Success', 'Profile photo deleted successfully!');
      } else {
         Alert.alert('Error', 'Failed to delete profile photo.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete profile photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAvatarPick = async () => {
    try {
      const pickResults = await pick({
        type: ['image/jpeg', 'image/png', 'image/jpg'],
      });
      const res = pickResults[0];
      
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? res.uri : res.uri.replace('file://', ''),
        type: res.type || 'image/jpeg',
        name: res.name || 'avatar.jpg',
      } as any);

      // Upload file to server
      const uploadRes = await apiRequest('/upload/file', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes && uploadRes.url) {
        const imageUrl = uploadRes.url;
        
        // Save the image URL in the candidate's profile
        const updateRes = await viewProfileService.updateProfile({ profileImage: imageUrl });
        
        if (updateRes && updateRes.success) {
          setProfileImage(imageUrl);
          // Reload profile statistics
          await loadProfile();
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          Alert.alert('Error', 'Failed to update profile picture in database.');
        }
      } else {
        Alert.alert('Error', 'Failed to upload image file.');
      }
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        console.log('User cancelled image picker');
      } else {
        Alert.alert('Error', err.message || 'Failed to select and upload image.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const profileOptions = [
    { title: 'Personal Information', icon: (color: string) => <UserOutlineIcon color={color} />, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Analytics', icon: (color: string) => <AnalyticsIcon color={color} />, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { title: 'My Application', icon: (color: string) => <DocumentIcon color={color} />, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    { title: 'Settings', icon: (color: string) => <SettingsIcon color={color} />, color: '#64748B', bgColor: 'rgba(100, 116, 139, 0.1)' },
    { title: 'Language', icon: (color: string) => <GlobeIcon color={color} />, color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.1)' },
    { title: 'Help Center', icon: (color: string) => <HelpIcon color={color} />, color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
    { title: 'Privacy Policy', icon: (color: string) => <LockIcon color={color} />, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    { title: 'Invites Friends', icon: (color: string) => <InviteIcon color={color} />, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Log out', icon: (color: string) => <LogoutIcon color={color} />, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  ];

  const radius = 25;
  const strokeWidth = 5.5;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (completionPercentage / 100) * circumference;

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      <FadeInView style={{ flex: 1 }}>

      {/* Main Scroll Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Profile Card Container (Blue Gradient mockup style) */}
        <View style={styles.profileCard}>
          {/* Top Row: Avatar, Name & Role, Progress Ring */}
          <View style={styles.cardTopRow}>
            {/* Avatar Image Picker with White border */}
            <TouchableOpacity
              style={styles.avatarWrapperMock}
              activeOpacity={0.8}
              onPress={() => setPreviewVisible(true)}
              disabled={uploadingImage}
            >
              <View style={styles.avatarPlaceholderMock}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImageMock} />
                ) : (
                  <Svg width={42} height={42} viewBox="0 0 24 24" fill="#64748B">
                    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </Svg>
                )}
              </View>
              {/* Blue edit pencil circle badge */}
              <View style={styles.editBadgeMock}>
                <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                  <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#FFFFFF" />
                </Svg>
              </View>
            </TouchableOpacity>

            {/* Name, Role & View Profile Button */}
            <View style={styles.profileDetailsMock}>
              <Text style={styles.profileNameMock} numberOfLines={1}>
                {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : ''}
              </Text>
              <Text style={styles.profileRoleMock}>
                {profileData?.position || profileData?.preferredJobRole || 'Job Seeker'}
              </Text>
              
              <TouchableOpacity
                style={styles.viewProfileBtnMock}
                activeOpacity={0.8}
                onPress={() => onNavigateTo && onNavigateTo('your_profile')}
              >
                {/* Eye icon SVG */}
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                  <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#FFFFFF" />
                </Svg>
                <Text style={styles.viewProfileTextMock}>View Profile</Text>
                <Text style={styles.viewProfileArrowMock}>➔</Text>
              </TouchableOpacity>
            </View>

            {/* Circle Progress Tracker on the Right */}
            <View style={styles.rightProgressContainerMock}>
              <View style={styles.progressRingWrapperMock}>
                <Svg width={54} height={54} viewBox="0 0 60 60">
                  <Circle
                    cx="30"
                    cy="30"
                    r="26"
                    stroke="rgba(255, 255, 255, 0.18)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <Circle
                    cx="30"
                    cy="30"
                    r="26"
                    stroke="#FBBF24" // Yellow completion ring
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 - (completionPercentage / 100) * (2 * Math.PI * 26)}
                    strokeLinecap="round"
                    transform="rotate(-90 30 30)"
                  />
                </Svg>
                <View style={styles.progressTextContainerMock}>
                  <Text style={styles.progressPercentTextMock}>{completionPercentage}%</Text>
                </View>
              </View>
              <Text style={styles.progressLabelMock}>Profile Complete</Text>
              <Text style={styles.progressSubtitleMock}>Add more details to get better job matches</Text>
            </View>
          </View>

          {/* Bottom Row Stats Grid */}
          <View style={styles.cardBottomRowMock}>
            {/* Stat 1: Applications */}
            <View style={styles.statItemMock}>
              <View style={styles.statIconContainerMock}>
                {/* Briefcase SVG */}
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="#FFFFFF" />
                </Svg>
              </View>
              <View style={styles.statTextColumnMock}>
                <Text style={styles.statValueMock}>{applicationsCount}</Text>
                <Text style={styles.statLabelMock} numberOfLines={1}>Applications</Text>
              </View>
            </View>

            <View style={styles.verticalDividerMock} />

            {/* Stat 2: Saved Jobs */}
            <View style={styles.statItemMock}>
              <View style={styles.statIconContainerMock}>
                {/* Bookmark SVG */}
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="#FFFFFF" />
                </Svg>
              </View>
              <View style={styles.statTextColumnMock}>
                <Text style={styles.statValueMock}>{savedJobsCount}</Text>
                <Text style={styles.statLabelMock} numberOfLines={1}>Saved Jobs</Text>
              </View>
            </View>

            <View style={styles.verticalDividerMock} />

            {/* Stat 3: Profile Strength */}
            <View style={styles.statItemMock}>
              <View style={styles.statIconContainerMock}>
                {/* Graph/Gauge SVG */}
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" fill="#FFFFFF" />
                </Svg>
              </View>
              <View style={styles.statTextColumnMock}>
                <Text style={styles.statValueMock}>{profileStrength}</Text>
                <Text style={styles.statLabelMock} numberOfLines={1}>Profile Strength</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionRow, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
              activeOpacity={0.7}
              onPress={() => {
                if (option.title === 'Personal Information') {
                  onNavigateTo && onNavigateTo('personal_info');
                } else if (option.title === 'My Application') {
                  onNavigateTo && onNavigateTo('my_application');
                } else if (option.title === 'Help Center') {
                  onNavigateTo && onNavigateTo('help_center');
                } else if (option.title === 'Settings' && onSettingsPress) {
                  onSettingsPress();
                } else if (option.title === 'Language') {
                  // Navigate to languages screen
                  onNavigateTo && onNavigateTo('languages');
                } else if (option.title === 'Privacy Policy') {
                  onNavigateTo && onNavigateTo('privacy_policy');
                } else if (option.title === 'Log out') {
                  setShowLogoutModal(true);
                }
              }}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: option.bgColor }]}>
                {option.icon(option.color)}
              </View>
              <Text style={[styles.optionTitle, { color: dynamicStyles.textColor }]}>{option.title}</Text>
              <ChevronIcon isDark={isDarkTheme} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Safe spacing for bottom navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      </FadeInView>

      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLogoutModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: isDarkTheme ? '#131A2E' : '#FFFFFF' }]}>
            <View style={[styles.pullBar, { backgroundColor: isDarkTheme ? '#334155' : '#CBD5E1' }]} />
            <Text style={[styles.modalTitle, { color: dynamicStyles.textColor }]}>Logout</Text>
            <View style={[styles.modalDivider, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]} />
            <Text style={[styles.modalDescription, { color: isDarkTheme ? '#94A3B8' : '#64748B' }]}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: isDarkTheme ? '#1E293B' : '#F1F5F9' }]}
                activeOpacity={0.8}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: isDarkTheme ? '#3B82F6' : '#2563EB' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutConfirmButton]}
                activeOpacity={0.8}
                onPress={() => {
                  setShowLogoutModal(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    onNavigateTo && onNavigateTo('onboarding');
                  }
                }}
              >
                <Text style={styles.logoutConfirmButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <AvatarPreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        imageUri={profileImage}
        onUpdate={handleAvatarPick}
        onDelete={handleAvatarDelete}
        isDarkTheme={isDarkTheme}
      />
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
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 10,
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
  profileCard: {
    backgroundColor: '#1E40AF', // Blue card background
    borderRadius: 28,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  avatarWrapperMock: {
    position: 'relative',
  },
  avatarPlaceholderMock: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImageMock: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  editBadgeMock: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#1E40AF',
  },
  profileDetailsMock: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  profileNameMock: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
    marginBottom: 2,
  },
  profileRoleMock: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    fontFamily: 'Outfit',
    marginBottom: 8,
  },
  viewProfileBtnMock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewProfileTextMock: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Outfit',
  },
  viewProfileArrowMock: {
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  rightProgressContainerMock: {
    alignItems: 'center',
    marginLeft: 10,
  },
  progressRingWrapperMock: {
    position: 'relative',
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTextContainerMock: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentTextMock: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Outfit',
  },
  progressLabelMock: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    fontFamily: 'Outfit',
  },
  progressSubtitleMock: {
    fontSize: 7.5,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginTop: 1,
    width: 80,
    lineHeight: 10,
    fontFamily: 'Outfit',
  },
  cardBottomRowMock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 16,
    width: '100%',
  },
  statItemMock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statIconContainerMock: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statTextColumnMock: {
    justifyContent: 'center',
  },
  statValueMock: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
    lineHeight: 16,
  },
  statLabelMock: {
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    fontFamily: 'Outfit',
    marginTop: 1,
  },
  verticalDividerMock: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  optionsList: {
    paddingHorizontal: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  optionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pullBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutConfirmButton: {
    backgroundColor: '#2563EB',
    marginLeft: 12,
  },
  logoutConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
};
