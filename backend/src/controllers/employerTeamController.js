const CompanyTeamMember = require("../models/CompanyTeamMember");
const Company = require("../models/Company");
const Candidate = require("../models/Candidate");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper to get default permissions for a role
const getRolePermissions = (role) => {
  switch (role) {
    case "employer_admin":
      return [
        "full_access",
        "manage_team",
        "manage_jobs",
        "manage_billing",
        "view_analytics",
        "manage_company_profile",
      ];
    case "talent_acquisition":
      return [
        "create_jobs",
        "source_candidates",
        "view_candidates",
        "manage_pipeline",
      ];
    case "hiring_manager":
      return [
        "review_candidates",
        "interview_feedback",
        "view_jobs",
        "shortlist_candidates",
      ];
    case "hr_recruiter":
      return [
        "manage_pipeline",
        "schedule_interviews",
        "communicate_candidates",
      ];
    case "interview_panel":
      return ["conduct_interviews", "submit_feedback", "view_candidates"];
    case "hr_admin":
      return [
        "manage_employees",
        "manage_payroll",
        "manage_leave_policies",
        "manage_hr_documents",
        "view_all_candidates",
        "view_analytics",
        "manage_onboarding",
        "manage_compliance",
      ];
    case "recruitment_coordinator":
      return [
        "coordinate_job_postings",
        "manage_candidate_pipeline",
        "schedule_interviews",
        "communicate_candidates",
        "track_recruitment_metrics",
        "manage_job_applications",
        "generate_recruitment_reports",
      ];
    case "interview_coordinator":
      return [
        "schedule_interviews",
        "coordinate_interview_panels",
        "send_interview_invites",
        "manage_interview_slots",
        "collect_feedback",
        "view_candidates",
        "update_interview_status",
      ];
    case "onboarding_manager":
      return [
        "manage_onboarding_process",
        "send_offer_letters",
        "manage_documents_collection",
        "track_joining_status",
        "communicate_new_hires",
        "manage_onboarding_checklist",
        "coordinate_with_hr_admin",
      ];
    default:
      return [];
  }
};

// 1. Invite Team Member
exports.inviteTeamMember = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;

    if (!firstName || !lastName || !email || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields (firstName, lastName, email, phone, role) are required",
      });
    }

    // Backend Security: Prevent creating employer_admin unless current user is platform_admin or super_admin
    if (role === "employer_admin") {
      if (!req.user || (req.user.role !== "platform_admin" && req.user.role !== "super_admin")) {
        return res.status(403).json({
          success: false,
          message: "Employer Admin role cannot be assigned here"
        });
      }
    }

    // Find the company of the logged-in user
    const company = await Company.findOne({ owner_user_id: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Your company profile was not found. Please register first.",
      });
    }

    // Check plan limits for team member invites
    const Plan = require("../models/Plan");
    let plan = null;
    if (company.plan_id) {
      plan = await Plan.findById(company.plan_id);
    } else {
      plan = await Plan.findOne({ plan_type: "free" });
    }

    if (plan && plan.limits && plan.limits.team_members !== -1) {
      const activeTeamMembersCount = await CompanyTeamMember.countDocuments({
        company_id: company._id,
        status: { $in: ["active", "pending"] },
      });
      const allowedInvitedSeats = plan.limits.team_members - 1;
      if (activeTeamMembersCount >= allowedInvitedSeats) {
        return res.status(403).json({
          success: false,
          message: `Team size limit exceeded. Your current plan "${plan.plan_name}" allows up to ${plan.limits.team_members} total seats (including 1 default Owner Admin + ${allowedInvitedSeats} invited team members). Please upgrade your plan.`
        });
      }
    }

    // Check if duplicate invitation in the same company
    const existingMember = await CompanyTeamMember.findOne({
      company_id: company._id,
      email: email.toLowerCase(),
      status: { $ne: "removed" },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: `A team member with email ${email} already exists or has a pending invitation in your company.`,
      });
    }

    // Generate token and expiry (24 hours from now)
    const invitation_token = crypto.randomBytes(32).toString("hex");
    const token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const permissions = getRolePermissions(role);

    // Save company team member record
    const teamMember = new CompanyTeamMember({
      company_id: company._id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      role,
      permissions,
      invited_by: req.user.id,
      status: "pending",
      invitation_token,
      token_expires_at,
      invitation_sent_at: new Date(),
    });

    await teamMember.save();

    const acceptLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/employer/accept-invite?token=${invitation_token}`;

    // Send email using existing template/helpers
    let emailSent = false;
    try {
      const { sendInviteEmail } = require("../utils/emailTemplates");
      const inviterName = req.user.name || "An Administrator";
      await sendInviteEmail(
        email,
        `${firstName} ${lastName}`,
        acceptLink,
        role.replace("_", " ").toUpperCase()
      );
      emailSent = true;
    } catch (err) {
      console.warn("SMTP email dispatch failed, providing direct registration link instead:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Team member invitation created successfully",
      teamMember,
      acceptLink, // Return link so they can test/register even if SMTP fails
      emailSent,
    });
  } catch (error) {
    console.error("Invite Team Member Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Team Members
exports.getTeam = async (req, res) => {
  try {
    // Check if caller is owner company or associated team member
    let companyId;

    // Check if caller is company owner
    const company = await Company.findOne({ owner_user_id: req.user.id });
    if (company) {
      companyId = company._id;
    } else {
      // Check if caller is a team member
      const activeMember = await CompanyTeamMember.findOne({ user_id: req.user.id, status: "active" });
      if (activeMember) {
        companyId = activeMember.company_id;
      }
    }

    if (!companyId) {
      return res.status(403).json({ success: false, message: "Unauthorized company access" });
    }

    const team = await CompanyTeamMember.find({
      company_id: companyId,
      status: { $ne: "removed" },
    }).sort("-createdAt");

    res.json({ success: true, team });
  } catch (error) {
    console.error("Get Team Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Invite Details by Token
exports.getInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const teamMember = await CompanyTeamMember.findOne({ invitation_token: token });
    if (!teamMember) {
      return res.status(404).json({ success: false, message: "Invitation not found or invalid token" });
    }

    if (teamMember.status !== "pending") {
      return res.status(400).json({ success: false, message: "Invitation has already been accepted or deactivated" });
    }

    if (new Date() > teamMember.token_expires_at) {
      return res.status(400).json({ success: false, message: "Invitation has expired. Please contact your company administrator to resend it." });
    }

    const company = await Company.findById(teamMember.company_id);

    res.json({
      success: true,
      teamMember: {
        firstName: teamMember.firstName,
        lastName: teamMember.lastName,
        email: teamMember.email,
        role: teamMember.role,
      },
      companyName: company ? company.name : "ITjobx Corporate Partner",
    });
  } catch (error) {
    console.error("Get Invite Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Accept Invite and Activate Account
exports.acceptInvite = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    const teamMember = await CompanyTeamMember.findOne({ invitation_token: token });
    if (!teamMember) {
      return res.status(404).json({ success: false, message: "Invitation invalid" });
    }

    if (teamMember.status !== "pending") {
      return res.status(400).json({ success: false, message: "Invitation already accepted or invalid" });
    }

    if (new Date() > teamMember.token_expires_at) {
      return res.status(400).json({ success: false, message: "Invitation expired" });
    }

    // Check if user account with this email already exists
    let user = await Candidate.findOne({ email: teamMember.email.toLowerCase() });

    if (user) {
      // If user exists, link them and update mode
      user.is_employer = true;
      user.current_mode = "employer";
      user.company_id = teamMember.company_id;
      user.password = password; // pre save hooks will hash it!
      await user.save();
    } else {
      // Create a brand new Candidate user
      user = new Candidate({
        firstName: teamMember.firstName,
        lastName: teamMember.lastName,
        email: teamMember.email.toLowerCase(),
        phone: teamMember.phone,
        password: password, // will be hashed by mongoose pre-save hook
        role: "employer", // Role set as employer for general authorization
        is_employer: true,
        current_mode: "employer",
        company_id: teamMember.company_id,
        isVerified: true, // Auto verify invited emails
      });
      await user.save();
    }

    // Update CompanyTeamMember status
    teamMember.user_id = user._id;
    teamMember.status = "active";
    teamMember.joined_at = new Date();
    teamMember.invitation_token = null; // Clear token
    teamMember.token_expires_at = null;
    await teamMember.save();

    // Generate JWT Token
    const payload = {
      id: user._id,
      email: user.email,
      role: "employer",
      team_role: teamMember.role,
      permissions: teamMember.permissions,
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Account activated successfully!",
      token: jwtToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: "employer",
        team_role: teamMember.role,
        permissions: teamMember.permissions,
      },
    });
  } catch (error) {
    console.error("Accept Invite Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Resend Invite
exports.resendInvite = async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await CompanyTeamMember.findById(id);
    if (!teamMember) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    if (teamMember.status !== "pending") {
      return res.status(400).json({ success: false, message: "Can only resend pending invitations" });
    }

    const invitation_token = crypto.randomBytes(32).toString("hex");
    const token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

    teamMember.invitation_token = invitation_token;
    teamMember.token_expires_at = token_expires_at;
    teamMember.invitation_sent_at = new Date();
    await teamMember.save();

    const acceptLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/employer/accept-invite?token=${invitation_token}`;

    let emailSent = false;
    try {
      const { sendInviteEmail } = require("../utils/emailTemplates");
      await sendInviteEmail(
        teamMember.email,
        `${teamMember.firstName} ${teamMember.lastName}`,
        acceptLink,
        teamMember.role.replace("_", " ").toUpperCase()
      );
      emailSent = true;
    } catch (err) {
      console.warn("SMTP resend fail:", err.message);
    }

    res.json({
      success: true,
      message: "Invitation resent successfully",
      teamMember,
      acceptLink,
      emailSent,
    });
  } catch (error) {
    console.error("Resend Invite Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Update Team Member Role / Permissions
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const teamMember = await CompanyTeamMember.findById(id);
    if (!teamMember) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    if (role) {
      // Backend Security: Prevent updating to employer_admin unless current user is platform_admin or super_admin
      if (role === "employer_admin") {
        if (!req.user || (req.user.role !== "platform_admin" && req.user.role !== "super_admin")) {
          return res.status(403).json({
            success: false,
            message: "Employer Admin role cannot be assigned here"
          });
        }
      }
      teamMember.role = role;
      teamMember.permissions = getRolePermissions(role);
    }

    if (status) {
      teamMember.status = status;
    }

    await teamMember.save();

    // If active and role has been updated, also update any current cached/live candidate roles if necessary
    res.json({
      success: true,
      message: "Team member details updated successfully",
      teamMember,
    });
  } catch (error) {
    console.error("Update Team Member Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Delete Team Member (Set status to 'removed')
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await CompanyTeamMember.findById(id);
    if (!teamMember) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    teamMember.status = "removed";
    teamMember.invitation_token = null;
    await teamMember.save();

    res.json({
      success: true,
      message: "Team member access removed successfully",
    });
  } catch (error) {
    console.error("Delete Team Member Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
