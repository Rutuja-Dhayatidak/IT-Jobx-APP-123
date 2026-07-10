const Candidate = require("../models/Candidate");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Ticket = require("../models/Ticket");
const CompanyDocument = require("../models/CompanyDocument");
const TrustLog = require("../models/TrustLog");
const sendEmail = require("../utils/sendEmail");

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await Candidate.countDocuments({ role: "candidate" });
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();

    res.json({
      totalUsers,
      totalCompanies,
      totalJobs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User Management
exports.addCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await Candidate.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Candidate already exists" });

    const user = new Candidate({
      firstName,
      lastName,
      email,
      password, // Hashing happens in pre-save hook
      role: "candidate",
      status: "active",
      isVerified: true
    });

    await user.save();

    // Audit log capture
    req.newData = user.toObject();
    req.actionName = "CREATE";
    req.description = `New candidate account created: ${email}`;

    res.status(201).json({ message: "Candidate added successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Candidate.find({ role: "candidate" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await Candidate.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reason is mandatory for blocking/unblocking users" });

    // Capture OLD state before changes
    req.oldData = user.toObject();

    const newStatus = user.status === "blocked" ? "active" : "blocked";
    const action = newStatus === "blocked" ? "BLOCK" : "UNBLOCK";

    user.status = newStatus;
    user.isBlocked = newStatus === "blocked";

    // Add to history
    if (!user.blockHistory) user.blockHistory = [];
    user.blockHistory.push({
      actionBy: req.user?._id || req.user?.id,
      adminName: (req.user?.firstName || req.user?.name || "Admin"),
      role: req.user?.role || "PLATFORM_ADMIN",
      action: action,
      reason: reason,
      visibleTo: "SUPER_ADMIN"
    });

    await user.save();

    // Capture NEW state after changes
    req.newData = user.toObject();
    req.actionName = action;
    req.reason = reason;
    req.description = `User account ${user.email} ${action === 'BLOCK' ? 'blocked' : 'unblocked'} by platform admin. Reason: ${reason}`;

    res.json({ message: `User ${action === "BLOCK" ? "blocked" : "unblocked"} successfully` });
  } catch (err) {
    console.error("[Block Error]:", err.message);
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

// Company Management
exports.getCompanies = async (req, res) => {
  try {
    // Only return companies that have been reviewed by Trust & Safety (trust_safety_status is 'cleared' or 'flagged')
    // OR if the company is already approved/rejected (for historical records)
    const companies = await Company.find({
      $or: [
        { trust_safety_status: { $in: ['cleared', 'approved', 'flagged'] } },
        { status: { $in: ['approved', 'rejected'] } }
      ]
    }).sort('-createdAt');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.isVerified = !company.isVerified;
    if (company.isVerified) {
      company.status = "approved";
      company.verification_status = "approved";
      
      // Activate Employer Access roles
      if (company.owner_user_id) {
        await Candidate.findByIdAndUpdate(company.owner_user_id, {
          is_employer: true,
          current_mode: 'employer'
        });
      }
    } else {
      company.status = "pending";
      company.verification_status = "pending";
    }

    await company.save();

    res.json({ message: `Company ${company.isVerified ? "verified" : "unverified"} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.status = "approved";
    company.verification_status = "approved";
    company.isVerified = true;
    await company.save();

    if (company.owner_user_id) {
      await Candidate.findByIdAndUpdate(company.owner_user_id, {
        is_employer: true,
        current_mode: 'employer',
        company_role: 'owner'
      });
    }

    // Append to TrustLog
    await new TrustLog({
      action: 'Platform Approved',
      adminId: req.user.id || req.user._id,
      targetId: company._id,
      targetType: 'company',
      details: 'Company request approved and activated on the platform by Platform Admin'
    }).save();

    res.json({ message: "Company approved and activated successfully!", company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectCompany = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required." });
    }

    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.status = "rejected";
    company.verification_status = "rejected";
    company.isVerified = false;
    company.rejectionReason = reason;
    await company.save();

    // Append to TrustLog
    await new TrustLog({
      action: 'Platform Rejected',
      adminId: req.user.id || req.user._id,
      targetId: company._id,
      targetType: 'company',
      details: `Company request rejected. Reason: ${reason}`
    }).save();

    // Send email notification
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcfc;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #fee2e2; padding-bottom: 10px;">Registration Rejected</h2>
        <p>Dear Partner,</p>
        <p>Your company registration for <strong>${company.name}</strong> on NextHire has been rejected by our platform administration.</p>
        <p style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; font-weight: bold; color: #991b1b; border-radius: 4px;">
          Reason: "${reason}"
        </p>
        <p>You can log back in, update your registration documents or checklist details, and resubmit your request for another review.</p>
        <p style="margin-top: 20px; color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          NextHire Platform Administration & Compliance Team
        </p>
      </div>
    `;
    await sendEmail(company.email || company.official_work_email, 'Company Registration Status Update - NextHire', emailHtml);

    res.json({ message: "Company request rejected and email notification sent.", company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanyReviewDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('owner_user_id', 'firstName lastName email mobile_number');
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Auto-heal and synchronize individual document statuses with parent company verification fields
    if (company.documents_verified) {
      await CompanyDocument.updateMany({ company_id: company._id, verification_status: 'pending' }, { verification_status: 'approved' });
    } else {
      if (company.gst_verified) {
        await CompanyDocument.updateMany({ company_id: company._id, document_type: 'gst_cert', verification_status: 'pending' }, { verification_status: 'approved' });
      }
      if (company.pan_verified) {
        await CompanyDocument.updateMany({ company_id: company._id, document_type: 'pan_card', verification_status: 'pending' }, { verification_status: 'approved' });
      }
      if (company.cin_verified) {
        await CompanyDocument.updateMany({ company_id: company._id, document_type: 'company_proof', verification_status: 'pending' }, { verification_status: 'approved' });
      }
    }

    const documents = await CompanyDocument.find({ company_id: company._id });

    // Fetch and populate audit log details
    const logs = await TrustLog.find({ targetId: company._id })
      .populate('adminId', 'firstName lastName email role')
      .sort({ timestamp: -1 });

    res.json({ company, documents, logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.escalateCompany = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Escalation reason is required." });
    }

    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.trust_safety_status = 'escalated';
    company.is_escalated = true;
    company.escalation_reason = reason;
    company.escalated_by = req.user.id || req.user._id;
    company.escalated_at = new Date();
    await company.save();

    await new TrustLog({
      action: 'Escalated to Super Admin',
      adminId: req.user.id || req.user._id,
      targetId: company._id,
      targetType: 'company',
      details: `Escalated for Super Admin review. Reason: ${reason}`
    }).save();

    res.json({ message: "Company case escalated to Super Admin successfully", company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Job Management
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("company", "name");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Capture old data for audit logging
    req.oldData = job.toObject();

    job.status = job.status === "approved" ? "pending" : "approved";
    await job.save();

    res.json({ message: `Job ${job.status === "approved" ? "approved" : "set to pending"} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ticket Management
exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("user", "firstName lastName email");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = "resolved";
    await ticket.save();

    res.json({ message: "Ticket resolved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
