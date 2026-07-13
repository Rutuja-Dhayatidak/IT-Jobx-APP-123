import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { SuggestedJob } from '../../services/suggestedJobsApi';

interface SuggestedJobCardProps {
  job: SuggestedJob;
  onPress: () => void;
  onApplyPress: () => void;
  onSavePress: () => void;
  isSaved?: boolean;
  isDarkTheme?: boolean;
}

// Icons Set
const PinIcon = ({ color = '#64748B' }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={color} />
  </Svg>
);

const BriefcaseIcon = ({ color = '#64748B' }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
    <Path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z" fill={color} />
  </Svg>
);

const CalendarIcon = ({ color = '#64748B' }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
    <Path d="M9 2h2v2H9V2zm6 0h2v2h-2V2zM19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill={color} />
  </Svg>
);

const ClockIcon = ({ color = '#64748B' }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
    <Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill={color} />
  </Svg>
);

const VerifiedIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="#2563EB" style={{ marginLeft: 4 }}>
    <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#2563EB" />
  </Svg>
);

const WalletIcon = ({ color = '#64748B' }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 18c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V6c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v12zm-2 0V6H5v12h14zm-1-7c0-1.1-.9-2-2-2h-3v4h3c1.1 0 2-.9 2-2z" fill={color} />
  </Svg>
);

const ChevronRightCircle = () => (
  <View style={styles.chevronCircle}>
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={1} />
    </Svg>
  </View>
);

const SparklesIcon = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6 }}>
    <Path d="M9 21.5L7.5 15.5L1.5 14L7.5 12.5L9 6.5L10.5 12.5L16.5 14L10.5 15.5L9 21.5ZM19 12L18.25 9L15.25 8.25L18.25 7.5L19 4.5L19.75 7.5L22.75 8.25L19.75 9L19 12Z" fill="#3B82F6" />
  </Svg>
);

const StarIcon = () => (
  <Svg width={10} height={10} viewBox="0 0 24 24" fill="#D97706" style={{ marginRight: 4 }}>
    <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </Svg>
);

// Circular Progress Component
const CircularProgress = ({ score, size = 42, strokeWidth = 4 }: { score: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F59E0B"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute' }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: '#F59E0B' }}>{score}%</Text>
      </View>
    </View>
  );
};

export default function SuggestedJobCard({
  job,
  onPress,
  onApplyPress,
  onSavePress,
  isSaved = false,
  isDarkTheme = false
}: SuggestedJobCardProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;
  
  // Helper for company logo initial
  const companyInitial = job.companyName.charAt(0).toUpperCase();

  // Create a pleasant background color based on name
  const code = job.companyName.charCodeAt(0) || 65;
  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#EF4444'];
  const logoBg = colors[code % colors.length];

  // Limit matched skills rendering
  const maxSkillsShow = 4;
  const displayedSkills = (job.matchedSkills || []).slice(0, maxSkillsShow);
  const extraSkillsCount = (job.matchedSkills || []).length - maxSkillsShow;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Featured Badge */}
      {job.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>FEATURED</Text>
        </View>
      )}

      {/* Upper Section */}
      <View style={styles.headerRow}>
        <View style={[styles.companyLogo, { backgroundColor: logoBg }]}>
          <Text style={styles.logoText}>{companyInitial}</Text>
        </View>
        <View style={styles.titleCol}>
          <Text style={[styles.jobTitle, { color: dynamicStyles.textColor }]} numberOfLines={1}>
            {job.title}
          </Text>
          <View style={styles.companyRow}>
            <Text style={[styles.companyName, { color: dynamicStyles.labelColor }]} numberOfLines={1}>
              {job.companyName}
            </Text>
            <VerifiedIcon />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.bookmarkBtn, { borderColor: dynamicStyles.cardBorder }]} 
          onPress={onSavePress} 
          activeOpacity={0.7}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill={isSaved ? '#2563EB' : 'none'} stroke={isSaved ? '#2563EB' : dynamicStyles.labelColor} strokeWidth={2}>
            <Path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Badges / Meta Info Row */}
      <View style={styles.metaRow}>
        <View style={[styles.metaBadge, { backgroundColor: dynamicStyles.metaBg }]}>
          <PinIcon color={dynamicStyles.labelColor} />
          <Text style={[styles.metaText, { color: dynamicStyles.labelColor }]} numberOfLines={1}>
            {job.location}
          </Text>
        </View>
        <View style={[styles.metaBadge, { backgroundColor: dynamicStyles.metaBg }]}>
          <BriefcaseIcon color={dynamicStyles.labelColor} />
          <Text style={[styles.metaText, { color: dynamicStyles.labelColor }]}>
            {job.jobType}
          </Text>
        </View>
        <View style={[styles.metaBadge, { backgroundColor: dynamicStyles.metaBg }]}>
          <CalendarIcon color={dynamicStyles.labelColor} />
          <Text style={[styles.metaText, { color: dynamicStyles.labelColor }]}>
            {job.minimumExperienceMonths === 0 && job.maximumExperienceMonths === 0
              ? 'Fresher'
              : `${Math.round(job.minimumExperienceMonths / 12)}–${Math.round(job.maximumExperienceMonths / 12)} Yrs`}
          </Text>
        </View>
        <View style={[styles.metaBadge, { backgroundColor: dynamicStyles.metaBg }]}>
          <ClockIcon color={dynamicStyles.labelColor} />
          <Text style={[styles.metaText, { color: dynamicStyles.labelColor }]}>Posted 1d ago</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: dynamicStyles.dividerBg }]} />

      {/* Match Quality Banner */}
      <View style={styles.matchBanner}>
        <CircularProgress score={job.recommendationScore} size={36} />
        <View style={styles.matchDetailsCol}>
          <View style={styles.matchBadgeRow}>
            <Text style={[styles.matchStatusText, { color: dynamicStyles.textColor }]}>
              {job.recommendationScore >= 80 ? 'Excellent Match' : job.recommendationScore >= 50 ? 'Great Match' : 'Good Match'}
            </Text>
            <View style={styles.yellowBadge}>
              <StarIcon />
              <Text style={styles.yellowBadgeText}>Best Match</Text>
            </View>
          </View>
          <Text style={styles.matchSubtext}>Your skills are a strong match for this role</Text>
        </View>
      </View>

      {/* Matching Skills Box */}
      {job.matchedSkills && job.matchedSkills.length > 0 && (
        <View style={[styles.skillsBox, { backgroundColor: dynamicStyles.skillsBoxBg }]}>
          <View style={styles.skillsHeader}>
            <Text style={styles.skillsTitle}>Matching Skills</Text>
            <SparklesIcon />
          </View>
          <View style={styles.skillsListRow}>
            {displayedSkills.map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <View style={styles.greenDot} />
                <Text style={styles.skillPillText} numberOfLines={1}>{skill}</Text>
              </View>
            ))}
            {extraSkillsCount > 0 && (
              <View style={styles.extraSkillsPill}>
                <Text style={styles.extraSkillsText}>+{extraSkillsCount}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer Row */}
      <View style={styles.footerRow}>
        <View style={styles.salaryCol}>
          <View style={[styles.walletBg, { backgroundColor: dynamicStyles.metaBg }]}>
            <WalletIcon color={dynamicStyles.labelColor} />
          </View>
          <View style={styles.salaryInfo}>
            <Text style={[styles.salaryText, { color: dynamicStyles.textColor }]}>
              {job.salary || '₹12 - 20 LPA'}
            </Text>
            <Text style={styles.salarySubtext}>Estimated Salary</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.applyBtn, { backgroundColor: '#2563EB' }]}
          onPress={onApplyPress}
          activeOpacity={0.8}
        >
          <Text style={styles.applyBtnText}>Apply Now</Text>
          <ChevronRightCircle />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 390,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  featuredBadge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  titleCol: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 160,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 90,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  matchDetailsCol: {
    flex: 1,
    marginLeft: 12,
  },
  matchBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  matchStatusText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  yellowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  yellowBadgeText: {
    color: '#D97706',
    fontSize: 9,
    fontWeight: '700',
  },
  matchSubtext: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  skillsBox: {
    borderRadius: 14,
    padding: 8,
    marginBottom: 8,
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  skillsListRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  skillPillText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
    maxWidth: 90,
  },
  extraSkillsPill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraSkillsText: {
    color: '#1E40AF',
    fontSize: 11,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    paddingTop: 6,
  },
  salaryCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletBg: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  salaryInfo: {
    marginLeft: 8,
  },
  salaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  salarySubtext: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
  },
  applyBtn: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

const darkStyles = {
  cardBg: '#1E293B',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  textColor: '#F8FAFC',
  labelColor: '#94A3B8',
  metaBg: '#0F172A',
  dividerBg: 'rgba(255, 255, 255, 0.05)',
  skillsBoxBg: 'rgba(30, 41, 59, 0.5)',
};

const lightStyles = {
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  textColor: '#0F172A',
  labelColor: '#64748B',
  metaBg: '#F8FAFC',
  dividerBg: '#E2E8F0',
  skillsBoxBg: '#EFF6FF',
};
