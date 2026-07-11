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

interface ProjectsProps {
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

export default function Projects({ onBackPress, isDarkTheme = true }: ProjectsProps) {
  const [projectName, setProjectName] = useState('E-Commerce App');
  const [role, setRole] = useState('UI Designer');
  const [fromMonth, setFromMonth] = useState('Dec 2020');
  const [toMonth, setToMonth] = useState('Select');
  const [workingOnProject, setWorkingOnProject] = useState(false);
  const [contributors, setContributors] = useState('Select');
  const [associatedWith, setAssociatedWith] = useState('Select');
  const [liveUrl, setLiveUrl] = useState('Select');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showContributorsDropdown, setShowContributorsDropdown] = useState(false);
  const [showAssociatedDropdown, setShowAssociatedDropdown] = useState(false);
  const [showUrlDropdown, setShowUrlDropdown] = useState(false);

  const months = ['Dec 2020', 'Jan 2021', 'Feb 2021', 'Mar 2021', 'Select'];
  const contributorsList = ['Only Me', '2 members', '3 members', 'Select'];
  const associatedList = ['BrioSoft solutions', 'Imaginaria University', 'Select'];
  const urlList = ['https://example.com/project', 'https://github.com/project', 'Select'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await viewProfileService.getProfile();
        if (data && data.success && data.profile && data.profile.projects && data.profile.projects.length > 0) {
          const proj = data.profile.projects[0];
          setProjectName(proj.title || '');
          if (proj.description && proj.description.includes(' | ')) {
            const parts = proj.description.split(' | ');
            setRole(parts[0]);
            setDescription(parts.slice(1).join(' | '));
          } else {
            setDescription(proj.description || '');
          }
          setLiveUrl(proj.link || 'Select');
        }
      } catch (err: any) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!projectName) {
      Alert.alert('Error', 'Project Name is required.');
      return;
    }
    try {
      setSaving(true);
      const updatedProj = {
        title: projectName,
        description: role ? `${role} | ${description}` : description,
        link: liveUrl !== 'Select' ? liveUrl : '',
      };
      const data = await viewProfileService.updateProfile({ projects: [updatedProj] });
      if (data && data.success) {
        Alert.alert('Success', 'Project updated successfully!');
        onBackPress();
      } else {
        Alert.alert('Error', 'Failed to update project.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this project entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const data = await viewProfileService.updateProfile({ projects: [] });
              if (data && data.success) {
                Alert.alert('Deleted', 'Project entry removed.');
                onBackPress();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete project.');
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
          <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Projects</Text>
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
              {/* Project Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Project Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={projectName}
                  onChangeText={setProjectName}
                  placeholder="Project Name"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Role */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Role</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={role}
                  onChangeText={setRole}
                  placeholder="Role"
                  placeholderTextColor={isDarkTheme ? '#64748B' : '#94A3B8'}
                />
              </View>

              {/* Dates Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>From</Text>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                    onPress={() => setShowFromDropdown(!showFromDropdown)}
                  >
                    <Text style={{ color: dynamicStyles.textColor }}>{fromMonth}</Text>
                    <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                  </TouchableOpacity>
                  {showFromDropdown && (
                    <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                      {months.map((m) => (
                        <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setFromMonth(m); setShowFromDropdown(false); }}>
                          <Text style={{ color: dynamicStyles.textColor }}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>To</Text>
                  <TouchableOpacity
                    style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                    onPress={() => setShowToDropdown(!showToDropdown)}
                  >
                    <Text style={{ color: dynamicStyles.textColor }}>{toMonth}</Text>
                    <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                  </TouchableOpacity>
                  {showToDropdown && (
                    <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                      {months.map((m) => (
                        <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setToMonth(m); setShowToDropdown(false); }}>
                          <Text style={{ color: dynamicStyles.textColor }}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Working on this project toggle */}
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: dynamicStyles.textColor }]}>Working on this project</Text>
                <Switch
                  value={workingOnProject}
                  onValueChange={setWorkingOnProject}
                  trackColor={{ false: '#767577', true: '#2563EB' }}
                  thumbColor={workingOnProject ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>

              {/* Contributors */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Contributors</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                  onPress={() => setShowContributorsDropdown(!showContributorsDropdown)}
                >
                  <Text style={{ color: dynamicStyles.textColor }}>{contributors}</Text>
                  <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
                {showContributorsDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                    {contributorsList.map((c) => (
                      <TouchableOpacity key={c} style={styles.dropdownItem} onPress={() => { setContributors(c); setShowContributorsDropdown(false); }}>
                        <Text style={{ color: dynamicStyles.textColor }}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Associated With */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Associated with</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                  onPress={() => setShowAssociatedDropdown(!showAssociatedDropdown)}
                >
                  <Text style={{ color: dynamicStyles.textColor }}>{associatedWith}</Text>
                  <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
                {showAssociatedDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                    {associatedList.map((a) => (
                      <TouchableOpacity key={a} style={styles.dropdownItem} onPress={() => { setAssociatedWith(a); setShowAssociatedDropdown(false); }}>
                        <Text style={{ color: dynamicStyles.textColor }}>{a}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Live Project URL (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Live Project URL (Optional)</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: dynamicStyles.inputBg, borderColor: dynamicStyles.inputBorder }]}
                  onPress={() => setShowUrlDropdown(!showUrlDropdown)}
                >
                  <Text style={{ color: dynamicStyles.textColor }}>{liveUrl}</Text>
                  <ChevronIcon color={isDarkTheme ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
                {showUrlDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: dynamicStyles.dropdownBg, borderColor: dynamicStyles.inputBorder }]}>
                    {urlList.map((u) => (
                      <TouchableOpacity key={u} style={styles.dropdownItem} onPress={() => { setLiveUrl(u); setShowUrlDropdown(false); }}>
                        <Text style={{ color: dynamicStyles.textColor }}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Description (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: dynamicStyles.labelColor }]}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: dynamicStyles.inputBg, color: dynamicStyles.textColor, borderColor: dynamicStyles.inputBorder }]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholder="Enter Description"
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
  textArea: {
    height: 100,
    paddingVertical: 14,
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
