import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FadeInView from '../components/FadeInView';

interface FilterProps {
  onBackPress?: () => void;
  onApply?: (filters: any) => void;
  isDarkTheme?: boolean;
}

// Chevron Down Icon
const ChevronDown = ({ color = '#64748B' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M7 10l5 5 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Checkbox Icon
const CheckboxIcon = ({ checked }: { checked: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    {checked ? (
      <Path
        d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        fill="#2563EB"
      />
    ) : (
      <Path
        d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
        fill="#94A3B8"
      />
    )}
  </Svg>
);

export default function Filter({ onBackPress, onApply, isDarkTheme = true }: FilterProps) {
  const [location, setLocation] = useState('New York, USA');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [minSalary, setMinSalary] = useState(30);
  const [maxSalary, setMaxSalary] = useState(70);
  const [workingModel, setWorkingModel] = useState<'all' | 'onsite' | 'hybrid' | 'remote'>('all');
  const [jobType, setJobType] = useState<'all' | 'fulltime' | 'parttime' | 'contract'>('fulltime');
  const [experienceLevels, setExperienceLevels] = useState<string[]>(['internship', 'entry']);
  const [jobTitles, setJobTitles] = useState<string[]>(['accountant']);

  const locations = ['New York, USA', 'San Francisco, USA', 'Chicago, USA', 'London, UK', 'Remote'];
  const salaryScale = [20, 30, 40, 50, 60, 70, 80];

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const getPercent = (val: number) => {
    return ((val - 20) / 60) * 100;
  };

  const handleScaleTap = (value: number) => {
    const distToMin = Math.abs(value - minSalary);
    const distToMax = Math.abs(value - maxSalary);
    if (distToMin < distToMax) {
      if (value < maxSalary) {
        setMinSalary(value);
      }
    } else {
      if (value > minSalary) {
        setMaxSalary(value);
      }
    }
  };

  const toggleExperience = (level: string) => {
    if (experienceLevels.includes(level)) {
      setExperienceLevels(experienceLevels.filter(x => x !== level));
    } else {
      setExperienceLevels([...experienceLevels, level]);
    }
  };

  const toggleJobTitle = (title: string) => {
    if (jobTitles.includes(title)) {
      setJobTitles(jobTitles.filter(x => x !== title));
    } else {
      setJobTitles([...jobTitles, title]);
    }
  };

  const handleReset = () => {
    setLocation('New York, USA');
    setShowLocationDropdown(false);
    setMinSalary(30);
    setMaxSalary(70);
    setWorkingModel('all');
    setJobType('fulltime');
    setExperienceLevels(['internship', 'entry']);
    setJobTitles(['accountant']);
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
        <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Filter</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Location Dropdown Selector */}
        <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>Location</Text>
        <TouchableOpacity
          style={[styles.dropdownSelector, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
          onPress={() => setShowLocationDropdown(!showLocationDropdown)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownValue, { color: dynamicStyles.textColor }]}>{location}</Text>
          <ChevronDown color={dynamicStyles.labelColor} />
        </TouchableOpacity>

        {showLocationDropdown && (
          <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}>
            {locations.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[styles.dropdownItem, { borderBottomColor: dynamicStyles.dividerColor }]}
                onPress={() => {
                  setLocation(loc);
                  setShowLocationDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: dynamicStyles.textColor, fontWeight: location === loc ? 'bold' : 'normal' }]}>
                  {loc}
                </Text>
                {location === loc && <Text style={{ color: '#2563EB', fontWeight: 'bold' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Salary Double-Thumb Range Slider Mockup */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor, marginBottom: 0 }]}>Salary Range</Text>
          <Text style={{ color: '#2563EB', fontWeight: 'bold', fontSize: 14 }}>
            ${minSalary}k - ${maxSalary}k
          </Text>
        </View>
        <View style={styles.sliderContainer}>
          <View style={[styles.sliderTrack, { backgroundColor: dynamicStyles.sliderTrackBg }]}>
            {/* Active filled range */}
            <View
              style={[
                styles.sliderActiveTrack,
                {
                  left: `${getPercent(minSalary)}%`,
                  width: `${getPercent(maxSalary) - getPercent(minSalary)}%`,
                },
              ]}
            />
          </View>
          {/* Slider Thumbs */}
          <View style={[styles.sliderThumb, { left: `${getPercent(minSalary)}%` }]} />
          <View style={[styles.sliderThumb, { left: `${getPercent(maxSalary)}%` }]} />

          {/* Slider scale labels */}
          <View style={styles.scaleLabelsRow}>
            {salaryScale.map((val) => {
              const isSelected = val === minSalary || val === maxSalary;
              const inRange = val > minSalary && val < maxSalary;
              return (
                <TouchableOpacity
                  key={val}
                  onPress={() => handleScaleTap(val)}
                  style={{ padding: 4 }}
                >
                  <Text
                    style={[
                      styles.scaleText,
                      {
                        color: isSelected
                          ? '#2563EB'
                          : inRange
                          ? dynamicStyles.textColor
                          : dynamicStyles.labelColor,
                        fontWeight: isSelected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    ${val}k
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Working Model pills */}
        <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor, marginTop: 24 }]}>Working Model</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {[
            { id: 'all', label: 'All' },
            { id: 'onsite', label: 'On-Site' },
            { id: 'hybrid', label: 'Hybrid' },
            { id: 'remote', label: 'Remote' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.pillButton,
                workingModel === item.id ? styles.activePill : { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder },
              ]}
              onPress={() => setWorkingModel(item.id as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, workingModel === item.id ? styles.activePillText : { color: dynamicStyles.labelColor }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Job Type pills */}
        <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor, marginTop: 24 }]}>Job Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {[
            { id: 'all', label: 'All' },
            { id: 'fulltime', label: 'Full-Time' },
            { id: 'parttime', label: 'Part-Time' },
            { id: 'contract', label: 'Contract' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.pillButton,
                jobType === item.id ? styles.activePill : { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder },
              ]}
              onPress={() => setJobType(item.id as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, jobType === item.id ? styles.activePillText : { color: dynamicStyles.labelColor }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Experience Level pills */}
        <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor, marginTop: 24 }]}>Level of Experience</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {[
            { id: 'all', label: 'All' },
            { id: 'internship', label: 'Internship' },
            { id: 'entry', label: 'Entry level' },
            { id: 'associate', label: 'Associate' },
          ].map((item) => {
            const isActive = experienceLevels.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.pillButton,
                  isActive ? styles.activePill : { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder },
                ]}
                onPress={() => toggleExperience(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, isActive ? styles.activePillText : { color: dynamicStyles.labelColor }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Job Title Checkboxes list */}
        <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor, marginTop: 24, marginBottom: 12 }]}>Job Title</Text>
        <View style={styles.checkboxList}>
          {[
            { id: 'accountant', label: 'Accountant' },
            { id: 'bdm', label: 'Business Development Manager' },
            { id: 'writer', label: 'Content Writer' },
          ].map((item) => {
            const isChecked = jobTitles.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.checkboxRow}
                onPress={() => toggleJobTitle(item.id)}
                activeOpacity={0.8}
              >
                <CheckboxIcon checked={isChecked} />
                <Text style={[styles.checkboxLabel, { color: isChecked ? dynamicStyles.textColor : dynamicStyles.labelColor }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom buttons */}
      <View style={[styles.bottomBar, { borderTopColor: dynamicStyles.dividerColor, backgroundColor: dynamicStyles.backgroundColor }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton, { backgroundColor: dynamicStyles.resetButtonBg }]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={[styles.resetButtonText, { color: dynamicStyles.resetButtonText }]}>Reset Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.applyButton]}
          onPress={() => onApply && onApply({ location, minSalary, maxSalary, workingModel, jobType, experienceLevels, jobTitles })}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dropdownSelector: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dropdownValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  sliderContainer: {
    paddingVertical: 12,
    position: 'relative',
    justifyContent: 'center',
    height: 70,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  sliderActiveTrack: {
    height: 6,
    backgroundColor: '#2563EB',
    position: 'absolute',
  },
  sliderThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ translateX: -11 }],
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scaleLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  scaleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  pillButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  activePill: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkboxList: {
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    marginRight: 12,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#2563EB',
    marginLeft: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dropdownMenu: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 15,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  labelColor: '#94A3B8',
  dividerColor: 'rgba(255, 255, 255, 0.05)',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  sliderTrackBg: '#1E293B',
  resetButtonBg: '#1E293B',
  resetButtonText: '#3B82F6',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  dividerColor: '#F1F5F9',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  sliderTrackBg: '#E2E8F0',
  resetButtonBg: '#F1F5F9',
  resetButtonText: '#2563EB',
};
