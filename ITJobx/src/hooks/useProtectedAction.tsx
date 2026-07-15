import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './useAuth';
import { apiRequest } from '../services/api';

export type PendingAction =
  | {
      type: 'APPLY_JOB';
      jobId: string;
      returnRoute: string;
      returnParams?: Record<string, any>;
    }
  | {
      type: 'SAVE_JOB';
      jobId: string;
      returnRoute: string;
      returnParams?: Record<string, any>;
    }
  | {
      type: 'VIEW_PROFILE';
      returnRoute: string;
      returnParams?: Record<string, any>;
    }
  | null;

interface ProtectedActionContextType {
  pendingAction: PendingAction;
  setPendingAction: (action: PendingAction) => void;
  authModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;
  profileIncompleteModalVisible: boolean;
  setProfileIncompleteModalVisible: (visible: boolean) => void;
  resumeRequiredModalVisible: boolean;
  setResumeRequiredModalVisible: (visible: boolean) => void;
  authModalMessage: string;
  setAuthModalMessage: (msg: string) => void;
  executeProtectedAction: (params: {
    action: PendingAction;
    onSuccess: () => void | Promise<void>;
  }) => Promise<void>;
}

const ProtectedActionContext = createContext<ProtectedActionContextType | undefined>(undefined);

export function ProtectedActionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [profileIncompleteModalVisible, setProfileIncompleteModalVisible] = useState(false);
  const [resumeRequiredModalVisible, setResumeRequiredModalVisible] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  const executeProtectedAction = async ({
    action,
    onSuccess,
  }: {
    action: PendingAction;
    onSuccess: () => void | Promise<void>;
  }) => {
    if (!isAuthenticated) {
      setPendingAction(action);
      if (action?.type === 'VIEW_PROFILE') {
        setAuthModalMessage('To view or create your candidate profile, please log in or create an account.');
      } else if (action?.type === 'SAVE_JOB') {
        setAuthModalMessage('To save this job, please log in or create an account.');
      } else if (action?.type === 'APPLY_JOB') {
        setAuthModalMessage('To apply for this job, please log in or create an account.');
      }
      setAuthModalVisible(true);
      return;
    }

    // If applying for a job, check profile and resume
    if (action?.type === 'APPLY_JOB') {
      try {
        const profileData = await apiRequest('/candidates/profile', { method: 'GET' });
        
        // Step 2: Profile completion check
        // Check both isProfileComplete flag from backend or compute manually
        if (!profileData || profileData.isProfileComplete === false) {
          setPendingAction(action);
          setProfileIncompleteModalVisible(true);
          return;
        }

        // Step 3: Resume check
        // Check if the user profile has resumeUrl
        const hasResume = profileData.profile && (profileData.profile.resumeUrl || profileData.profile.resumePublicId);
        if (!hasResume) {
          setPendingAction(action);
          setResumeRequiredModalVisible(true);
          return;
        }
      } catch (err) {
        console.warn('Failed to perform application requirements pre-check:', err);
      }
    }

    // All checks passed or action doesn't require extra checks
    await onSuccess();
  };

  return (
    <ProtectedActionContext.Provider
      value={{
        pendingAction,
        setPendingAction,
        authModalVisible,
        setAuthModalVisible,
        profileIncompleteModalVisible,
        setProfileIncompleteModalVisible,
        resumeRequiredModalVisible,
        setResumeRequiredModalVisible,
        authModalMessage,
        setAuthModalMessage,
        executeProtectedAction,
      }}
    >
      {children}
    </ProtectedActionContext.Provider>
  );
}

export function useProtectedAction() {
  const context = useContext(ProtectedActionContext);
  if (context === undefined) {
    throw new Error('useProtectedAction must be used within a ProtectedActionProvider');
  }
  return context;
}
