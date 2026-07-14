const { validateFileSignature } = require("../utils/fileSignatureValidator");
const { sanitizeFileName, generateSecureFileName } = require("../utils/fileNameSanitizer");
const { validatePdfSecurity, sanitizeAndReencodeImage } = require("../services/fileSecurity.service");
const { UploadErrorCodes } = require("../constants/upload.constants");

/**
 * Reusable middleware factory to validate and sanitize uploaded files based on Category.
 */
function validateUploadedFile(category) {
  return async (req, res, next) => {
    try {
      // 1. Ensure file is present on the correct field
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: UploadErrorCodes.FILE_REQUIRED,
            message: "No file was uploaded."
          }
        });
      }

      const file = req.file;

      // 2. Enforce field whitelisting (check fieldname matches category fieldName)
      if (file.fieldname !== category.fieldName) {
        return res.status(400).json({
          success: false,
          error: {
            code: UploadErrorCodes.INVALID_FILE_TYPE,
            message: `Unexpected file field name. Expected '${category.fieldName}'`
          }
        });
      }

      // 3. Enforce size limit
      if (file.size > category.maxSize) {
        return res.status(400).json({
          success: false,
          error: {
            code: UploadErrorCodes.FILE_TOO_LARGE,
            message: `The uploaded file exceeds the maximum allowed limit of ${category.maxSize / (1024 * 1024)} MB.`
          }
        });
      }

      // 4. Validate extension in allowed lists
      const originalName = sanitizeFileName(file.originalname);
      const ext = originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase();
      if (!category.extensions.includes(ext)) {
        return res.status(400).json({
          success: false,
          error: {
            code: UploadErrorCodes.INVALID_FILE_TYPE,
            message: `Unsupported file extension. Allowed extensions are: ${category.extensions.join(", ")}`
          }
        });
      }

      // 5. Verify actual magic bytes (file signature check)
      let detectedInfo;
      try {
        detectedInfo = await validateFileSignature(file.buffer, category.mimeTypes);
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: {
            code: UploadErrorCodes.INVALID_FILE_SIGNATURE,
            message: "File identification check failed: signature spoofing detected."
          }
        });
      }

      // 6. Inspect content security (PDF script search / Image dimensions and EXIF stripping)
      let sanitizedBuffer = file.buffer;
      try {
        if (detectedInfo.mime === "application/pdf") {
          validatePdfSecurity(file.buffer);
        } else if (detectedInfo.mime.startsWith("image/")) {
          // Re-encode image to strip EXIF data and verify dimensions
          sanitizedBuffer = await sanitizeAndReencodeImage(file.buffer, detectedInfo.ext);
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: {
            code: UploadErrorCodes.INVALID_FILE_CONTENT,
            message: err.message || "File content validation failed."
          }
        });
      }

      // 7. Update file properties with sanitized/randomized attributes
      req.file.buffer = sanitizedBuffer;
      req.file.size = sanitizedBuffer.length;
      req.file.originalname = originalName;
      req.file.filename = generateSecureFileName(category.fieldName, detectedInfo.ext);
      req.file.mimetype = detectedInfo.mime;

      next();
    } catch (error) {
      // Return a safe generic error response
      return res.status(500).json({
        success: false,
        error: {
          code: UploadErrorCodes.FILE_UPLOAD_FAILED,
          message: "Internal error processing file. Please try again."
        }
      });
    }
  };
}

module.exports = validateUploadedFile;
