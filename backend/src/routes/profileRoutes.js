const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const verifyToken = require("../middleware/verifyToken");
const { body, validationResult } = require("express-validator");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/profile/me
router.get("/me", verifyToken, profileController.getMe);

// PUT /api/profile/update
router.put(
  "/update",
  verifyToken,
  [
    body("headline").optional().trim(),
    body("location").optional().trim(),
    body("about").optional().trim(),
    body("skills").optional().isArray().withMessage("Skills must be an array"),
    body("gender").optional().isIn(["Male", "Female", "Other", ""]).withMessage("Invalid gender value")
  ],
  validate,
  profileController.updateProfile
);

module.exports = router;
