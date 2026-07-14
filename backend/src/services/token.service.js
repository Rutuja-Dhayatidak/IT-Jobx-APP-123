const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");
const authConfig = require("../config/auth.config");

/**
 * Computes a SHA-256 hash of a token.
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates short-lived access token and long-lived refresh token.
 */
async function generateTokens(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    permissions: user.permissions || []
  };

  // Explicit algorithm configured, rejection of 'none'
  const accessToken = jwt.sign(payload, authConfig.accessSecret, {
    algorithm: "HS256",
    expiresIn: authConfig.accessExpiresIn
  });

  const refreshToken = jwt.sign({ id: user._id }, authConfig.refreshSecret, {
    algorithm: "HS256",
    expiresIn: authConfig.refreshExpiresIn
  });

  // Save secure hash of refresh token to DB
  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt
  });

  return { accessToken, refreshToken };
}

/**
 * Verifies a refresh token and returns the decoded payload if valid.
 */
async function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, authConfig.refreshSecret, { algorithms: ["HS256"] });
    const tokenHash = hashToken(token);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      // Token not found in database: potential reuse detection!
      await RefreshToken.deleteMany({ userId: decoded.id });
      throw new Error("Refresh token reuse detected. Revoking all sessions.");
    }

    if (new Date() > storedToken.expiresAt) {
      await storedToken.deleteOne();
      throw new Error("Refresh token expired");
    }

    return { decoded, storedToken };
  } catch (error) {
    throw new Error(error.message || "Invalid refresh token");
  }
}

/**
 * Rotates the refresh token. Deletes the old one and generates a new pair.
 */
async function rotateRefreshToken(oldToken, user) {
  const { decoded, storedToken } = await verifyRefreshToken(oldToken);
  
  // Delete the old token hash
  await storedToken.deleteOne();

  // Generate new tokens
  return generateTokens(user);
}

/**
 * Revokes a specific refresh token (e.g. on logout).
 */
async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  await RefreshToken.deleteOne({ tokenHash });
}

/**
 * Revokes all refresh tokens for a user (e.g. on password change).
 */
async function revokeAllUserTokens(userId) {
  await RefreshToken.deleteMany({ userId });
}

module.exports = {
  generateTokens,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
};
