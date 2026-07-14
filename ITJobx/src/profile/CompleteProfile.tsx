// CompleteProfile Screen
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface CompleteProfileProps {
  onFinish?: (profileData: any) => void;
  onBackPress?: () => void;
}

export default function CompleteProfile({ onFinish, onBackPress }: CompleteProfileProps) {
  // Step state: 0 = Profile Info, 1 = Job Type, 2 = Experience, 3 = Work Model, 4 = Job Title
  const [step, setStep] = useState(0);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // Preferences State
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [selectedWorkModels, setSelectedWorkModels] = useState<string[]>([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);

  // Constants for choices
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
  const experienceLevels = ['Internship', 'Entry level', 'Associate', 'Mid-Senior level', 'Director', 'Executive'];
  const workModels = ['On-site', 'Hybrid', 'Remote'];
  const jobTitles = [
    'Accountant',
    'Business Development Manager',
    'Content Writer',
    'Data Analyst',
    'Finance Manager',
    'Graphic Designer',
    'HR Specialist',
    'Human Resources Manager',
  ];

  // Navigation handlers
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else if (onBackPress) {
      onBackPress();
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const profileData = {
        name,
        phone,
        gender,
        selectedJobTypes,
        selectedExperience,
        selectedWorkModels,
        selectedJobTitles,
      };
      if (onFinish) {
        onFinish(profileData);
      }
    }
  };

  // Toggle selection for arrays
  const toggleSelection = (item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (state.includes(item)) {
      setState(state.filter((i) => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  // Step renders
  const renderProfileInfo = () => (
    <View style={styles.form}>
      {/* Avatar Container */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          {/* Default User SVG Icon */}
          <Svg width={60} height={60} viewBox="0 0 24 24" fill="#4B5563">
            <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </Svg>
        </View>
        <TouchableOpacity style={styles.editBadge} activeOpacity={0.8}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Name Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex. John Doe"
          placeholderTextColor="#64748B"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Phone Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneInputContainer}>
          <TouchableOpacity style={styles.countryCode} activeOpacity={0.7}>
            <Text style={styles.countryCodeText}>+1</Text>
            <Text style={styles.dropdownArrow}>⏷</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter Phone Number"
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>

      {/* Gender Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowGenderDropdown(!showGenderDropdown)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownButtonText, !gender && { color: '#64748B' }]}>
            {gender || 'Select'}
          </Text>
          <Text style={styles.dropdownArrow}>⏷</Text>
        </TouchableOpacity>

        {showGenderDropdown && (
          <View style={styles.dropdownMenu}>
            {['Male', 'Female', 'Other', 'Prefer not to say'].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setGender(item);
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderJobTypes = () => (
    <View style={styles.selectionList}>
      {jobTypes.map((item) => {
        const isSelected = selectedJobTypes.includes(item);
        return (
          <TouchableOpacity
            key={item}
            style={[styles.listItem, isSelected && styles.listItemActive]}
            onPress={() => toggleSelection(item, selectedJobTypes, setSelectedJobTypes)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.listItemText, isSelected && styles.listItemTextActive]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderExperience = () => (
    <View style={styles.selectionList}>
      {experienceLevels.map((item) => {
        const isSelected = selectedExperience === item;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.listItem, isSelected && styles.listItemActive]}
            onPress={() => setSelectedExperience(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.listItemText, isSelected && styles.listItemTextActive]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderWorkModels = () => (
    <View style={styles.selectionList}>
      {workModels.map((item) => {
        const isSelected = selectedWorkModels.includes(item);
        return (
          <TouchableOpacity
            key={item}
            style={[styles.listItem, isSelected && styles.listItemActive]}
            onPress={() => toggleSelection(item, selectedWorkModels, setSelectedWorkModels)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.listItemText, isSelected && styles.listItemTextActive]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderJobTitles = () => (
    <View style={styles.selectionList}>
      {jobTitles.map((item) => {
        const isSelected = selectedJobTitles.includes(item);
        return (
          <TouchableOpacity
            key={item}
            style={[styles.listItem, isSelected && styles.listItemActive]}
            onPress={() => toggleSelection(item, selectedJobTitles, setSelectedJobTitles)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.listItemText, isSelected && styles.listItemTextActive]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Titles mapping
  const getTitles = () => {
    switch (step) {
      case 0:
        return {
          title: 'Complete Your Profile',
          subtitle: "Don't worry, only you can see your personal data. No one else will be able to see it.",
        };
      case 1:
        return {
          title: 'What Type of Job Are You Interested In?',
          subtitle: '',
        };
      case 2:
        return {
          title: 'What is Your Level of Experience?',
          subtitle: '',
        };
      case 3:
        return {
          title: 'Preferred Working Model: Your Ideal Work Structure?',
          subtitle: '',
        };
      case 4:
        return {
          title: 'What Job Title Are You Seeking?',
          subtitle: '',
        };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const { title, subtitle } = getTitles();

  const isNextDisabled = () => {
    if (step === 0) return !name.trim() || !phone.trim() || !gender;
    if (step === 1) return selectedJobTypes.length === 0;
    if (step === 2) return !selectedExperience;
    if (step === 3) return selectedWorkModels.length === 0;
    if (step === 4) return selectedJobTitles.length === 0;
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Glow Background */}
        <View style={styles.backgroundContainer}>
          <View style={[styles.glowCircle, { width: 300, height: 300, backgroundColor: 'rgba(59, 130, 246, 0.1)', top: -50, left: -50 }]} />
          <View style={[styles.glowCircle, { width: 250, height: 250, backgroundColor: 'rgba(34, 197, 94, 0.05)', bottom: 50, right: -50 }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            {/* Progress Bar (Only for steps 1-4) */}
            {step > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{step}/4</Text>
              </View>
            )}
          </View>

          {/* Heading */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle !== '' && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {/* Step content */}
          {step === 0 && renderProfileInfo()}
          {step === 1 && renderJobTypes()}
          {step === 2 && renderExperience()}
          {step === 3 && renderWorkModels()}
          {step === 4 && renderJobTitles()}

          {/* Button container */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.nextButton, isNextDisabled() && styles.disabledButton]}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={isNextDisabled()}
            >
              <Text style={styles.nextButtonText}>
                {step === 0 ? 'Complete Profile' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: -1,
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#131A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#131A2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB', // Blue fill matching register/login theme
    borderRadius: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  titleContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  form: {
    marginTop: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: width * 0.5 - 65 - 8,
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0B0F19',
  },
  editIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: '#131A2E',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 56,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    marginRight: 10,
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownArrow: {
    color: '#94A3B8',
    marginLeft: 6,
    fontSize: 12,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#131A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#131A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  dropdownMenu: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  selectionList: {
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#131A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listItemActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listItemText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  listItemTextActive: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
  nextButton: {
    height: 54,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
