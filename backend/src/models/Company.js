const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  owner_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  logo: { type: String },
  industry: { type: String },
  company_size: { type: String },
  website_url: { type: String },
  about_company: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  
  // Contact details
  official_work_email: { type: String, required: true, unique: true },
  contact_person_name: { type: String, required: true },
  mobile_number: { type: String, required: true },
  company_location: { type: String, required: true },

  // Business verification details
  gst_number: { type: String },
  cin_number: { type: String },
  pan_number: { type: String },

  // Trust and security metrics
  trust_score: { type: Number, default: 0 },
  risk_level: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  verification_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

  // Individual verification flags
  email_verified: { type: Boolean, default: false },
  website_verified: { type: Boolean, default: false },
  gst_verified: { type: Boolean, default: false },
  cin_verified: { type: Boolean, default: false },
  pan_verified: { type: Boolean, default: false },
  documents_verified: { type: Boolean, default: false },
  logo_verified: { type: Boolean, default: false },
  google_verified: { type: Boolean, default: false },
  duplicate_checked: { type: Boolean, default: false },

  // Official email verification fields
  email_verification_token: { type: String },
  email_verification_expiry: { type: Date },
  email_verified_at: { type: Date },
  email_verification_attempts: { type: Number, default: 0 },
  otp_rate_limit_reset: { type: Date },
  
  // Trust & Safety Verification Fields
  trust_safety_status: { type: String, enum: ['pending', 'cleared', 'approved', 'rejected', 'escalated', 'flagged'], default: 'pending' },
  moderator_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  is_escalated: { type: Boolean, default: false },
  escalation_reason: { type: String },
  escalated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  escalated_at: { type: Date },
  risk_score: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  risk_flagged: { type: Boolean, default: false },
  flagged_reason: { type: String },
  flagged_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  flagged_at: { type: Date },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  reviewed_at: { type: Date },
  verification_checklist: {
    website_active: { type: Boolean, default: null }, // null means pending manual check if auto fails
    google_presence: { type: Boolean, default: null },
    no_duplicates: { type: Boolean, default: null },
    logo_verified: { type: Boolean, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
