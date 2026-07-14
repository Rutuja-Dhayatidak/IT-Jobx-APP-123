const mongoose = require("mongoose");

const fileMetadataSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    ownerType: {
      type: String,
      required: true,
      enum: ["Candidate", "Company"]
    },
    category: {
      type: String,
      required: true,
      enum: ["resume", "profile-image", "company-logo", "document"]
    },
    storageProvider: {
      type: String,
      required: true,
      enum: ["cloudinary", "s3", "local"],
      default: "cloudinary"
    },
    publicId: {
      type: String,
      required: true
    },
    secureUrl: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    storedName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    extension: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    checksum: {
      type: String, // SHA-256
      required: true
    },
    scanStatus: {
      type: String,
      enum: ["PENDING_SCAN", "CLEAN", "REJECTED", "SCAN_FAILED"],
      default: "CLEAN"
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate uploads by the same user for identical file contents using checksum
fileMetadataSchema.index({ ownerId: 1, checksum: 1 }, { unique: true });

module.exports = mongoose.model("FileMetadata", fileMetadataSchema);
