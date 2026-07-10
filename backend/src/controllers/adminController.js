const Candidate = require("../models/Candidate");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Ticket = require("../models/Ticket");
const CompanyDocument = require("../models/CompanyDocument");
const TrustLog = require("../models/TrustLog");
const sendEmail = require("../utils/sendEmail");

// Helper to send beautiful premium company approval email
const sendCompanyApprovalEmail = async (company) => {
  try {
    const emailTo = company.email || company.official_work_email;
    if (!emailTo) {
      console.log(`[Email Notice]: No registered email found for company ${company.name}`);
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const subject = "Congratulations! Your company is approved - ITjobx";

    const textContent = `Congratulations! 🎉

Your company has been successfully verified and approved on the ITjobx platform.

You can now start using employer features, including:
• Creating and managing job posts
• Hiring candidates
• Accessing employer dashboard features
• Managing applications and recruitment activities

Your account is now active and ready to use.

We’re excited to have your company onboard and look forward to supporting your hiring journey.

If you need any assistance, feel free to contact our support team.

Best Regards,
ITjobx Verification Team
ITjobx Technologies`;

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 30px;">
           <h1 style="color: #10b981; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ITjobx</h1>
           <p style="color: #64748b; font-size: 14px; margin-top: 5px; font-weight: 500;">Your Gateway to Elite Talent</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
           <div style="display: inline-block; background-color: #f0fdf4; border-radius: 50%; padding: 16px; margin-bottom: 15px;">
              <span style="font-size: 40px; line-height: 1;">🎉</span>
           </div>
           <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700;">Congratulations!</h2>
           <p style="color: #475569; font-size: 16px; margin-top: 8px; line-height: 1.5;">Your company, <strong style="color: #10b981;">${company.name}</strong>, has been successfully verified and approved on the ITjobx platform.</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
           <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 16px; font-weight: 600;">You can now start using employer features, including:</h3>
           <ul style="margin: 0; padding-left: 0; list-style-type: none;">
              <li style="margin-bottom: 12px; color: #334155; font-size: 15px;">
                 <span style="color: #10b981; margin-right: 8px; font-weight: bold; font-size: 16px;">•</span>
                 Creating and managing job posts
              </li>
              <li style="margin-bottom: 12px; color: #334155; font-size: 15px;">
                 <span style="color: #10b981; margin-right: 8px; font-weight: bold; font-size: 16px;">•</span>
                 Hiring candidates
              </li>
              <li style="margin-bottom: 12px; color: #334155; font-size: 15px;">
                 <span style="color: #10b981; margin-right: 8px; font-weight: bold; font-size: 16px;">•</span>
                 Accessing employer dashboard features
              </li>
              <li style="margin-bottom: 0; color: #334155; font-size: 15px;">
                 <span style="color: #10b981; margin-right: 8px; font-weight: bold; font-size: 16px;">•</span>
                 Managing applications and recruitment activities
              </li>
           </ul>
        </div>

        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
           Your account is now active and ready to use. We’re excited to have your company onboard and look forward to supporting your hiring journey.
        </p>

        <div style="text-align: center; margin-bottom: 35px;">
           <a href="${frontendUrl}/dashboard" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: all 0.2s;">
              Go to Employer Dashboard
           </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 25px; text-align: center;">
           If you need any assistance, feel free to contact our support team.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 25px;">

        <div style="text-align: center; color: #64748b; font-size: 14px; line-height: 1.5;">
           <p style="margin: 0; font-weight: 600;">Best Regards,</p>
           <p style="margin: 4px 0 0 0; color: #0f172a; font-weight: 700;">ITjobx Verification Team</p>
           <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">ITjobx Technologies</p>
        </div>
      </div>
    `;

    await sendEmail(emailTo, subject, textContent, htmlContent);
    console.log(`[Email Success]: Verification approval email sent to ${emailTo}`);
  } catch (error) {
    console.error(`[Email Error]: Failed to send company approval email:`, error);
  }
};

// Helper to send beautiful premium company rejection email
const sendCompanyRejectionEmail = async (company, reason) => {
  try {
    const emailTo = company.email || company.official_work_email;
    if (!emailTo) {
      console.log(`[Email Notice]: No registered email found for company ${company.name}`);
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const subject = "Registration Rejected - Action Required: ITjobx Platform Verification";
    const rejectionDate = new Date().toLocaleString();

    const textContent = `Company Verification Status: Rejected

Dear partner, your company registration request for "${company.name}" has been rejected.

Reason: ${reason}
Date & Time: ${rejectionDate}

Please update and resubmit your details.
Best Regards,
ITjobx Verification Team`;

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px 30px; border: 1px solid #fee2e2; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.03);">
        <div style="text-align: center; margin-bottom: 30px;">
           <h1 style="color: #ef4444; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ITjobx</h1>
           <p style="color: #64748b; font-size: 14px; margin-top: 5px; font-weight: 500;">Verification and Compliance</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
           <div style="display: inline-block; background-color: #fef2f2; border-radius: 50%; padding: 16px; margin-bottom: 15px;">
              <span style="font-size: 40px; line-height: 1;">❌</span>
           </div>
           <h2 style="color: #991b1b; margin: 0; font-size: 24px; font-weight: 700;">Company Verification Rejected</h2>
           <p style="color: #475569; font-size: 16px; margin-top: 8px; line-height: 1.5;">Your company registration request for <strong>${company.name}</strong> was rejected by the Platform Administration.</p>
        </div>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
           <h3 style="color: #991b1b; margin-top: 0; margin-bottom: 10px; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Rejection Details:</h3>
           <p style="margin: 0; color: #7f1d1d; font-size: 15px; font-weight: 600; line-height: 1.6;">"${reason}"</p>
           
           <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #fca5a5; font-size: 12px; color: #991b1b; font-weight: 700;">
              <strong>Date & Time of Rejection:</strong> ${rejectionDate}
           </div>
        </div>

        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
           Please log back into ITjobx, review your profile and documents (such as your GST document), update any outdated/incorrect details, and resubmit your registration for verification.
        </p>

        <div style="text-align: center; margin-bottom: 35px;">
           <a href="${frontendUrl}/company/register" style="display: inline-block; background-color: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2); transition: all 0.2s;">
              Update & Resubmit Application
           </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 25px; text-align: center;">
           <strong>Need assistance?</strong> Contact our support team via email at <a href="mailto:support@ITjobx.ai" style="color: #ef4444; text-decoration: none; font-weight: bold;">support@ITjobx.ai</a> or reach out through the employer portal.
        </p>

        <hr style="border: none; border-top: 1px solid #fee2e2; margin-bottom: 25px;">

        <div style="text-align: center; color: #64748b; font-size: 14px; line-height: 1.5;">
           <p style="margin: 0; font-weight: 600;">Best Regards,</p>
           <p style="margin: 4px 0 0 0; color: #991b1b; font-weight: 700;">ITjobx Verification Team</p>
           <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">ITjobx Technologies</p>
        </div>
      </div>
    `;

    await sendEmail(emailTo, subject, textContent, htmlContent);
    console.log(`[Email Success]: Verification rejection email sent to ${emailTo}`);
  } catch (error) {
    console.error(`[Email Error]: Failed to send company rejection email:`, error);
  }
};

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
          role: "employer",
          is_employer: true,
          current_mode: 'employer'
        });
      }
    } else {
      company.status = "pending";
      company.verification_status = "pending";
    }

    await company.save();

    // Send email notification upon successful verification/approval
    if (company.isVerified) {
      await sendCompanyApprovalEmail(company);
    }

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
        role: "employer",
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

    // Send email notification upon successful verification/approval
    await sendCompanyApprovalEmail(company);

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

    // Log the verification rejection record to database
    const CompanyVerification = require("../models/CompanyVerification");
    await CompanyVerification.create({
      company_id: company._id,
      status: 'rejected',
      rejection_reason: reason,
      rejected_by: req.user.id || req.user._id,
      rejected_at: new Date()
    });

    // Append to TrustLog
    await new TrustLog({
      action: 'Platform Rejected',
      adminId: req.user.id || req.user._id,
      targetId: company._id,
      targetType: 'company',
      details: `Company request rejected. Reason: ${reason}`
    }).save();

    // Send beautiful corporate rejection email notification
    await sendCompanyRejectionEmail(company, reason);

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
    const jobs = await Job.find().populate("companyId", "name").lean();

    // Map companyId to company for frontend compatibility
    const mappedJobs = jobs.map(job => ({
      ...job,
      company: job.companyId
    }));

    res.json(mappedJobs);
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
