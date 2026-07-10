const Candidate = require("../models/Candidate");
const Company = require("../models/Company");
const Job = require("../models/Job");
const AdminInvite = require("../models/AdminInvite");
const crypto = require("crypto");
const { sendInviteEmail } = require("../utils/emailTemplates");

// 📊 Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCompanies, totalJobs] = await Promise.all([
      Candidate.countDocuments({ role: "candidate" }),
      Company.countDocuments(),
      Job.countDocuments(),
    ]);

    res.json({ totalUsers, totalCompanies, totalJobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👥 Candidates
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ role: "candidate" }).select("-password").sort("-createdAt");
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🛡️ Admin Management
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const existingUser = await Candidate.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists with this email" });

    // Default permissions map
    const defaultPermissions = {
      'Moderator': ['VIEW_REPORTS', 'REVIEW_REPORT', 'BAN_USER', 'WARN_USER', 'APPROVE_JOB', 'REJECT_JOB'],
      'trust_safety': ['VIEW_REPORTS', 'REVIEW_REPORT', 'BAN_USER', 'WARN_USER', 'APPROVE_JOB', 'REJECT_JOB'],
      'Trust & Safety': ['VIEW_REPORTS', 'REVIEW_REPORT', 'BAN_USER', 'WARN_USER', 'APPROVE_JOB', 'REJECT_JOB'],
      'Platform Admin': ['VIEW_USERS', 'VIEW_JOBS', 'VERIFY_COMPANY'],
      'Ops Admin': ['VIEW_USERS', 'VIEW_JOBS', 'VIEW_REPORTS'],
      'Support Admin': ['VIEW_TICKETS', 'RESOLVE_TICKET']
    };

    // Create pending user
    const nameParts = name.split(" ");
    const newAdmin = await Candidate.create({
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" ") || "Admin",
      email,
      role,
      status: "pending",
      permissions: defaultPermissions[role] || [],
      password: crypto.randomBytes(16).toString("hex"), // Temp password
      createdBy: req.user?._id
    });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    await AdminInvite.create({
      userId: newAdmin._id,
      token
    });

    // Send Email
    const inviteLink = `${process.env.FRONTEND_URL}/activate-admin?token=${token}`;
    await sendInviteEmail(email, name, inviteLink, role);

    res.json({ message: "Invitation sent successfully", admin: newAdmin, inviteLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Candidate.find({ role: { $ne: "candidate" } }).select("-password").sort("-createdAt").lean();
    
    // Attach invite tokens for pending admins
    const adminsWithTokens = await Promise.all(admins.map(async (admin) => {
      if (admin.status === "pending") {
        const invite = await AdminInvite.findOne({ userId: admin._id, isUsed: false });
        if (invite) {
          admin.inviteLink = `${process.env.FRONTEND_URL}/activate-admin?token=${invite.token}`;
        }
      }
      return admin;
    }));

    res.json(adminsWithTokens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.revokeAdmin = async (req, res) => {
  try {
    const admin = await Candidate.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    
    admin.status = "blocked";
    admin.isBlocked = true;
    await admin.save();
    
    res.json({ message: "Admin access revoked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const admin = await Candidate.findById(req.params.id);
    
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (name) {
      const nameParts = name.split(" ");
      admin.firstName = nameParts[0];
      admin.lastName = nameParts.slice(1).join(" ") || "";
    }
    
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (status) admin.status = status;

    await admin.save();
    res.json({ message: "Admin updated successfully", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleSuspendAdmin = async (req, res) => {
  try {
    const admin = await Candidate.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.status === "suspended") {
      admin.status = "active";
      admin.isBlocked = false;
    } else {
      admin.status = "suspended";
      admin.isBlocked = true; // Still block access
    }

    await admin.save();
    res.json({ message: `Admin ${admin.status === "suspended" ? "suspended" : "activated"} successfully`, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rest of the controllers...
exports.toggleBlockCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    // Capture old data
    req.oldData = candidate.toObject();

    // Set dynamic action name for audit log
    req.actionName = candidate.isBlocked ? "UNBLOCK" : "BLOCK";

    candidate.isBlocked = !candidate.isBlocked;
    candidate.status = candidate.isBlocked ? "blocked" : "active";
    await candidate.save();

    // Capture new data and set description for audit log
    req.newData = candidate.toObject();
    req.description = `Candidate ${candidate.firstName} ${candidate.lastName} ${candidate.isBlocked ? "blocked" : "unblocked"} by admin`;

    res.json({ message: `Candidate ${candidate.isBlocked ? "blocked" : "unblocked"}`, candidate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort("-createdAt");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json({ message: "Company verified", company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("company", "name").sort("-createdAt");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Capture old data
    const oldJob = await Job.findById(req.params.id);
    if (oldJob) req.oldData = oldJob.toObject();

    const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: `Job ${status}`, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.overrideUserStatus = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: "BLOCK" | "UNBLOCK"
    if (!action || !reason) return res.status(400).json({ message: "Action and Reason are mandatory for override" });

    const user = await Candidate.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Capture old data
    req.oldData = user.toObject();

    user.isBlocked = action === "BLOCK";
    user.status = action === "BLOCK" ? "blocked" : "active";

    // Add to history (Visible to Platform Admin)
    if (!user.blockHistory) user.blockHistory = [];
    user.blockHistory.push({
      actionBy: req.user._id,
      adminName: (req.user.firstName || req.user.name || "Super Admin") + " " + (req.user.lastName || ""),
      role: "SUPER_ADMIN",
      action: action,
      reason: reason,
      visibleTo: "PLATFORM_ADMIN"
    });

    await user.save();

    // Audit log
    req.newData = user.toObject();
    req.actionName = `OVERRIDE_${action}`;
    req.reason = reason;
    req.description = `Super Admin overridden user ${user.email} to ${action}. Reason: ${reason}`;

    res.json({ message: `User status overridden to ${action} successfully`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBlockHistory = async (req, res) => {
  try {
    const user = await Candidate.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Visibility Logic
    // SUPER_ADMIN sees history where visibleTo = "SUPER_ADMIN"
    // PLATFORM_ADMIN sees history where visibleTo = "PLATFORM_ADMIN"
    
    const role = req.user.role === "superAdmin" ? "SUPER_ADMIN" : "PLATFORM_ADMIN";
    
    const history = user.blockHistory.filter(h => h.visibleTo === role);

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
