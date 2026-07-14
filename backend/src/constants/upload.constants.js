const UploadErrorCodes = {
  FILE_REQUIRED: "FILE_REQUIRED",
  TOO_MANY_FILES: "TOO_MANY_FILES",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  INVALID_FILE_SIGNATURE: "INVALID_FILE_SIGNATURE",
  INVALID_FILE_CONTENT: "INVALID_FILE_CONTENT",
  INVALID_IMAGE_DIMENSIONS: "INVALID_IMAGE_DIMENSIONS",
  MALWARE_DETECTED: "MALWARE_DETECTED",
  FILE_SCAN_FAILED: "FILE_SCAN_FAILED",
  FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_ACCESS_DENIED: "FILE_ACCESS_DENIED",
  FILE_DELETE_FAILED: "FILE_DELETE_FAILED",
  UPLOAD_RATE_LIMIT_EXCEEDED: "UPLOAD_RATE_LIMIT_EXCEEDED"
};

const UploadCategories = {
  RESUME: {
    fieldName: "file",
    maxSize: 15 * 1024 * 1024, // 15 MB
    extensions: ["pdf", "doc", "docx"],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
  },
  PROFILE_IMAGE: {
    fieldName: "file",
    maxSize: 15 * 1024 * 1024, // 15 MB
    extensions: ["jpg", "jpeg", "png", "webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"]
  },
  COMPANY_LOGO: {
    fieldName: "companyLogo",
    maxSize: 10 * 1024 * 1024, // 10 MB
    extensions: ["jpg", "jpeg", "png", "webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"]
  },
  COMPANY_DOCUMENT: {
    fieldName: "companyDocument",
    maxSize: 15 * 1024 * 1024, // 15 MB
    extensions: ["pdf", "jpg", "jpeg", "png"],
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"]
  }
};

module.exports = {
  UploadErrorCodes,
  UploadCategories
};
