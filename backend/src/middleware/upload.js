const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "jobportal",
    resource_type: "auto", // 🔥 MUST (PDF, DOC, etc.)
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

const upload = multer({ storage });

// Memory storage for parsing
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 5MB limit
});

module.exports = { upload, memoryUpload };