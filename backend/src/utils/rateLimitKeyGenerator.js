/**
 * Safely extracts client IP address, handling IPv6 mappings.
 */
function getClientIp(req) {
  let ip = req.ip || req.connection.remoteAddress || "127.0.0.1";
  
  // Normalize IPv6 loopback or IPv4-mapped IPv6 address
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  } else if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  return ip;
}

/**
 * Normalizes email address by trimming and converting to lowercase.
 */
function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Normalizes phone number by stripping formatting.
 */
function normalizePhone(phone) {
  if (typeof phone !== "string") return "";
  let cleaned = phone.replace(/[\s+-]/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

/**
 * Generates key based on IP and identifier (email or phone).
 */
function getLimiterKey(req, identifier) {
  const ip = getClientIp(req);
  if (!identifier) {
    return ip;
  }

  let cleanIdentifier = identifier.trim().toLowerCase();
  if (cleanIdentifier.includes("@")) {
    cleanIdentifier = normalizeEmail(cleanIdentifier);
  } else {
    cleanIdentifier = normalizePhone(cleanIdentifier);
  }

  return `${ip}_${cleanIdentifier}`;
}

module.exports = {
  getClientIp,
  normalizeEmail,
  normalizePhone,
  getLimiterKey
};
