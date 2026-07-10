const mongoose = require("mongoose");

const companyTeamMemberSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "employer_admin",
        "talent_acquisition",
        "hiring_manager",
        "hr_recruiter",
        "interview_panel",
        "hr_admin",
        "recruitment_coordinator",
        "interview_coordinator",
        "onboarding_manager"
      ],
      required: true,
    },
    permissions: [
      {
        type: String,
      },
    ],
    invited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "removed"],
      default: "pending",
    },
    invitation_token: {
      type: String,
      default: null,
    },
    token_expires_at: {
      type: Date,
      default: null,
    },
    invitation_sent_at: {
      type: Date,
      default: Date.now,
    },
    joined_at: {
      type: Date,
      default: null,
    },
    last_login: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate team members in the same company
companyTeamMemberSchema.index({ company_id: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("CompanyTeamMember", companyTeamMemberSchema);
