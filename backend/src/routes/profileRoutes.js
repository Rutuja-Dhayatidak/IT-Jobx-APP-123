const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const verifyToken = require("../middleware/verifyToken");
const validateRequest = require("../middlewares/validateRequest");
const { updateProfileSchema } = require("../validations/user.validation");

// GET /api/profile/me
router.get("/me", verifyToken, profileController.getMe);

// PUT /api/profile/update
router.put(
  "/update",
  verifyToken,
  validateRequest(updateProfileSchema),
  profileController.updateProfile
);

module.exports = router;
