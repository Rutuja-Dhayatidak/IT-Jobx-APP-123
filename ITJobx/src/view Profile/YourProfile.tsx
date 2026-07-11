import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { viewProfileService } from '../services/viewProfile';

interface YourProfileProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
  onNavigateTo?: (screen: any) => void;
}

// Icons definitions
const ChevronRightIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill={color} />
  </Svg>
);

const CheckmarkIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#2563EB" />
    <Path d="M9 12l2 2 4-4" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ContactIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#2563EB" />
  </Svg>
);

const AboutIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#2563EB" />
  </Svg>
);

const ExperienceIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="#2563EB" />
  </Svg>
);

const EducationIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91v5.91h2V9L12 3z" fill="#2563EB" />
  </Svg>
);

const ProjectsIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-5h2v5zm4 0h-2V9h2v8zm4 0h-2v-3h2v3z" fill="#2563EB" />
  </Svg>
);

const CertificateIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#2563EB" />
  </Svg>
);

const VolunteerIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#2563EB" />
  </Svg>
);

const AwardIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm1 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" fill="#2563EB" />
  </Svg>
);

const SkillIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm1 15.92c-.03-.01-.06-.02-.09-.03a10.08 10.08 0 0 1-5.83-5.83c-.01-.03-.02-.06-.03-.09h5.95v5.95z" fill="#2563EB" />
  </Svg>
);

const ResumeIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" fill="#2563EB" />
  </Svg>
);

export default function YourProfile({ onBackPress, isDarkTheme = true, onNavigateTo }: YourProfileProps) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await viewProfileService.getProfile();
        if (data && data.success && data.profile) {
          setProfile(data.profile);
        }
      } catch (err: any) {
        console.error('Error fetching profile in YourProfile:', err);
      }
    };
    fetchProfile();
  }, []);

  const contactInfoCompleted = !!(profile?.userId?.email || profile?.userId?.phone || profile?.location);
  const aboutMeCompleted = !!(profile?.about);
  const experienceCompleted = !!(profile?.experience && profile.experience.length > 0);
  const educationCompleted = !!(profile?.education && profile.education.length > 0);
  const projectsCompleted = !!(profile?.projects && profile.projects.length > 0);
  const certificatesCompleted = !!(profile?.certifications && profile.certifications.length > 0);
  const volunteerCompleted = !!(profile?.volunteer && profile.volunteer.length > 0);
  const awardsCompleted = !!(profile?.awards && profile.awards.length > 0);
  const skillsCompleted = !!(profile?.skills && profile.skills.length > 0);
  const resumeCompleted = !!(profile?.resumeUrl);

  const profileSections = [
    { title: 'Contact Info', icon: <ContactIcon />, completed: contactInfoCompleted, sectionKey: 'contact_info' },
    { title: 'About Me', icon: <AboutIcon />, completed: aboutMeCompleted, sectionKey: 'about_me' },
    { title: 'Experience', icon: <ExperienceIcon />, completed: experienceCompleted, sectionKey: 'experience' },
    { title: 'Education', icon: <EducationIcon />, completed: educationCompleted, sectionKey: 'education' },
    { title: 'Projects', icon: <ProjectsIcon />, completed: projectsCompleted, sectionKey: 'projects' },
    { title: 'Certificates & License', icon: <CertificateIcon />, completed: certificatesCompleted, sectionKey: 'certificates' },
    { title: 'Volunteers Experience', icon: <VolunteerIcon />, completed: volunteerCompleted, sectionKey: 'volunteer' },
    { title: 'Awards & Achievements', icon: <AwardIcon />, completed: awardsCompleted, sectionKey: 'awards' },
    { title: 'Skills', icon: <SkillIcon />, completed: skillsCompleted, sectionKey: 'skills' },
    { title: 'Resume/CV', icon: <ResumeIcon />, completed: resumeCompleted, sectionKey: 'resume' },
  ];

  const completedCount = profileSections.filter(s => s.completed).length;
  const progressPercent = completedCount * 10;

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

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
        <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Your Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress Bar Container */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: isDarkTheme ? '#1E293B' : '#E2E8F0' }]}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{completedCount}/10</Text>
      </View>

      {/* Checklist Scroll */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {profileSections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionRow, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
            activeOpacity={0.7}
            onPress={() => {
              if (section.sectionKey && onNavigateTo) {
                onNavigateTo(section.sectionKey);
              }
            }}
          >
            <View style={styles.leftContainer}>
              <View style={styles.iconWrapper}>
                {section.icon}
              </View>
              <Text style={[styles.optionTitle, { color: dynamicStyles.textColor }]}>
                {section.title}
              </Text>
            </View>

            {section.completed ? (
              <CheckmarkIcon />
            ) : (
              <ChevronRightIcon color="#2563EB" />
            )}
          </TouchableOpacity>
        ))}
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
};
