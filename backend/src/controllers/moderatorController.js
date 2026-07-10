const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const Company = require('../models/Company');

// Helper to log actions
const logAction = async (moderatorId, actionType, targetId, targetType, details) => {
  try {
    await new ActivityLog({ moderatorId, actionType, targetId, targetType, details }).save();
  } catch (err) {
    console.error("Log failed:", err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Candidate.findOne({ email });
    
    if (!user || !['moderator', 'trust_safety', 'superAdmin'].includes(user.role)) {
      return res.status(401).json({ message: "Invalid credentials or unauthorized role" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, permissions: user.permissions || [] },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, permissions: user.permissions || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, pending, resolved] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'Pending' }),
      Report.countDocuments({ status: 'Resolved' })
    ]);
    const activeMods = await Candidate.countDocuments({ role: 'moderator' });
    res.json({ total, pending, resolved, activeMods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort('-createdAt');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reviewReport = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status, adminNotes: notes }, { new: true });
    
    await logAction(req.user.id, 'REVIEW_REPORT', report._id, 'report', `Status changed to ${status}`);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Candidate.find({ role: 'candidate' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await Candidate.findByIdAndUpdate(req.params.id, { isBlocked: true, status: 'blocked' }, { new: true });
    await logAction(req.user.id, 'BAN_USER', user._id, 'user', "User banned for violation");
    res.json({ message: "User banned" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await Candidate.findByIdAndUpdate(req.params.id, { isBlocked: false, status: 'active' }, { new: true });
    await logAction(req.user.id, 'UNBAN_USER', user._id, 'user', "User ban lifted");
    res.json({ message: "User access restored" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.warnUser = async (req, res) => {
  try {
    const { reason } = req.body;
    await logAction(req.user.id, 'WARN_USER', req.params.id, 'user', reason);
    res.json({ message: "Warning issued" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('companyId', 'name email logo industry company_size website_url company_location trust_safety_status risk_level is_escalated escalation_reason')
      .populate('postedBy', 'firstName lastName email')
      .sort('-createdAt');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    await logAction(req.user.id, 'APPROVE_JOB', job._id, 'job', "Job approved by Moderator, pending final Ops clearance");
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const { reason, feedback } = req.body;
    
    // Find and update the job with rejection details
    const job = await Job.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'rejected',
        rejectionReason: reason || "Content Policy Violation",
        rejectionNote: feedback || "",
        rejectionCategory: reason || "Content Policy Violation"
      }, 
      { new: true }
    ).populate('companyId').populate('postedBy');

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await logAction(
      req.user.id, 
      'REJECT_JOB', 
      job._id, 
      'job', 
      `Job rejected: ${reason || 'Content Policy Violation'}. Notes: ${feedback || 'None'}`
    );

    // Get the email address to notify
    const recipientEmail = job.companyId?.official_work_email || job.companyId?.email || job.postedBy?.email;
    
    if (recipientEmail) {
      try {
        await emailService.sendEmail({
          to: recipientEmail,
          template: 'job_rejected',
          payload: {
            jobTitle: job.title,
            reason: reason || "Content Policy Violation",
            note: feedback || "Please ensure all criteria (salary, job description quality) align with platform standard policies."
          }
        });
        console.log(`Rejection notification email dispatched to ${recipientEmail}`);
      } catch (mailErr) {
        console.error("Failed to send rejection email:", mailErr.message);
      }
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.escalateJob = async (req, res) => {
  try {
    const { reason, note } = req.body;
    
    // Find the job first to verify companyId exists
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Update Job status to 'under_review'
    job.status = 'under_review';
    await job.save();

    // Update associated Company's Trust & Safety escalation metrics
    if (job.companyId) {
      await Company.findByIdAndUpdate(job.companyId, {
        trust_safety_status: 'escalated',
        is_escalated: true,
        escalation_reason: reason || "Suspicious Account/Job Activity",
        escalated_by: req.user.id,
        escalated_at: new Date(),
        risk_flagged: true,
        flagged_reason: note || "Moderator flagged account for suspicious scam case review."
      });
    }

    // Log the escalation activity
    await logAction(
      req.user.id, 
      'ESCALATE_JOB', 
      job._id, 
      'job', 
      `Job escalated to Trust & Safety: ${reason || 'Suspicious Activity'}. Comments: ${note || 'None'}`
    );

    res.json({ success: true, message: "Opportunity successfully escalated to Trust & Safety department", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.tsRejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: 'Trust & Safety Violation',
        rejectionNote: 'Company found fake, fraudulent, or suspicious by T&S.',
        rejectionCategory: 'Fraud/Scam'
      },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.companyId) {
      await Company.findByIdAndUpdate(job.companyId, {
        is_blocked: true,
        status: 'banned',
        trust_safety_status: 'banned',
        is_fraudulent: true
      });
    }

    await logAction(req.user.id, 'TS_REJECT_JOB', job._id, 'job', "T&S banned company and rejected job");
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.tsApproveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.companyId) {
      await Company.findByIdAndUpdate(job.companyId, {
        trust_safety_status: 'verified',
        is_fraudulent: false
      });
    }

    await logAction(req.user.id, 'TS_APPROVE_JOB', job._id, 'job', "T&S verified company, forwarded to Ops");
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.opsPublishJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    await logAction(req.user.id, 'OPS_PUBLISH_JOB', job._id, 'job', "Ops Admin performed final review and published job");
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate('moderatorId', 'firstName lastName').sort('-timestamp');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
