const SENSITIVE_KEYS = new Set([
  "password",
  "confirmpassword",
  "otp",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "apikey",
  "secret",
  "mongodburi",
  "smtppassword",
  "email_pass",
  "email_user",
  "razorpay_key_secret",
  "api_secret",
  "google_client_secret",
  "token"
]);

/**
 * Recursively redacts sensitive values from objects or arrays.
 * @param {*} data - The data object/array to redact.
 * @returns {*} Redacted clone of the original data.
 */
function redact(data) {
  if (!data) return data;

  if (typeof data === "string") {
    // Check if it looks like a URI containing a password
    if (data.startsWith("mongodb://") || data.startsWith("mongodb+srv://")) {
      return data.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, "$1********$3");
    }
    // Check if string contains bearer token
    if (data.toLowerCase().startsWith("bearer ")) {
      return "Bearer ********";
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redact(item));
  }

  if (typeof data === "object") {
    const redactedObj = {};
    for (const key of Object.keys(data)) {
      const normalizedKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(normalizedKey)) {
        redactedObj[key] = "********";
      } else {
        redactedObj[key] = redact(data[key]);
      }
    }
    return redactedObj;
  }

  return data;
}

/**
 * Express middleware to redact sensitive keys in req.body, req.query, and req.headers.
 */
function redactionMiddleware(req, res, next) {
  if (req.body) {
    req.body = redact(req.body);
  }
  if (req.query) {
    req.query = redact(req.query);
  }
  // Optional: Clone headers before redacting to avoid side effects on core middleware
  if (req.headers) {
    req.headers = redact(req.headers);
  }
  next();
}

module.exports = {
  redact,
  redactionMiddleware
};
