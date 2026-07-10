const Job = require('../models/Job');
const JobHistory = require('../models/JobHistory');
const { sendEmail } = require('./emailService');
const { emitNotification } = require('../utils/socketService');

// Simple local bad words checker to avoid installing dependencies
const detectBadWords = (text) => {
  const badWords = ['scam', 'fraud', 'fake', 'hiring money', 'pay upfront', 'deposit money', 'sexy', 'casino'];
  const lowercaseText = (text || '').toLowerCase();
  return badWords.some(word => lowercaseText.includes(word));
};

exports.moderateJob = async (jobId) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) return { success: false, message: 'Job not found' };

    const flags = [];
    let score = 0;

    // Rule 1: Bad words
    if (detectBadWords(job.title + ' ' + job.description)) {
      flags.push({ type: 'BAD_WORDS', severity: 'high' });
      score += 45;
    }

    // Rule 2: Salary budget checks (suspiciously high entry level)
    if (job.experienceLevel === 'Entry Level' && job.salaryBudget) {
      const budgetLower = job.salaryBudget.toLowerCase();
      if (budgetLower.includes('cr') || budgetLower.includes('crore') || budgetLower.includes('100lpa') || budgetLower.includes('50lpa')) {
        flags.push({ type: 'SALARY_TOO_HIGH_ENTRY', severity: 'medium' });
        score += 25;
      }
    }

    // Rule 3: Phone/Email detection in description
    const contactRegex = /(\d{10}|[\w.-]+@[\w.-]+\.\w+)/;
    if (contactRegex.test(job.description)) {
      flags.push({ type: 'CONTACT_IN_DESCRIPTION', severity: 'medium' });
      score += 15;
    }

    // Rule 4: Spam keywords
    const spamKeywords = ['earn money from home', 'guaranteed income', 'pay entry fee', 'send deposit'];
    const descLower = job.description.toLowerCase();
    for (const keyword of spamKeywords) {
      if (descLower.includes(keyword)) {
        flags.push({ type: 'SPAM_KEYWORD', keyword, severity: 'high' });
        score += 35;
      }
    }

    // Rule 5: Duplicate check
    const duplicate = await Job.findOne({
      companyId: job.companyId,
      title: job.title,
      status: { $in: ['published', 'pending_review', 'under_review'] },
      _id: { $ne: jobId }
    });
    if (duplicate) {
      flags.push({ type: 'DUPLICATE_JOB', severity: 'high' });
      score += 35;
    }

    const passed = score < 40;

    job.moderationFlags = flags;
    job.autoModerationScore = score;
    job.autoModerationPassed = passed;

    if (!passed) {
      job.status = 'rejected';
      job.rejectionReason = 'Failed automated content verification rules';
      job.rejectionCategory = 'auto_moderation';
    }

    await job.save();

    await JobHistory.create({
      jobId: job._id,
      companyId: job.companyId,
      action: passed ? 'auto_moderation_passed' : 'auto_moderation_failed',
      metadata: { score, flags }
    });

    // Notify company
    emitNotification(`company:${job.companyId}`, 'job:status:updated', {
      jobId: job._id,
      newStatus: job.status,
      message: passed 
        ? `Your job "${job.title}" passed automated checks and is under moderation.` 
        : `Your job "${job.title}" failed automated verification.`
    });

    return { passed, score, flags };
  } catch (error) {
    console.error('Auto moderation service error:', error);
    return { success: false, error: error.message };
  }
};
