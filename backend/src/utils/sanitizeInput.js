/**
 * Recursively sanitizes input to prevent NoSQL injection, prototype pollution, and XSS.
 */
function sanitize(data) {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings
  if (typeof data === "string") {
    let value = data;

    // 1. Remove Null Bytes
    value = value.replace(/\0/g, "");

    // 2. Prevent XSS: strip scripts and simple HTML tags
    value = value.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
    value = value.replace(/<\/?[^>]+(>|$)/g, "");

    // 3. Remove control characters
    value = value.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    return value;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    // Limit array size to prevent DoS (max 1000 items)
    const sliced = data.slice(0, 1000);
    return sliced.map(item => sanitize(item));
  }

  // Handle objects
  if (typeof data === "object") {
    const sanitizedObj = {};
    const keys = Object.keys(data);

    // Limit object properties to prevent DoS (max 100 properties)
    const truncatedKeys = keys.slice(0, 100);

    for (const key of truncatedKeys) {
      // Prevent prototype pollution
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }

      // Prevent MongoDB operator injection (starts with $)
      if (key.startsWith("$")) {
        continue;
      }

      sanitizedObj[key] = sanitize(data[key]);
    }
    return sanitizedObj;
  }

  return data;
}

function sanitizeInPlace(obj) {
  if (obj && typeof obj === "object") {
    const sanitized = sanitize(obj);
    for (const key of Object.keys(obj)) {
      delete obj[key];
    }
    Object.assign(obj, sanitized);
  }
}

/**
 * Express middleware to sanitize body, query, and params.
 */
function sanitizationMiddleware(req, res, next) {
  if (req.body) {
    sanitizeInPlace(req.body);
  }
  if (req.query) {
    sanitizeInPlace(req.query);
  }
  if (req.params) {
    sanitizeInPlace(req.params);
  }
  next();
}

module.exports = {
  sanitize,
  sanitizationMiddleware
};
