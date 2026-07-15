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
  Modal,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

const { width, height } = Dimensions.get('window');

// Custom SVG Icons for consistent job card metadata styling
const PinIcon = ({ color = '#64748B' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={color} />
  </Svg>
);

const UserGroupIcon = ({ color = '#64748B' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill={color} />
  </Svg>
);

const BriefcaseIcon = ({ color = '#2563EB' }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill={color} />
  </Svg>
);

const BuildingIcon = ({ color = '#8B5CF6' }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill={color} />
  </Svg>
);

interface BookmarkProps {
  onBackPress?: () => void;
  onNavigateToTab?: (tab: 'home' | 'portfolio' | 'saved' | 'chat' | 'profile') => void;
  onJobPress?: (job: any) => void;
  isDarkTheme?: boolean;
  savedJobs?: any[];
  onToggleSave?: (job: any) => void;
}

export default function Bookmark({ onBackPress, onNavigateToTab, onJobPress, isDarkTheme = false, savedJobs = [], onToggleSave }: BookmarkProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedJobToRemove, setSelectedJobToRemove] = useState<any>(null);

  const handleOpenRemoveModal = (job: any) => {
    setSelectedJobToRemove(job);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    if (selectedJobToRemove && onToggleSave) {
      onToggleSave(selectedJobToRemove);
    }
    setShowRemoveModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      
      <FadeInView style={{ flex: 1 }}>
        {/* Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Bookmark</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Saved Jobs List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {savedJobs.map((job) => {
            const jobId = job._id || job.id;
            const logoBg = job.logoBg || '#2563EB';
            const logoTextColor = job.logoTextColor || '#FFFFFF';
            const companyName = job.companyId?.name || job.company || 'Company';
            const logoText = job.logo || (companyName ? companyName.substring(0, 1) + '.' : 'J.');
            
            // Handle tags dynamically from both array format and separate fields
            const rawTags = [job.jobType, job.locationType, job.experienceLevel].filter(Boolean);
            const jobTags = (job.tags && job.tags.length > 0) ? job.tags : (rawTags.length > 0 ? rawTags : ['Full-Time', 'Remote']);
            
            const applicantsCount = job.applyCount !== undefined ? job.applyCount : (job.applicants || 0);
            const salaryText = job.salaryBudget ? `${job.salaryBudget}` : (job.salary || 'Negotiable');
            const salaryUnitText = job.salaryBudget ? '' : (job.salaryUnit || '');             return (
              <TouchableOpacity
                key={jobId}
                style={[
                  styles.jobCard,
                  {
                    backgroundColor: dynamicStyles.cardBg,
                    borderColor: dynamicStyles.cardBorder,
                    shadowColor: isDarkTheme ? '#000000' : '#E2E8F0',
                  },
                ]}
                onPress={() => onJobPress && onJobPress(job)}
                activeOpacity={0.95}
              >
                {/* Card Main details (Logo and Info Column) */}
                <View style={styles.cardMainInfo}>
                  <View style={[styles.logoWrapper, { backgroundColor: isDarkTheme ? '#1E293B' : '#F8FAFC', borderColor: isDarkTheme ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
                    {job.companyId?.logo ? (
                      <Image 
                        source={{ uri: job.companyId.logo }} 
                        style={{ width: '100%', height: '100%', borderRadius: 12 }} 
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={[styles.logoText, { color: logoTextColor }]}>{logoText}</Text>
                    )}
                  </View>

                  <View style={styles.infoColumn}>
                    {/* Title & Right Actions (Bookmark Icon) */}
                    <View style={styles.titleRow}>
                      <Text style={[styles.jobTitle, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <TouchableOpacity 
                        style={styles.bookmarkButton} 
                        activeOpacity={0.7}
                        onPress={() => handleOpenRemoveModal(job)}
                      >
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="#2563EB">
                          <Path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                        </Svg>
                      </TouchableOpacity>
                    </View>

                    {/* Company Name */}
                    <Text style={[styles.companyNameText, { color: dynamicStyles.labelColor }]}>
                      {companyName}
                    </Text>

                    {/* Metadata Row (Location • Applicants) */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <PinIcon color={dynamicStyles.labelColor} />
                        <Text style={[styles.metaText, { color: dynamicStyles.labelColor }]}>{job.location || 'Remote'}</Text>
                      </View>
                      <Text style={[styles.metaDot, { color: dynamicStyles.labelColor }]}>•</Text>
                      <View style={styles.metaItem}>
                        <UserGroupIcon color={dynamicStyles.labelColor} />
                        <Text style={[styles.metaText, { color: dynamicStyles.labelColor }]}>{applicantsCount} Applicants</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Divider line */}
                <View style={[styles.cardDivider, { backgroundColor: dynamicStyles.dividerColor }]} />

                {/* Bottom Row - Tags & Salary */}
                <View style={styles.bottomRow}>
                  <View style={styles.tagsContainer}>
                    {jobTags.slice(0, 2).map((tag: string, i: number) => {
                      const cleanTag = tag.trim().toLowerCase();
                      let bg = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9';
                      let color = isDarkTheme ? '#94A3B8' : '#475569';
                      let icon = null;

                      if (cleanTag === 'full-time' || cleanTag === 'part-time' || cleanTag === 'contract') {
                        bg = isDarkTheme ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)';
                        color = '#2563EB';
                        icon = <BriefcaseIcon color={color} />;
                      } else if (cleanTag === 'hybrid' || cleanTag === 'remote' || cleanTag === 'on-site' || cleanTag === 'onsite') {
                        bg = isDarkTheme ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)';
                        color = '#8B5CF6';
                        icon = <BuildingIcon color={color} />;
                      }

                      return (
                        <View key={i} style={[styles.tagPill, { backgroundColor: bg }]}>
                          {icon}
                          <Text style={[styles.tagText, { color, marginLeft: icon ? 4 : 0 }]}>{tag}</Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.salaryContainer}>
                    <Text style={[styles.salaryTextText, { color: isDarkTheme ? '#FFFFFF' : '#0F172A' }]}>
                      {salaryText}
                    </Text>
                    <Text style={[styles.salarySubtext, { color: dynamicStyles.labelColor }]}>
                      {salaryText.toLowerCase().includes('lpa') || salaryText.toLowerCase().includes('annum') ? 'per annum' : 'per month'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          {savedJobs.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDarkTheme ? '#94A3B8' : '#64748B' }]}>No bookmarked jobs found.</Text>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </FadeInView>

      {/* Remove Confirmation Bottom Sheet Modal */}
      <Modal
        visible={showRemoveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRemoveModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: isDarkTheme ? '#1E293B' : '#FFFFFF' }]}>
            <View style={[styles.pullBar, { backgroundColor: isDarkTheme ? '#334155' : '#CBD5E1' }]} />
            <Text style={[styles.modalTitle, { color: dynamicStyles.textColor }]}>Remove from Bookmark?</Text>
            
            {/* Preview of Selected Job */}
            {selectedJobToRemove && (
              <View style={[styles.previewCard, { backgroundColor: isDarkTheme ? '#0F172A' : '#F8FAFC', borderColor: dynamicStyles.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.logoContainer, { backgroundColor: selectedJobToRemove.logoBg || '#2563EB' }]}>
                    <Text style={[styles.logoText, { color: selectedJobToRemove.logoTextColor || '#FFFFFF' }]}>{selectedJobToRemove.logo || (selectedJobToRemove.company ? selectedJobToRemove.company.substring(0, 1) + '.' : 'J.')}</Text>
                  </View>
                  <View style={styles.titleContainer}>
                    <Text style={[styles.jobTitle, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                      {selectedJobToRemove.title}
                    </Text>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {selectedJobToRemove.company}
                    </Text>
                  </View>
                </View>
                <View style={styles.tagsContainer}>
                  {(selectedJobToRemove.tags || ['Full-Time', 'Remote']).map((tag: string, i: number) => (
                    <View key={i} style={[styles.tagPill, { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0' }]}>
                      <Text style={[styles.tagText, { color: isDarkTheme ? '#94A3B8' : '#475569' }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.applicantsWrapper}>
                    <Text style={styles.applicantsText}>{(selectedJobToRemove.applicants || 0)} Applicants</Text>
                  </View>
                  <Text style={styles.salaryText}>
                    {selectedJobToRemove.salary}
                    {selectedJobToRemove.salaryUnit ? <Text style={styles.salaryUnit}>{selectedJobToRemove.salaryUnit}</Text> : null}
                  </Text>
                </View>
              </View>
            )}

            {/* Buttons Row */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: isDarkTheme ? '#0F172A' : '#F1F5F9' }]}
                activeOpacity={0.8}
                onPress={() => setShowRemoveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.removeConfirmButton]}
                activeOpacity={0.8}
                onPress={handleConfirmRemove}
              >
                <Text style={styles.removeConfirmButtonText}>Yes, Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  jobCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  companyNameText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  bookmarkButton: {
    padding: 4,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  metaDot: {
    marginHorizontal: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  salaryContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  salaryTextText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  salarySubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
  },
  // Modal Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
    maxHeight: height * 0.8,
  },
  pullBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  removeConfirmButton: {
    backgroundColor: '#2563EB',
  },
  removeConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Preview Card fallback style bindings
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.08)',
    paddingTop: 12,
  },
  applicantsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantsText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 0,
  },
  salaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  salaryUnit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'normal',
  },
});

const darkStyles = {
  backgroundColor: '#0F172A',
  cardBg: '#1E293B',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  buttonBg: '#1E293B',
  buttonBorder: 'rgba(255, 255, 255, 0.1)',
  textColor: '#FFFFFF',
  avatarBorder: '#1E293B',
  labelColor: '#94A3B8',
  dividerColor: 'rgba(255, 255, 255, 0.06)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  textColor: '#0F172A',
  avatarBorder: '#FFFFFF',
  labelColor: '#64748B',
  dividerColor: '#E2E8F0',
};
