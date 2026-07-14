const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const logger = require("../utils/logger");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Explicitly enforce the algorithm to reject 'none' or other unexpected types
    const decoded = jwt.verify(token, authConfig.accessSecret, {
      algorithms: ["HS256"]
    });
    req.user = decoded;
    next();
  } catch (error) {
    // Fallback verification using old key if available during secret rotation
    if (authConfig.oldAccessSecret) {
      try {
        const decoded = jwt.verify(token, authConfig.oldAccessSecret, {
          algorithms: ["HS256"]
        });
        req.user = decoded;
        return next();
      } catch (fallbackError) {
        // Fall through to error response below
      }
    }
    // Do not log the raw token or return internal errors in the client response
    logger.error("Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;