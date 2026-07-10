import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HelpCenterProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Icons
const SearchIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill={color} />
  </Svg>
);

const ChevronIcon = ({ isExpanded, color }: { isExpanded: boolean; color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
    <Path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill={color} />
  </Svg>
);

const HeadphoneIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" fill={color} />
  </Svg>
);

const WhatsAppIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.817 9.817 0 0 0 12.04 2zm5.83 14.15c-.24.67-1.2 1.23-1.65 1.28-.45.05-.89.24-2.88-.54-2.54-1-4.17-3.58-4.3-3.75-.12-.17-1.04-1.39-1.04-2.65 0-1.26.65-1.88.88-2.14.23-.26.5-.32.67-.32.17 0 .34.01.48.01.15.01.35-.06.55.42.2.49.69 1.68.75 1.8.06.12.1.27.02.43-.08.17-.18.27-.3.41-.12.14-.26.31-.37.42-.12.13-.25.27-.11.51.14.24.63 1.03 1.35 1.67.93.83 1.71 1.08 1.95 1.2.24.12.38.1.52-.06.14-.17.61-.71.77-.96.16-.25.32-.21.55-.12.23.09 1.48.7 1.73.82.25.12.41.18.47.28.06.1.06.57-.18 1.24z" fill={color} />
  </Svg>
);

const GlobeIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.33-.14 2 0 .67.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a8.03 8.03 0 0 1 3.79-3.56A15.65 15.65 0 0 0 7.91 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.26 14h-4.52c-.08-.66-.14-1.33-.14-2 0-.67.06-1.34.14-2h4.52c.08.66.14 1.33.14 2 0 .67-.06 1.34-.14 2zm.82 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zm1.54-5.56c.08-.66.14-1.33.14-2 0-.67-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" fill={color} />
  </Svg>
);

const FacebookIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8.02 9.71v-6.9H7.9v-2.81h2.12V9.88c0-2.09 1.28-3.23 3.12-3.23.88 0 1.8.16 1.8.16v1.97h-1.01c-1.04 0-1.36.64-1.36 1.3v1.56h2.22l-.35 2.81h-1.87v6.9C18.56 20.87 22 16.84 22 12z" fill={color} />
  </Svg>
);

const TwitterIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.54v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.3 1.83c-.35 0-.69-.02-1.03-.06C3.18 20.29 5.7 21 8.39 21c8.86 0 13.7-7.35 13.7-13.7 0-.21 0-.42-.01-.63.95-.68 1.77-1.53 2.38-2.5z" fill={color} />
  </Svg>
);

const InstagramIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" fill={color} />
  </Svg>
);

export default function HelpCenter({ onBackPress, isDarkTheme = true }: HelpCenterProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact_us'>('faq'); // Default to FAQ as shown in second mockup
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    WhatsApp: true,
    'How do I search for jobs on the app?': true, // Expanded by default in the mockup screenshot
  });

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const toggleExpand = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const contactOptions = [
    { title: 'Customer Service', icon: <HeadphoneIcon color="#2563EB" />, info: 'Available 24/7 at support@jobx.com' },
    { title: 'WhatsApp', icon: <WhatsAppIcon color="#2563EB" />, info: '(480) 555-0103' },
    { title: 'Website', icon: <GlobeIcon color="#2563EB" />, info: 'www.itjobx.com' },
    { title: 'Facebook', icon: <FacebookIcon color="#2563EB" />, info: 'facebook.com/itjobx' },
    { title: 'Twitter', icon: <TwitterIcon color="#2563EB" />, info: 'twitter.com/itjobx' },
    { title: 'Instagram', icon: <InstagramIcon color="#2563EB" />, info: 'instagram.com/itjobx' },
  ];

  const faqOptions = [
    {
      title: 'How do I search for jobs on the app?',
      category: 'General',
      info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      title: 'How do I apply for a job through the app?',
      category: 'Services',
      info: 'Tap on the job listing that interests you, review the requirements, and click on the blue "Apply" button at the bottom of the screen.',
    },
    {
      title: 'Can I save my favorite jobs for later?',
      category: 'Services',
      info: 'Yes, you can tap the bookmark icon on any job card to save it. You can access all your saved jobs from your bookmarks page.',
    },
    {
      title: 'I forgot my password. How can I reset it?',
      category: 'Account',
      info: 'On the login screen, click "Forgot Password". Enter your registered email address and follow the instructions sent to reset your password.',
    },
    {
      title: 'Can I track the status of my job applications?',
      category: 'Services',
      info: 'Yes, navigate to My Application section from your profile dashboard to see real-time status updates on all applications.',
    },
    {
      title: 'How can I contact customer support?',
      category: 'General',
      info: 'You can contact customer support by navigating to the "Contact Us" tab here and selecting the method of communication that suits you best.',
    },
    {
      title: 'How to add review?',
      category: 'General',
      info: 'Go to the company profile page, scroll down to the reviews section, and click "Write a Review" to submit your rating and comments.',
    },
  ];

  const categories = ['All', 'Services', 'General', 'Account'];

  // Filtering logic
  const filteredContacts = contactOptions.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFAQs = faqOptions.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Help Center</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: dynamicStyles.searchBg }]}>
          <SearchIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
          <TextInput
            style={[styles.searchInput, { color: dynamicStyles.textColor }]}
            placeholder="Search"
            placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'faq' && styles.activeTabButton]}
          onPress={() => setActiveTab('faq')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'faq' ? styles.activeTabText : { color: dynamicStyles.inactiveTabColor }]}>
            FAQ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'contact_us' && styles.activeTabButton]}
          onPress={() => setActiveTab('contact_us')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'contact_us' ? styles.activeTabText : { color: dynamicStyles.inactiveTabColor }]}>
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      {/* FAQ Category Pills (Only when FAQ tab is active) */}
      {activeTab === 'faq' && (
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? '#2563EB' : (isDarkTheme ? '#131A2E' : '#F1F5F9'),
                      borderColor: isSelected ? '#2563EB' : (isDarkTheme ? 'rgba(255,255,255,0.05)' : '#E2E8F0'),
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: isSelected ? '#FFFFFF' : (isDarkTheme ? '#94A3B8' : '#64748B') },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* List Container */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'contact_us' && (
          filteredContacts.map((item, index) => {
            const isExpanded = !!expandedItems[item.title];
            return (
              <View
                key={index}
                style={[styles.optionCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
              >
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => toggleExpand(item.title)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconWrapper}>
                    {item.icon}
                  </View>
                  <Text style={[styles.optionTitle, { color: dynamicStyles.textColor }]}>
                    {item.title}
                  </Text>
                  <ChevronIcon isExpanded={isExpanded} color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.cardContent, { borderTopColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0' }]}>
                    <View style={styles.infoRow}>
                      <View style={styles.bullet} />
                      <Text style={[styles.infoText, { color: dynamicStyles.infoColor }]}>
                        {item.info}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        {activeTab === 'faq' && (
          filteredFAQs.map((item, index) => {
            const isExpanded = !!expandedItems[item.title];
            return (
              <View
                key={index}
                style={[styles.optionCard, { backgroundColor: dynamicStyles.cardBg, borderColor: dynamicStyles.cardBorder }]}
              >
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => toggleExpand(item.title)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionTitle, { color: dynamicStyles.textColor, flex: 1, paddingLeft: 8 }]}>
                    {item.title}
                  </Text>
                  <ChevronIcon isExpanded={isExpanded} color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.cardContent, { borderTopColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0' }]}>
                    <Text style={[styles.infoText, { color: dynamicStyles.infoColor }]}>
                      {item.info}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
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
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    fontSize: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2563EB',
  },
  categoriesWrapper: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    height: 40,
  },
  categoryPill: {
    paddingHorizontal: 20,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  optionCard: {
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  iconWrapper: {
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  cardContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  searchBg: '#131A2E',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  cardBg: '#131A2E',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  inactiveTabColor: '#64748B',
  infoColor: '#94A3B8',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  searchBg: '#F1F5F9',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  inactiveTabColor: '#94A3B8',
  infoColor: '#64748B',
};
