import React from 'react';
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
import FadeInView from '../components/FadeInView';

interface PrivacyPolicyProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

export default function PrivacyPolicy({ onBackPress, isDarkTheme = false }: PrivacyPolicyProps) {
  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us when creating an account, building your profile, applying for jobs, or communicating with us. This includes your name, email address, phone number, work experience, education history, skills, and any resume documents you upload.',
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the collected information to power the core job search and matchmaking services of ITJobx. Specifically, we use it to show you relevant job listings, share your application profiles with prospective employers (when you apply), send you application status updates, and improve overall app functionality.',
    },
    {
      title: '3. Data Sharing & Disclosure',
      content: 'We do not sell or rent your personal data to third parties. We share your profile data only with employers whose jobs you actively apply to. We may also share anonymous, aggregated analytical details with service providers to monitor and optimize system performance.',
    },
    {
      title: '4. Data Security',
      content: 'We implement industry-standard administrative, technical, and physical security measures designed to protect your personal information from unauthorized access, loss, alteration, or disclosure. However, no electronic transmission or storage method is 100% secure, so we cannot guarantee absolute security.',
    },
    {
      title: '5. Your Rights and Choices',
      content: 'You have the right to access, edit, update, or delete your personal profile information at any time directly through the profile settings. You can also withdraw your consent to receive promotional notifications in the notification settings page.',
    },
    {
      title: '6. Policy Updates',
      content: 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. We will notify you of any significant changes by posting the updated policy inside the app with a revised "Last Updated" date.',
    },
    {
      title: '7. Contact Us',
      content: 'If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please feel free to reach out to us at privacy@itjobx.com or contact our help center support team.',
    },
  ];

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
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Privacy Policy</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Scrollable Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.lastUpdated, { color: dynamicStyles.labelColor }]}>Last updated: July 10, 2026</Text>
          
          <Text style={[styles.introText, { color: dynamicStyles.textColor }]}>
            Welcome to ITJobx. We are committed to protecting your personal data and your privacy. This Privacy Policy details how we handle, protect, and process the information you share with us on our platform.
          </Text>

          {sections.map((section, index) => (
            <View key={index} style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.textColor }]}>{section.title}</Text>
              <Text style={[styles.sectionBody, { color: dynamicStyles.labelColor }]}>{section.content}</Text>
            </View>
          ))}
          
          <View style={{ height: 60 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: Platform.OS === 'ios' ? 24 : 36,
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
  lastUpdated: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  labelColor: '#94A3B8',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#475569',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
};
