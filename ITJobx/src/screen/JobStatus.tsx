import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

const { width } = Dimensions.get('window');

interface JobStatusProps {
  application: any;
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Custom Icons
const BriefcaseIcon = ({ color = '#64748B' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" />
  </Svg>
);

const PinIcon = ({ color = '#64748B' }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" fill={color} />
  </Svg>
);

const CheckIcon = ({ color = '#FFFFFF' }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function JobStatus({ application, onBackPress, isDarkTheme = true }: JobStatusProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const job = application?.jobId || {};
  const companyName = job.companyId?.name || 'Company';
  const locationText = job.location || 'Remote';
  const roleTitle = job.title || 'Position';
  
  const code = companyName.charCodeAt(0) || 65;
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444'];
  const logoColor = colors[code % colors.length];
  const logoLetter = companyName.substring(0, 1).toUpperCase() + '.';

  const currentStatus = (application?.status || 'applied').toLowerCase();
  
  // Status steps mapping
  const steps = [
    { key: 'applied', label: 'Application Sent', desc: 'Your application has been received by the employer.' },
    { key: 'under_review', label: 'Application Review', desc: 'The employer is currently reviewing your profile and resume.' },
    { key: 'interviewing', label: 'Interview Process', desc: 'You have been shortlisted for an interview round.' },
    { key: 'final', label: 'Final Decision', desc: 'The employer has made a final decision on your application.' }
  ];

  const getStepStatus = (stepKey: string, index: number) => {
    // Determine status of each step: 'completed', 'active', or 'pending'
    const statusSequence = ['applied', 'under_review', 'interviewing', 'accepted', 'rejected'];
    
    if (stepKey === 'final') {
      if (currentStatus === 'accepted' || currentStatus === 'rejected') {
        return { type: 'completed', label: currentStatus === 'accepted' ? 'Application Accepted' : 'Application Rejected', color: currentStatus === 'accepted' ? '#10B981' : '#EF4444' };
      }
      return { type: 'pending', label: 'Final Decision', color: '#94A3B8' };
    }

    const currentIndex = statusSequence.indexOf(currentStatus);
    const stepIndex = statusSequence.indexOf(stepKey);

    if (currentIndex >= stepIndex) {
      if (currentStatus === 'rejected' && stepIndex > 0) {
        // If rejected, steps after applied are cancelled
        return { type: 'pending', label: steps[index].label, color: '#94A3B8' };
      }
      return { type: 'completed', label: steps[index].label, color: '#10B981' };
    } else if (stepIndex === currentIndex + 1 || (currentStatus === 'applied' && stepIndex === 1)) {
      return { type: 'active', label: steps[index].label, color: '#2563EB' };
    } else {
      return { type: 'pending', label: steps[index].label, color: '#94A3B8' };
    }
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Application Status</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Job details card */}
          <View style={[styles.jobCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.logoBox, { backgroundColor: logoColor }]}>
                <Text style={styles.logoText}>{logoLetter}</Text>
              </View>
              <View style={styles.roleContainer}>
                <Text style={[styles.roleTitle, { color: dynamicStyles.textColor }]}>{roleTitle}</Text>
                <Text style={[styles.companyText, { color: dynamicStyles.labelColor }]}>{companyName}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dynamicStyles.dividerColor }]} />

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <PinIcon color={dynamicStyles.labelColor} />
                <Text style={[styles.metaText, { color: dynamicStyles.textColor }]}>{locationText}</Text>
              </View>
              <View style={styles.metaItem}>
                <BriefcaseIcon color={dynamicStyles.labelColor} />
                <Text style={[styles.metaText, { color: dynamicStyles.textColor }]}>{job.jobType || 'Full-time'}</Text>
              </View>
            </View>
          </View>

          {/* Timeline Section */}
          <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Track Timeline</Text>

          <View style={[styles.timelineCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(step.key, index);
              const isLast = index === steps.length - 1;

              return (
                <View key={step.key} style={styles.stepContainer}>
                  {/* Left node and line */}
                  <View style={styles.leftColumn}>
                    <View
                      style={[
                        styles.nodeCircle,
                        {
                          backgroundColor:
                            stepStatus.type === 'pending'
                              ? (isDarkTheme ? '#1E293B' : '#E2E8F0')
                              : (stepStatus.color || '#2563EB'),
                          borderColor:
                            stepStatus.type === 'active'
                              ? '#93C5FD'
                              : 'transparent',
                          borderWidth: stepStatus.type === 'active' ? 4 : 0,
                        },
                      ]}
                    >
                      {stepStatus.type === 'completed' && <CheckIcon />}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.verticalLine,
                          {
                            backgroundColor:
                              stepStatus.type === 'completed'
                                ? '#10B981'
                                : isDarkTheme
                                ? '#1E293B'
                                : '#E2E8F0',
                          },
                        ]}
                      />
                    )}
                  </View>

                  {/* Right text details */}
                  <View style={styles.rightColumn}>
                    <View style={styles.stepHeader}>
                      <Text
                        style={[
                          styles.stepTitle,
                          {
                            color:
                              stepStatus.type === 'pending'
                                ? dynamicStyles.textColor
                                : (stepStatus.color || '#2563EB'),
                            fontWeight: stepStatus.type === 'active' ? 'bold' : '600',
                          },
                        ]}
                      >
                        {stepStatus.label}
                      </Text>
                      {index === 0 && application?.appliedAt && (
                        <Text style={[styles.stepDate, { color: dynamicStyles.labelColor }]}>
                          {getFormattedDate(application.appliedAt)}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.stepDescription, { color: dynamicStyles.labelColor }]}>
                      {step.key === 'final' && currentStatus === 'rejected'
                        ? 'We regret to inform you that the employer has decided not to proceed with your application.'
                        : step.key === 'final' && currentStatus === 'accepted'
                        ? 'Congratulations! You have been selected for the position.'
                        : step.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  jobCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  roleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  timelineCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 80,
  },
  leftColumn: {
    alignItems: 'center',
    width: 24,
  },
  nodeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginVertical: -2,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 16,
    paddingBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepDate: {
    fontSize: 11,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 18,
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
  dividerColor: 'rgba(255, 255, 255, 0.06)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  dividerColor: '#E2E8F0',
};
