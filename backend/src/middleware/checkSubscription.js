const Company = require('../models/Company');
const Job = require('../models/Job');
const CompanyTeamMember = require('../models/CompanyTeamMember');
const Subscription = require('../models/Subscription');

/**
 * Express middleware to gate general features based on permission keys
 */
const checkSubscriptionPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
      }

      const Candidate = require('../models/Candidate');
      const user = await Candidate.findById(req.user.id);
      let company = null;
      if (user && user.company_id) {
        company = await Company.findById(user.company_id);
      }
      if (!company) {
        company = await Company.findOne({ owner_user_id: req.user.id });
      }
      if (!company) {
        return res.status(404).json({ success: false, message: "Company profile not found." });
      }

      // Check expired status
      const now = new Date();
      if (company.plan_expires_at && company.plan_expires_at < now && company.plan_status === 'active') {
        company.plan_status = 'expired';
        await company.save();
      }

      if (company.plan_status === 'expired' && company.plan_type !== 'free') {
        return res.status(403).json({
          success: false,
          code: 'SUBSCRIPTION_EXPIRED',
          message: "Your premium subscription has expired. Please upgrade or renew your plan."
        });
      }

      const planType = company.plan_type || 'free';

      // 1. GATE: Job Post Limit
      if (permission === 'post_job') {
        return checkJobPostLimit(req, res, next);
      }

      // 2. GATE: Team Seat Limit
      if (permission === 'add_team_member') {
        return checkSeatLimit(req, res, next);
      }

      // 3. GATE: Resume Downloads
      if (permission === 'download_resume') {
        if (planType === 'free') {
          return res.status(403).json({
            success: false,
            code: 'LOCKED_FEATURE',
            message: "Resume downloads are locked for Free Trial accounts. Please upgrade to Basic or higher to download resumes."
          });
        }
      }

      // 4. GATE: Advanced Analytics
      if (permission === 'advanced_analytics') {
        if (planType === 'free' || planType === 'basic') {
          return res.status(403).json({
            success: false,
            code: 'LOCKED_FEATURE',
            message: "Advanced Analytics reports are premium Pro/Enterprise tier features. Please upgrade your plan."
          });
        }
      }

      // 5. GATE: AI Candidate Matching
      if (permission === 'ai_matching') {
        if (planType !== 'pro' && planType !== 'enterprise') {
          return res.status(403).json({
            success: false,
            code: 'LOCKED_FEATURE',
            message: "AI Candidate Matching is an exclusive Pro/Enterprise module. Please upgrade your plan."
          });
        }
      }

      next();
    } catch (error) {
      console.error("Subscription Gating Middleware Error:", error);
      res.status(500).json({ success: false, message: "Internal server error gating subscription permissions." });
    }
  };
};

/**
 * Middleware: Dynamically checks if the seat limit is reached.
 * Seat Limit includes the Default Owner Admin + all active/pending invited Team Members.
 */
const checkSeatLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const Candidate = require('../models/Candidate');
    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id);
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id });
    }
    if (!company) {
      return res.status(404).json({ success: false, message: "Company profile not found." });
    }

    // Dynamic database lookup
    let subscription = await Subscription.findOne({ companyId: company._id });

    let allowedSeats = 1;
    let planName = company.plan_type || 'free';
    if (subscription) {
      allowedSeats = subscription.seatLimit;
      planName = subscription.plan;
    } else {
      const Plan = require('../models/Plan');
      const dbPlan = await Plan.findOne({ plan_type: company.plan_type || 'free' });
      if (dbPlan) {
        allowedSeats = dbPlan.limits?.team_members ?? 1;
        planName = dbPlan.plan_name;
      } else {
        // Backwards-compatible defaults
        if (company.plan_type === 'basic') allowedSeats = 3;
        else if (company.plan_type === 'pro') allowedSeats = 10;
        else if (company.plan_type === 'enterprise') allowedSeats = 9999;
      }
    }

    const teamCount = await CompanyTeamMember.countDocuments({ 
      company_id: company._id, 
      status: { $in: ["active", "pending"] } 
    });

    // Total seats = active/pending invited team members + 1 (the primary company owner)
    const currentSeats = teamCount + 1;

    if (currentSeats >= allowedSeats && allowedSeats !== -1 && allowedSeats !== 9999) {
      return res.status(403).json({
        success: false,
        code: 'LIMIT_EXCEEDED',
        message: `Corporate team seats limit reached (${allowedSeats} total seats). Your current "${planName.toUpperCase()}" plan allows up to ${allowedSeats} seats (including 1 default Owner Admin + ${allowedSeats - 1} invited seats). Please upgrade your plan.`,
        limit: allowedSeats,
        current: currentSeats
      });
    }

    next();
  } catch (error) {
    console.error("checkSeatLimit middleware error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Middleware: Dynamically checks if the job posts limit is reached.
 */
const checkJobPostLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const Candidate = require('../models/Candidate');
    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id);
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id });
    }
    if (!company) {
      return res.status(404).json({ success: false, message: "Company profile not found." });
    }

    // Dynamic database lookup
    let subscription = await Subscription.findOne({ companyId: company._id });

    let allowedJobs = 2;
    let planName = company.plan_type || 'free';
    if (subscription) {
      allowedJobs = subscription.jobLimit;
      planName = subscription.plan;
    } else {
      const Plan = require('../models/Plan');
      const dbPlan = await Plan.findOne({ plan_type: company.plan_type || 'free' });
      if (dbPlan) {
        allowedJobs = dbPlan.limits?.job_posts ?? 2;
        planName = dbPlan.plan_name;
      } else {
        // Backwards-compatible defaults
        if (company.plan_type === 'basic') allowedJobs = 5;
        else if (company.plan_type === 'pro') allowedJobs = 25;
        else if (company.plan_type === 'enterprise') allowedJobs = 9999;
      }
    }

    const jobsCount = await Job.countDocuments({ company: company._id });

    if (jobsCount >= allowedJobs && allowedJobs !== -1 && allowedJobs !== 9999) {
      return res.status(403).json({
        success: false,
        code: 'LIMIT_EXCEEDED',
        message: `Active job post limit reached (${allowedJobs} jobs). Your current "${planName.toUpperCase()}" plan allows up to ${allowedJobs} active postings. Please upgrade your plan.`,
        limit: allowedJobs,
        current: jobsCount
      });
    }

    next();
  } catch (error) {
    console.error("checkJobPostLimit middleware error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Expose and bind for maximum backwards-compatibility with both raw calls and object calls
checkSubscriptionPermission.checkSubscriptionPermission = checkSubscriptionPermission;
checkSubscriptionPermission.checkSeatLimit = checkSeatLimit;
checkSubscriptionPermission.checkJobPostLimit = checkJobPostLimit;

module.exports = checkSubscriptionPermission;
