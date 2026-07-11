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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

const { width, height } = Dimensions.get('window');

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
            const logoText = job.logo || (job.company ? job.company.substring(0, 1) + '.' : 'J.');
            const jobTags = job.tags || ['Full-Time', 'Remote'];
            const applicantsCount = job.applicants || 0;
            const salaryText = job.salary || 'Negotiable';
            const salaryUnitText = job.salaryUnit || '';

            return (
              <TouchableOpacity
                key={jobId}
                style={[styles.jobCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
                onPress={() => onJobPress && onJobPress(job)}
                activeOpacity={0.9}
              >
                {/* Top Row: Logo, Title, Bookmark Icon */}
                <View style={styles.cardHeader}>
                  <View style={[styles.logoContainer, { backgroundColor: logoBg }]}>
                    <Text style={[styles.logoText, { color: logoTextColor }]}>{logoText}</Text>
                  </View>
                  <View style={styles.titleContainer}>
                    <Text style={[styles.jobTitle, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {job.company}
                    </Text>
                  </View>
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

                {/* Tags Row */}
                <View style={styles.tagsContainer}>
                  {jobTags.map((tag: string, i: number) => (
                    <View key={i} style={[styles.tagPill, { backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}>
                      <Text style={[styles.tagText, { color: isDarkTheme ? '#94A3B8' : '#475569' }]}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Footer Row: Applicants and Salary */}
                <View style={styles.cardFooter}>
                  <View style={styles.applicantsWrapper}>
                    <View style={styles.avatarStack}>
                      <View style={[styles.miniAvatar, { backgroundColor: '#F43F5E', zIndex: 3, borderColor: dynamicStyles.avatarBorder }]} />
                      <View style={[styles.miniAvatar, { backgroundColor: '#3B82F6', zIndex: 2, marginLeft: -8, borderColor: dynamicStyles.avatarBorder }]} />
                      <View style={[styles.miniAvatar, { backgroundColor: '#10B981', zIndex: 1, marginLeft: -8, borderColor: dynamicStyles.avatarBorder }]} />
                      <View style={[styles.miniAvatarPlus, { zIndex: 0, marginLeft: -8, borderColor: dynamicStyles.avatarBorder, backgroundColor: isDarkTheme ? '#1E293B' : '#E2E8F0' }]}>
                        <Text style={styles.miniAvatarPlusText}>+</Text>
                      </View>
                    </View>
                    <Text style={styles.applicantsText}>{applicantsCount} Applicants</Text>
                  </View>

                  <Text style={styles.salaryText}>
                    {salaryText}
                    {salaryUnitText ? <Text style={styles.salaryUnit}>{salaryUnitText}</Text> : null}
                  </Text>
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
                    <View style={styles.avatarStack}>
                      <View style={[styles.miniAvatar, { backgroundColor: '#F43F5E', zIndex: 3, borderColor: isDarkTheme ? '#0F172A' : '#F8FAFC' }]} />
                      <View style={[styles.miniAvatar, { backgroundColor: '#3B82F6', zIndex: 2, marginLeft: -8, borderColor: isDarkTheme ? '#0F172A' : '#F8FAFC' }]} />
                      <View style={[styles.miniAvatar, { backgroundColor: '#10B981', zIndex: 1, marginLeft: -8, borderColor: isDarkTheme ? '#0F172A' : '#F8FAFC' }]} />
                    </View>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  bookmarkButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
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
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  miniAvatarPlus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarPlusText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'bold',
  },
  applicantsText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
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
});

const darkStyles = {
  backgroundColor: '#0F172A',
  cardBg: '#1E293B',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  buttonBg: '#1E293B',
  buttonBorder: 'rgba(255, 255, 255, 0.1)',
  textColor: '#FFFFFF',
  avatarBorder: '#1E293B',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  textColor: '#0F172A',
  avatarBorder: '#FFFFFF',
};
