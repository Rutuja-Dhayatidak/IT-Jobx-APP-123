const Job = require('../models/Job');

/**
 * Calculates recommendation score and matching metadata for a job compared to candidate preferences.
 * @param {Object} job - Mongoose Job document
 * @param {Object} profile - User Profile document/object
 * @returns {Object} { score, matchType, label, matchedSkills }
 */
const calculateJobScore = (job, profile) => {
  const candExp = Number(profile.experienceInMonths) || 0;
  const candSkills = Array.isArray(profile.skills) ? profile.skills.map(s => s.toLowerCase().trim()) : [];
  const preferredRoles = Array.isArray(profile.preferredRoles) ? profile.preferredRoles.map(r => r.toLowerCase().trim()) : [];
  const preferredLocations = Array.isArray(profile.preferredLocations) ? profile.preferredLocations.map(l => l.toLowerCase().trim()) : [];
  const preferredJobType = profile.preferredJobType ? profile.preferredJobType.toLowerCase().trim() : '';

  const jobMinExp = Number(job.minimumExperienceMonths) || 0;
  const jobMaxExp = Number(job.maximumExperienceMonths) || 0;
  const jobSkills = Array.isArray(job.skills) ? job.skills.map(s => s.toLowerCase().trim()) : [];
  const jobTitle = (job.title || '').toLowerCase().trim();
  const jobLoc = (job.location || '').toLowerCase().trim();
  const jobType = (job.jobType || '').toLowerCase().trim();

  let expPoints = 0;
  let isExactExp = false;
  let isNearbyExp = false;

  // 1. Experience Match (10 Points max)
  if (candExp >= jobMinExp) {
    expPoints = 10; // Candidate is qualified
    isExactExp = true;
  } else {
    // Nearby check: diff within 12 months (under-qualified but close)
    const diff = jobMinExp - candExp;
    if (diff <= 12) {
      expPoints = 5; // Award partial points for nearby match
      isNearbyExp = true;
    }
  }

  // 2. Skills Match (60 Points max)
  let skillsPoints = 0;
  const matchedSkillsList = [];
  if (jobSkills.length > 0) {
    jobSkills.forEach(skill => {
      const normJobSkill = skill.toLowerCase().replace(/\.js\b/g, '').replace(/\bjs\b/g, '').replace(/[^a-z0-9]/g, '').trim();
      const hasMatch = candSkills.some(candSkill => {
        const normCandSkill = candSkill.toLowerCase().replace(/\.js\b/g, '').replace(/\bjs\b/g, '').replace(/[^a-z0-9]/g, '').trim();
        return normCandSkill.includes(normJobSkill) || normJobSkill.includes(normCandSkill);
      });
      if (hasMatch) {
        matchedSkillsList.push(skill);
      }
    });
    const matchedCount = matchedSkillsList.length;
    skillsPoints = Math.round((matchedCount / jobSkills.length) * 60);
  } else {
    skillsPoints = 60; // If job lists no skills, default to full match points
  }

  // 3. Preferred Role Match (20 Points)
  let rolePoints = 0;
  const isRoleMatch = preferredRoles.some(role => jobTitle.includes(role) || role.includes(jobTitle));
  if (isRoleMatch) {
    rolePoints = 20;
  }

  // 4. Preferred Location Match (7 Points)
  let locPoints = 0;
  const isLocMatch = preferredLocations.some(loc => jobLoc.includes(loc) || loc.includes(jobLoc));
  if (isLocMatch) {
    locPoints = 7;
  }

  // 5. Job Type Match (3 Points)
  let typePoints = 0;
  const isTypeMatch = preferredJobType && (jobType.includes(preferredJobType) || preferredJobType.includes(jobType));
  if (isTypeMatch) {
    typePoints = 3;
  }

  let recommendationScore = expPoints + skillsPoints + rolePoints + locPoints + typePoints;

  // If BOTH skills and preferred roles do not match (are 0), then show 0% match
  if (skillsPoints === 0 && rolePoints === 0) {
    recommendationScore = 0;
  }

  // Map MatchType & Labels
  let matchType = 'LATEST_JOBS';
  let recommendationLabel = 'Latest opportunities';

  if (matchedSkillsList.length > 0 && isRoleMatch) {
    matchType = 'ROLE_SKILLS_MATCH';
    recommendationLabel = 'Best Match (Skills & Role)';
  } else if (matchedSkillsList.length > 0) {
    matchType = 'SKILLS_MATCH';
    recommendationLabel = 'Best Skills Match';
  } else if (isRoleMatch) {
    matchType = 'ROLE_MATCH';
    recommendationLabel = 'Preferred Role Match';
  } else if (isExactExp) {
    matchType = 'EXACT_MATCH';
    recommendationLabel = 'Experience Match';
  } else if (isNearbyExp) {
    matchType = 'NEARBY_EXPERIENCE';
    recommendationLabel = 'Experience Match';
  } else if (isLocMatch || isTypeMatch) {
    matchType = 'PREFERENCE_MATCH';
    recommendationLabel = 'Based on your preferences';
  }

  // Re-map skills to their original casing from the job document for presentation
  const matchedOriginalSkills = (job.skills || []).filter(s =>
    matchedSkillsList.includes(s.toLowerCase().trim())
  );

  return {
    recommendationScore,
    matchType,
    recommendationLabel,
    matchedSkills: matchedOriginalSkills,
  };
};

/**
 * Parses duration string (e.g. "Dec 2020 - Present") to count total months.
 */
const parseDurationToMonths = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') return 0;

  const parts = durationStr.split('-').map(s => s.trim());
  if (parts.length === 0) return 0;

  const parsePart = (part) => {
    if (part.toLowerCase() === 'present') {
      return new Date();
    }

    const subParts = part.trim().split(' ');
    if (subParts.length === 1) {
      const year = parseInt(subParts[0], 10);
      if (isNaN(year)) return null;
      return new Date(year, 0, 1);
    }
    const monthName = subParts[0];
    const year = parseInt(subParts[1], 10);

    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthIndex = monthNames.indexOf(monthName.toLowerCase().substring(0, 3));
    if (monthIndex === -1 || isNaN(year)) return null;

    return new Date(year, monthIndex, 1);
  };

  const startDate = parsePart(parts[0]);
  const endDate = parts[1] ? parsePart(parts[1]) : new Date();

  if (!startDate || !endDate) return 0;

  const diffYears = endDate.getFullYear() - startDate.getFullYear();
  const diffMonths = endDate.getMonth() - startDate.getMonth();

  return Math.max(0, (diffYears * 12) + diffMonths);
};

/**
 * Recommends jobs for a candidate.
 * @param {string} candidateId - Logged-in candidate user ID
 * @param {Object} profile - Candidate's Profile document
 * @returns {Promise<Object>} { matchType, jobs }
 */
const getSuggestedJobsForCandidate = async (candidateId, profile) => {
  // Query only published and active jobs
  const jobs = await Job.find({ status: 'published', isActive: { $ne: false } })
    .populate('companyId')
    .sort({ createdAt: -1 });

  if (!jobs || jobs.length === 0) {
    return {
      matchType: 'NO_MATCH',
      jobs: []
    };
  }

  // If profile is incomplete, return latest active jobs
  if (!profile) {
    const latestJobs = jobs.slice(0, 10).map(job => ({
      ...job.toObject(),
      matchedSkills: [],
      recommendationScore: 0,
      recommendationLabel: 'Latest opportunities'
    }));

    return {
      matchType: 'LATEST_JOBS',
      jobs: latestJobs
    };
  }

  // Dynamically calculate total experience in months if not set or 0
  let totalExperienceMonths = Number(profile.experienceInMonths) || 0;
  if (totalExperienceMonths === 0 && Array.isArray(profile.experience) && profile.experience.length > 0) {
    let computedMonths = 0;
    profile.experience.forEach(exp => {
      if (exp.duration) {
        computedMonths += parseDurationToMonths(exp.duration);
      }
    });
    if (computedMonths > 0) {
      profile.experienceInMonths = computedMonths;
    }
  }

  // Calculate scores for all active jobs
  const scoredJobs = jobs.map(job => {
    const scoreData = calculateJobScore(job, profile);
    return {
      ...job.toObject(),
      ...scoreData
    };
  });

  // Sort by score in descending order
  scoredJobs.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Take top 10 jobs
  const topJobs = scoredJobs.slice(0, 10);

  // If no job has any recommendation score > 0, return them as latest jobs (Level 5 fallback!)
  const hasMatches = topJobs.some(j => j.recommendationScore > 0);
  if (!hasMatches) {
    const latestJobs = jobs.slice(0, 10).map(job => ({
      ...job.toObject(),
      matchedSkills: [],
      recommendationScore: 0,
      recommendationLabel: 'Latest opportunities',
      matchType: 'LATEST_JOBS'
    }));

    return {
      matchType: 'LATEST_JOBS',
      jobs: latestJobs
    };
  }

  // Determine primary matchType of the set based on the highest scored job
  const primaryMatchType = topJobs[0].matchType;

  return {
    matchType: primaryMatchType,
    jobs: topJobs
  };
};

module.exports = {
  calculateJobScore,
  getSuggestedJobsForCandidate
};
