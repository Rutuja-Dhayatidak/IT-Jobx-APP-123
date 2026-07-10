const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const employerOnly = require('../middleware/employerOnly');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const Invoice = require('../models/Invoice');
const Lead = require('../models/Lead');

// Enforce authentication guards
router.use(verifyToken, employerOnly);

// 1. Fetch current subscription details, company profile, and usage statistics
router.get('/current', async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id).populate('plan_id');
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id }).populate('plan_id');
    }

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    let subscription = await Subscription.findOne({ companyId: company._id }).populate('planId');

    // Sync company plan_id with Subscription doc if missing
    if (!subscription && company.plan_id) {
      subscription = new Subscription({
        companyId: company._id,
        planId: company.plan_id._id,
        plan: company.plan_type || 'free',
        seatLimit: company.plan_type === 'basic' ? 3 : company.plan_type === 'pro' ? 10 : company.plan_type === 'enterprise' ? 9999 : 1,
        jobLimit: company.plan_type === 'basic' ? 5 : company.plan_type === 'pro' ? 25 : company.plan_type === 'enterprise' ? 9999 : 2,
        status: company.plan_status === 'active' ? 'active' : 'inactive',
        startDate: company.plan_started_at || new Date(),
        expiryDate: company.plan_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        permissions: ['post_job', 'add_team_member']
      });
      await subscription.save();
    }

    // Dynamic telemetry calculations
    const Job = require('../models/Job');
    const CompanyTeamMember = require('../models/CompanyTeamMember');

    const activeJobsCount = await Job.countDocuments({ company: company._id });
    const teamCount = await CompanyTeamMember.countDocuments({ company_id: company._id, status: { $ne: 'removed' } });

    const usage = {
      jobsPosted: activeJobsCount,
      membersAdded: teamCount + 1, // Including 1 default Owner Admin
      resumesDownloaded: subscription ? subscription.usage.resumesDownloaded : 0
    };

    const responsePlan = subscription ? subscription.plan : (company.plan_type || 'free');
    const responseSeatLimit = subscription ? subscription.seatLimit : (company.plan_type === 'basic' ? 3 : company.plan_type === 'pro' ? 10 : company.plan_type === 'enterprise' ? 9999 : 1);
    const responseJobLimit = subscription ? subscription.jobLimit : (company.plan_type === 'basic' ? 5 : company.plan_type === 'pro' ? 25 : company.plan_type === 'enterprise' ? 9999 : 2);
    const responseStatus = subscription ? subscription.status : (company.plan_status || 'active');

    res.json({
      success: true,
      plan: responsePlan,
      seatLimit: responseSeatLimit,
      jobLimit: responseJobLimit,
      status: responseStatus,
      subscription: subscription || { status: 'inactive', planType: 'free', autoRenew: false },
      company,
      usage
    });
  } catch (error) {
    console.error("Fetch current subscription failed:", error);
    res.status(500).json({ success: false, message: "Internal server error fetching subscription parameters" });
  }
});

// 2. Toggle Auto-Renewal switcher flag
router.post('/toggle-autorenew', async (req, res) => {
  try {
    const company = await Company.findOne({ owner_user_id: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const subscription = await Subscription.findOne({ companyId: company._id });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Active subscription not found to toggle' });
    }

    subscription.autoRenew = !subscription.autoRenew;
    await subscription.save();

    res.json({
      success: true,
      message: `Auto-renewal successfully ${subscription.autoRenew ? 'enabled' : 'disabled'}.`,
      autoRenew: subscription.autoRenew
    });
  } catch (error) {
    console.error("Toggle Auto-Renew failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Fetch list of invoices for the company
router.get('/invoices', async (req, res) => {
  try {
    const company = await Company.findOne({ owner_user_id: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const associatedLeads = await Lead.find({ company_id: company._id }).select('_id');
    const leadIds = associatedLeads.map(l => l._id);

    const rawInvoices = await Invoice.find({ 
      $or: [
        { companyId: company._id }, 
        { company_id: company._id },
        { lead_id: { $in: leadIds } }
      ] 
    })
      .sort({ createdAt: -1 })
      .lean();

    // Normalize schema differences between Razorpay invoices and Enterprise manual invoices
    const invoices = rawInvoices.map(inv => ({
      ...inv,
      planName: inv.planName || inv.service_description || 'Enterprise Plan',
      subtotal: inv.subtotal || inv.base_amount || 0,
      gstAmount: inv.gstAmount || ((inv.cgst || 0) + (inv.sgst || 0)),
      totalAmount: inv.totalAmount || inv.total_amount || 0,
      issuedDate: inv.issuedDate || inv.invoice_date || inv.createdAt
    }));

    res.json({
      success: true,
      invoices
    });
  } catch (error) {
    console.error("Fetch invoices list CRITICAL ERROR:", error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
});

// 4. Fetch dynamic subscription status, real-time usage, permissions, and upgrade pathway
router.get('/current-status', async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const Plan = require('../models/Plan');
    const Job = require('../models/Job');
    const CompanyTeamMember = require('../models/CompanyTeamMember');

    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id).populate('plan_id');
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id }).populate('plan_id');
    }

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    let subscription = await Subscription.findOne({ companyId: company._id }).populate('planId');

    // Sync company plan_id with Subscription doc if missing
    if (!subscription && company.plan_id) {
      subscription = new Subscription({
        companyId: company._id,
        planId: company.plan_id._id,
        plan: company.plan_type || 'free',
        seatLimit: company.plan_type === 'basic' ? 3 : company.plan_type === 'pro' ? 10 : company.plan_type === 'enterprise' ? 9999 : 1,
        jobLimit: company.plan_type === 'basic' ? 5 : company.plan_type === 'pro' ? 25 : company.plan_type === 'enterprise' ? 9999 : 2,
        status: company.plan_status === 'active' ? 'active' : 'inactive',
        startDate: company.plan_started_at || new Date(),
        expiryDate: company.plan_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        permissions: ['post_job', 'add_team_member']
      });
      await subscription.save();
    }

    const planType = subscription ? subscription.plan : (company.plan_type || 'free');

    // Query active Plan model from database to avoid hardcoding limits/features
    let dbPlan = null;
    if (subscription && subscription.planId) {
      dbPlan = await Plan.findById(subscription.planId);
    } else {
      dbPlan = await Plan.findOne({ plan_type: planType });
    }

    const seatLimit = dbPlan ? (dbPlan.limits?.team_members ?? (subscription ? subscription.seatLimit : 1)) : (subscription ? subscription.seatLimit : 1);
    const jobLimit = dbPlan ? (dbPlan.limits?.job_posts ?? (subscription ? subscription.jobLimit : 2)) : (subscription ? subscription.jobLimit : 2);

    const activeJobsCount = await Job.countDocuments({ company: company._id });
    const teamCount = await CompanyTeamMember.countDocuments({ company_id: company._id, status: { $ne: 'removed' } });

    const usedSeats = teamCount + 1; // Including owner
    const remainingSeats = seatLimit === -1 || seatLimit >= 9999 ? 9999 : Math.max(0, seatLimit - usedSeats);

    // Dynamic human-readable permissions matching Plan features
    let permissionsList = [];
    if (dbPlan) {
      permissionsList = Object.keys(dbPlan.features || {})
        .filter(k => dbPlan.features[k])
        .map(k => k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    } else {
      const fallbackPermissions = {
        free: ["Basic Job Posting", "Team Roster Access"],
        basic: ["Standard Job Posting", "Team Collaboration", "Custom Branding"],
        pro: ["Priority Active Job Listings", "Granular Access Roles", "AI Automated Candidate Matcher", "Internal Payroll Integration"],
        enterprise: ["Unlimited Postings", "Custom Department Hierarchy", "AI Matcher Premium", "API Integration Keys", "Dedicated Account Lead"]
      };
      permissionsList = fallbackPermissions[planType] || fallbackPermissions.free;
    }

    const nextPlanTypeMap = {
      free: 'basic',
      basic: 'pro',
      pro: 'enterprise',
      enterprise: null
    };

    const nextPlanType = nextPlanTypeMap[planType];
    let suggestedUpgrade = null;

    if (nextPlanType) {
      const dbNextPlan = await Plan.findOne({ plan_type: nextPlanType, is_active: true });
      if (dbNextPlan) {
        suggestedUpgrade = {
          name: dbNextPlan.plan_name,
          planType: dbNextPlan.plan_type,
          seatLimit: dbNextPlan.limits?.team_members ?? 9999,
          jobLimit: dbNextPlan.limits?.job_posts ?? 9999
        };
      } else {
        const fallbackUpgrades = {
          basic: { name: 'Basic', planType: 'basic', seatLimit: 3, jobLimit: 5 },
          pro: { name: 'Pro', planType: 'pro', seatLimit: 10, jobLimit: 25 },
          enterprise: { name: 'Enterprise', planType: 'enterprise', seatLimit: 9999, jobLimit: 9999 }
        };
        suggestedUpgrade = fallbackUpgrades[nextPlanType];
      }
    }

    res.json({
      success: true,
      currentPlan: {
        name: dbPlan ? dbPlan.plan_name : planType.toUpperCase(),
        planType: planType,
        seatLimit: seatLimit === -1 ? 9999 : seatLimit,
        usedSeats,
        remainingSeats,
        jobLimit: jobLimit === -1 ? 9999 : jobLimit,
        usedJobs: activeJobsCount,
        permissions: permissionsList
      },
      suggestedUpgrade
    });
  } catch (error) {
    console.error("GET /current-status failed:", error);
    res.status(500).json({ success: false, message: "Internal server error fetching dynamic subscription status" });
  }
});

module.exports = router;
