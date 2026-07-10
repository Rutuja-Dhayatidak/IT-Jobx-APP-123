const splitOrigins = (value = "") =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  ...splitOrigins(process.env.ALLOWED_ORIGINS),
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

module.exports = [...new Set(allowedOrigins)];
