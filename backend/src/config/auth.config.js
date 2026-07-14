const env = require("./env.config");

const authConfig = {
  accessSecret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  oldAccessSecret: env.JWT_OLD_SECRET,
  accessExpiresIn: env.JWT_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
};

module.exports = authConfig;
