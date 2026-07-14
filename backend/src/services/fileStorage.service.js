const cloudinary = require("../config/cloudinary");

/**
 * Uploads a file buffer directly to Cloudinary.
 * Supported options: resource_type ('image' or 'raw'), type ('upload', 'private', 'authenticated'), folder.
 */
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
    uploadStream.end(buffer);
  });
}

/**
 * Safely deletes a file from Cloudinary using its publicId.
 */
async function deleteFromCloudinary(publicId, resourceType = "image") {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete resource ${publicId} from Cloudinary:`, error);
    throw error;
  }
}

/**
 * Generates a short-lived signed URL for authenticated resources.
 * Expiry is configured in minutes (default 15 minutes).
 */
function generateSignedUrl(publicId, expiryMinutes = 15) {
  if (!publicId) return "";
  
  // Calculate expiration time (current timestamp + expiry minutes in seconds)
  const expiresAt = Math.floor(Date.now() / 1000) + expiryMinutes * 60;

  return cloudinary.url(publicId, {
    sign_url: true,
    type: "authenticated",
    expires_at: expiresAt
  });
}

module.exports = {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  generateSignedUrl
};
