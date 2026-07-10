const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      unique: true
    },
    userType: {
      type: String,
      enum: ["fresher", "experienced"],
      default: "fresher"
    },
    profileImage: {
      type: String,
      default: ""
    },
    headline: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    },
    about: {
      type: String,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    resumeUrl: {
      type: String,
      default: ""
    },
    // Detailed Experience for Experienced Professionals
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        responsibilities: String
      }
    ],
    // Detailed Education
    education: [
      {
        degree: String,
        college: String,
        year: String
      }
    ],
    // Projects for both
    projects: [
      {
        title: String,
        description: String,
        link: String
      }
    ],
    // Internship / Training for Freshers
    internships: [
      {
        company: String,
        role: String,
        duration: String
      }
    ],
    certifications: [String],
    links: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" }
    },
    job_preferences: {
      role: { type: String, default: "" },
      location: { type: String, default: "" },
      type: { type: String, default: "" }, // Full-time, Internship, etc.
      salary: { type: String, default: "" }
    },
    dob: {
      type: Date
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""]
    },
    languages: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Profile", profileSchema);
