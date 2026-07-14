const mongoose = require("mongoose");
const databaseConfig = require("./database.config");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    logger.info(`MongoDB Connected ✅: ${conn.connection.host}`);
  } catch (error) {
    // Redact database URI from error message if present
    logger.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;