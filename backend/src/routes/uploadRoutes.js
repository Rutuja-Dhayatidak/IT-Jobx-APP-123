const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const verifyToken = require("../middleware/verifyToken");

const { secureMulter } = require("../config/upload.config");
const validateUploadedFile = require("../middlewares/validateUploadedFile");
const { UploadCategories } = require("../constants/upload.constants");
const { resumeUploadRateLimiter, profileImageUploadRateLimiter } = require("../middlewares/fileUploadRateLimiter");

// Safe Profile image upload (Public asset)
router.post(
  "/file",
  verifyToken,
  profileImageUploadRateLimiter,
  secureMulter.single("file"),
  validateUploadedFile(UploadCategories.PROFILE_IMAGE),
  
  uploadController.uploadFile
);

// Safe Resume upload and parse (Private/Authenticated asset)
router.post(
  "/resume",
  verifyToken,
  resumeUploadRateLimiter,
  secureMulter.single("file"),
  validateUploadedFile(UploadCategories.RESUME),
  uploadController.uploadResume
);

module.exports = router;
