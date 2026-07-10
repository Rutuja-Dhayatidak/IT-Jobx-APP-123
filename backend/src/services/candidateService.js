const Candidate = require("../models/Candidate");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const registerCandidate = async (userData) => {
  const { firstName, lastName, email, phone, password } = userData;

  const existing = await Candidate.findOne({ email });
  if (existing) {
    throw new Error("Email already exists");
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

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    throw new Error("Invalid or expired OTP");
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
