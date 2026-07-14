const FileType = require("file-type");

/**
 * Validates the file buffer magic bytes against allowed mime types.
 * Returns the detected extension and mime type if valid, otherwise throws an error.
 */
async function validateFileSignature(buffer, allowedMimeTypes) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty file buffer");
  }

  // Detect file type using magic bytes
  const typeInfo = await FileType.fromBuffer(buffer);
  
  if (!typeInfo) {
    throw new Error("Could not identify file magic bytes signature");
  }

  const { ext, mime } = typeInfo;

  // Verify that the detected MIME type is in the allowed list
  if (!allowedMimeTypes.includes(mime)) {
    throw new Error(`MIME signature mismatch: detected ${mime} but allowed only ${allowedMimeTypes.join(", ")}`);
  }

  return { ext, mime };
}

module.exports = {
  validateFileSignature
};
