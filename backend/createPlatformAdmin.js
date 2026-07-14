const mongoose = require("mongoose");
const Candidate = require("./src/models/Candidate");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const env = require("./src/config/env.config");
const logger = require("./src/utils/logger");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

const createPlatformAdmin = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info("Connected to MongoDB...");

    // Check environment first, fallback to prompt
    let email = process.env.ADMIN_EMAIL || await askQuestion("Enter Platform Admin Email: ");
    let password = process.env.ADMIN_PASSWORD || await askQuestion("Enter Platform Admin Password: ");
    const phone = process.env.ADMIN_PHONE || "9999999999";

    if (!email || !password) {
      logger.error("Error: Platform Admin email and password are required.");
      process.exit(1);
    }

    if (password.length < 8) {
      logger.error("Error: Password must be at least 8 characters long.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const existingAdmin = await Candidate.findOne({ email });

    if (existingAdmin) {
      existingAdmin.role = "Platform Admin";
      existingAdmin.status = "active";
      existingAdmin.password = hashedPassword;
      existingAdmin.phone = phone;
      await existingAdmin.save();
      logger.info("Existing user updated to Platform Admin.");
    } else {
      const newAdmin = new Candidate({
        firstName: "Platform",
        lastName: "Admin",
        email,
        phone,
        password: hashedPassword,
        role: "Platform Admin",
        status: "active",
        isVerified: true
      });
      await newAdmin.save();
      logger.info("New Platform Admin created.");
    }

    logger.info("---------------------------------");
    logger.info(`Email: ${email}`);
    logger.info("Password: [SECURELY HIDDEN]");
    logger.info("---------------------------------");

    rl.close();
    process.exit(0);
  } catch (err) {
    logger.error("Error creating Platform Admin:", err.message);
    rl.close();
    process.exit(1);
  }
};

createPlatformAdmin();
