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
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface LocationProps {
  onFinish?: (location: string) => void;
  onBackPress?: () => void;
}

export default function Location({ onFinish, onBackPress }: LocationProps) {
  // Mode state: 'prompt' = What is Your Location, 'search' = Enter Your Location
  const [mode, setMode] = useState<'prompt' | 'search'>('prompt');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Sample locations search results
  const sampleResults = [
    { title: 'Golden Avenue', subtitle: '8502 Preston Rd. Inglewood, Maine' },
    { title: 'Golden Gate Bridge', subtitle: 'San Francisco, California' },
    { title: 'Golden Square', subtitle: 'Soho, London, United Kingdom' },
  ];

  const filteredResults = searchQuery.trim()
    ? sampleResults.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectLocation = (locationName: string) => {
    if (onFinish) {
      onFinish(locationName);
    }
  };

  const handleAllowAccess = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://ip-api.com/json');
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Response is not valid JSON');
      }

      if (data && data.status === 'success' && data.city && data.regionName) {
        const locString = `${data.city}, ${data.regionName}`;
        console.log('Automatically detected location:', locString);
        handleSelectLocation(locString);
      } else {
        handleSelectLocation('Mumbai, Maharashtra');
      }
    } catch (error) {
      console.error('Failed to get automatic location:', error);
      handleSelectLocation('Mumbai, Maharashtra'); // Default fallback
    } finally {
      setLoading(false);
    }
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

        {mode === 'prompt' ? (
          <View style={styles.promptContainer}>
            {/* Header Row */}
            <View style={styles.header}>
              {onBackPress && (
                <TouchableOpacity onPress={onBackPress} style={styles.backButton} activeOpacity={0.7}>
                  <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.centeredContent}>
              {/* Location Pin Icon Container */}
              <View style={styles.pinCircle}>
                <Svg width={64} height={64} viewBox="0 0 24 24" fill="#2563EB">
                  <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </Svg>
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.title}>What is Your Location?</Text>
              <Text style={styles.subtitle}>To Find Nearby Job Availability.</Text>

              {/* Buttons */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && { opacity: 0.8 }]}
                onPress={handleAllowAccess}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Allow Location Access</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textLinkButton}
                onPress={() => setMode('search')}
                activeOpacity={0.7}
              >
                <Text style={styles.textLinkText}>Enter Location Manually</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.searchContainer}>
            {/* Header Row */}
            <View style={styles.searchHeader}>
              <TouchableOpacity onPress={() => setMode('prompt')} style={styles.backButton} activeOpacity={0.7}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.searchTitle}>Enter Your Location</Text>
              <View style={{ width: 44 }} /> {/* Balance back button spacer */}
            </View>

            {/* Search Input Bar */}
            <View style={styles.searchBarContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter Location (e.g. Pune, India)"
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (searchQuery.trim()) {
                    handleSelectLocation(searchQuery.trim());
                  }
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Text style={styles.clearIcon}>❌</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Use Current Location Action */}
            <TouchableOpacity
              style={styles.currentLocationRow}
              onPress={handleAllowAccess}
              activeOpacity={0.7}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="#2563EB">
                <Path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1c0-.55-.45-1-1-1s-1 .45-1 1v2.06C6.83 3.52 3.52 6.83 3.06 11H1c-.55 0-1 .45-1 1s.45 1 1 1h2.06c.46 4.17 3.77 7.48 7.94 7.94V23c0 .55.45 1 1 1s1-.45 1-1v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23c.55 0 1-.45 1-1s-.45-1-1-1h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
              </Svg>
              <Text style={styles.currentLocationText}>Use my current location</Text>
            </TouchableOpacity>

            {/* Divider line */}
            <View style={styles.divider} />

            {/* Results Title */}
            {searchQuery.trim() !== '' && (
              <Text style={styles.resultsHeader}>SEARCH RESULT</Text>
            )}

            {/* Results Scroll List */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {searchQuery.trim() !== '' && (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(searchQuery.trim())}
                  activeOpacity={0.7}
                >
                  <View style={[styles.resultIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#2563EB">
                      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </Svg>
                  </View>
                  <View style={styles.resultTextContainer}>
                    <Text style={[styles.resultTitle, { color: '#2563EB', fontWeight: 'bold' }]}>Use "{searchQuery.trim()}"</Text>
                    <Text style={styles.resultSubtitle}>Select this typed location</Text>
                  </View>
                </TouchableOpacity>
              )}
              {filteredResults.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(item.title)}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultIconContainer}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#94A3B8">
                      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </Svg>
                  </View>
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
  promptContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    height: 60,
    justifyContent: 'center',
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
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  pinCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 48,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textLinkButton: {
    paddingVertical: 8,
  },
  textLinkText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#131A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  clearIcon: {
    fontSize: 14,
    marginLeft: 10,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  currentLocationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  resultsHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  resultIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
});
