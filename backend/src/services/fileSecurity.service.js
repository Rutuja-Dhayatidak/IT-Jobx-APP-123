const sharp = require("sharp");

/**
 * Validates PDF structure and checks for malicious active scripts/launch actions.
 */
function validatePdfSecurity(buffer) {
  const content = buffer.toString("binary");
  
  // 1. Check for standard PDF signature "%PDF-" in the first 1024 bytes
  const header = content.substring(0, 1024);
  if (!header.includes("%PDF-")) {
    throw new Error("Invalid PDF header signature");
  }

  // 2. Reject embedded scripts/JS
  if (content.includes("/JS") || content.includes("/JavaScript")) {
    throw new Error("Security Alert: PDF contains embedded JavaScript");
  }

  // 3. Reject embedded external application launch commands
  if (content.includes("/Launch")) {
    throw new Error("Security Alert: PDF contains external launch actions");
  }

  // 4. Reject embedded files
  if (content.includes("/EmbeddedFiles")) {
    throw new Error("Security Alert: PDF contains embedded attachments");
  }
}

/**
 * Validates image dimensions, checks for pixel decompression bombs, 
 * strips EXIF metadata, and re-encodes the image.
 * Returns the sanitized image buffer.
 */
async function sanitizeAndReencodeImage(buffer, allowedFormat) {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read image dimensions");
  }

  const { width, height } = metadata;

  // 1. Enforce dimension limits
  if (width < 100 || height < 100) {
    throw new Error("Image dimensions are too small (minimum 100x100 pixels)");
  }
  if (width > 5000 || height > 5000) {
    throw new Error("Image dimensions exceed limit (maximum 5000x5000 pixels)");
  }

  // 2. Prevent decompression bomb (limit total pixels to 20 million)
  const totalPixels = width * height;
  if (totalPixels > 20000000) {
    throw new Error("Image pixel volume exceeds safe limit (maximum 20 million pixels)");
  }

  // 3. Re-encode the image to strip EXIF metadata (keep it clean)
  // sharp automatically strips EXIF data unless .withMetadata() is called.
  let outputBuffer;
  if (allowedFormat === "png") {
    outputBuffer = await image.png({ compressionLevel: 9 }).toBuffer();
  } else if (allowedFormat === "webp") {
    outputBuffer = await image.webp({ quality: 80 }).toBuffer();
  } else {
    // Default to JPEG
    outputBuffer = await image.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  }

  return outputBuffer;
}

module.exports = {
  validatePdfSecurity,
  sanitizeAndReencodeImage
};
