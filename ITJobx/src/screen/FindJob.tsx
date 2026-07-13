import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import FadeInView from '../components/FadeInView';
import { apiRequest } from '../services/api';

interface FindJobProps {
  onBackPress?: () => void;
  onNavigateToTab?: (tab: 'home' | 'portfolio' | 'saved' | 'chat' | 'profile') => void;
  onFilterPress?: () => void;
  onJobPress?: (job: any) => void;
  isDarkTheme?: boolean;
  initialTab?: 'available' | 'saved' | 'hire';
  savedJobs?: any[];
  onToggleSave?: (job: any) => void;
  filters?: any;
  initialSearchQuery?: string;
}

// Custom SVG Icons
const FigmaIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C9.24 2 7 4.24 7 7c0 1.63.78 3.08 2 4-.78.43-1.42.99-1.88 1.69C6.44 13.6 6 14.76 6 16c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.24-.44-2.4-1.12-3.31C15.34 11.78 16 10.43 16 9c0-2.76-2.24-5-5-5h1zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-3 8c0-1.66 1.34-3 3-3s3 1.34 3 3v2h-6v-2zm3 7c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3v1c0 1.1-.9 2-2 2h-1z" fill="#F24E1E" />
    <Circle cx="12" cy="16" r="3" fill="#1ABC9C" />
    <Path d="M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z" fill="#A259FF" />
    <Path d="M12 2c1.66 0 3 1.34 3 3s-1.34 3-3 3V2z" fill="#FF7262" />
    <Path d="M12 8c1.66 0 3 1.34 3 3s-1.34 3-3 3V8z" fill="#1ABC9C" />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.17-4.52z" fill="#EA4335" />
  </Svg>
);

const AmazonIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15.9 13.9c-.8.6-1.9 1-3.2 1-2.4 0-3.9-1.4-3.9-3.7 0-2.5 1.9-3.8 4.6-3.8.9 0 1.8.2 2.5.5v.7c0 1.9-.9 3.5-2.5 4.3-.8.4-1.7.5-2.4.3.4.5 1 .7 1.8.7 1 0 1.9-.4 2.5-1.1l.6.4zm-1.8-4.5c-.5-.2-1.1-.3-1.7-.3-1.7 0-2.6.7-2.6 2.1 0 1.2.7 1.9 1.9 1.9.9 0 1.7-.4 2.1-1.1v-2.6z" fill="#000000" />
    <Path d="M6 19c3.5 2 8.5 2 12 0" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
    <Path d="M18 19l-1-1.5m1 1.5l-1.8.2" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const SlidersIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" fill="#FFFFFF" />
  </Svg>
);

const BookmarkIcon = ({ active, color = '#64748B' }: { active: boolean; color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
      fill={active ? '#2563EB' : 'none'}
      stroke={active ? '#2563EB' : color}
      strokeWidth="2"
    />
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

export default function FindJob({ onBackPress, onNavigateToTab, onFilterPress, onJobPress, isDarkTheme = true, initialTab = 'available', savedJobs = [], onToggleSave, filters, initialSearchQuery }: FindJobProps) {
  const [activeTab, setActiveTab] = useState<'available' | 'saved' | 'hire'>(initialTab);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [locationQuery, setLocationQuery] = useState(filters?.location && filters.location !== 'Remote' ? filters.location : '');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (filters?.location) {
      setLocationQuery(filters.location === 'Remote' ? '' : filters.location);
    }
  }, [filters]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const fetchJobs = async (search = '', location = '') => {
    try {
      setLoading(true);
      setError(null);

      let queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);

      const finalLoc = location || locationQuery || (filters?.location && filters.location !== 'Remote' ? filters.location : '') || '';
      if (finalLoc && finalLoc !== 'All Locations') {
        queryParams.push(`location=${encodeURIComponent(finalLoc)}`);
      }

      if (filters) {
        if (filters.workingModel && filters.workingModel !== 'all') {
          let locType = filters.workingModel;
          if (locType === 'onsite') locType = 'on-site';
          queryParams.push(`locationType=${encodeURIComponent(locType)}`);
        }

        if (filters.jobType && filters.jobType !== 'all') {
          let jType = filters.jobType;
          if (jType === 'fulltime') jType = 'Full-time';
          if (jType === 'parttime') jType = 'Part-time';
          if (jType === 'contract') jType = 'Contract';
          queryParams.push(`jobType=${encodeURIComponent(jType)}`);
        }

        if (filters.experienceLevels && filters.experienceLevels.length > 0 && !filters.experienceLevels.includes('all')) {
          let exp = filters.experienceLevels[0];
          if (exp === 'entry') exp = 'Entry Level';
          if (exp === 'associate') exp = 'Mid Level';
          if (exp === 'internship') exp = 'Internship';
          if (['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Director', 'Internship'].includes(exp)) {
            queryParams.push(`experienceLevel=${encodeURIComponent(exp)}`);
          }
        }
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const url = `/jobs/published${queryString}`;

      const data = await apiRequest(url, { method: 'GET' });
      if (data && data.success) {
        let fetchedJobs = data.jobs || [];

        if (filters) {
          fetchedJobs = fetchedJobs.filter((job: any) => {
            const activeLoc = location || locationQuery || filters.location || '';
            if (activeLoc) {
              if (activeLoc === 'Remote') {
                const isRemote = (job.locationType || '').toLowerCase() === 'remote' ||
                  (job.location || '').toLowerCase().includes('remote');
                if (!isRemote) return false;
              } else if (activeLoc !== 'All Locations') {
                const matchesLoc = (job.location || '').toLowerCase().includes(activeLoc.toLowerCase());
                if (!matchesLoc) return false;
              }
            }

            if (job.salaryBudget) {
              const salaryStr = String(job.salaryBudget).toLowerCase();
              const numbers = salaryStr.match(/\d+/g);
              if (numbers && numbers.length > 0) {
                let salaryVal = parseInt(numbers[0], 10);
                if (salaryVal > 1000) {
                  salaryVal = salaryVal / 1000;
                }
                if (salaryVal < filters.minSalary || salaryVal > filters.maxSalary) {
                  return false;
                }
              }
            }

            if (filters.experienceLevels && filters.experienceLevels.length > 0 && !filters.experienceLevels.includes('all')) {
              const jobExp = (job.experienceLevel || '').toLowerCase();
              const hasMatch = filters.experienceLevels.some((lvl: string) => {
                if (lvl === 'entry' && jobExp.includes('entry')) return true;
                if (lvl === 'associate' && (jobExp.includes('mid') || jobExp.includes('associate'))) return true;
                if (lvl === 'internship' && jobExp.includes('intern')) return true;
                return false;
              });
              if (!hasMatch) return false;
            }

            if (filters.jobTitles && filters.jobTitles.length > 0) {
              const jobTitle = (job.title || '').toLowerCase();
              const hasMatch = filters.jobTitles.some((titleId: string) => {
                if (titleId === 'accountant' && jobTitle.includes('account')) return true;
                if (titleId === 'bdm' && (jobTitle.includes('business development') || jobTitle.includes('bdm') || jobTitle.includes('manager'))) return true;
                if (titleId === 'writer' && (jobTitle.includes('writer') || jobTitle.includes('content'))) return true;
                return false;
              });
              if (!hasMatch) return false;
            }

            return true;
          });
        }

        setJobs(fetchedJobs);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(searchQuery, locationQuery);
  }, [searchQuery, locationQuery, filters]);

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getCompanyLogo = (companyName: string) => {
    const name = companyName.toLowerCase();
    if (name.includes('figma')) return <FigmaIcon />;
    if (name.includes('google')) return <GoogleIcon />;
    if (name.includes('amazon')) return <AmazonIcon />;

    // Choose a color palette based on name first char
    const code = companyName.charCodeAt(0) || 65;
    const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444'];
    const selectedColor = colors[code % colors.length];

    return (
      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: selectedColor, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>{companyName.charAt(0).toUpperCase()}</Text>
      </View>
    );
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
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Find Jobs</Text>

          {/* Styled Profile Initials Avatar for balance */}
          <View style={[styles.avatarContainer, { backgroundColor: '#2563EB' }]}>
            <Text style={styles.avatarText}>R</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Search & Filter Row */}
          <View style={styles.searchRow}>
            <View style={[styles.searchBar, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: dynamicStyles.textColor }]}
                placeholder="Search for your dream job..."
                placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.length === 0) {
                    setLocationQuery('');
                  }
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setLocationQuery('');
                  }}
                  style={styles.clearSearchBtn}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: dynamicStyles.textColor, fontSize: 18, fontWeight: '700' }}>×</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.8}
              onPress={onFilterPress}
            >
              <SlidersIcon />
            </TouchableOpacity>
          </View>

          {/* Dedicated Location Input Field - Only shown when typing in search bar or locationQuery exists */}
          {(searchQuery.length > 0 || locationQuery.length > 0) && (
            <View style={styles.locationContainer}>
              <View style={[styles.locationBar, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
                <Text style={styles.locationIcon}>📍</Text>
                <TextInput
                  style={[styles.locationInput, { color: dynamicStyles.textColor }]}
                  placeholder="Enter city, state or country..."
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                  value={locationQuery}
                  onChangeText={setLocationQuery}
                />
                {locationQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setLocationQuery('')} style={styles.clearLocationBtn} activeOpacity={0.7}>
                    <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '700' }}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Jobs List */}
          <View style={styles.jobsList}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : jobs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Svg width={80} height={80} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16 }}>
                  <Path d="M12 2C6.48 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill={isDarkTheme ? '#334155' : '#CBD5E1'} />
                </Svg>
                <Text style={[styles.emptyText, { color: dynamicStyles.labelColor }]}>No jobs found matching your criteria</Text>
              </View>
            ) : (
              jobs.map((job) => {
                const companyName = job.companyId?.name || 'Company';
                const locationText = job.location || 'Remote';
                const roleTitle = job.title;
                const salaryText = job.salaryBudget ? `${job.salaryBudget}` : 'N/A';
                const isYearly = salaryText.toLowerCase().includes('lpa') ||
                  salaryText.toLowerCase().includes('pa') ||
                  salaryText.toLowerCase().includes('annum') ||
                  salaryText.toLowerCase().includes('lakh') ||
                  salaryText.toLowerCase().includes('yr') ||
                  salaryText.toLowerCase().includes('year');
                const timeAgo = getTimeAgo(job.publishedAt || job.createdAt);
                const applicantsText = `${job.applyCount || 0} Applicants`;
                const tags = [job.jobType, job.locationType, job.experienceLevel].filter(Boolean);

                const isFeatured = job.isFeatured;
                const badgeText = isFeatured ? 'Featured' : (job.planTier || 'Hot');
                const badgeBg = isFeatured ? 'rgba(245, 158, 11, 0.12)' : 'rgba(37, 99, 235, 0.12)';
                const badgeColor = isFeatured ? '#F59E0B' : '#2563EB';
                const isSaved = savedJobs.some((j) => (j._id || j.id) === job._id);

                return (
                  <TouchableOpacity
                    key={job._id}
                    style={[
                      styles.jobCard,
                      {
                        backgroundColor: dynamicStyles.cardBg,
                        borderColor: dynamicStyles.cardBorder,
                        shadowColor: isDarkTheme ? '#000000' : '#E2E8F0',
                      },
                    ]}
                    onPress={() => {
                      if (onJobPress) {
                        onJobPress({
                          ...job,
                          role: roleTitle,
                          company: companyName,
                          location: locationText,
                          salary: isYearly ? salaryText : (salaryText.includes('/m') ? salaryText : `${salaryText}/m`),
                          tags: [
                            job.jobType || 'Full-time',
                            job.locationType || 'remote',
                            job.experienceLevel || 'Mid Level'
                          ]
                        });
                      }
                    }}
                    activeOpacity={0.95}
                  >
                    {/* Card Main details (Logo and Info Column) */}
                    <View style={styles.cardMainInfo}>
                      <View style={[styles.logoWrapper, { backgroundColor: isDarkTheme ? '#1E293B' : '#F8FAFC', borderColor: isDarkTheme ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
                        {getCompanyLogo(companyName)}
                      </View>

                      <View style={styles.infoColumn}>
                        {/* Title & Right Actions (Status badge + Bookmark) */}
                        <View style={styles.titleRow}>
                          <Text style={[styles.roleTitle, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                            {roleTitle}
                          </Text>
                          <View style={styles.rightActions}>
                            <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                              <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{badgeText}</Text>
                            </View>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              style={styles.bookmarkButton}
                              onPress={() => onToggleSave && onToggleSave(job)}
                            >
                              <BookmarkIcon active={isSaved} color={isSaved ? '#2563EB' : dynamicStyles.labelColor} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Company Name */}
                        <Text style={[styles.companyName, { color: dynamicStyles.labelColor }]}>
                          {companyName}
                        </Text>

                        {/* Metadata Row (Location • Applicants) */}
                        <View style={styles.metaRow}>
                          <View style={styles.metaItem}>
                            <PinIcon color={dynamicStyles.labelColor} />
                            <Text style={[styles.metaText, { color: dynamicStyles.labelColor }]}>{locationText}</Text>
                          </View>
                          <Text style={[styles.metaDot, { color: dynamicStyles.labelColor }]}>•</Text>
                          <View style={styles.metaItem}>
                            <UserGroupIcon color={dynamicStyles.labelColor} />
                            <Text style={[styles.metaText, { color: dynamicStyles.labelColor }]}>{applicantsText}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Divider line */}
                    <View style={[styles.cardDivider, { backgroundColor: dynamicStyles.dividerColor }]} />

                    {/* Bottom Row - Tags & Salary */}
                    <View style={styles.bottomRow}>
                      <View style={styles.tagsContainer}>
                        {tags.slice(0, 2).map((tag, i) => {
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
                        <Text style={[styles.salaryText, { color: isDarkTheme ? '#FFFFFF' : '#0F172A' }]}>
                          {salaryText}
                        </Text>
                        <Text style={[styles.salarySubtext, { color: dynamicStyles.labelColor }]}>
                          {isYearly ? 'per annum' : 'per month'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
          <View style={{ height: 110 }} />
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
    marginTop: Platform.OS === 'ios' ? 24 : 36,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 54,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearSearchBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  locationContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  locationBar: {
    height: 50,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearLocationBtn: {
    padding: 4,
    marginLeft: 8,
  },
  tabsWrapper: {
    flexDirection: 'row',
    marginHorizontal: 24,
    padding: 5,
    borderRadius: 30,
    marginBottom: 24,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
  },
  jobsList: {
    paddingHorizontal: 24,
  },
  jobCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  infoColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  salaryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  salarySubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 15,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  labelColor: '#94A3B8',
  tabsBg: '#131A2E',
  dividerColor: 'rgba(255, 255, 255, 0.06)',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#1E293B', // Modern Slate-800 dark gray card background
  cardBorder: '#334155', // Slate-700 border for sharp premium contrast
  activeTabBg: '#1E293B',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#475569',
  tabsBg: '#EFF2F6',
  dividerColor: '#E2E8F0',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  activeTabBg: '#FFFFFF',
};

