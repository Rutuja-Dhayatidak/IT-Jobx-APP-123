import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileCompletionBanner from '../ProfileCompletionBanner';

describe('ProfileCompletionBanner component unit tests', () => {
  it('renders title, percentage, and list of missing fields', () => {
    const { getByText } = render(
      <ProfileCompletionBanner
        percentage={60}
        missingFields={['skills', 'experience']}
        onComplete={() => {}}
        onDismiss={() => {}}
      />
    );

    // Verify Title & Percentage
    expect(getByText(/Complete your profile for better job matches/)).toBeTruthy();
    expect(getByText('60%')).toBeTruthy();

    // Verify Missing Fields Badges
    expect(getByText('• Skills')).toBeTruthy();
    expect(getByText('• Experience')).toBeTruthy();
  });

  it('triggers onComplete callback when clicking Complete Profile', () => {
    const handleComplete = jest.fn();
    const { getByText } = render(
      <ProfileCompletionBanner
        percentage={60}
        missingFields={['skills']}
        onComplete={handleComplete}
        onDismiss={() => {}}
      />
    );

    fireEvent.press(getByText('Complete Profile'));
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('triggers onDismiss callback when clicking Maybe Later', () => {
    const handleDismiss = jest.fn();
    const { getByText } = render(
      <ProfileCompletionBanner
        percentage={60}
        missingFields={['skills']}
        onComplete={() => {}}
        onDismiss={handleDismiss}
      />
    );

    fireEvent.press(getByText('Maybe Later'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
