import React from 'react';
import CompleteProfile from './CompleteProfile';

interface ProfileProps {
  onFinish?: (data: any) => void;
  onBackPress?: () => void;
}

export default function Profile({ onFinish, onBackPress }: ProfileProps) {
  return (
    <CompleteProfile
      onFinish={onFinish}
      onBackPress={onBackPress}
    />
  );
}
