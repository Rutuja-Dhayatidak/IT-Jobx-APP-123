const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const employerOnly = require("../middleware/employerOnly");
const teamController = require("../controllers/employerTeamController");

// Helper middleware to check if user is an Employer Admin (either Company Owner or invited Admin)
const verifyEmployerAdmin = async (req, res, next) => {
  try {
    const Company = require("../models/Company");
    const isOwner = await Company.findOne({ owner_user_id: req.user.id });
    if (isOwner) {
      return next();
    }

    const CompanyTeamMember = require("../models/CompanyTeamMember");
    const activeAdmin = await CompanyTeamMember.findOne({
      user_id: req.user.id,
      role: "employer_admin",
      status: "active",
    });

    if (activeAdmin) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. Only Employer Administrators can manage the company team.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UNPROTECTED ROUTES ---
// Get invitation details (used when setting up password)
router.get("/invite/:token", teamController.getInvite);
// Accept invitation (submits password to activate account)
router.post("/accept-invite", teamController.acceptInvite);

// --- PROTECTED ROUTES (Login & Employer Role Required) ---
router.use(verifyToken, employerOnly);

// Get company team members list (Accessible by all active company team members)
router.get("/", teamController.getTeam);

// --- ADMIN-ONLY PROTECTED ROUTES ---
const { checkSeatLimit } = require("../middleware/checkSubscription");
router.post("/invite", verifyEmployerAdmin, checkSeatLimit, teamController.inviteTeamMember);
router.post("/resend-invite/:id", verifyEmployerAdmin, checkSeatLimit, teamController.resendInvite);
router.put("/:id", verifyEmployerAdmin, teamController.updateTeamMember);
router.delete("/:id", verifyEmployerAdmin, teamController.deleteTeamMember);

module.exports = router;
