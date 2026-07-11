import { apiRequest } from './api';

export const jobService = {
  /**
   * Apply for a job post
   */
  async applyJob(jobId: string, resumeUrl: string, coverLetter?: string) {
    return apiRequest('/applications/apply', {
      method: 'POST',
      body: JSON.stringify({
        jobId,
        resumeUrl,
        coverLetter,
      }),
    });
  },

  /**
   * Fetch job applications submitted by candidate
   */
  async getMyApplications() {
    return apiRequest('/applications/my-applications', {
      method: 'GET',
    });
  },

  /**
   * Upload resume document
   */
  async uploadResume(formData: FormData) {
    return apiRequest('/upload/resume', {
      method: 'POST',
      body: formData,
    });
  },
};
