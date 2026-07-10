const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");
const Role = require("../models/Role");
const { formatForUI } = require("../utils/permissionHelper");
const AdminInvite = require("../models/AdminInvite");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.SUPER_ADMIN_EMAIL &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email: email, role: "superAdmin" },
        process.env.JWT_SECRET || "nexthire_secret_key",
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Super Admin Login Successful",
        token,
        role: "superAdmin"
      });
    }

    const user = await Candidate.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status !== "active") {
      return res.status(403).json({ message: "Your account is pending activation or blocked." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Fetch permissions for the user's role
    // Fetch granular permissions from the Role collection (RBAC)
    const roleData = await Role.findOne({ name: user.role });
    if (roleData) {
      // Convert nested array from DB to object for frontend
      permissions = formatForUI(roleData.permissions);
    } else if (!user.permissions || Object.keys(user.permissions).length === 0) {
      // Auto-healing fallback if role doesn't exist in RBAC yet
      const defaultPermissions = {
        'platform admin': { 'Candidates': ['view'], 'Jobs': ['view'], 'Companies': ['view', 'approve'], 'Support': ['view'] },
        'finance admin': { 'Dashboard': ['view'], 'Revenue Analytics': ['view'], 'Payments': ['view'] },
        'ops admin': { 'Dashboard': ['view'], 'Users': ['view'], 'Jobs': ['view'] },
        'moderator': { 'Dashboard': ['view'], 'Reports': ['view'], 'Users': ['view'], 'Jobs': ['view'] },
        'support admin': { 'Dashboard': ['view'], 'Tickets': ['view'], 'Users Help': ['view'] }
      };
      
      const roleKey = user.role?.toLowerCase();
      permissions = defaultPermissions[roleKey] || {};
      
      // Save healed permissions to user as fallback
      user.permissions = permissions;
      await user.save();
    } else {
      permissions = user.permissions;
    }

    if (user.role === "superAdmin") {
      permissions = { '*': ['*'] };
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, permissions: user.permissions || [] },
      process.env.JWT_SECRET || "nexthire_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      permissions,
      user: { _id: user._id, firstName: user.firstName, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(401).json({ message: err.message || "Invalid credentials" });
  }
};

exports.verifyInvite = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Verifying token:", token);
    const invite = await AdminInvite.findOne({ token, isUsed: false });

    if (!invite) return res.status(400).json({ message: "Invalid or used invitation link" });
    if (new Date() > invite.expiresAt) return res.status(400).json({ message: "Invitation link has expired" });

    const user = await Candidate.findById(invite.userId).select("firstName lastName email role");
    res.json({ message: "Token valid", user });
  } catch (err) {
    console.error("Verify Invite Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.activateAdmin = async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log("Activating admin with token...");

    const invite = await AdminInvite.findOne({ token, isUsed: false });
    if (!invite) return res.status(400).json({ message: "Invalid invitation" });

    const user = await Candidate.findById(invite.userId);
    if (!user) return res.status(404).json({ message: "Admin user not found" });

    console.log("Updating password and status for:", user.email);
    user.password = password; 
    user.status = "active";
    user.isVerified = true;
    
    await user.save();
    console.log("User saved successfully");

    invite.isUsed = true;
    await invite.save();
    console.log("Invite marked as used");

    res.json({ message: "Account activated successfully! You can now log in." });
  } catch (err) {
    console.error("Activate Admin Error:", err);
    res.status(500).json({ message: err.message });
  }
};
