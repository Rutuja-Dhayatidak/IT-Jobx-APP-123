require("dotenv").config();
const mongoose = require("mongoose");
const Candidate = require("./src/models/Candidate");

async function diagnose() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobportal");
    console.log("Connected to MongoDB database!");

    const user = await Candidate.findOne({ email: "worknaiintern5@gmail.com" });
    if (!user) {
      console.log("Candidate not found!");
      return;
    }

    console.log("\n--- [DB CANDIDATE DIAGNOSTIC] ---");
    console.log("First Name:  ", user.firstName);
    console.log("Last Name:   ", user.lastName);
    console.log("Email:       ", user.email);
    console.log("Is Verified: ", user.isVerified);
    console.log("OTP Value:   ", user.otp, `(Type: ${typeof user.otp})`);
    console.log("OTP Expiry:  ", user.otpExpiry);
    console.log("Current Time:", new Date());
    console.log("Is Expired:  ", user.otpExpiry < Date.now());
    console.log("---------------------------------\n");

  } catch (err) {
    console.error("Diagnosis error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

diagnose();
