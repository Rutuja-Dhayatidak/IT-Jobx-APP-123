import React, { useState, useEffect } from 'react';
import { StatusBar, BackHandler, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './src/screen/OnboardingScreen';
import Login from './src/screen/Login';
import Register from './src/screen/Register';
import ForgotPassword from './src/screen/ForgotPassword';
import OTPVerification from './src/screen/OTPVerification';
import ResetPassword from './src/screen/ResetPassword';
import Profile from './src/profile/Profile';
import Location from './src/location/Location';
import Home from './src/screen/Home';
import MyProfile from './src/profile/MyProfile';
import Settings from './src/profile/Settings';
import PersonalInfo from './src/profile/PersonalInfo';
import HelpCenter from './src/profile/HelpCenter';
// Import Languages Screen
import Languages from './src/profile/Languages';
import YourProfile from './src/view Profile/YourProfile';
import PasswordManager from './src/profile/PasswordManager';
import NotificationSettings from './src/profile/NotificationSettings';
import ContactInfo from './src/view Profile/ContactInfo';
import AboutMe from './src/view Profile/AboutMe';
import Experience from './src/view Profile/Experience';
import Education from './src/view Profile/Education';
import Projects from './src/view Profile/Projects';
import Certificates from './src/view Profile/Certificates';
import Volunteer from './src/view Profile/Volunteer';
import Awards from './src/view Profile/Awards';
import Skills from './src/view Profile/Skills';
import Resume from './src/view Profile/Resume';
import MyApplication from './src/profile/MyApplication';
import Notification from './src/screen/Notification';
import FindJob from './src/screen/FindJob';
import Chat from './src/screen/Chat';
import CandidateSupportScreen from './src/screen/chat/CandidateSupportScreen';
import { chatApi } from './src/services/chatApi';
import Filter from './src/screen/Filter';
import JobDetail from './src/screen/JobDetail';
import ApplyJob from './src/screen/ApplyJob';
import Bookmark from './src/screen/Bookmark';
import PrivacyPolicy from './src/profile/PrivacyPolicy';
import BottomNavigation from './src/components/BottomNavigation';
import JobStatus from './src/screen/JobStatus';
import { setToken, apiRequest } from './src/services/api';

type ScreenName =
  | 'onboarding'
  | 'job_status'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'otp_verification'
  | 'reset_password'
  | 'profile'
  | 'location'
  | 'home'
  | 'myprofile'
  | 'settings'
  | 'personal_info'
  | 'help_center'
  | 'your_profile'
  | 'password_manager'
  | 'notification_settings'
  | 'contact_info'
  | 'about_me'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certificates'
  | 'volunteer'
  | 'awards'
  | 'skills'
  | 'resume'
  | 'my_application'
  | 'notification'
  | 'find_job'
  | 'filter'
  | 'job_detail'
  | 'bookmark'
  | 'languages'
  | 'apply_job'
  | 'privacy_policy'
  | 'chat'
  | 'candidate_support';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('onboarding');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>(['onboarding']);
  const [resetEmail, setResetEmail] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [findJobInitialTab, setFindJobInitialTab] = useState<'available' | 'saved' | 'hire'>('available');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [otpType, setOtpType] = useState<'register' | 'forgot_password'>('register');
  const [userLocation, setUserLocation] = useState('New York, USA');
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [supportUnreadCount, setSupportUnreadCount] = useState(0);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Load persistent login session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('authToken');
        const savedUser = await AsyncStorage.getItem('user');
        const savedLocation = await AsyncStorage.getItem('userLocation');
        const savedBookmarks = await AsyncStorage.getItem('savedJobs');
        
        if (savedToken) {
          setAuthToken(savedToken);
          setToken(savedToken);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
          if (savedLocation) {
            setUserLocation(savedLocation);
          }
          setCurrentScreen('home');
          setScreenHistory(['home']);
        }

        if (savedBookmarks) {
          setSavedJobs(JSON.parse(savedBookmarks));
        }
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setIsLoadingSession(false);
      }
    };
    loadSession();
  }, []);

  // Persist savedJobs whenever it changes
  useEffect(() => {
    const saveJobsToStorage = async () => {
      if (!isLoadingSession) {
        try {
          await AsyncStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        } catch (err) {
          console.error('Error saving bookmarked jobs:', err);
        }
      }
    };
    saveJobsToStorage();
  }, [savedJobs, isLoadingSession]);

  useEffect(() => {
    setToken(authToken);
  }, [authToken]);

  const checkUnreadNotifications = async () => {
    try {
      if (authToken) {
        const data = await apiRequest('/notifications/unread-count', { method: 'GET' });
        if (data && data.success) {
          setHasUnreadNotifications(data.count > 0);
        }

        const chatData = await chatApi.getUnreadCount();
        if (chatData && chatData.success) {
          setSupportUnreadCount(chatData.unreadCount);
        }
      }
    } catch (err) {
      console.error('Error checking unread notifications:', err);
    }
  };

  useEffect(() => {
    checkUnreadNotifications();
  }, [authToken, currentScreen]);

  // Navigate to a new screen and add to history stack
  const navigateTo = (screen: ScreenName) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  // Go back to the previous screen from history stack
  const goBack = (): boolean => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // Remove current screen
      const prevScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(prevScreen);
      return true; // Intercepted back press
    }
    return false; // Exit app
  };

  // Handle hardware back button press on Android
  useEffect(() => {
    const backAction = () => {
      return goBack();
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [screenHistory]);

  if (isLoadingSession) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkTheme ? '#0B0F19' : '#F8FAFC' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
      {currentScreen === 'onboarding' && (
        <OnboardingScreen
          onFinish={() => navigateTo('login')}
          onSignInPress={() => navigateTo('login')}
          onSkipPress={() => navigateTo('home')}
        />
      )}
      {currentScreen === 'login' && (
        <Login
          onRegisterPress={() => navigateTo('register')}
          onBackPress={() => goBack()}
          onLoginSuccess={async (token, loggedUser) => {
            try {
              await AsyncStorage.setItem('authToken', token);
              await AsyncStorage.setItem('user', JSON.stringify(loggedUser));
            } catch (err) {
              console.error('Error saving login session:', err);
            }
            setAuthToken(token);
            setUser(loggedUser);
            navigateTo('location');
          }}
          onForgotPasswordPress={() => navigateTo('forgot_password')}
        />
      )}
      {currentScreen === 'register' && (
        <Register
          onLoginPress={() => navigateTo('login')}
          onBackPress={() => goBack()}
          onRegisterSuccess={(email) => {
            setResetEmail(email);
            setOtpType('register');
            navigateTo('otp_verification');
          }}
        />
      )}
      {currentScreen === 'forgot_password' && (
        <ForgotPassword
          onBackPress={() => goBack()}
          onSendPress={(email) => {
            setResetEmail(email);
            setOtpType('forgot_password');
            navigateTo('otp_verification');
          }}
        />
      )}
      {currentScreen === 'otp_verification' && (
        <OTPVerification
          email={resetEmail}
          onBackPress={() => goBack()}
          onVerifyPress={async (token) => {
            if (otpType === 'register') {
              try {
                await AsyncStorage.setItem('authToken', token);
              } catch (err) {
                console.error('Error saving session:', err);
              }
              setAuthToken(token);
              navigateTo('location');
            } else {
              navigateTo('reset_password');
            }
          }}
        />
      )}
      {currentScreen === 'reset_password' && (
        <ResetPassword
          onBackPress={() => goBack()}
          onResetPress={(password) => {
            console.log('Password reset successfully with new password:', password);
            navigateTo('login');
          }}
        />
      )}
      {currentScreen === 'profile' && (
        <Profile
          onFinish={(data) => {
            console.log('Profile setup completed successfully:', data);
            navigateTo('location');
          }}
          onBackPress={() => goBack()}
        />
      )}
      {currentScreen === 'location' && (
        <Location
          onFinish={async (location) => {
            console.log('Selected location:', location);
            try {
              await AsyncStorage.setItem('userLocation', location);
            } catch (err) {
              console.error('Error saving userLocation:', err);
            }
            setUserLocation(location);
            navigateTo('home');
          }}
          onBackPress={() => goBack()}
        />
      )}
      {currentScreen === 'home' && (
        <Home
          isDarkTheme={isDarkTheme}
          userLocation={userLocation}
          hasUnreadNotifications={hasUnreadNotifications}
          onProfilePress={() => navigateTo('myprofile')}
          onNotificationPress={() => navigateTo('notification')}
          onFilterPress={() => navigateTo('filter')}
          onLocationPress={() => navigateTo('location')}
          onLocationChange={(loc) => setUserLocation(loc)}
          onSeeAllSuggested={() => navigateTo('find_job')}
          onSeeAllRecent={() => navigateTo('find_job')}
          onSearch={(query) => {
            setHomeSearchQuery(query);
            navigateTo('find_job');
          }}
          onJobPress={(job) => {
            setSelectedJob(job);
            navigateTo('job_detail');
          }}
          savedJobs={savedJobs}
          onToggleSave={(job) => {
            const isAlreadySaved = savedJobs.some((j) => (j._id || j.id) === (job._id || job.id));
            if (isAlreadySaved) {
              setSavedJobs((prev) => prev.filter((j) => (j._id || j.id) !== (job._id || job.id)));
            } else {
              setSavedJobs((prev) => [...prev, job]);
            }
          }}
          onNavigateToTab={(tab) => {
            if (tab === 'profile') {
              navigateTo('myprofile');
            } else if (tab === 'portfolio') {
              setFindJobInitialTab('available');
              navigateTo('find_job');
            } else if (tab === 'saved') {
              setFindJobInitialTab('saved');
              navigateTo('find_job');
            } else if (tab === 'home') {
              navigateTo('home');
            } else if (tab === 'chat') {
              navigateTo('notification');
            }
          }}
        />
      )}
      {currentScreen === 'myprofile' && (
        <MyProfile
          isDarkTheme={isDarkTheme}
          onBackPress={() => goBack()}
          onNavigateToTab={(tab) => {
            if (tab === 'home') {
              navigateTo('home');
            } else if (tab === 'portfolio') {
              setFindJobInitialTab('available');
              navigateTo('find_job');
            } else if (tab === 'saved') {
              navigateTo('bookmark');
            } else if (tab === 'chat') {
              navigateTo('notification');
            }
          }}
          onSettingsPress={() => navigateTo('settings')}
          onNavigateTo={navigateTo}
          onLogout={async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('userLocation');
            } catch (err) {
              console.error('Error clearing session:', err);
            }
            setAuthToken(null);
            setUser(null);
            setScreenHistory(['onboarding']);
            setCurrentScreen('onboarding');
          }}
        />
      )}
      {currentScreen === 'settings' && (
        <Settings
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          onToggleTheme={(value) => setIsDarkTheme(value)}
          onNavigateTo={navigateTo}
        />
      )}
      {currentScreen === 'personal_info' && (
        <PersonalInfo
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'help_center' && (
        <HelpCenter
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'your_profile' && (
        <YourProfile
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          onNavigateTo={navigateTo}
        />
      )}
      {currentScreen === 'password_manager' && (
        <PasswordManager
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'notification_settings' && (
        <NotificationSettings
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'contact_info' && (
        <ContactInfo
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'about_me' && (
        <AboutMe
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'experience' && (
        <Experience
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'education' && (
        <Education
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'projects' && (
        <Projects
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'certificates' && (
        <Certificates
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'volunteer' && (
        <Volunteer
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'awards' && (
        <Awards
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'skills' && (
        <Skills
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'resume' && (
        <Resume
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'my_application' && (
        <MyApplication
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          onApplicationPress={(app) => {
            setSelectedApplication(app);
            navigateTo('job_status');
          }}
        />
      )}
      {currentScreen === 'notification' && (
        <Notification
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'find_job' && (
        <FindJob
          onBackPress={() => {
            setHomeSearchQuery('');
            goBack();
          }}
          isDarkTheme={isDarkTheme}
          initialTab={findJobInitialTab}
          onFilterPress={() => navigateTo('filter')}
          savedJobs={savedJobs}
          filters={appliedFilters}
          initialSearchQuery={homeSearchQuery}
          onToggleSave={(job) => {
            const companyName = job.company || job.companyId?.name || 'Company';
            const mappedJob = {
              _id: job._id || job.id || '',
              title: job.role || job.title || 'Position',
              company: companyName,
              logo: companyName.substring(0, 1) + '.',
              logoBg: companyName === 'Google' ? '#EA4335' : companyName === 'Amazon' ? '#FF9900' : '#F24E1E',
              location: job.location,
              salary: job.salary || job.salaryBudget,
              tags: job.tags || [job.jobType, job.locationType, job.experienceLevel].filter(Boolean),
              applicants: job.applicants || job.applyCount || 0,
            };
            const isAlreadySaved = savedJobs.some((j) => (j._id || j.id) === mappedJob._id);
            if (isAlreadySaved) {
              setSavedJobs((prev) => prev.filter((j) => (j._id || j.id) !== mappedJob._id));
            } else {
              setSavedJobs((prev) => [...prev, mappedJob]);
            }
          }}
          onJobPress={(job) => {
            const mappedJob = {
              ...job,
              _id: job._id || job.id || '',
              title: job.role || job.title,
              company: job.company,
              logo: job.company ? (job.company.substring(0, 1) + '.') : 'C.',
              logoBg: job.company === 'Google' ? '#EA4335' : job.company === 'Amazon' ? '#FF9900' : '#F24E1E',
              location: job.location,
              salary: job.salary,
              type: job.tags ? job.tags[0] : job.jobType,
              workplace: job.tags ? job.tags[1] : job.locationType,
              experience: job.tags ? job.tags[2] : job.experienceLevel,
            };
            setSelectedJob(mappedJob);
            navigateTo('job_detail');
          }}
          onNavigateToTab={(tab) => {
            if (tab === 'home') {
              navigateTo('home');
            } else if (tab === 'profile') {
              if (!authToken) {
                navigateTo('login');
              } else {
                navigateTo('myprofile');
              }
            } else if (tab === 'chat') {
              navigateTo('notification');
            } else if (tab === 'saved') {
              navigateTo('bookmark');
            }
          }}
        />
      )}
      {currentScreen === 'filter' && (
        <Filter
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          onApply={(filters) => {
            console.log('Applied filters:', filters);
            setAppliedFilters(filters);
            const prevScreen = screenHistory[screenHistory.length - 2];
            goBack();
            if (prevScreen === 'home') {
              navigateTo('find_job');
            }
          }}
        />
      )}
      {currentScreen === 'bookmark' && (
        <Bookmark
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          savedJobs={savedJobs}
          onToggleSave={(job) => {
            setSavedJobs((prev) => prev.filter((j) => (j._id || j.id) !== (job._id || job.id)));
          }}
          onNavigateToTab={(tab) => {
            if (tab === 'home') {
              navigateTo('home');
            } else if (tab === 'profile') {
              if (!authToken) {
                navigateTo('login');
              } else {
                navigateTo('myprofile');
              }
            } else if (tab === 'portfolio') {
              setFindJobInitialTab('available');
              navigateTo('find_job');
            } else if (tab === 'chat') {
              navigateTo('notification');
            } else if (tab === 'saved') {
              navigateTo('bookmark');
            }
          }}
          onJobPress={(job) => {
            const mappedJob = {
              ...job,
              _id: job._id || job.id || '',
              title: job.title,
              company: job.company,
              logo: job.logo,
              logoBg: job.logoBg,
              location: job.location,
              salary: job.salary,
              type: job.tags && job.tags.length > 0 ? job.tags[0] : 'Full-time',
              workplace: job.tags && job.tags.length > 1 ? job.tags[1] : 'Remote',
              experience: job.tags && job.tags.length > 2 ? job.tags[2] : 'Mid Level',
            };
            setSelectedJob(mappedJob);
            navigateTo('job_detail');
          }}
        />
      )}
      {currentScreen === 'candidate_support' && (
        <CandidateSupportScreen
          isDarkTheme={isDarkTheme}
          onBackPress={() => goBack()}
        />
      )}
      {['home', 'find_job', 'bookmark', 'myprofile', 'candidate_support'].includes(currentScreen) && (
        <BottomNavigation
          activeTab={
            currentScreen === 'home' ? 'home' :
            currentScreen === 'find_job' ? 'portfolio' :
            currentScreen === 'bookmark' ? 'saved' :
            currentScreen === 'candidate_support' ? 'chat' :
            'profile'
          }
          isDarkTheme={isDarkTheme}
          chatBadgeCount={supportUnreadCount}
          onTabPress={(tab) => {
            if (tab === 'home') {
              navigateTo('home');
            } else if (tab === 'portfolio') {
              setFindJobInitialTab('available');
              navigateTo('find_job');
            } else if (tab === 'saved') {
              navigateTo('bookmark');
            } else if (tab === 'chat') {
              navigateTo('candidate_support');
            } else if (tab === 'profile') {
              if (!authToken) {
                navigateTo('login');
              } else {
                navigateTo('myprofile');
              }
            }
          }}
        />
      )}
      {currentScreen === 'job_detail' && (
        <JobDetail
          job={selectedJob}
          isDarkTheme={isDarkTheme}
          onBackPress={() => goBack()}
          onApplyPress={() => navigateTo('apply_job')}
          isSaved={savedJobs.some((j) => (j._id || j.id) === (selectedJob?._id || selectedJob?.id))}
          onToggleSave={() => {
            if (!selectedJob) return;
            const isAlreadySaved = savedJobs.some((j) => (j._id || j.id) === (selectedJob._id || selectedJob.id));
            if (isAlreadySaved) {
              setSavedJobs((prev) => prev.filter((j) => (j._id || j.id) !== (selectedJob._id || selectedJob.id)));
            } else {
              setSavedJobs((prev) => [...prev, selectedJob]);
            }
          }}
        />
      )}
      {currentScreen === 'languages' && (
        <Languages
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'privacy_policy' && (
        <PrivacyPolicy
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'apply_job' && (
        <ApplyJob
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          jobTitle={selectedJob?.title || "Position"}
          jobId={selectedJob?._id}
          onGoToApplication={() => navigateTo('my_application')}
        />
      )}
      {currentScreen === 'job_status' && (
        <JobStatus
          application={selectedApplication}
          isDarkTheme={isDarkTheme}
          onBackPress={() => goBack()}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
