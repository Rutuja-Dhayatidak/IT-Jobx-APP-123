const env = require("./env.config");

const databaseConfig = {
  uri: env.MONGO_URI,
  options: {
    // Add any Mongoose specific production configuration options here
    tls: env.NODE_ENV === "production" ? true : undefined,
  }
};

module.exports = databaseConfig;
