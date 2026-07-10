import React, { useState, useEffect } from 'react';
import { StatusBar, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import Filter from './src/screen/Filter';
import JobDetail from './src/screen/JobDetail';
import ApplyJob from './src/screen/ApplyJob';
import Bookmark from './src/screen/Bookmark';
import BottomNavigation from './src/components/BottomNavigation';

type ScreenName =
  | 'onboarding'
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
  | 'apply_job';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('onboarding');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>(['onboarding']);
  const [resetEmail, setResetEmail] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [findJobInitialTab, setFindJobInitialTab] = useState<'available' | 'saved' | 'hire'>('available');

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
          onLoginSuccess={() => navigateTo('profile')}
          onForgotPasswordPress={() => navigateTo('forgot_password')}
        />
      )}
      {currentScreen === 'register' && (
        <Register
          onLoginPress={() => navigateTo('login')}
          onBackPress={() => goBack()}
          onRegisterSuccess={() => console.log('Registration successful!')}
        />
      )}
      {currentScreen === 'forgot_password' && (
        <ForgotPassword
          onBackPress={() => goBack()}
          onSendPress={(email) => {
            setResetEmail(email);
            navigateTo('otp_verification');
          }}
        />
      )}
      {currentScreen === 'otp_verification' && (
        <OTPVerification
          email={resetEmail}
          onBackPress={() => goBack()}
          onVerifyPress={(otp) => {
            console.log('OTP verified:', otp);
            navigateTo('reset_password');
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
          onFinish={(location) => {
            console.log('Selected location:', location);
            navigateTo('home');
          }}
          onBackPress={() => goBack()}
        />
      )}
      {currentScreen === 'home' && (
        <Home
          isDarkTheme={isDarkTheme}
          onProfilePress={() => navigateTo('myprofile')}
          onNotificationPress={() => navigateTo('notification')}
          onFilterPress={() => navigateTo('filter')}
          onJobPress={(job) => {
            setSelectedJob(job);
            navigateTo('job_detail');
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
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          initialTab={findJobInitialTab}
          onFilterPress={() => navigateTo('filter')}
          onJobPress={(job) => {
            const mappedJob = {
              title: job.role,
              company: job.company,
              logo: job.company.substring(0, 1) + '.',
              logoBg: job.company === 'Google' ? '#EA4335' : job.company === 'Amazon' ? '#FF9900' : '#F24E1E',
              location: job.location,
              salary: job.salary.includes('k')
                ? job.salary
                : job.salary.includes('/m')
                ? job.salary.replace('/m', '') + ' - $' + (parseInt(job.salary.replace(/[^0-9]/g, ''), 10) * 1.2).toFixed(0) + '/m'
                : job.salary,
              type: job.tags[0],
              workplace: job.tags[1],
              experience: job.tags[2],
            };
            setSelectedJob(mappedJob);
            navigateTo('job_detail');
          }}
          onNavigateToTab={(tab) => {
            if (tab === 'home') {
              navigateTo('home');
            } else if (tab === 'profile') {
              navigateTo('myprofile');
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
            goBack();
          }}
        />
      )}
      {currentScreen === 'bookmark' && (
        <Bookmark
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          onNavigateToTab={(tab) => {
            if (tab === 'home') {
              navigateTo('home');
            } else if (tab === 'profile') {
              navigateTo('myprofile');
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
              title: job.title,
              company: job.company,
              logo: job.logo,
              logoBg: job.logoBg,
              location: job.location,
              salary: job.salary + job.salaryUnit,
              type: job.tags[0],
              workplace: job.tags[1],
              experience: job.tags[2],
            };
            setSelectedJob(mappedJob);
            navigateTo('job_detail');
          }}
        />
      )}
      {['home', 'find_job', 'bookmark', 'notification', 'myprofile'].includes(currentScreen) && (
        <BottomNavigation
          activeTab={
            currentScreen === 'home' ? 'home' :
            currentScreen === 'find_job' ? 'portfolio' :
            currentScreen === 'bookmark' ? 'saved' :
            currentScreen === 'notification' ? 'chat' :
            'profile'
          }
          isDarkTheme={isDarkTheme}
          onTabPress={(tab) => {
            if (tab === 'home') {
              navigateTo('home');
            } else if (tab === 'portfolio') {
              setFindJobInitialTab('available');
              navigateTo('find_job');
            } else if (tab === 'saved') {
              navigateTo('bookmark');
            } else if (tab === 'chat') {
              navigateTo('notification');
            } else if (tab === 'profile') {
              navigateTo('myprofile');
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
        />
      )}
      {currentScreen === 'languages' && (
        <Languages
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
        />
      )}
      {currentScreen === 'apply_job' && (
        <ApplyJob
          onBackPress={() => goBack()}
          isDarkTheme={isDarkTheme}
          jobTitle={selectedJob?.title || "Position"}
          onGoToApplication={() => navigateTo('my_application')}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
