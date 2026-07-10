const Candidate = require("../models/Candidate");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const registerCandidate = async (userData) => {
  const { firstName, lastName, email, phone, password } = userData;

  const existing = await Candidate.findOne({ email });
  if (existing) {
    if (existing.isVerified) {
      throw new Error("Email already exists");
    } else {
      // Unverified user - update details and regenerate OTP
      existing.firstName = firstName;
      existing.lastName = lastName;
      existing.phone = phone;
      if (password) {
        existing.password = password;
      }

      // ⏱️ Check if the current OTP was generated less than 2 minutes ago
      const generatedAt = existing.otpExpiry ? (new Date(existing.otpExpiry).getTime() - 5 * 60 * 1000) : 0;
      const elapsedMs = Date.now() - generatedAt;
      const twoMinutesMs = 2 * 60 * 1000;

      let otp = existing.otp;
      if (!otp || elapsedMs > twoMinutesMs) {
        // Generate new OTP only if more than 2 minutes have elapsed
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        existing.otp = otp;
        existing.otpExpiry = Date.now() + 5 * 60 * 1000;
      } else {
        // Reuse the existing active OTP, and extend its validity for another 5 minutes from now
        existing.otpExpiry = Date.now() + 5 * 60 * 1000;
      }

      await existing.save();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #007bff;">Welcome to Our Job Portal, ${firstName}!</h2>
          <p>Thank you for registering with us. To complete your registration, please use the following OTP:</p>
          <div style="font-size: 24px; font-weight: bold; color: #d9534f; padding: 10px; border: 1px solid #ddd; display: inline-block; background-color: #f9f9f9;">
            ${otp}
          </div>
          <p>This OTP is valid for 5 minutes.</p>
          
          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Registration Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>First Name:</strong> ${firstName}</li>
            <li><strong>Last Name:</strong> ${lastName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
          </ul>
          
          <p style="margin-top: 20px;">If you did not request this registration, please ignore this email.</p>
          <p>Best regards,<br/>The Job Portal Team</p>
        </div>
      `;

      await sendEmail(email, "Candidate Registration - OTP Verification", `Your OTP is ${otp}`, htmlContent);
      return existing;
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await Candidate.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    otp,
    otpExpiry: Date.now() + 5 * 60 * 1000
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #007bff;">Welcome to Our Job Portal, ${firstName}!</h2>
      <p>Thank you for registering with us. To complete your registration, please use the following OTP:</p>
      <div style="font-size: 24px; font-weight: bold; color: #d9534f; padding: 10px; border: 1px solid #ddd; display: inline-block; background-color: #f9f9f9;">
        ${otp}
      </div>
      <p>This OTP is valid for 5 minutes.</p>
      
      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Registration Details</h3>
      <ul style="list-style: none; padding: 0;">
        <li><strong>First Name:</strong> ${firstName}</li>
        <li><strong>Last Name:</strong> ${lastName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
      </ul>
      
      <p style="margin-top: 20px;">If you did not request this registration, please ignore this email.</p>
      <p>Best regards,<br/>The Job Portal Team</p>
    </div>
  `;

  await sendEmail(email, "Candidate Registration - OTP Verification", `Your OTP is ${otp}`, htmlContent);

  return user;
};

const verifyOtp = async (email, otp) => {
  const user = await Candidate.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  console.log("\n--- [OTP VERIFICATION DEBUG] ---");
  console.log("Candidate Email: ", email);
  console.log("Incoming OTP:    ", otp, `(Type: ${typeof otp})`);
  console.log("Stored DB OTP:   ", user.otp, `(Type: ${typeof user.otp})`);
  console.log("DB OTP Expiry:   ", user.otpExpiry, `(Current Time: ${new Date()})`);
  console.log("Is Expired:      ", user.otpExpiry < Date.now());
  console.log("Does Match:      ", String(user.otp).trim() === String(otp).trim());
  console.log("---------------------------------\n");

  const cleanInputOtp = String(otp).trim();
  const cleanStoredOtp = String(user.otp).trim();

  if (cleanStoredOtp !== cleanInputOtp || user.otpExpiry < Date.now()) {
    const isExpired = user.otpExpiry < Date.now();
    throw new Error(`Invalid or expired OTP. (Entered: "${cleanInputOtp}", Expected/Latest: "${cleanStoredOtp}", Expired: ${isExpired})`);
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  const token = generateToken(user);
  return { user, token };
};

const loginCandidate = async (email, password) => {
  const user = await Candidate.findOne({ email });

  if (!user || !user.isVerified) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);
  return { user, token };
};

const getProfile = async (userId) => {
  const user = await Candidate.findById(userId).select("-password");
  return user;
};

module.exports = {
  registerCandidate,
  verifyOtp,
  loginCandidate,
  getProfile
};
