import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { jobService } from '../services/job';

interface MyApplicationProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
  onApplicationPress: (app: any) => void;
}

// Search Icon
const SearchIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#2563EB" />
  </Svg>
);

// Map Pin Icon
const PinIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" fill="#2563EB" />
  </Svg>
);

export default function MyApplication({ onBackPress, isDarkTheme = true, onApplicationPress }: MyApplicationProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await jobService.getMyApplications();
        if (data && data.success) {
          setApplications(data.applications || []);
        } else {
          setError('Failed to load applications');
        }
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return { bg: isDarkTheme ? 'rgba(16, 185, 129, 0.1)' : '#DCFCE7', text: '#10B981', label: 'Accepted' };
      case 'rejected':
        return { bg: isDarkTheme ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2', text: '#EF4444', label: 'Rejected' };
      case 'under_review':
        return { bg: isDarkTheme ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7', text: '#F59E0B', label: 'Review' };
      case 'interviewing':
        return { bg: isDarkTheme ? 'rgba(139, 92, 246, 0.1)' : '#F3E8FF', text: '#8B5CF6', label: 'Interview' };
      case 'applied':
      default:
        return { bg: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : '#DBEAFE', text: '#2563EB', label: 'Applied' };
    }
  };

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
        <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>My Application</Text>
        <TouchableOpacity style={[styles.searchButton, { borderColor: dynamicStyles.buttonBorder }]} activeOpacity={0.7}>
          <SearchIcon />
        </TouchableOpacity>
      </View>

      {/* Applications List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#EF4444', fontSize: 15, textAlign: 'center' }}>
              {error.toLowerCase() === 'no token provided' ? 'Login plz/register' : error}
            </Text>
          </View>
        ) : applications.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 20 }}>
            <Svg width={80} height={80} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16 }}>
              <Path d="M12 2C6.48 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill={isDarkTheme ? '#334155' : '#CBD5E1'} />
            </Svg>
            <Text style={{ fontSize: 15, textAlign: 'center', color: dynamicStyles.labelColor }}>
              You haven't applied for any jobs yet.
            </Text>
          </View>
        ) : (
          applications.map((app) => {
            const statusStyle = getStatusStyles(app.status || 'applied');
            const jobInfo = app.jobId || {};
            const companyName = jobInfo.companyId?.name || 'Company';
            const locationText = jobInfo.location || 'Remote';
            
            // Choose logo bg color based on company name
            const code = companyName.charCodeAt(0) || 65;
            const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444'];
            const logoColor = colors[code % colors.length];
            const logoLetter = companyName.substring(0, 1).toUpperCase() + '.';

            const tags = [jobInfo.jobType, jobInfo.locationType, jobInfo.experienceLevel].filter(Boolean);

            return (
              <TouchableOpacity
                key={app._id}
                style={[styles.card, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
                onPress={() => onApplicationPress(app)}
                activeOpacity={0.85}
              >
                {/* Top Row with Logo and Info */}
                <View style={styles.cardHeader}>
                  <View style={[styles.logoBox, { backgroundColor: logoColor }]}>
                    <Text style={[styles.logoText, { color: '#FFFFFF' }]}>{logoLetter}</Text>
                  </View>
                  <View style={styles.roleContainer}>
                    <Text style={[styles.roleTitle, { color: dynamicStyles.textColor }]}>{jobInfo.title || 'Position'}</Text>
                    <Text style={[styles.companyText, { color: dynamicStyles.labelColor }]}>{companyName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                  </View>
                </View>

                {/* Location Row */}
                <View style={styles.locationRow}>
                  <PinIcon />
                  <Text style={[styles.locationText, { color: dynamicStyles.labelColor }]}>{locationText}</Text>
                </View>

                {/* Tags Row */}
                {tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {tags.map((tag) => (
                      <View key={tag} style={[styles.tagPill, { backgroundColor: dynamicStyles.tagBg }]}>
                        <Text style={[styles.tagText, { color: dynamicStyles.tagTextColor }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
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
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchButton: {
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
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingLeft: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
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
  tagBg: 'rgba(255, 255, 255, 0.05)',
  tagTextColor: '#FFFFFF',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  tagBg: '#F1F5F9',
  tagTextColor: '#64748B',
};
