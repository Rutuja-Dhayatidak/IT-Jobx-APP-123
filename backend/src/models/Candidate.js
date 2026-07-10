const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const candidateSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      unique: true,
      sparse: true 
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "candidate"
    },
    status: {
      type: String,
      enum: ["pending", "active", "blocked", "suspended"],
      default: "active" 
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String
    },
    otpExpiry: {
      type: Date
    },
    profileCompleted: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    blockHistory: [
      {
        actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
        adminName: String,
        role: String,
        action: { type: String, enum: ['BLOCK', 'UNBLOCK'] },
        reason: { type: String, required: true },
        visibleTo: { type: String, enum: ['SUPER_ADMIN', 'PLATFORM_ADMIN'] },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    is_employer: {
      type: Boolean,
      default: false
    },
    current_mode: {
      type: String,
      enum: ['candidate', 'employer'],
      default: 'candidate'
    },
    otp_verified: {
      type: Boolean,
      default: false
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate"
    }
  },
  {
    timestamps: true
  }
);

// Hashing password before save - Final Fix for "next is not a function"
candidateSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error; // Async hooks should throw instead of calling next(err)
  }
});

module.exports = mongoose.model("Candidate", candidateSchema);