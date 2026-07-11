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
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { viewProfileService } from '../services/viewProfile';
import { apiRequest } from '../services/api';
import { pick, errorCodes, isErrorWithCode } from '@react-native-documents/picker';

interface PersonalInfoProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

export default function PersonalInfo({ onBackPress, isDarkTheme = true }: PersonalInfoProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [position, setPosition] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);

  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const positions = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Other'];

  const fetchProfile = async () => {
    try {
      const data = await viewProfileService.getProfile();
      if (data && data.success && data.profile) {
        const userObj = data.profile.userId;
        if (userObj) {
          setName(`${userObj.firstName || ''} ${userObj.lastName || ''}`.trim());
          setPhone(userObj.phone || '');
          setEmail(userObj.email || '');
        }
        setGender(data.profile.gender || '');
        setPosition(data.profile.position || '');
        setProfileImage(data.profile.profileImage || '');
      }
    } catch (err: any) {
      console.error('Error fetching personal info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarPick = async () => {
    try {
      const pickResults = await pick({
        type: ['image/jpeg', 'image/png', 'image/jpg'],
      });
      const res = pickResults[0];
      
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? res.uri : res.uri.replace('file://', ''),
        type: res.type || 'image/jpeg',
        name: res.name || 'avatar.jpg',
      } as any);

      // Upload file to server
      const uploadRes = await apiRequest('/upload/file', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes && uploadRes.url) {
        const imageUrl = uploadRes.url;
        
        // Save the image URL in the candidate's profile
        const updateRes = await viewProfileService.updateProfile({ profileImage: imageUrl });
        
        if (updateRes && updateRes.success) {
          setProfileImage(imageUrl);
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          Alert.alert('Error', 'Failed to update profile picture in database.');
        }
      } else {
        Alert.alert('Error', 'Failed to upload image file.');
      }
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        console.log('User cancelled image picker');
      } else {
        Alert.alert('Error', err.message || 'Failed to select and upload image.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }

    try {
      setSaving(true);
      // Split name into first and last
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const data = await viewProfileService.updateProfile({
        firstName,
        lastName,
        phone,
        email,
        gender,
        position,
      });

      if (data && data.success) {
        Alert.alert('Success', 'Personal information updated successfully!');
        onBackPress();
      } else {
        Alert.alert('Error', 'Failed to update personal information.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update personal information.');
    } finally {
      setSaving(false);
    }
  };

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicStyles.backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={dynamicStyles.backgroundColor} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: dynamicStyles.buttonBg, borderColor: dynamicStyles.buttonBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: dynamicStyles.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Personal Information</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Avatar Container */}
              <TouchableOpacity 
                style={styles.avatarContainer} 
                activeOpacity={0.8}
                onPress={handleAvatarPick}
                disabled={uploadingImage}
              >
                <View style={[styles.avatarCircle, { borderColor: dynamicStyles.cardBorder, overflow: 'hidden' }]}>
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                  ) : (
                    /* Profile silhouette / avatar illustration */
                    <Svg width={70} height={70} viewBox="0 0 24 24" fill={isDarkTheme ? '#3B82F6' : '#2563EB'}>
                      <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </Svg>
                  )}
                </View>
                <View style={styles.editBadge}>
                  {/* Pencil icon */}
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#FFFFFF" />
                  </Svg>
                </View>
              </TouchableOpacity>

              {/* Form */}
              <View style={styles.form}>
                {/* Name Input */}
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

                {/* Phone Number Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Phone Number</Text>
                  <View style={styles.phoneInputWrapper}>
                    <TextInput
                      style={[styles.input, styles.phoneInput, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholder="Phone Number"
                      placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                    />
                    <TouchableOpacity style={styles.changeLink} activeOpacity={0.7}>
                      <Text style={styles.changeText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Email</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Email Address"
                    placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                  />
                </View>

                {/* Gender Select Dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Gender</Text>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                    onPress={() => {
                      setShowGenderDropdown(!showGenderDropdown);
                      setShowPositionDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dropdownButtonText, { color: gender ? dynamicStyles.textColor : '#64748B' }]}>
                      {gender || 'Select'}
                    </Text>
                    {/* Down chevron */}
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill={isDarkTheme ? '#64748B' : '#94A3B8'} />
                    </Svg>
                  </TouchableOpacity>

                  {showGenderDropdown && (
                    <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                      {genders.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={[styles.dropdownItem, { borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0' }]}
                          onPress={() => {
                            setGender(item);
                            setShowGenderDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { color: dynamicStyles.textColor }]}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Current Position Dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Current Position</Text>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                    onPress={() => {
                      setShowPositionDropdown(!showPositionDropdown);
                      setShowGenderDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dropdownButtonText, { color: position ? dynamicStyles.textColor : '#64748B' }]}>
                      {position || 'Select'}
                    </Text>
                    {/* Down chevron */}
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill={isDarkTheme ? '#64748B' : '#94A3B8'} />
                    </Svg>
                  </TouchableOpacity>

                  {showPositionDropdown && (
                    <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                      {positions.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={[styles.dropdownItem, { borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0' }]}
                          onPress={() => {
                            setPosition(item);
                            setShowPositionDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { color: dynamicStyles.textColor }]}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Update Button */}
              <TouchableOpacity 
                style={[styles.updateButton, saving && { opacity: 0.7 }]} 
                activeOpacity={0.8} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.updateButtonText}>Update</Text>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#2563EB',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  form: {
    marginBottom: 24,
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
  phoneInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  phoneInput: {
    paddingRight: 80,
  },
  changeLink: {
    position: 'absolute',
    right: 16,
  },
  changeText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
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
  dropdownButtonText: {
    fontSize: 15,
  },
  dropdownMenu: {
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 15,
  },
  updateButton: {
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
    marginTop: 10,
  },
  updateButtonText: {
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
  cardBorder: 'rgba(255, 255, 255, 0.08)',
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
  cardBorder: '#E2E8F0',
  dropdownBg: '#FFFFFF',
};
