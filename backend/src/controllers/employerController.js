const Candidate = require('../models/Candidate');
const Company = require('../models/Company');
const Job = require('../models/Job');

exports.getProfile = async (req, res) => {
  try {
    const user = await Candidate.findById(req.user.id).select('-password');
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id).populate('plan_id');
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id }).populate('plan_id');
      if (company && user && !user.company_id) {
        user.company_id = company._id;
        await user.save();
      }
    }
    if (company && !company.plan_id) {
      const Plan = require('../models/Plan');
      const freePlan = await Plan.findOne({ plan_type: "free" });
      if (freePlan) {
        company.plan_id = freePlan._id;
        company.plan_type = "free";
        company.plan_started_at = new Date();
        company.plan_expires_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14-day free trial
        company.plan_status = "active";
        await company.save();
        company = await Company.findById(company._id).populate('plan_id');
      }
    }
    res.json({ success: true, user, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id);
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id });
    }
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    const jobs = await Job.find({ company: company._id }).sort('-createdAt');
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    // Return sample candidates for future-proofing ATS Dashboard
    const candidates = await Candidate.find({ role: 'candidate' }).select('-password').limit(10);
    res.json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id).populate('owner_user_id', 'firstName lastName email phone');
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id }).populate('owner_user_id', 'firstName lastName email phone');
    }
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.json({ 
      success: true, 
      team: [
        {
          id: company.owner_user_id?._id,
          name: `${company.owner_user_id?.firstName} ${company.owner_user_id?.lastName}`,
          email: company.owner_user_id?.email,
          role: "Owner / Administrator",
          status: "active"
        }
      ] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { name, website, phone, address, description } = req.body;
    
    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id);
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id });
    }
    
    if (!company) {
      return res.status(404).json({ success: false, message: "Company profile not found" });
    }
    
    if (name) company.name = name;
    if (website !== undefined) company.website_url = website;
    if (phone !== undefined) company.mobile_number = phone;
    if (address !== undefined) company.company_location = address;
    if (description !== undefined) company.about_company = description;
    
    await company.save();
    
    res.json({ success: true, message: "Company profile updated successfully", company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.subscribeToPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: "Plan ID is required" });
    }

    const Plan = require('../models/Plan');
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id);
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id });
    }
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // Determine validity days based on plan name/type
    let validityDays = 30; // standard month
    if (plan.plan_name.toLowerCase().includes('year') || plan.billing_cycle === 'yearly') {
      validityDays = 365;
    } else if (plan.plan_name.toLowerCase().includes('trial') || plan.plan_type === 'free') {
      validityDays = 14;
    } else if (plan.plan_type === 'enterprise') {
      validityDays = 365; // enterprise defaults to 1 year
    }

    company.plan_id = plan._id;
    company.plan_type = plan.plan_type;
    company.plan_started_at = new Date();
    company.plan_expires_at = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
    company.plan_status = "active";

    await company.save();

    // Populate plan_id and return updated company
    const updatedCompany = await Company.findById(company._id).populate('plan_id');

    res.json({
      success: true,
      message: `Successfully subscribed to ${plan.plan_name}!`,
      company: updatedCompany
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEnterpriseStatus = async (req, res) => {
  try {
    const user = await Candidate.findById(req.user.id);
    const companyId = user.company_id || (await Company.findOne({ owner_user_id: req.user.id }))?._id;

    if (!companyId) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const Lead = require('../models/Lead');
    const lead = await Lead.findOne({ 
      companyId: companyId, 
      status: 'activated' 
    }).populate('account_manager', 'name email phone');

    if (!lead) {
      return res.status(200).json({ success: false, message: "No active enterprise lead found" });
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

