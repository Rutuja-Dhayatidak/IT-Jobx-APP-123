import { apiRequest } from './api';

export interface SuggestedJob {
  _id: string;
  title: string;
  companyName: string;
  company_id?: string | { _id: string; name: string };
  location: string;
  jobType: string;
  minimumExperienceMonths: number;
  maximumExperienceMonths: number;
  matchedSkills: string[];
  recommendationScore: number;
  recommendationLabel: string;
  isFeatured?: boolean;
  salary?: string;
  salaryBudget?: string;
}

export interface SuggestedJobsResponse {
  success: boolean;
  matchType: 'EXACT_MATCH' | 'NEARBY_EXPERIENCE' | 'SKILLS_MATCH' | 'PREFERENCE_MATCH' | 'LATEST_JOBS' | 'NO_MATCH';
  message: string;
  jobs: SuggestedJob[];
}

/**
 * Fetch dynamic suggested jobs for candidate
 */
export const getSuggestedJobs = async (): Promise<SuggestedJobsResponse> => {
  return await apiRequest('/jobs/suggested', {
    method: 'GET',
  });
};
