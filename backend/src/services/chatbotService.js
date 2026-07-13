const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

/**
 * Processes incoming candidate messages and returns an automated bot response.
 * @param {string} message - Message text
 * @param {string} candidateId - Candidate MongoDB ObjectId
 * @returns {Promise<{ reply: string, transferAgent: boolean, metadata?: any }>}
 */
const getBotResponse = async (message, candidateId) => {
  const query = message.trim().toLowerCase();

  // 1. Human agent escalation triggers disabled
  if (
    query.includes('connect me to support') ||
    query.includes('talk to agent') ||
    query.includes('human support') ||
    query.includes('chat with human') ||
    query.includes('support agent')
  ) {
    return {
      reply: 'ITJobX Candidate Support is fully automated via our AI Assistant to solve your queries instantly. Please choose one of the options (Application Status, Resume Help, Interview Support, Job Search) or type your query below!',
      transferAgent: false,
    };
  }

  // 2. Application Status
  if (query.includes('application status') || query.includes('my application') || query.includes('applied')) {
    try {
      const lastApp = await JobApplication.findOne({ candidateId })
        .populate('jobId')
        .sort({ createdAt: -1 });

      if (lastApp && lastApp.jobId) {
        return {
          reply: `Here is your latest job application status:\n\n• **Job Title**: ${lastApp.jobId.title}\n• **Status**: ${lastApp.status.toUpperCase()}\n• **Applied On**: ${new Date(lastApp.createdAt).toLocaleDateString()}\n\nYou can view all applications in detail by navigating to the **My Applications** section in your Profile.`,
          transferAgent: false,
          metadata: { action: 'navigate', screen: 'my_application' },
        };
      } else {
        return {
          reply: "You haven't applied to any jobs yet! You can browse and apply for jobs under the **Jobs** tab in the bottom bar.",
          transferAgent: false,
          metadata: { action: 'navigate', screen: 'find_job' },
        };
      }
    } catch (err) {
      console.error('[Bot Error] Failed to fetch application:', err);
      return {
        reply: 'Sorry, I encountered an issue fetching your application status. Please check your **My Applications** page under Profile.',
        transferAgent: false,
      };
    }
  }

  // 3. Resume Help
  if (query.includes('resume') || query.includes('cv') || query.includes('upload resume')) {
    return {
      reply: "To upload or update your resume, follow these steps:\n\n1. Go to the **Profile** tab in the bottom navigation.\n2. Click on **View Profile** under your profile card.\n3. Scroll down to the **Resume** section.\n4. Upload your resume PDF file (Max 5MB).\n\nHaving a complete profile increases your chances of getting hired by 75%!",
      transferAgent: false,
      metadata: { action: 'navigate', screen: 'myprofile' },
    };
  }

  // 4. Interview Support / HR / Technical
  if (query.includes('interview') || query.includes('prepare') || query.includes('question')) {
    if (query.includes('technical')) {
      return {
        reply: "Here is a list of top Technical Questions to prepare:\n\n• **Frontend**: 'Explain React reconciliation & Virtual DOM', 'How does flexbox work?'\n• **Backend**: 'Difference between SQL and NoSQL databases', 'What are RESTful API best practices?'\n• **JavaScript**: 'What is a closure?', 'Explain event loop and promises.'\n\nCheck out our home screen resources for technical preparation videos!",
        transferAgent: false,
      };
    }
    if (query.includes('hr')) {
      return {
        reply: "Here are some common HR Questions to prepare:\n\n1. *'Tell me about yourself?'*\n2. *'Why do you want to join this company?'*\n3. *'What are your strengths and weaknesses?'*\n4. *'Describe a time you handled conflict in a team?'*\n\nBe confident, speak clearly, and link your answers to the job requirements!",
        transferAgent: false,
      };
    }
    return {
      reply: "How can I support your upcoming interview? Select one of the topics below or type your choice:\n\n• **HR Questions**: Prepare common behavioural & intro questions.\n• **Technical Questions**: Core programming & system design prep.\n• **Interview Tips**: General dos & don'ts.",
      transferAgent: false,
    };
  }

  // 5. Job Search
  if (query.includes('job') || query.includes('search') || query.includes('find job')) {
    try {
      const liveJobs = await Job.find({ status: 'published' })
        .populate('companyId', 'name')
        .sort({ publishedAt: -1 })
        .limit(3);

      if (liveJobs && liveJobs.length > 0) {
        const jobListStr = liveJobs
          .map((job, idx) => `${idx + 1}. **${job.title}** at ${job.companyId?.name || 'Enterprise'} (${job.locationType})`)
          .join('\n');
        return {
          reply: `Here are some of the latest job openings for you:\n\n${jobListStr}\n\nTo view all jobs and apply, go to the **Jobs** search screen!`,
          transferAgent: false,
          metadata: { action: 'navigate', screen: 'find_job' },
        };
      }
    } catch (err) {
      console.error('[Bot Error] Failed to fetch jobs:', err);
    }
    return {
      reply: 'To search for your dream job, go to the **Jobs** tab, type your keywords (like developer, designer), select your location, and click search!',
      transferAgent: false,
      metadata: { action: 'navigate', screen: 'find_job' },
    };
  }

  // 6. Account Help / Profile / Password
  if (query.includes('account') || query.includes('profile') || query.includes('password') || query.includes('delete')) {
    return {
      reply: "Here is how you can manage your ITJobX account:\n\n• **Update Profile**: Navigate to the **Profile** tab and edit your Personal Details.\n• **Change Password**: Go to **Profile** > **Settings** > **Password Manager**.\n• **Email Verification**: Ensure your profile status says verified. Contact support if not received.\n• **Delete Account**: Send a request to delete your account via Settings or type 'Connect me to support'.",
      transferAgent: false,
      metadata: { action: 'navigate', screen: 'myprofile' },
    };
  }

  // Default fallback response
  return {
    reply: "I'm sorry, I couldn't understand your question. Please select one of the support options (Application Status, Resume Help, Interview Support, Job Search, Account Help) to get help from our automated AI Assistant.",
    transferAgent: false,
  };
};

module.exports = {
  getBotResponse,
};
