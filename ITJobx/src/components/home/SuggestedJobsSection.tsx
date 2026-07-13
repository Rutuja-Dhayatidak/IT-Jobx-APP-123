import React from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import SuggestedJobCard from './SuggestedJobCard';
import { SuggestedJob } from '../../services/suggestedJobsApi';

interface SuggestedJobsSectionProps {
  jobs: SuggestedJob[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onJobPress: (job: SuggestedJob) => void;
  onApplyPress: (job: SuggestedJob) => void;
  onSavePress: (job: SuggestedJob) => void;
  savedJobIds: string[];
  onExploreAllPress: () => void;
  onUpdateProfilePress: () => void;
  isDarkTheme?: boolean;
}

export default function SuggestedJobsSection({
  jobs,
  loading,
  error,
  onRetry,
  onJobPress,
  onApplyPress,
  onSavePress,
  savedJobIds,
  onExploreAllPress,
  onUpdateProfilePress,
  isDarkTheme = false
}: SuggestedJobsSectionProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  // 1. Loading State
  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Suggested Jobs</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {[1, 2].map((idx) => (
            <View key={idx} style={[styles.skeletonCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
              <View style={styles.skeletonHeader}>
                <View style={styles.skeletonLogo} />
                <View style={styles.skeletonTitleCol}>
                  <View style={styles.skeletonLineShort} />
                  <View style={styles.skeletonLineTiny} />
                </View>
              </View>
              <View style={styles.skeletonMetaRow}>
                <View style={styles.skeletonBadge} />
                <View style={styles.skeletonBadge} />
              </View>
              <View style={styles.skeletonIndicator} />
              <View style={styles.skeletonBtn} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Suggested Jobs</Text>
        </View>
        <View style={[styles.errorBox, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
          <Text style={[styles.errorText, { color: dynamicStyles.textColor }]}>Could not load suggestions</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Empty State
  if (jobs.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Suggested Jobs</Text>
        </View>
        <View style={[styles.emptyBox, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: dynamicStyles.textColor }]}>
            No matching jobs available right now
          </Text>
          <Text style={[styles.emptySubTitle, { color: dynamicStyles.labelColor }]}>
            We’ll show you new opportunities when jobs matching your experience and skills are posted.
          </Text>
          <View style={styles.emptyActionsRow}>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: '#2563EB' }]} onPress={onExploreAllPress} activeOpacity={0.8}>
              <Text style={styles.emptyBtnText}>Explore All Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2563EB' }]} onPress={onUpdateProfilePress} activeOpacity={0.8}>
              <Text style={[styles.emptyBtnText, { color: '#2563EB' }]}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // 4. Content State
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Suggested Jobs</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {jobs.map((job) => {
          const isSaved = savedJobIds.includes(job._id);
          return (
            <SuggestedJobCard
              key={job._id}
              job={job}
              isSaved={isSaved}
              isDarkTheme={isDarkTheme}
              onPress={() => onJobPress(job)}
              onApplyPress={() => onApplyPress(job)}
              onSavePress={() => onSavePress(job)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  horizontalScroll: {
    paddingLeft: 24,
    paddingRight: 8,
    paddingBottom: 8,
  },
  skeletonCard: {
    width: 290,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginRight: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
  skeletonTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonLineShort: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    width: '70%',
    marginBottom: 6,
    opacity: 0.5,
  },
  skeletonLineTiny: {
    height: 10,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    width: '40%',
    opacity: 0.5,
  },
  skeletonMetaRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  skeletonBadge: {
    width: 60,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
  skeletonIndicator: {
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
    opacity: 0.3,
  },
  skeletonBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
  errorBox: {
    marginHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    marginHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubTitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

const darkStyles = {
  cardBg: '#1E293B',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  textColor: '#F8FAFC',
  labelColor: '#94A3B8',
};

const lightStyles = {
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  textColor: '#0F172A',
  labelColor: '#64748B',
};
