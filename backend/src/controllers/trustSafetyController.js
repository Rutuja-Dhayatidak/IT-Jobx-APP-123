const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Report = require('../models/Report');
const KYC = require('../models/KYC');
const Fraud = require('../models/Fraud');
const TrustLog = require('../models/TrustLog');
const Moderation = require('../models/Moderation');
const EnforcementAction = require('../models/EnforcementAction');
const CompanyDocument = require('../models/CompanyDocument');
const sendEmail = require('../utils/sendEmail');
// Helper to calculate risk score
const calculateRiskLevel = async (targetId, targetType) => {
  const reportCount = await Report.countDocuments({ targetId, status: { $ne: 'Dismissed' } });
  const fraudAlerts = await Fraud.countDocuments({ userId: targetId, riskLevel: 'Critical' });

  if (fraudAlerts > 0 || reportCount > 10) return 'Critical';
  if (reportCount > 5) return 'High';
  if (reportCount > 2) return 'Medium';
  return 'Low';
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingModeration = await Moderation.countDocuments({ status: 'Pending' });
    const blockedUsers = await Candidate.countDocuments({ isBlocked: true });
    const fraudAlerts = await Fraud.countDocuments({ riskLevel: { $in: ['High', 'Critical'] } });

    res.json({
      totalReports,
      pendingModeration,
      blockedUsers,
      fraudAlerts,
      reportTrends: [15, 20, 25, 18, 30, 22],
      fraudActivity: [5, 8, 3, 7, 10, 6]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReportsAndFlags = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'firstName lastName')
      .sort('-createdAt');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getModerationQueue = async (req, res) => {
  try {
    const queue = await Moderation.find({ status: { $in: ['Pending', 'In-Review', 'Escalated'] } })
      .populate({
        path: 'reportId',
        populate: { path: 'reporterId', select: 'firstName lastName' }
      })
      .sort('-createdAt');
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveContent = async (req, res) => {
  try {
    const { modId } = req.body;
    const mod = await Moderation.findById(modId).populate('reportId');
    mod.status = 'Resolved';
    mod.reviewedBy = req.user.id;
    await mod.save();

    await Report.findByIdAndUpdate(mod.reportId._id, { status: 'Resolved' });

    await new TrustLog({
      action: 'Approved Content',
      adminId: req.user.id,
      targetId: mod.reportId.targetId,
      targetType: mod.reportId.targetType
    }).save();

    res.json({ message: "Content approved and report resolved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectContent = async (req, res) => {
  try {
    const { modId, reason } = req.body;
    const mod = await Moderation.findById(modId).populate('reportId');
    mod.status = 'Resolved';
    mod.resolutionNotes = reason;
    mod.reviewedBy = req.user.id;
    await mod.save();

    await Report.findByIdAndUpdate(mod.reportId._id, { status: 'Resolved', adminNotes: reason });

    // If it's a job, mark as inactive/rejected
    if (mod.reportId.targetType === 'job') {
      await Job.findByIdAndUpdate(mod.reportId.targetId, { status: 'rejected' });
    }

    await new TrustLog({
      action: 'Rejected Content',
      adminId: req.user.id,
      targetId: mod.reportId.targetId,
      targetType: mod.reportId.targetType,
      details: reason
    }).save();

    res.json({ message: "Content rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.escalateReport = async (req, res) => {
  try {
    const { modId } = req.body;
    await Moderation.findByIdAndUpdate(modId, { status: 'Escalated', riskLevel: 'High' });
    res.json({ message: "Report escalated to senior team" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.takeEnforcementAction = async (req, res) => {
  try {
    const { targetId, targetType, type, reason, duration } = req.body;

    const action = new EnforcementAction({
      type,
      targetId,
      targetType,
      adminId: req.user.id,
      reason,
      duration
    });
    await action.save();

    if (type.toLowerCase() === 'block' && targetType === 'user') {
      await Candidate.findByIdAndUpdate(targetId, { isBlocked: true, status: 'blocked' });
    }

    await new TrustLog({
      action: `Enforcement: ${type}`,
      adminId: req.user.id,
      targetId,
      targetType,
      details: reason
    }).save();

    res.json({ message: `Enforcement action '${type}' applied successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnforcementHistory = async (req, res) => {
  try {
    const history = await EnforcementAction.find()
      .populate('adminId', 'firstName lastName')
      .sort('-createdAt');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFraudAnalysis = async (req, res) => {
  try {
    const analysis = await Fraud.find()
      .populate('userId', 'firstName lastName email')
      .sort('-riskLevel');
    
    // Auto-calculate risk scores dynamically
    const enriched = await Promise.all(analysis.map(async (a) => {
      const dynamicRisk = await calculateRiskLevel(a.userId?._id, 'user');
      return { ...a.toObject(), calculatedRisk: dynamicRisk };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getKYC = async (req, res) => {
  try {
    const kycs = await KYC.find().populate('userId', 'firstName lastName email');
    res.json(kycs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveKYC = async (req, res) => {
  try {
    await KYC.findByIdAndUpdate(req.params.id, { status: 'Approved', verifiedAt: new Date() });
    res.json({ message: "KYC Approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectKYC = async (req, res) => {
  try {
    await KYC.findByIdAndUpdate(req.params.id, { status: 'Rejected', rejectionReason: req.body.reason });
    res.json({ message: "KYC Rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBlockedAccounts = async (req, res) => {
  try {
    const blocked = await Candidate.find({ isBlocked: true }).select('-password');
    res.json(blocked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await Candidate.findByIdAndUpdate(req.params.id, { isBlocked: false, status: 'active' });
    res.json({ message: "User unblocked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchData = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const [users, jobs, reports] = await Promise.all([
      Candidate.find({ 
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }).limit(5),
      Job.find({ title: { $regex: q, $options: 'i' } }).limit(5),
      Report.find({ reason: { $regex: q, $options: 'i' } }).limit(5)
    ]);

    res.json({ users, jobs, reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await TrustLog.find().populate('adminId', 'firstName lastName').sort('-timestamp');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// COMPANY VERIFICATION (TRUST & SAFETY)
// ==========================================

// Helper to auto-calculate risk for companies
const calculateCompanyRisk = (company) => {
  let riskScore = 'Low';
  let flaggedReasons = [];
  
  if (!company.website_url) {
    riskScore = 'Medium';
    flaggedReasons.push('No website URL provided');
  } else if (company.website_url.match(/\.(xyz|info|tk|ml)$/i)) {
    riskScore = 'High';
    flaggedReasons.push('Suspicious website domain (high risk TLD)');
  }

  const emailDomain = company.email.split('@')[1];
  const webDomain = company.website_url ? company.website_url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0] : '';
  
  // Basic domain mismatch check
  if (webDomain && emailDomain && emailDomain !== webDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)) {
    riskScore = 'High';
    flaggedReasons.push('Email domain does not match website domain');
  }

  const spamKeywords = ['earn money', 'work from home scam', 'quick cash', 'free money'];
  if (company.about_company && spamKeywords.some(kw => company.about_company.toLowerCase().includes(kw))) {
    riskScore = 'Critical';
    flaggedReasons.push('Contains blacklisted spam keywords');
  }

  return { riskScore, flaggedReason: flaggedReasons.join(', ') };
};

exports.getCompanyRequests = async (req, res) => {
  try {
    const { status, risk } = req.query;
    let query = {};
    
    if (status) query.trust_safety_status = status;
    if (risk) query.risk_score = risk;

    const companies = await Company.find(query)
      .populate('owner_user_id', 'firstName lastName email phone')
      .populate('reviewed_by', 'firstName lastName')
      .populate('flagged_by', 'firstName lastName')
      .sort('-createdAt');

    // Dynamically apply automated risk scores and fraud checklist
    const enriched = await Promise.all(companies.map(async (comp) => {
      // Duplicate check
      const duplicateCount = await Company.countDocuments({
        _id: { $ne: comp._id },
        $or: [
          { name: comp.name },
          { website_url: comp.website_url && comp.website_url !== '' ? comp.website_url : 'NO_URL' },
          { email: comp.email }
        ]
      });

      const checklistDB = comp.verification_checklist || {};
      const fraudChecklist = {
        websiteActive: checklistDB.website_active !== null && checklistDB.website_active !== undefined ? checklistDB.website_active : !!comp.website_url,
        googlePresence: checklistDB.google_presence !== null && checklistDB.google_presence !== undefined ? checklistDB.google_presence : null, 
        noDuplicates: checklistDB.no_duplicates !== null && checklistDB.no_duplicates !== undefined ? checklistDB.no_duplicates : duplicateCount === 0,
        logoVerification: checklistDB.logo_verified !== null && checklistDB.logo_verified !== undefined ? checklistDB.logo_verified : null
      };

      if (comp.trust_safety_status === 'pending' && !comp.flagged_reason && !comp.risk_flagged) {
        let { riskScore, flaggedReason } = calculateCompanyRisk(comp);
        
        if (duplicateCount > 0) {
          riskScore = 'Critical';
          flaggedReason = (flaggedReason ? flaggedReason + ', ' : '') + 'Duplicate company details detected';
        }

        if (riskScore !== comp.risk_score || flaggedReason !== comp.flagged_reason) {
          comp.risk_score = riskScore;
          comp.flagged_reason = flaggedReason;
          await comp.save();
        }
      }
      
      const docs = await CompanyDocument.find({ company_id: comp._id });
      const compObj = comp.toObject();
      compObj.fraudChecklist = fraudChecklist;
      compObj.documents = docs;
      return compObj;
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveCompanyRequest = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.trust_safety_status = 'cleared';
    company.status = 'pending';
    company.verification_status = 'pending';
    company.isVerified = false;
    company.reviewed_by = req.user.id;
    company.reviewed_at = new Date();
    company.flagged_reason = ''; // Clear flags on safety review pass
    await company.save();

    await new TrustLog({
      action: 'Marked Company Safe',
      adminId: req.user.id,
      targetId: company._id,
      targetType: 'company',
      details: 'Marked as safe by Trust & Safety, sent to Platform Admin for final approval'
    }).save();

    res.json({ message: 'Company marked as safe and forwarded to Platform Admin successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectCompanyRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.trust_safety_status = 'rejected';
    company.status = 'rejected'; // Also reject the main platform status
    company.verification_status = 'rejected';
    company.isVerified = false;
    company.rejectionReason = reason;
    company.reviewed_by = req.user.id;
    company.reviewed_at = new Date();
    await company.save();

    await new TrustLog({
      action: 'Rejected Company Verification',
      adminId: req.user.id,
      targetId: company._id,
      targetType: 'company',
      details: `Reason: ${reason}`
    }).save();

    // Send email to the company owner
    const emailHtml = `
      <h3>Registration Rejected</h3>
      <p>Hello,</p>
      <p>Your company registration for <strong>${company.name}</strong> has been rejected by our Trust & Safety team.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please fix the mentioned issues and contact support if you believe this is a mistake.</p>
    `;
    await sendEmail(company.email || company.official_work_email, 'Company Registration Status - NextHire', emailHtml);

    res.json({ message: 'Company request rejected and email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyCompanyDocument = async (req, res) => {
  try {
    const { documentId, status } = req.body; // status: 'approved' or 'rejected'
    const doc = await CompanyDocument.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    doc.verification_status = status;
    await doc.save();

    await new TrustLog({
      action: 'Verified Company Document',
      adminId: req.user.id,
      targetId: doc.company_id,
      targetType: 'company',
      details: `Document ${doc.document_type} status set to ${status}`
    }).save();

    res.json({ message: 'Document verification status updated successfully', document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.flagCompanyRisk = async (req, res) => {
  try {
    const { riskScore, reason } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.risk_score = riskScore;
    company.risk_flagged = true;
    company.flagged_reason = reason;
    company.flagged_by = req.user.id;
    company.flagged_at = new Date();
    
    if (riskScore === 'Critical') {
        company.trust_safety_status = 'escalated';
    }
    
    await company.save();

    await new TrustLog({
      action: 'risk_flagged',
      adminId: req.user.id,
      targetId: company._id,
      targetType: 'company',
      details: `Flagged as ${riskScore} Risk: ${reason}`
    }).save();

    // Notify Platform Admins and Super Admins
    const admins = await Candidate.find({ role: { $in: ['Platform Admin', 'superAdmin'] } });
    const adminEmails = admins.map(a => a.email);

    if (adminEmails.length > 0) {
      const emailHtml = `
        <h3>High-Risk Company Flagged</h3>
        <p>A company registration has been flagged by Trust & Safety.</p>
        <ul>
          <li><strong>Company:</strong> ${company.name}</li>
          <li><strong>Risk Score:</strong> ${riskScore}</li>
          <li><strong>Reason:</strong> ${reason}</li>
        </ul>
        <p>Please review this in the admin dashboard.</p>
      `;
      // Send to the first admin, could use a loop or proper mass emailer in production
      await sendEmail(adminEmails[0], `Alert: High Risk Company - ${company.name}`, emailHtml);
    }

    res.json({ message: `Company flagged as ${riskScore} risk` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyChecklistItem = async (req, res) => {
  try {
    const { key, value } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    if (!company.verification_checklist) {
      company.verification_checklist = {};
    }
    
    company.verification_checklist[key] = value;
    await company.save();

    await new TrustLog({
      action: 'checklist_verified',
      adminId: req.user.id,
      targetId: company._id,
      targetType: 'company',
      details: `Manually set ${key} to ${value}`
    }).save();

    res.json({ message: 'Checklist updated successfully', checklist: company.verification_checklist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendCompanyEmailLink = async (req, res) => {
  try {
    const { company_id } = req.body;
    const company = await Company.findById(company_id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    if (!company.official_work_email) {
      return res.status(400).json({ message: 'Company does not have an official work email registered' });
    }

    // Cooldown check (60 seconds)
    if (company.otp_rate_limit_reset && new Date() < company.otp_rate_limit_reset) {
      const waitSec = Math.ceil((company.otp_rate_limit_reset.getTime() - Date.now()) / 1000);
      return res.status(429).json({ message: `Please wait ${waitSec} seconds before requesting another verification link.` });
    }

    // Generate secure random token (32 bytes)
    const crypto = require('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    company.email_verification_token = hashedToken;
    company.email_verification_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    company.otp_rate_limit_reset = new Date(Date.now() + 60 * 1000); // 1 minute cooldown
    await company.save();

    // Verification URL pointing to the frontend
    const origin = req.headers.origin || 'http://localhost:5173';
    const verifyUrl = `${origin}/company/verify-email/${rawToken}`;

    // Send professional HTML email using Nodemailer
    const subject = "Verify Your Official Company Email";
    const text = `Please verify your official company email to continue employer verification on WorknAI by opening this URL: ${verifyUrl}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-bottom: 12px; font-weight: 800; font-size: 20px;">Verify Your Official Company Email</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Please verify your official company email to continue employer verification on WorknAI.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${verifyUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
            Verify Company Email
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">
          This link is valid for 24 hours. If you did not request this, please ignore this email.
        </p>
      </div>
    `;

    await sendEmail(company.official_work_email, subject, text, html);

    res.json({ 
      message: 'Verification link sent successfully to official work email',
      verifyUrl 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyCompanyEmailLink = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    // Hash incoming token
    const crypto = require('crypto');
    const hashedInput = crypto.createHash('sha256').update(token).digest('hex');

    // Find company with valid token
    const company = await Company.findOne({
      email_verification_token: hashedInput
    });

    if (!company) {
      return res.status(400).json({ message: 'Invalid verification link or link already used.' });
    }

    if (new Date() > company.email_verification_expiry) {
      return res.status(400).json({ message: 'Verification link has expired. Please request a new link.' });
    }

    // Update Verification State
    company.email_verified = true;
    company.email_verified_at = new Date();
    company.email_verification_token = undefined;
    company.email_verification_expiry = undefined;

    // Recalculate/Increment Trust Score (+20)
    company.trust_score = Math.min(100, (company.trust_score || 0) + 20);
    await company.save();

    // Create Audit Log
    await new TrustLog({
      action: 'official_email_verified_link',
      adminId: req.user ? req.user.id : company.owner_user_id, // Fallback if direct link hit without active session
      targetId: company._id,
      targetType: 'company',
      details: 'Successfully verified official company email via secure verification link'
    }).save();

    // Notify Admins
    const admins = await Candidate.find({ role: { $in: ['Platform Admin', 'superAdmin'] } });
    const adminEmails = admins.map(a => a.email);
    if (adminEmails.length > 0) {
      const emailHtml = `
        <h3>Official Company Email Verified</h3>
        <p>A registering company has verified its official work email.</p>
        <ul>
          <li><strong>Company:</strong> ${company.name}</li>
          <li><strong>Official Email:</strong> ${company.official_work_email}</li>
          <li><strong>Verified At:</strong> ${company.email_verified_at.toISOString()}</li>
          <li><strong>New Trust Score:</strong> ${company.trust_score}%</li>
        </ul>
      `;
      // Send alert email
      await sendEmail(adminEmails[0], `Notification: Official Company Email Verified - ${company.name}`, emailHtml);
    }

    res.json({ 
      success: true, 
      message: 'Official company email verified successfully.', 
      companyName: company.name,
      trustScore: company.trust_score
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateVerificationField = async (req, res) => {
  try {
    const { companyId, field, value } = req.body;
    
    if (!companyId) return res.status(400).json({ message: 'companyId is required' });
    if (!field) return res.status(400).json({ message: 'field is required' });
    if (value === undefined) return res.status(400).json({ message: 'value is required' });

    const allowedFields = [
      'website_verified',
      'gst_verified',
      'cin_verified',
      'pan_verified',
      'documents_verified',
      'email_verified',
      'logo_verified',
      'google_verified',
      'duplicate_checked'
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: `Field ${field} is not allowed for dynamic verification updates` });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const oldValue = company[field];
    company[field] = value;

    // Synchronize to nested verification_checklist subfields as requested
    if (!company.verification_checklist) {
      company.verification_checklist = {};
    }
    if (field === 'website_verified') {
      company.verification_checklist.website_active = value;
    } else if (field === 'logo_verified') {
      company.verification_checklist.logo_verified = value;
    } else if (field === 'google_verified') {
      company.verification_checklist.google_presence = value;
    } else if (field === 'duplicate_checked') {
      company.verification_checklist.no_duplicates = value;
    }

    // Synchronize individual CompanyDocument records based on field updates
    const docStatus = value ? 'approved' : 'pending';
    if (field === 'gst_verified') {
      await CompanyDocument.updateMany({ company_id: company._id, document_type: 'gst_cert' }, { verification_status: docStatus });
    } else if (field === 'pan_verified') {
      await CompanyDocument.updateMany({ company_id: company._id, document_type: 'pan_card' }, { verification_status: docStatus });
    } else if (field === 'cin_verified') {
      await CompanyDocument.updateMany({ company_id: company._id, document_type: 'company_proof' }, { verification_status: docStatus });
    } else if (field === 'documents_verified') {
      await CompanyDocument.updateMany({ company_id: company._id }, { verification_status: docStatus });
    }

    // Auto verification logic: documents_verified
    // If gst_verified, pan_verified, and cin_verified are all true, documents_verified should auto-update to true.
    if (company.gst_verified && company.pan_verified && company.cin_verified) {
      company.documents_verified = true;
      // Also auto-approve all documents in collection
      await CompanyDocument.updateMany({ company_id: company._id }, { verification_status: 'approved' });
    }

    // Auto overall verification status
    // If email_verified && website_verified && documents_verified are all true, verification_status = "approved"
    if (company.email_verified && company.website_verified && company.documents_verified) {
      company.verification_status = 'approved';
    } else {
      company.verification_status = 'pending';
    }

    // Capture changes to save
    await company.save();

    // Store in Audit Logs (TrustLog)
    await new TrustLog({
      action: 'Updated Verification Field',
      adminId: req.user.id,
      targetId: company._id,
      targetType: 'company',
      details: `Field "${field}" updated from ${oldValue} to ${value}. Auto-documents: ${company.documents_verified}. Status: ${company.verification_status}.`
    }).save();

    // Fetch and attach documents and fraudChecklist so the frontend does not lose them on update!
    const docs = await CompanyDocument.find({ company_id: company._id });
    
    // Duplicate count for checklist
    const duplicateCount = await Company.countDocuments({
      _id: { $ne: company._id },
      $or: [
        { name: company.name },
        { website_url: company.website_url && company.website_url !== '' ? company.website_url : 'NO_URL' },
        { email: company.email }
      ]
    });
    const checklistDB = company.verification_checklist || {};
    const fraudChecklist = {
      websiteActive: checklistDB.website_active !== null && checklistDB.website_active !== undefined ? checklistDB.website_active : !!company.website_url,
      googlePresence: checklistDB.google_presence !== null && checklistDB.google_presence !== undefined ? checklistDB.google_presence : null, 
      noDuplicates: checklistDB.no_duplicates !== null && checklistDB.no_duplicates !== undefined ? checklistDB.no_duplicates : duplicateCount === 0,
      logoVerification: checklistDB.logo_verified !== null && checklistDB.logo_verified !== undefined ? checklistDB.logo_verified : null
    };

    const companyObj = company.toObject();
    companyObj.documents = docs;
    companyObj.fraudChecklist = fraudChecklist;

    res.json({ 
      success: true, 
      message: 'Company verification updated successfully',
      company: companyObj
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
