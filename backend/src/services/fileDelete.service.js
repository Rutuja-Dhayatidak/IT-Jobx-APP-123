const crypto = require("crypto");
const FileMetadata = require("../models/FileMetadata");
const { deleteFromCloudinary } = require("./fileStorage.service");

/**
 * Calculates SHA-256 checksum of a file buffer.
 */
function calculateBufferChecksum(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Safely deletes a file metadata record and its backing storage resource.
 */
async function deleteFileRecord(ownerId, category) {
  const record = await FileMetadata.findOne({ ownerId, category });
  if (!record) return false;

  // 1. Delete from Cloudinary
  const resourceType = category === "resume" || category === "document" ? "raw" : "image";
  await deleteFromCloudinary(record.publicId, resourceType);

  // 2. Delete database metadata record
  await FileMetadata.deleteOne({ _id: record._id });
  return true;
}

module.exports = {
  calculateBufferChecksum,
  deleteFileRecord
};
