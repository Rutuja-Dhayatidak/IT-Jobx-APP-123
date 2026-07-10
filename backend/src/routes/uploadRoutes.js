const express = require("express");
const router = express.Router();
const { upload, memoryUpload } = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");
const verifyToken = require("../middleware/verifyToken");

// Basic file upload (Already implemented)
router.post("/file", verifyToken, memoryUpload.single("file"), uploadController.uploadFile);

// Resume upload and parse
router.post(
  "/resume",
  verifyToken,
  (req, res, next) => {
    memoryUpload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadController.uploadResume
);

module.exports = router;
