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
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { viewProfileService } from '../services/viewProfile';

interface CertificatesProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

// Trash Icon
const TrashIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444" />
  </Svg>
);

// Chevron Icon
const ChevronIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill={color} />
  </Svg>
);

export default function Certificates({ onBackPress, isDarkTheme = true }: CertificatesProps) {
  const [name, setName] = useState('Figma Advance');
  const [organization, setOrganization] = useState('AestheticCraft Academy');
  const [issueDate, setIssueDate] = useState('Dec 2020');
  const [expiryDate, setExpiryDate] = useState('Select');
  const [noExpiry, setNoExpiry] = useState(false);
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [credentialUrl2, setCredentialUrl2] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showIssueDropdown, setShowIssueDropdown] = useState(false);
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false);

  const months = ['Dec 2020', 'Jan 2021', 'Feb 2021', 'Mar 2021', 'Select'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await viewProfileService.getProfile();
        if (data && data.success && data.profile && data.profile.certifications && data.profile.certifications.length > 0) {
          const cert = data.profile.certifications[0];
          setName(cert.name || '');
          setOrganization(cert.organization || '');
          setIssueDate(cert.issueDate || 'Select');
          setExpiryDate(cert.expiryDate || 'Select');
          setNoExpiry(!!cert.noExpiry);
          setCredentialId(cert.credentialId || '');
          setCredentialUrl(cert.credentialUrl || '');
          setCredentialUrl2(cert.credentialUrl2 || '');
        }
      } catch (err: any) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!name || !organization) {
      Alert.alert('Error', 'Name and Organization are required.');
      return;
    }
    try {
      setSaving(true);
      const updatedCert = {
        name,
        organization,
        issueDate,
        expiryDate: noExpiry ? 'N/A' : expiryDate,
        noExpiry,
        credentialId,
        credentialUrl,
        credentialUrl2,
      };
      const data = await viewProfileService.updateProfile({ certifications: [updatedCert] });
      if (data && data.success) {
        Alert.alert('Success', 'Certificate updated successfully!');
        onBackPress();
      } else {
        Alert.alert('Error', 'Failed to update certificate.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update certificate.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this certificate entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const data = await viewProfileService.updateProfile({ certifications: [] });
              if (data && data.success) {
                Alert.alert('Deleted', 'Certificate entry removed.');
                onBackPress();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete certificate.');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Certification and Licenses</Text>
          <TouchableOpacity 
            style={[styles.deleteButton, { borderColor: dynamicStyles.buttonBorder }]} 
            activeOpacity={0.7}
            onPress={handleDelete}
          >
            <TrashIcon />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Name"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Organization */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Organization</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={organization}
                  onChangeText={setOrganization}
                  placeholder="Organization"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Dates Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Issue date</Text>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                    onPress={() => setShowIssueDropdown(!showIssueDropdown)}
                  >
                    <Text style={{ color: dynamicStyles.textColor }}>{issueDate}</Text>
                    <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                  </TouchableOpacity>
                  {showIssueDropdown && (
                    <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                      {months.map((m) => (
                        <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setIssueDate(m); setShowIssueDropdown(false); }}>
                          <Text style={{ color: dynamicStyles.textColor }}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Expiration Date</Text>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                    onPress={() => !noExpiry && setShowExpiryDropdown(!showExpiryDropdown)}
                    disabled={noExpiry}
                  >
                    <Text style={{ color: noExpiry ? '#64748B' : dynamicStyles.textColor }}>{noExpiry ? 'N/A' : expiryDate}</Text>
                    <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                  </TouchableOpacity>
                  {showExpiryDropdown && !noExpiry && (
                    <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                      {months.map((m) => (
                        <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setExpiryDate(m); setShowExpiryDropdown(false); }}>
                          <Text style={{ color: dynamicStyles.textColor }}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* No Expiry Toggle */}
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: dynamicStyles.textColor }]}>No Expiry</Text>
                <Switch
                  value={noExpiry}
                  onValueChange={setNoExpiry}
                  trackColor={{ false: '#767577', true: '#2563EB' }}
                  thumbColor={noExpiry ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>

              {/* Credential ID (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Credential ID (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={credentialId}
                  onChangeText={setCredentialId}
                  placeholder="Enter ID"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Credential URL (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Credential URL (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={credentialUrl}
                  onChangeText={setCredentialUrl}
                  placeholder="Enter URL"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Credential URL 2 (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Credential URL (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={credentialUrl2}
                  onChangeText={setCredentialUrl2}
                  placeholder="Enter URL"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={[styles.saveButton, saving && { opacity: 0.7 }]} 
                activeOpacity={0.8} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  deleteButton: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  dropdownMenu: {
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  labelColor: '#94A3B8',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
  inputBg: '#131A2E',
  inputBorder: 'rgba(255, 255, 255, 0.05)',
  dropdownBg: '#131A2E',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  labelColor: '#64748B',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  dropdownBg: '#FFFFFF',
};
