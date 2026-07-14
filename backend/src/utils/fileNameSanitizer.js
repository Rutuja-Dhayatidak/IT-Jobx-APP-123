const crypto = require("crypto");
const path = require("path");

const RESERVED_FILENAMES = new Set([
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
]);

/**
 * Sanitizes the original filename to prevent path traversal, HTML injection, and name spoofing.
 */
function sanitizeFileName(fileName) {
  if (typeof fileName !== "string") {
    return "unnamed_file";
  }

  // 1. Normalize Unicode
  let cleanName = fileName.normalize("NFC");

  // 2. Remove Null Bytes
  cleanName = cleanName.replace(/\0/g, "");

  // 3. Remove Path Traversal sequences
  cleanName = cleanName.replace(/\.\.+\//g, "");
  cleanName = cleanName.replace(/\.\.+\\/g, "");
  cleanName = cleanName.replace(/%2e%2e/gi, "");

  // 4. Remove HTML and Script tags
  cleanName = cleanName.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  cleanName = cleanName.replace(/<\/?[^>]+(>|$)/g, "");

  // 5. Replace control characters and unsafe special chars with hyphens
  cleanName = cleanName.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  cleanName = cleanName.replace(/[\\/:*?"<>|#%&{}+=~`;]/g, "-");

  // 6. Split basename and extension
  const parsed = path.parse(cleanName);
  let base = parsed.name.trim();
  const ext = parsed.ext.toLowerCase();

  // 7. Prevent Double Extensions (e.g. file.pdf.exe)
  if (base.includes(".")) {
    base = base.replace(/\./g, "-");
  }

  // 8. Prevent OS Reserved Filenames
  if (RESERVED_FILENAMES.has(base.toUpperCase())) {
    base = `safe_${base}`;
  }

  // 9. Enforce filename length limits
  if (base.length > 100) {
    base = base.substring(0, 100);
  }

  return `${base}${ext}`;
}

/**
 * Generates a secure, randomized filename using randomUUID.
 */
function generateSecureFileName(categoryName, extension) {
  const uuid = crypto.randomUUID();
  const cleanExt = extension.startsWith(".") ? extension : `.${extension}`;
  return `${categoryName}_${uuid}${cleanExt}`;
}

module.exports = {
  sanitizeFileName,
  generateSecureFileName
};
