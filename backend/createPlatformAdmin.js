const mongoose = require('mongoose');
const Candidate = require('./src/models/Candidate');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createPlatformAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const email = "admin@platform.com";
    const password = "password123";
    const phone = "9999999999";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await Candidate.findOne({ email });
    if (existingAdmin) {
      existingAdmin.role = "Platform Admin";
      existingAdmin.status = "active";
      existingAdmin.password = hashedPassword;
      existingAdmin.phone = phone;
      await existingAdmin.save();
      console.log("Existing user updated to Platform Admin.");
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
      console.log("New Platform Admin created.");
    }

    console.log("---------------------------------");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("---------------------------------");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createPlatformAdmin();
