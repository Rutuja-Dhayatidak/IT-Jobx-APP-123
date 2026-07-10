import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';

interface NotificationSettingsProps {
  onBackPress: () => void;
  isDarkTheme?: boolean;
}

export default function NotificationSettings({ onBackPress, isDarkTheme = true }: NotificationSettingsProps) {
  const [general, setGeneral] = useState(true);
  const [jobAvailable, setJobAvailable] = useState(true);
  const [jobInvitation, setJobInvitation] = useState(false);
  const [appUpdates, setAppUpdates] = useState(false);
  const [jobStatus, setJobStatus] = useState(false);

  const dynamicStyles = isDarkTheme ? darkStyles : lightStyles;

  const settingsList = [
    { title: 'General Notification', value: general, setter: setGeneral },
    { title: 'Notify when there is Job Available', value: jobAvailable, setter: setJobAvailable },
    { title: 'Notify when there is Job Invitation', value: jobInvitation, setter: setJobInvitation },
    { title: 'App Updates', value: appUpdates, setter: setAppUpdates },
    { title: 'Job Status Update', value: jobStatus, setter: setJobStatus },
  ];

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
        <Text style={[styles.headerTitle, { color: dynamicStyles.textColor }]}>Notification Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {settingsList.map((item, index) => (
          <View
            key={index}
            style={[styles.settingRow, { borderBottomColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}
          >
            <Text style={[styles.settingTitle, { color: dynamicStyles.textColor }]}>
              {item.title}
            </Text>
            <Switch
              value={item.value}
              onValueChange={item.setter}
              trackColor={{ false: '#767577', true: '#2563EB' }} // Blue active track
              thumbColor={item.value ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        ))}
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
});

const darkStyles = {
  backgroundColor: '#0B0F19',
  textColor: '#FFFFFF',
  buttonBg: '#131A2E',
  buttonBorder: 'rgba(255, 255, 255, 0.05)',
};

const lightStyles = {
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  buttonBg: '#FFFFFF',
  buttonBorder: '#E2E8F0',
};
