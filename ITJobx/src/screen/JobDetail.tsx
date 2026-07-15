import React, { useState } from 'react';
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
  Share,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

const { width } = Dimensions.get('window');

interface JobDetailProps {
  job?: any;
  onBackPress?: () => void;
  isDarkTheme?: boolean;
  onApplyPress?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

// Verified badge checkmark
const VerifiedIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="#3B82F6">
    <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </Svg>
);

// Gold Star
const StarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FBBF24">
    <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </Svg>
);

// Location Icon
const LocationIcon = ({ color = '#64748B' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={color} />
  </Svg>
);

// Briefcase Icon
const BriefcaseIcon = ({ color = '#64748B' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" />
  </Svg>
);

// Rupee Icon
const RupeeIcon = ({ color = '#64748B' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M6 4h10M6 9h10M6 14h6M6 4c6 0 10 3 10 5s-4 5-10 5M11 14l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Dollar Icon
const DollarIcon = ({ color = '#64748B' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Paper Airplane Icon
const SendIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Clipboard illustration SVG for Key Responsibilities
const ClipboardIllustration = () => (
  <Svg width={60} height={70} viewBox="0 0 60 70" fill="none">
    <Rect x="8" y="12" width="44" height="52" rx="8" fill="#F0F4FF" stroke="#A5B4FC" strokeWidth="2" />
    <Rect x="20" y="4" width="20" height="12" rx="4" fill="#3B82F6" />
    <Path d="M18 28h20" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
    <Path d="M18 38h24" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <Path d="M18 46h14" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <Circle cx="18" cy="54" r="2.5" fill="#10B981" />
    <Path d="M24 54h14" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Target illustration SVG for Requirements
const TargetIllustration = () => (
  <Svg width={65} height={65} viewBox="0 0 60 60" fill="none">
    <Circle cx="30" cy="30" r="24" fill="#F0FDF4" stroke="#A7F3D0" strokeWidth="2" />
    <Circle cx="30" cy="30" r="16" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
    <Circle cx="30" cy="30" r="8" fill="#10B981" />
    <Path d="M48 12L32 28M48 12l-8 2M48 12l-2 8" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="32" cy="28" r="2.5" fill="#EF4444" />
  </Svg>
);

export default function JobDetail({ job, onBackPress, isDarkTheme = false, onApplyPress, isSaved = false, onToggleSave }: JobDetailProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'company' | 'reviews' | 'similar'>('details');

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  // Fallback default job info if none provided
  const jobInfo = job || {
    title: 'Frontend Developer',
    company: 'Acme Technologies',
    logo: 'A',
    logoBg: '#3B82F6',
    location: 'Pune, India',
    salary: '₹6 - 10 LPA',
    type: 'Full Time',
    workplace: 'Office',
    experience: '2-4 Yrs Exp',
  };

  const handleShare = async () => {
    try {
      const jobId = jobInfo._id || '';
      const jobUrl = `https://itjobx.com/jobs/${jobId}`;
      
      const message = `Check out this job on ITJobx:
Role: ${jobInfo.title}
Company: ${jobInfo.company || jobInfo.companyId?.name || 'Company'}
Location: ${jobInfo.location || 'Remote'}
Salary: ${jobInfo.salary || jobInfo.salaryBudget || 'Negotiable'}

Apply Link: ${jobUrl}

Apply now using the ITJobx App!`;

      await Share.share({
        message,
        url: jobUrl,
      });
    } catch (error: any) {
      console.error('Error sharing job:', error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      <FadeInView style={{ flex: 1 }}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBackPress}
          style={[styles.headerBtn, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            {/* Share Icon */}
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={dynamicStyles.textColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder, marginLeft: 12 }]}
            onPress={onToggleSave}
            activeOpacity={0.7}
          >
            {/* Heart Icon */}
            <Svg width={18} height={18} viewBox="0 0 24 24" fill={isSaved ? '#EF4444' : 'none'}>
              <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={isSaved ? '#EF4444' : dynamicStyles.textColor} strokeWidth="2" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Job Overview Card */}
        <View style={[styles.mainCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
          <View style={styles.mainCardTop}>
            <View style={[styles.logoContainer, { backgroundColor: jobInfo.logoBg || '#3B82F6' }]}>
              <View style={styles.circularIconInner}>
                <Text style={styles.logoText}>{jobInfo.logo || 'A'}</Text>
              </View>
            </View>
            <View style={styles.mainCardTitleContainer}>
              <Text style={[styles.jobTitleText, { color: dynamicStyles.textColor }]}>{jobInfo.title}</Text>
              <View style={styles.companyRow}>
                <Text style={[styles.companyNameText, { color: dynamicStyles.textColor }]}>{jobInfo.company}</Text>
                <View style={{ marginLeft: 6 }}>
                  <VerifiedIcon />
                </View>
              </View>
              <View style={styles.ratingRow}>
                <StarIcon />
                <Text style={[styles.ratingText, { color: dynamicStyles.textColor }]}>4.5 <Text style={{ color: dynamicStyles.subLabelColor, fontWeight: 'normal' }}>(128 reviews)</Text></Text>
              </View>
            </View>

            {/* Top Right Full-time Badge */}
            <View style={[styles.greenBadge, { backgroundColor: dynamicStyles.greenBadgeBg }]}>
              <Text style={[styles.greenBadgeText, { color: dynamicStyles.greenBadgeText }]}>{jobInfo.type || 'Full Time'}</Text>
            </View>
          </View>

          {/* Row of 3 capsule badges with wrap */}
          <View style={styles.capsuleRow}>
            <View style={[styles.capsuleBadge, { backgroundColor: dynamicStyles.badgeBg }]}>
              <LocationIcon color={dynamicStyles.labelColor} />
              <Text style={[styles.capsuleText, { color: dynamicStyles.textColor }]}>{jobInfo.location}</Text>
            </View>
            <View style={[styles.capsuleBadge, { backgroundColor: dynamicStyles.badgeBg }]}>
              <BriefcaseIcon color={dynamicStyles.labelColor} />
              <Text style={[styles.capsuleText, { color: dynamicStyles.textColor }]}>{jobInfo.experience || '2-4 Yrs Exp'}</Text>
            </View>
            <View style={[styles.capsuleBadge, { backgroundColor: dynamicStyles.badgeBg }]}>
              {jobInfo.salary && jobInfo.salary.includes('$') ? (
                <DollarIcon color={dynamicStyles.labelColor} />
              ) : (
                <RupeeIcon color={dynamicStyles.labelColor} />
              )}
              <Text style={[styles.capsuleText, { color: dynamicStyles.textColor }]}>{jobInfo.salary || 'Not Disclosed'}</Text>
            </View>
          </View>

          {/* Separator */}
          <View style={[styles.cardSeparator, { backgroundColor: dynamicStyles.dividerColor }]} />

          {/* Posted info */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: dynamicStyles.subLabelColor }]}>Posted 2 days ago  •  345 applicants</Text>
          </View>
        </View>
        <View>
          {/* Card 1: About the Role */}
          <View style={[styles.contentCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: dynamicStyles.textColor }]}>About the Role</Text>
            <Text style={[styles.cardDescriptionText, { color: dynamicStyles.labelColor }]}>
              {jobInfo.description || "We are looking for a skilled Frontend Developer to join our team and build amazing user experiences. You will work on building responsive web applications and collaborate with cross-functional teams."}
            </Text>
          </View>

          {/* Card 2: Key Responsibilities */}
          <View style={[styles.contentCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            <View style={styles.illustrationRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: dynamicStyles.textColor, marginBottom: 12 }]}>Key Responsibilities</Text>
                {(jobInfo.responsibilities && jobInfo.responsibilities.length > 0
                  ? jobInfo.responsibilities
                  : [
                      'Build responsive and interactive user interfaces using modern framework libraries',
                      'Develop reusable components and front-end libraries',
                      'Optimize components for maximum performance',
                      'Collaborate with designers and backend developers',
                      'Ensure technical feasibility of UI/UX designs',
                    ]
                ).map((item: string, idx: number) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={[styles.bulletText, { color: dynamicStyles.labelColor }]}>{item}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.illustrationWrapper}>
                <ClipboardIllustration />
              </View>
            </View>
          </View>

          {/* Card 3: Requirements */}
          <View style={[styles.contentCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            <View style={styles.illustrationRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: dynamicStyles.textColor, marginBottom: 12 }]}>Key Skills & Requirements</Text>
                {(jobInfo.skills && jobInfo.skills.length > 0
                  ? jobInfo.skills
                  : [
                      '2-4 years of experience in frontend development',
                      'Strong knowledge of HTML, CSS, JavaScript, React.js',
                      'Experience with state management (Redux/Context API)',
                      'Familiarity with REST APIs and version control (Git)',
                      'Good problem-solving and communication skills',
                    ]
                ).map((item: string, idx: number) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={[styles.bulletText, { color: dynamicStyles.labelColor }]}>{item}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.illustrationWrapper}>
                <TargetIllustration />
              </View>
            </View>
          </View>

          {/* Card 4: Additional Information */}
          <View style={[styles.contentCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: dynamicStyles.textColor, marginBottom: 16 }]}>Additional Information</Text>
            
            <View style={styles.additionalGrid}>
              {/* Item 1 */}
              <View style={styles.gridItem}>
                <View style={[styles.gridIconCircle, { backgroundColor: dynamicStyles.iconCircleBg }]}>
                  <BriefcaseIcon color="#2563EB" />
                </View>
                <View style={styles.gridDetails}>
                  <Text style={[styles.gridLabel, { color: dynamicStyles.subLabelColor }]}>Job Type</Text>
                  <Text style={[styles.gridValue, { color: dynamicStyles.textColor }]}>
                    {jobInfo.type || jobInfo.jobType || "Full Time"}
                  </Text>
                </View>
              </View>

              {/* Item 2 */}
              <View style={styles.gridItem}>
                <View style={[styles.gridIconCircle, { backgroundColor: dynamicStyles.iconCircleBg }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="9" stroke="#2563EB" strokeWidth="2" />
                    <Path d="M12 7v5l3 2" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                  </Svg>
                </View>
                <View style={styles.gridDetails}>
                  <Text style={[styles.gridLabel, { color: dynamicStyles.subLabelColor }]}>Experience</Text>
                  <Text style={[styles.gridValue, { color: dynamicStyles.textColor }]}>
                    {jobInfo.experience || jobInfo.experienceLevel || "2-4 Years"}
                  </Text>
                </View>
              </View>

              {/* Item 3 */}
              <View style={styles.gridItem}>
                <View style={[styles.gridIconCircle, { backgroundColor: dynamicStyles.iconCircleBg }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Rect x="4" y="4" width="16" height="16" rx="2" stroke="#2563EB" strokeWidth="2" />
                    <Path d="M9 4v16M15 4v16M4 10h16M4 15h16" stroke="#2563EB" strokeWidth="2" />
                  </Svg>
                </View>
                <View style={styles.gridDetails}>
                  <Text style={[styles.gridLabel, { color: dynamicStyles.subLabelColor }]}>Department</Text>
                  <Text style={[styles.gridValue, { color: dynamicStyles.textColor }]}>
                    {jobInfo.department || "Engineering"}
                  </Text>
                </View>
              </View>

              {/* Item 4 */}
              <View style={styles.gridItem}>
                <View style={[styles.gridIconCircle, { backgroundColor: dynamicStyles.iconCircleBg }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M22 10L12 5 2 10l10 5 10-5z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={styles.gridDetails}>
                  <Text style={[styles.gridLabel, { color: dynamicStyles.subLabelColor }]}>Openings</Text>
                  <Text style={[styles.gridValue, { color: dynamicStyles.textColor }]}>
                    {jobInfo.openings !== undefined ? `${jobInfo.openings} Position(s)` : "1 Position"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={[styles.bottomBar, { borderTopColor: dynamicStyles.dividerColor, backgroundColor: dynamicStyles.cardBg }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { borderColor: dynamicStyles.cardBorder, backgroundColor: dynamicStyles.backgroundColor }]}
          onPress={onToggleSave}
          activeOpacity={0.8}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill={isSaved ? '#EF4444' : 'none'}>
            <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke={isSaved ? '#EF4444' : dynamicStyles.textColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={[styles.saveBtnText, { color: dynamicStyles.textColor }]}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8} onPress={onApplyPress}>
          <SendIcon />
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
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
    marginTop: Platform.OS === 'ios' ? 24 : 36,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  mainCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    marginBottom: 20,
  },
  mainCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  circularIconInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 19,
  },
  mainCardTitleContainer: {
    marginLeft: 16,
    flex: 1,
    paddingRight: 80, // Safe space for Full-time badge
  },
  jobTitleText: {
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: -0.2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  companyNameText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  greenBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  greenBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  capsuleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
    gap: 8,
  },
  capsuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.08)',
  },
  capsuleText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  cardSeparator: {
    height: 1,
    width: '100%',
    marginVertical: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabButton: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  reviewBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  contentCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescriptionText: {
    fontSize: 13,
    lineHeight: 22,
  },
  illustrationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  illustrationWrapper: {
    marginLeft: 12,
    alignSelf: 'center',
  },
  additionalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDetails: {
    marginLeft: 12,
    flex: 1,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  gridValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 24,
    marginRight: 16,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  labelColor: '#94A3B8',
  subLabelColor: '#64748B',
  dividerColor: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  badgeBg: 'rgba(255, 255, 255, 0.04)',
  greenBadgeBg: 'rgba(16, 185, 129, 0.15)',
  greenBadgeText: '#34D399',
  iconCircleBg: 'rgba(59, 130, 246, 0.1)',
  tabBarBg: '#131A2E',
  activeTabBg: '#1E293B',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#475569',
  subLabelColor: '#94A3B8',
  dividerColor: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  badgeBg: '#F1F5F9',
  greenBadgeBg: '#E6F4EA',
  greenBadgeText: '#10B981',
  iconCircleBg: 'rgba(59, 130, 246, 0.06)',
  tabBarBg: '#F1F5F9',
  activeTabBg: '#FFFFFF',
};
