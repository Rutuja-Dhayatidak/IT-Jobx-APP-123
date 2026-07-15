import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface ProfileCompletionBannerProps {
  percentage: number;
  missingFields: string[];
  onComplete: () => void;
  onDismiss: () => void;
  isDarkTheme?: boolean;
}

const TargetIcon = () => (
  <View style={styles.iconContainer}>
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#3B82F6" opacity={0.15} />
      <Circle cx="12" cy="12" r="8" stroke="#3B82F6" strokeWidth="2" />
      <Circle cx="12" cy="12" r="5" fill="#3B82F6" opacity={0.3} />
      <Circle cx="12" cy="12" r="2" fill="#3B82F6" />
    </Svg>
  </View>
);

export default function ProfileCompletionBanner({
  percentage,
  missingFields,
  onComplete,
  onDismiss,
  isDarkTheme = false,
}: ProfileCompletionBannerProps) {
  const containerBg = isDarkTheme ? '#1E293B' : '#EFF6FF';
  const textColor = isDarkTheme ? '#F8FAFC' : '#1E3A8A';
  const descColor = isDarkTheme ? '#94A3B8' : '#1E40AF';
  const progressTrackBg = isDarkTheme ? '#334155' : '#DBEAFE';

  const mapFieldLabel = (field: string) => {
    switch (field) {
      case 'skills': return 'Skills';
      case 'experience': return 'Experience';
      case 'preferredJobRole': return 'Preferred Job Role';
      case 'location': return 'Current Location';
      case 'education': return 'Education';
      case 'resume': return 'Resume';
      default: return field;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <View style={styles.header}>
        <TargetIcon />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: textColor }]}>
            Complete your profile for better job matches 🎯
          </Text>
          <Text style={[styles.description, { color: descColor }]}>
            Add your skills, experience and preferred role to receive more relevant job recommendations.
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: textColor }]}>Profile Completion</Text>
          <Text style={[styles.percentageText, { color: textColor }]}>{percentage}%</Text>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: progressTrackBg }]}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>

      {missingFields && missingFields.length > 0 && (
        <View style={styles.missingSection}>
          <Text style={[styles.missingTitle, { color: textColor }]}>Missing fields:</Text>
          <View style={styles.badgeContainer}>
            {missingFields.map((field) => (
              <View key={field} style={[styles.badge, { backgroundColor: isDarkTheme ? '#334155' : '#DBEAFE' }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>
                  • {mapFieldLabel(field)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Complete Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryButtonText, { color: textColor }]}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.85,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  missingSection: {
    marginBottom: 20,
  },
  missingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
